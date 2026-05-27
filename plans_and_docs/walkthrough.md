# 🎮 PSP GoTube + yt2009 Integration Post-Mortem

This document serves as a comprehensive technical analysis of the journey to get modern YouTube streaming on a Sony PSP Go using the ancient GoTube homebrew app and a modern Node.js `yt2009` proxy server.

## 🎯 The Architecture
The setup relies on a pipeline that bridges 2026 YouTube with a 2008 console:
1. **The Client:** PSP Go running the HighMemoryMod of `GoTube`, utilizing `YouTubex.js` to parse search results and request media.
2. **The Proxy (Laptop):** A modified `yt2009` Node.js server that acts as a middleman.
3. **The Engine:** `yt-dlp` for bypassing modern YouTube DRM/anti-bot measures, and `ffmpeg` for real-time transcoding into legacy formats.

---

## 🛑 What Failed (The Roadblocks)

### 1. MP4 Network Streaming is a Myth
**The Attempt:** I tried to bypass the CPU-heavy FLV transcoding by feeding raw `.mp4` streams directly to the PSP, modifying `YouTubex.js` to request MP4s.
**The Failure:** The PSP successfully parsed the metadata (showing the correct duration, e.g., `4:12`), but hard-froze on a black screen upon playback.
**The Reality:** The PSP's hardware Media Engine is hardcoded by Sony to only play MP4s loaded locally from the Memory Stick. For network streams, GoTube relies on a custom software decoder that strictly only understands the ancient Sorenson Spark (`flv1`) format.

### 2. HTTP `res.sendFile` vs `res.redirect`
**The Attempt:** I changed the Express server's video delivery method from an HTTP 302 Redirect to a direct 200 OK stream (`res.sendFile`) to theoretically speed up delivery.
**The Failure:** The PSP instantly threw a `0/0` playback error.
**The Reality:** GoTube's ancient NetFront browser plugin expects the specific HTTP 302 redirect flow built into `yt2009`. Modern Express header formatting on `sendFile` broke the plugin's payload expectations. Reverting to `res.redirect` instantly fixed it.

### 3. YouTube's Modern Anti-Bot Defenses (403 Forbidden)
**The Attempt:** Relying on `yt2009`'s built-in `ytdl-core` downstream fetcher to download videos.
**The Failure:** When testing official music videos (like Playboi Carti or The Weeknd), YouTube actively blocked the laptop's IP with a strict `403 Forbidden` error, causing the video pipeline to fail silently and freeze the PSP.
**The Fix:** Ripped out `yt2009`'s internal downloader and patched `yt2009utils.js` to spawn a `child_process` running the latest 2026 build of `yt-dlp`, which flawlessly bypasses YouTube's PoToken/SABR defenses.

### 4. The 10-Second UI Timeout Bug
**The Problem:** When a user clicks a new video, `yt-dlp` and `ffmpeg` take roughly ~15 seconds to download and convert the stream. However, GoTube has a hardcoded 10-second timeout. The PSP gives up, caches the failure in RAM, and shows `0:0`.
**The Unfixable UI:** Because the `Circle` button is hardcoded in C++ to open the keyboard and reset the view, the user is forced to requit the search and click the video a second time to play the cached file. I attempted a `Math.random()` cache-buster, but the physical UI flow makes the "double-click" dance unavoidable without access to GoTube's original C++ source code.

---

## ✅ What Worked (The Final Pipeline)

### 1. The Ultimate Transcoding Parameters
After dialing back the quality to troubleshoot the 403 errors, I pushed the `ffmpeg` conversion back to the absolute limit of the PSP's capabilities.
**The winning parameters:**
```bash
-vcodec flv1 -b:v 600k -s 480x272 -r 24 -acodec libmp3lame -ar 44100 -ac 2 -ab 96k
```
* **480x272:** The exact native widescreen resolution of the PSP.
* **600kbps:** High enough to remove "minecraft" blockiness, low enough not to crash the RAM.
* **44.1kHz Stereo:** Restored full stereo audio instead of flat mono.

### 2. The `yt-dlp` Injection
By hijacking `utils.saveMp4` in `backend.js`, the server now dynamically intercepts requests, calls `yt-dlp` to grab the best compatible 720p/1080p source, and hands it off to `ffmpeg`.

### 3. Maximum Portability (The iPhone Hotspot)
To decouple the system from the home router, we bound both the laptop proxy (`config.json`) and the PSP client (`YouTubex.js`) to the static IP of an iPhone Mobile Hotspot (`172.20.10.2`). 
* The laptop runs the server while tethered to the phone.
* The PSP connects to the phone.
* The system is now 100% portable and can stream YouTube anywhere in the world.

---

## 🔮 Future Improvements (For Claude)
If you are continuing this in a new coding environment, here are the areas to explore next:
1. **Asynchronous HTTP Piping:** Currently, `child_process.exec` waits for the entire `ffmpeg` conversion to finish before serving the file. If you can rewrite `yt2009warpSWF.js` to pipe `ffmpeg`'s `stdout` directly to the Express HTTP response (`res`), the video would start streaming instantly on the PSP, entirely eliminating the 10-second timeout bug!
2. **Dynamic IP Detection:** Writing a startup script that dynamically grabs the laptop's current IPv4 address and auto-injects it into `config.json` and serves an updated `YouTubex.js` payload.
