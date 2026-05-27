# 🛑 Errors and Learnings: PSP GoTube & yt2009 Integration

This document compiles the core errors, debugging steps, and hard architectural lessons learned during the integration of YouTube and Anime streaming on the Sony PSP (using GoTube and the `yt2009` server proxy).

---

## 1. Video Playback Freeze / Crash on PSP

### The Error
The PSP parsed the video feed successfully (loaded duration and title), but froze on a black screen or crashed with a system error upon starting playback.

### The Investigation
- Tested if the PSP could handle modern H.264/AAC `.mp4` network streams.
- Modified the GoTube plugin to serve direct `.mp4` URLs.
- **Result:** The PSP's hardware Media Engine is strictly sandboxed by Sony. It only decodes network streams via GoTube's custom software player, which only understands Sorenson Spark (`flv1`) video and `mp3` audio in an `.flv` container.

### The Fix
Transcode all streams (both YouTube and Anime) to legacy FLV using `ffmpeg`.
**Working Transcode Command:**
```bash
ffmpeg -i [input_stream] -vcodec flv1 -b:v 600k -s 480x272 -r 24 -acodec libmp3lame -ar 44100 -ac 2 -ab 96k [output].flv
```
- `flv1`: Sorenson Spark codec.
- `480x272`: Native PSP widescreen resolution.
- `600k`: Perfect balance between visual clarity and low RAM/bandwidth footprint.
- `44100Hz Stereo`: High-fidelity stereo audio instead of flat mono.

---

## 2. Express `res.sendFile` Breaking Playback

### The Error
Changing the server's streaming method from HTTP redirect (`res.redirect`) to direct file sending (`res.sendFile`) resulted in an instant `0/0` playback failure on GoTube.

### The Investigation
- GoTube's built-in NetFront browser plugin is extremely sensitive to HTTP header structure.
- Modern `res.sendFile` sends standard chunked transfer-encoding and content-disposition headers, which the legacy 2008 player fails to parse.

### The Fix
Reverted back to the original `yt2009` architecture:
- Server prepares the file.
- Server returns a standard HTTP `302 Redirect` pointing to the static assets directory.
- GoTube follows the redirect and consumes the FLV file smoothly.

---

## 3. YouTube 403 Forbidden Block (PoToken / Bot Protection)

### The Error
When attempting to stream popular YouTube music videos or newly uploaded videos, the server failed silently, and the console logged `403 Forbidden`.

### The Investigation
- `yt2009` historically relies on `ytdl-core` downstream, which is heavily throttled and flagged by YouTube's modern PoToken and anti-bot mechanism (SABR/visitor data requirements).

### The Fix
Ripped out the internal `ytdl-core` downloader in `back/yt2009utils.js` and replaced it with a dynamic shell execution invoking `yt-dlp`:
```javascript
let dlcmd = `yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" "https://www.youtube.com/watch?v=${id}" -o "${__dirname}/../assets/${id}.mp4"`;
```
`yt-dlp` regularly updates to bypass YouTube's active blockades, restoring 100% video download reliability.

---

## 4. GoTube 10-Second UI Timeout

### The Error
When clicking a video for the first time, GoTube would spinner for exactly 10 seconds and then throw a `0:0` error, forcing the user to exit and select the video again to start playing.

### The Investigation
- Spawning `yt-dlp` and `ffmpeg` to download and transcode a video in real-time takes roughly 15-20 seconds.
- GoTube has a hardcoded C++ connection timeout of 10 seconds. When the server takes longer to respond with the redirect, GoTube gives up.

### The Workaround / Fix
- **Cache Hits:** On the second click, the file is already transcoded and cached in `assets/`, so the server responds instantly, and playback begins immediately.
- **Future Solution:** Implement asynchronous chunked FLV piping where `ffmpeg`'s output is piped directly into the Express HTTP response in real-time. This starts the video stream within ~2 seconds, eliminating the timeout entirely!

---

## 5. ISP DNS Hijacking / Domain Blocks (Anime Scraper)

### The Error
The Consumet scraper (`AnimeSaturn` extension) failed to fetch search results, throwing `ENOTFOUND` or timing out.

### The Investigation
- Italian ISP and other regional operators implement strict DNS-level blocks on anime streaming index sites like AnimeSaturn.
- Node.js defaults to the system's local DNS servers (which are hijacked by the ISP).

### The Fix
Implemented a global DNS hijack at the beginning of `back/anime_backend.js` using `dns.setServers()` to bypass local ISP DNS servers completely:
```javascript
dns.setServers(["8.8.8.8", "1.1.1.1", "208.67.222.222"]);
```
This forces all downstream lookups (including the Consumet scraper) to use secure, open DNS, restoring flawless scraping.
