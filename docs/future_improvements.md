# Future Improvements & TODO

While the PSP Streaming Project is highly functional, there are several areas for optimization and feature expansion.

## 1. Manga Continuous Mode Memory Limits
Currently, the Manga Lua frontend requires precise VRAM management. We removed the explicit `image.free()` calls in favor of standard Lua garbage collection (`img = nil; collectgarbage()`) to prevent the fatal "attempt to call field free a nil value" crash. 
However, in continuous streaming mode, users can scroll extremely fast, queuing multiple un-rendered pages into RAM.
- **TODO**: Implement a hard queue limit (e.g., max 3 pages ahead) in `manga-server.js` or in the Lua client. If the user scrolls faster than the garbage collector can dump old pages, the Lua interpreter will OOM (Out of Memory) crash.

## 2. Authentication & Token Refresh (yt2009)
The yt2009 frontend relies on a specific Android YouTube API token to fetch search results, comments, and channel metadata.
- **Current Issue**: If this token expires or is blacklisted by YouTube, the frontend throws a `403 BadAuthentication` error when searching. The video streaming (handled by `yt-dlp` + WARP) still works perfectly, but the frontend metadata fails.
- **TODO**: Implement an automated token rotation script or a mechanism inside `yt2009_utils.js` to automatically fetch new tokens from a trusted source, or route the yt2009 backend's internal API requests through the WARP SOCKS5 proxy to prevent IP flagging.

## 3. WebM/AV1 Support via FFmpeg
Some of the newest YouTube videos default exclusively to AV1 or WebM formats internally. While `yt-dlp` currently forces MP4 extraction via `-f "best[ext=mp4]"`, this could eventually break if YouTube drops MP4 entirely.
- **TODO**: Ensure the `yt-dlp` pipe fallback architecture can ingest raw WebM streams and that the FFmpeg `-vcodec flv1` transcode pipeline can handle WebM containers dynamically.

## 4. Subtitle Burn-In (Hardsubs)
- **TODO**: Implement a query parameter in `backend.js` (e.g., `?sub=en`) that forces `yt-dlp` to download subtitles and instructs FFmpeg to burn them directly into the video frame (`-vf subtitles=...`) before transcoding to FLV. This would allow PSP users to watch foreign content natively.

## 5. Security & Rate Limiting
Currently, the PM2 backend processes are completely open to the public internet on their respective ports.
- **TODO**: Implement Express rate limiting (`express-rate-limit`) to prevent malicious actors from spamming `/stream_flv` and exhausting the Azure VM's CPU credits with runaway ffmpeg instances.
- **TODO**: Bind internal services (like `backend.js`) exclusively to `localhost` and use NGINX as a reverse proxy to handle traffic routing and SSL termination (for modern clients, while keeping port 80 open specifically for the PSP).
