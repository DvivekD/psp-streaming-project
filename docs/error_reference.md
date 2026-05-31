# PSP Streaming Project - Error Reference

A dictionary of common error messages encountered during the project and their root causes.

### `403 BadAuthentication` / `HTTP 403 Forbidden`
- **Component:** `yt-dlp` / YouTube API
- **Root Cause:** YouTube's anti-bot system blocking the request. This occurs either because `yt-dlp` is outdated and cannot bypass the latest signature algorithms, or because the server's IP address (e.g., an Azure datacenter IP) is globally blocked by YouTube.
- **Resolution:** Update `yt-dlp` to the latest version and route traffic through a residential proxy or Cloudflare WARP to mask the datacenter IP.

### `attempt to call field free a nil value`
- **Component:** PSP MangaReader (`script.lua` ONElua engine)
- **Root Cause:** A syntax or API error in the Lua garbage collector function. When the PSP attempted to delete an off-screen image chunk from RAM to save memory as the user scrolled down, the incorrectly named free function returned `nil`, corrupting the memory and crashing the script (often resulting in gray textures).
- **Resolution:** Correct the function call to the proper ONElua image freeing syntax (e.g., `image.free()`).

### `Connection timed out` (SSH)
- **Component:** Azure VM / Cloudflare WARP
- **Root Cause:** Configuring `cloudflare-warp` in standard system-wide VPN mode (`mode warp`) on a headless cloud environment. This instantly routes all outbound packets, including SSH return packets, through the WARP tunnel interface instead of the VM's public network gateway, breaking the TCP connection and locking you out of the server.
- **Resolution:** Forcefully stop the WARP daemon via Azure "Run command" to restore the default network routing tables. Reconfigure WARP to run exclusively in `mode proxy` (SOCKS5).

### `EPIPE` / `write EPIPE`
- **Component:** Node.js Backend (`backend.js`)
- **Root Cause:** The PSP client prematurely disconnected (e.g., skipping a video or closing the app), but the Node.js server and `ffmpeg` attempted to continue writing data to the closed network socket.
- **Resolution:** Implement error handlers on the stream and a "Zombie Process Wall" (`req.on('close')`) to actively kill lingering `ffmpeg` and `yt-dlp` processes when the PSP disconnects.

### `'best' is not a valid URL`
- **Component:** WebOne / `yt-dlp`
- **Root Cause:** Misconfiguration in `webone.conf`. The WebOne proxy passed the argument `format=best` literally as the video URL to `yt-dlp`, causing it to crash because it expected a valid HTTP link.
- **Resolution:** Revert custom formatting arguments in `webone.conf` and ensure the proxy parses options correctly before passing them to the downloader.
