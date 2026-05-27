

const dns = require("dns");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const fetch = require("node-fetch");
const { ANIME } = require("@consumet/extensions");



const animesaturn = new ANIME.AnimeSaturn();
const flvProcessingEpisodes = new Set();

/**
 * Searches AnimeSaturn, grabs the best match, gets the episodes, and formats them as GData XML for GoTube.
 */
function anime_search(query, page, bypage, callback) {
  console.log(`[anime_backend] Searching for "${query}" (page: ${page})`);

  animesaturn.search(query)
    .then(async (searchResults) => {
      if (!searchResults.results || searchResults.results.length === 0) {
        return callback(empty_feed_xml());
      }

      // Pick the best match (first one)
      const bestMatch = searchResults.results[0];
      console.log(`[anime_backend] Selected anime: ${bestMatch.title} (${bestMatch.id})`);

      try {
        const details = await animesaturn.fetchAnimeInfo(bestMatch.id);
        const episodes = details.episodes || [];
        const totalResults = episodes.length;

        // Slice based on pagination (start is 1-indexed)
        const startIndex = (page - 1) * bypage;
        const slicedEpisodes = episodes.slice(startIndex, startIndex + bypage);

        // Map cover image filename for proxy proxying
        let coverImg = "default.png";
        if (bestMatch.image) {
          const match = bestMatch.image.match(/\/copertine\/([^/]+)$/);
          if (match) {
            coverImg = match[1];
          }
        }

        let xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:openSearch="http://a9.com/-/spec/opensearch/1.1/" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">
  <openSearch:totalResults>${totalResults}</openSearch:totalResults>
  <openSearch:startIndex>${startIndex + 1}</openSearch:startIndex>
  <openSearch:itemsPerPage>${bypage}</openSearch:itemsPerPage>
`;

        slicedEpisodes.forEach(ep => {
          const epId = ep.id;
          const epNum = ep.number;
          const epTitle = `${details.title} - Episode ${epNum}`;
          const epDesc = `Anime: ${details.title}\nEpisode: ${epNum}\nGenres: ${(details.genres || []).join(", ")}`;

          xml += `
  <entry>
    <id>http://172.20.10.2:8081/anime/id/${epId}</id>
    <title type='text'>${epTitle}</title>
    <content type='text'>${epDesc}</content>
    <name>${(details.genres || []).slice(0, 3).join(", ")}</name>
    <media:thumbnail url='http://172.20.10.2:8081/anime/thumb?img=${coverImg}'/>
  </entry>`;
        });

        xml += `\n</feed>`;
        callback(xml);
      } catch (err) {
        console.error("[anime_backend] Failed to fetch anime details:", err.message);
        callback(empty_feed_xml());
      }
    })
    .catch((err) => {
      console.error("[anime_backend] Search failed:", err.message);
      callback(empty_feed_xml());
    });
}

/**
 * Transcodes AnimeSaturn episode M3U8 stream to FLV and pipes to response.
 */
function anime_play(episodeId, req, res) {
  res.setHeader("Content-Type", "video/x-flv");
  res.setHeader("Connection", "keep-alive");

  console.log(`[anime_backend] Resolving stream sources for ${episodeId}...`);

  animesaturn.fetchEpisodeSources(episodeId)
    .then((sourcesData) => {
      if (!sourcesData.sources || sourcesData.sources.length === 0) {
        res.sendStatus(404);
        return;
      }

      // Pick the first source
      const streamSource = sourcesData.sources[0];
      const m3u8Url = streamSource.url;
      const headers = sourcesData.headers || {};
      const referer = headers.Referer || "https://www.animesaturn.cx/";
      const userAgent = headers["User-Agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

      console.log(`[anime_backend] Transcoding M3U8 -> FLV: ${m3u8Url}`);

      // Transcode HLS straight to FLV using spawn to avoid command injection / escaping bugs
      const ffmpegHeaders = `Referer: ${referer}\r\nUser-Agent: ${userAgent}\r\n`;
      const args = [
        "-y",
        "-re", // Throttle to real-time to save CPU burst credits
        "-headers", ffmpegHeaders,
        "-i", m3u8Url,
        "-vcodec", "flv1",
        "-b:v", "600k",
        "-s", "480x272",
        "-r", "24",
        "-acodec", "libmp3lame",
        "-ar", "44100",
        "-ac", "2",
        "-ab", "96k",
        "-f", "flv",
        "pipe:1"
      ];

      const ffmpeg = spawn("ffmpeg", args);
      ffmpeg.stdout.pipe(res);

      req.on('close', () => {
        console.log(`[anime_backend] PSP disconnected for ${episodeId}. Terminating transcode.`);
        try { ffmpeg.kill('SIGKILL'); } catch (e) {}
      });
    })
    .catch((err) => {
      console.error("[anime_backend] Failed to fetch stream sources:", err.message);
      if (!res.headersSent) res.sendStatus(500);
    });
}

/**
 * Proxies AnimeSaturn cover image.
 */
function anime_thumb(imgName, res) {
  const targetUrl = `https://cdn.animesaturn.cx/static/images/copertine/${imgName}`;
  console.log(`[anime_backend] Proxying cover thumbnail: ${targetUrl}`);

  fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  })
    .then((resp) => {
      if (resp.status !== 200) {
        return res.sendStatus(resp.status);
      }
      res.setHeader("Content-Type", resp.headers.get("content-type") || "image/png");
      resp.body.pipe(res);
    })
    .catch((err) => {
      console.error("[anime_backend] Thumbnail proxy failed:", err.message);
      res.sendStatus(500);
    });
}

function empty_feed_xml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:openSearch="http://a9.com/-/spec/opensearch/1.1/">
  <openSearch:totalResults>0</openSearch:totalResults>
  <openSearch:startIndex>1</openSearch:startIndex>
  <openSearch:itemsPerPage>20</openSearch:itemsPerPage>
</feed>`;
}

module.exports = {
  anime_search,
  anime_play,
  anime_thumb
};
