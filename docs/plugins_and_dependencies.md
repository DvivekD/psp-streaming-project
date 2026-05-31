# PSP Streaming Project Dependencies & Plugins

This document outlines the core Node.js modules, CLI tools, external APIs, and architectural dependencies utilized to make modern web media compatible with the Sony PlayStation Portable (PSP).

## Node Modules (NPM)
* **`express`**: The core HTTP server framework used across all three sub-systems (Main Video, Manga, SpotiFLAC). Chosen for its lightweight footprint and ease of piping streams.
* **`axios` / `node-fetch`**: Employed for HTTP requests, specifically downloading images in the Manga backend and handling external API calls in yt2009.
* **`sharp`**: Utilized heavily in the Manga backend for high-performance image manipulation. Chosen over ImageMagick because it operates in-memory (using `libvips`), which is crucial for dynamically resizing manga pages and stitching them into continuous streams.
* **`cheerio`**: Used in the Manga backend (specifically the ReadAllComics provider) for parsing HTML DOMs and scraping elements when standard JSON APIs are unavailable.
* **`child_process` (`spawn`, `exec`)**: Essential native Node module used to spawn external CLI tools like `yt-dlp` and `ffmpeg`.
* **`@consumet/extensions`**: A massive scraping library used in the Manga backend to parse data from sites like MangaDex, MangaHere, and ComicK. Chosen because it provides standardized JSON outputs for heavily obfuscated streaming sites.
* **`lru-cache`** (Referenced implicitly in `yt2009`): Used for caching video metadata, comments, and search results in memory to reduce upstream API load.

## CLI Tools
* **`yt-dlp`**: The absolute backbone of the video and music backends. It is utilized to bypass YouTube's cipher signatures and extract direct stream URLs. Chosen over `youtube-dl` due to its active maintenance and ability to handle throttling.
* **`ffmpeg`**: The multimedia encoder. The PSP has strict hardware decoding requirements (FLV1/H264 baseline, specific resolutions like 480x272, specific framerates). `ffmpeg` transcodes modern formats (like WebM or MP4) in real-time.
* **`warp-cli` (Cloudflare WARP)**: Runs a local SOCKS5 proxy (`127.0.0.1:40000`). Used aggressively by `yt-dlp` to bypass YouTube's IP blocking and geo-restrictions on server datacenters. Chosen over standard proxies due to reliability and bandwidth limits.
* **`python3`**: Executed via `child_process` to run custom YouTube Music search scraping scripts (`ytm_search.py`) in the SpotiFLAC backend.

## External APIs & Services
* **Piped API**: (Used historically / implicitly in parts of the codebase). Acts as an alternative to the official YouTube Data API. Chosen for its lack of rate-limiting and quota restrictions.
* **yt2009 API**: The main backend is built on a heavy fork of `yt2009`, utilizing its mechanisms to translate modern YouTube API responses into legacy XML payloads that the PSP's internal NetFront browser and GoTube application can natively parse.
* **ScraperAPI**: Utilized in the Manga backend (`ReadAllComicsProvider`) to bypass Cloudflare's Under Attack Mode. A necessary evil, as direct HTTP requests would result in 403 Forbidden errors.
* **MangaDex / MangaPill / ComicK APIs**: Sourced via `@consumet` to grab high-quality manga images.

## Alternative Considerations
* **Why `flv1` instead of `h264`?** While the PSP technically supports `H.264`, the baseline profile required is extremely strict and computationally expensive to transcode on-the-fly. `flv1` (Sorenson Spark) requires significantly less CPU overhead, allowing small VMs to transcode multiple streams simultaneously without buffering, at the cost of slightly higher bitrates.
* **Why not pipe `ffmpeg` directly to `yt-dlp` via stdout?** We do this in the video backend for efficiency. In the Manga backend, we dump images to `/tmp` first because Manga site CDNs throttle concurrent requests; downloading sequentially and using `ffmpeg -f concat` proved much more stable than piping dynamic image buffers.
