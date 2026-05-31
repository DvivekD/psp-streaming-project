# Cloud Storage Streaming

## Overview
This document outlines the cloud file hosting structure and the mechanism by which the PSP streams videos directly from the cloud backend.

## Cloud File Hosting Structure
The cloud backend acts as a centralized repository for media files. Videos are structured in a flat or shallow hierarchical directory system accessible via standard HTTP servers.
- Files are pre-processed or stored in PSP-compatible formats (such as specific MP4/AVC profiles or compatible FLV formats).
- An API endpoint (or simple directory listing) provides the PSP with the direct URL to the media file.
- The server must support HTTP Range requests, allowing the PSP to seek within the file and resume broken downloads, which is vital given the unstable nature of the PSP's 802.11b Wi-Fi connection.

## Direct Streaming Mechanism
The PSP uses its native NetFront browser/streaming engine to access the files.
1. **Request:** The Lua frontend or web portal generates a direct HTTP URI to the cloud-hosted video.
2. **Handshake:** The PSP initiates an HTTP GET request. The cloud server responds with the appropriate MIME type (e.g., `video/mp4` or `video/x-flv`) and supports range headers.
3. **Buffering:** As described in the yt2009 frontend docs, the PSP requests data as fast as the network allows. The cloud storage must serve the file unthrottled.
4. **Playback:** The PSP's hardware decoder processes the incoming HTTP stream in real-time. By streaming directly from the cloud without intermediate transcoding on a local proxy (assuming the file is pre-formatted), latency is reduced and the system scales efficiently.
