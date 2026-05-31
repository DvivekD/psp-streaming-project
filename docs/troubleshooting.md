# PSP Streaming Project - Troubleshooting Guide

This document contains exhaustive details of the major bugs encountered during the development of the PSP Streaming Project, their symptoms, and the exact fixes applied to resolve them.

## 1. ffmpeg pipe hangs
- **Symptom:** When attempting to stream a video on the PSP, the video playback hangs completely on a black screen. The characteristic "light blue buffering line" on the PSP never appears.
- **Cause:** In the `backend.js` (yt2009) transcoder, `ffmpeg` was initially set up to read video bytes from a piped stream (using the `-re` flag). Because it was reading from a pipe rather than a direct file or HTTP link, `ffmpeg` was failing to send the initial FLV video headers (specifically the `moov` atom) to the console immediately, causing the PSP player to hang indefinitely waiting for the header.
- **Fix:** The transcoding pipeline in `backend.js` was rewritten. Instead of piping raw bytes, the server uses `yt-dlp` (routed through the WARP proxy) to extract the raw HTTP URL of the YouTube video. This direct HTTP URL is then fed directly into `ffmpeg`. Because `ffmpeg` reads from a direct HTTP network link, it can instantly skip to the end of the video, read the `moov` atom, and begin streaming the FLV data to the PSP immediately.

## 2. manga vram crashes
- **Symptom:** The PSP crashes with an "out of memory" error or displays corrupted gray textures when scrolling through long manhwas or webtoons.
- **Cause:** Manhwas are designed as one continuous scrolling strip. Initially, the server was gluing all pages together into a single massive 24,000-pixel-tall image and sending it to the PSP. This massive image completely exceeded the PSP's limited 32MB of RAM, causing the VRAM to crash.
- **Fix:** The `script.lua` engine for the MangaReader was completely re-architected. The Azure server now slices the massive continuous strip into 61 optimized, smaller chunks. The PSP script uses a rolling window/garbage collector to free off-screen chunks from VRAM and only loads chunks currently needed. It also utilizes ONElua's `thread mode` for true asynchronous downloading of chunks to the Memory Stick (`ms0:/MangaReader/cache/`) without freezing the UI.

## 3. yt-dlp datacenter IP blocks
- **Symptom:** Video streams fail to start, and the backend logs show `HTTP 403 Forbidden` or `403 BadAuthentication` errors from YouTube.
- **Cause:** The project was migrated to an Azure Virtual Machine, and YouTube's anti-bot systems heavily flag and block datacenter IP addresses. Additionally, the initial version of `yt-dlp` was outdated and unable to bypass new YouTube bot-protections.
- **Fix:** First, `yt-dlp` was updated to the latest release to bypass current signature blocks. Second, Cloudflare WARP (`cloudflare-warp`) was installed on the Azure VM. It was configured strictly in **Proxy Mode** (SOCKS5 proxy on `127.0.0.1:40000`) rather than global VPN mode to avoid severing the SSH connection. All `yt-dlp` traffic was then globally routed through this SOCKS5 WARP tunnel, successfully masking the datacenter footprint and bypassing the YouTube IP bans.

## 4. spotiflac HTTP keep-alive audio bleeding
- **Symptom:** When skipping tracks in the Spotiflac application, audio from the previous track continues playing and mixes ("bleeds") into the new track. Audio buffering is also slow.
- **Cause:** The `spotiflac-server_azure.js` backend was using HTTP Keep-Alive connections, keeping the stream open between skips. Additionally, `ffmpeg` was using the `-re` flag (read at native frame rate), which prevented the server from building a fast buffer.
- **Fix:** The `-re` flag was removed from the `ffmpeg` command, allowing it to instantly blast the converted FLV audio to the PSP and build a massive buffer. Furthermore, the `Connection: close` HTTP header was forced on the responses, ensuring the connection cleanly terminates on skips and preventing any audio bleeding. Spotiflac's `yt-dlp` was also routed through the same SOCKS5 WARP proxy to avoid IP bans.
