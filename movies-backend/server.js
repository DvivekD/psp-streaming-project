const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { bootstrap } = require('global-agent');

// Force Node to use the WARP tunnel for all scraper fetch requests
process.env.GLOBAL_AGENT_HTTP_PROXY = 'socks5://127.0.0.1:40000';
process.env.GLOBAL_AGENT_HTTPS_PROXY = 'socks5://127.0.0.1:40000';
bootstrap();

// NOW initialize consumet. It will automatically inherit the proxy.
const { ANIME, MOVIES } = require('@consumet/extensions');
const gogoanime = new ANIME.Gogoanime();
const flixhq = new MOVIES.FlixHQ();

const app = express();
const port = 8082;

// Serve the static cache folder so the PSP can download the FLV directly
app.use('/cache', express.static(path.join(__dirname, 'cache')));

// Track active background transcodes to prevent duplicate ffmpeg processes
const activeTranscodes = new Set();

// Ensure cache directory exists
const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

// --- ROUTE 1: Search and Get Links ---
app.get('/search_media', async (req, res) => {
    const { type, query } = req.query; // type = 'anime' or 'movie'
    
    try {
        let results;
        if (type === 'anime') {
            results = await gogoanime.search(query);
        } else if (type === 'movie') {
            results = await flixhq.search(query);
        }
        
        res.json({ success: true, data: results.results });
    } catch (error) {
        console.error("Scraper failed:", error);
        res.json({ success: false, error: "Scraper failed or blocked." });
    }
});

// --- ROUTE 2: Get Streaming Link ---
app.get('/get_stream_link', async (req, res) => {
    const { type, id, episodeId } = req.query;
    try {
        let streamData;
        if (type === 'anime') {
            streamData = await gogoanime.fetchEpisodeSources(episodeId);
        } else {
            streamData = await flixhq.fetchEpisodeSources(episodeId, id);
        }
        
        // Find the best quality or auto
        let bestSource = streamData.sources.find(s => s.quality === 'auto' || s.quality === '1080p' || s.quality === '720p') || streamData.sources[0];
        res.send(bestSource.url);
    } catch (error) {
        console.error("Link fetch failed:", error);
        res.send("ERROR");
    }
});

// --- ROUTE 3: The ffmpeg Transcoder ---
app.get('/play', (req, res) => {
    const { url, id } = req.query; 
    if (!url || !id) {
        return res.status(400).send("Missing URL or ID");
    }
    
    const fileName = `${id}.flv`;
    const filePath = path.join(__dirname, 'cache', fileName);

    if (!activeTranscodes.has(id)) {
        console.log(`[Phase 1] First click. Starting background transcode for ${id}...`);
        activeTranscodes.add(id);

        if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) {}
        }

        const ffmpegArgs = [
            '-re', 
            '-i', url,
            '-vcodec', 'flv1', '-b:v', '900k', '-s', '480x272', '-r', '30',
            '-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-ab', '128k',
            '-af', 'volume=1.5',
            '-f', 'flv', 
            filePath
        ];

        const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

        ffmpegProcess.on('close', () => {
            console.log(`[Cache] Transcode finished or killed for ${id}`);
            activeTranscodes.delete(id);
        });
        
        ffmpegProcess.on('error', (err) => {
            console.error(`ffmpeg error for ${id}:`, err);
            activeTranscodes.delete(id);
        });
    } else {
        console.log(`[Phase 2] Second click. File is already warming up for ${id}!`);
    }

    // Give ffmpeg 1.5 seconds to create the file and write the FLV headers.
    setTimeout(() => {
        res.redirect(`/cache/${fileName}`);
    }, 1500); 
});

app.listen(port, () => console.log(`Universal Media Server running on Port ${port}`));
