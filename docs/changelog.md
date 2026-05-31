# PSP Streaming Project - Changelog

A chronological history of code changes, feature implementations, and major bug fixes.

- **08d7ff0:** `Initial commit of psp-streaming-project`
  - Initialized the base repository for the PSP streaming proxy and backend servers.

- **ce55c4c:** `Update Animex.js to use DuckDNS URL`
  - Updated the Animex GoTube plugin to route traffic through the DuckDNS dynamic DNS URL for remote accessibility.

- **1b92a1f:** `Add and update YouTubex.js plugin`
  - Added the YouTubex plugin for the PSP GoTube application to support the new yt2009 streaming backend.

- **7d99600:** `feat: bypass bot protection with WARP proxy and fix PSP 302 redirects`
  - Implemented Cloudflare WARP in SOCKS5 proxy mode to mask the Azure datacenter IP.
  - Routed `yt-dlp` traffic through the proxy to bypass YouTube's 403 Forbidden blocks.
  - Fixed 302 redirect handling on the PSP client to ensure streams load correctly.

- **d1ac64b:** `fix: add error handlers to prevent EPIPE crash on video replay`
  - Added `req.on('close')` event listeners to build a "Zombie Process Wall".
  - Ensured that `ffmpeg` and `yt-dlp` processes are aggressively killed when the PSP disconnects, preventing `EPIPE` crashes and saving RAM on the Azure VM.

- **93abc4b:** `feat: increase video quality to 900k 30fps and boost audio volume 150%`
  - Tuned `ffmpeg` transcoding parameters.
  - Increased PSP video bitrate to 900k at 30 frames per second for a smoother experience.
  - Boosted the audio volume parameter (`volume=1.5`) to compensate for the PSP's quiet internal speakers.

- **455c6d7:** `feat: add CloudMedia GoTube plugin and universal movies backend`
  - Introduced the CloudMedia plugin to aggregate various media sources.
  - Developed a universal movies backend for streaming full-length films to the PSP.

- **cd2a93a:** `fix: rewrite CloudMedia.js to use GoTube SiteList.push format`
  - Refactored the `CloudMedia.js` plugin code to properly register itself in the GoTube app using the `SiteList.push` standard format, fixing menu visibility issues.

- **1201258:** `fix: use Hianime instead of deprecated Gogoanime in Consumet 1.5.0`
  - Updated anime scraping backend to point to Hianime after the deprecation of Gogoanime in the Consumet API.

### Unversioned Backend Fixes
- **MangaReader Infinite Scroll:** Overhauled `script.lua` to use ONElua thread mode for asynchronous chunk downloading. Sliced continuous manhwa strips into 61 optimized chunks to prevent VRAM crashes, and fixed memory garbage collection (`attempt to call field free a nil value`).
- **FFmpeg Direct HTTP Streaming:** Rewrote the yt2009 transcoding pipeline to pass direct HTTP URLs to `ffmpeg` instead of raw piped bytes, fixing the missing `moov` atom bug and restoring the PSP's blue buffering line.
- **Spotiflac Audio Bleeding:** Removed the `-re` flag from the Spotiflac `ffmpeg` command and forced `Connection: close` headers to prevent tracks from bleeding into each other on skips.
