# Contributor Notes & Guidelines

Welcome to the PSP Streaming Project! This system relies on delicate proxying and real-time transcoding to keep 20-year-old hardware functioning on the modern internet. Please adhere to the following guidelines when contributing.

## 1. Stream Bleeding & Socket Management
The biggest challenge with streaming continuous data (via `ffmpeg`) to the PSP's NetFront browser or GoTube is **Stream Bleeding**. If the PSP drops the connection unexpectedly, Node.js may not immediately destroy the underlying socket, leaving `ffmpeg` and `yt-dlp` running indefinitely in the background. This will quickly exhaust server memory and CPU.

* **Connection Headers:** In endpoints that stream infinite or very large pipes (like `GET /stream_flv`), you MUST send `Connection: close` in the response headers. `keep-alive` will often cause the PSP to hang on the socket even after the user exits the video.
* **Process Killing:** Always listen to the `req.on("close")` event. When triggered, forcefully kill child processes using `kill('SIGKILL')`. `SIGTERM` is often ignored by `ffmpeg` when its stdout pipe gets deadlocked.
  ```javascript
  req.on('close', () => {
      try { yt_proc.kill('SIGKILL'); } catch(e) {}
      try { ffmpeg.kill('SIGKILL'); } catch(e) {}
  });
  ```
* **Hard Timeouts:** Always implement a hard fallback timeout (e.g., 30 minutes for music, 2 hours for video) to reap zombie processes in case the `close` event fails to fire.

## 2. Memory & Disk Management
* **Temporary Files:** If your feature requires downloading files before transcoding (e.g., the Manga backend downloading `.jpg` pages), you MUST write them to a unique folder in `/tmp/` and aggressively `rm -rf` the folder on both successful completion and `req.on('close')`.
* **Concurrency Limits:** Transcoding `flv1` is relatively cheap, but `yt-dlp` extraction and `sharp` image manipulation are not. Maintain strict concurrency limiters (e.g., `activeTranscodes.size >= 2`) in your route handlers to protect the server from being DDoS'd by multiple PSP clients.

## 3. Error Handling & PM2 Crash Prevention
Because this server bridges unreliable scraping APIs, unhandled exceptions are common.
* **Never let a socket crash the app:** Wrap all external requests and `child_process.spawn` calls in `try/catch` blocks.
* **Global Handlers:** Ensure the following global fallbacks remain active at the top of your server files to prevent PM2 restart loops:
  ```javascript
  process.on('uncaughtException', (err) => console.error(err));
  process.on('unhandledRejection', (reason) => console.error(reason));
  
  app.use((req, res, next) => {
      if (req.socket) req.socket.on('error', () => {});
      next();
  });
  ```

## 4. Coding Standards
* **Vanilla JS:** Stick to CommonJS (`require`) for backend scripts to maintain compatibility with older PM2 configurations, unless explicitly refactoring a module to ESM.
* **Avoid Heavy Abstractions:** Keep ffmpeg pipelines raw and visible. Do not use wrapper libraries like `fluent-ffmpeg`; we need precise, bare-metal control over the flags being passed to `ffmpeg` to ensure exact PSP codec compliance.
* **PSP Compatibility:** The PSP requires video resolutions strictly divisible by 16 (or standard resolutions like 480x272), audio at 44100Hz, and strict profile baselines. Always test your ffmpeg flags against real hardware or PPSSPP before committing.
