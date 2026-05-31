# PSP Streaming Project

Welcome to the ultimate ecosystem for bringing modern internet media down to the original Sony PlayStation Portable (PSP) hardware. 

This project bridges the immense gap between modern web standards (TLS 1.3, HTTPS, H.264, React, Next.js) and the PSP's proprietary NetFront browser from 2004 (TLS 1.0, 2MB RAM limits, HTTP-only).

## Core Capabilities

By deploying this ecosystem on a middleman server (like an Azure VM), your PSP can natively:
- **Watch YouTube Videos**: Using a resurrected 2009 YouTube interface (yt2009) and real-time FFmpeg FLV transcoding.
- **Listen to Spotify/SoundCloud**: Via the Spotiflac audio transcoder.
- **Read Manga**: Using a custom MangaDex wrapper that slices high-res manga panels into 480x272 chunks that fit precisely into the PSP's microscopic Video RAM.
- **Access Cloud Storage**: Stream videos and download files directly from a custom HTTP cloud interface.

## Documentation Directory

We have exhaustively documented every bug, architecture decision, and configuration step. If you are a new developer or contributor, start here:

- [System Architecture](docs/architecture.md): Understand the Cloudflare WARP proxy pipeline and FFmpeg memory management.
- [Setup and Deployment](docs/setup_and_deployment.md): Step-by-step instructions to get the Azure VM running.
- [Changelog](docs/changelog.md): The chronological history of the project's evolution.
- [Troubleshooting & Bug Fixes](docs/troubleshooting.md): How we solved FFmpeg pipe hangs, VRAM crashes, and IP blocks.
- [Error Reference](docs/error_reference.md): A dictionary of exact error messages and their root causes.
- [API Documentation](docs/api_documentation.md): Details on every Express backend endpoint.
- [Plugins and Dependencies](docs/plugins_and_dependencies.md): Why we use `yt-dlp`, PM2, and specific Lua wrappers.
- [Contributor Notes](docs/contributor_notes.md): Coding standards and crash protection rules.
- [Future Improvements & TODO](docs/future_improvements.md): What needs to be built next.

### Component Deep Dives
- [PSP yt2009 Frontend](docs/components/psp_yt2009_frontend.md)
- [Manga Reader Lua Application](docs/components/manga_reader_lua.md)
- [Cloud Storage Streaming](docs/components/cloud_storage_streaming.md)

## The Philosophy

The PSP is an incredible piece of hardware that was abandoned by modern security protocols. Instead of modifying the PSP's internal firmware to support modern TLS, this project moves the entire modern internet onto a highly robust Node.js backend. The backend acts as a translator, downloading media in modern formats, transcoding it to the highly-resilient FLV format, and streaming it via pure HTTP to the PSP.

We use **Cloudflare WARP** to mask our datacenter IP from YouTube's BotGuard, **FFmpeg** for real-time format translation, and **yt-dlp** for robust media extraction.
