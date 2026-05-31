# PSP Streaming Project API Documentation

This document exhaustively details the Express endpoints utilized across the PSP Streaming Project (Video, Music, Manga).

## 1. Video / Main Backend (`backend.js`)
The `backend.js` service is based on a highly modified version of `yt2009`. While it contains numerous endpoints for the old YouTube frontend and GData APIs, the critical routes utilized by the PSP client for streaming are documented below.

### `GET /stream_flv`
Streams a requested YouTube video transcoded into FLV format for the PSP.
* **Query Parameters:**
  * `v`: The YouTube Video ID to stream.
* **Headers Received:** Standard HTTP GET headers.
* **Headers Sent:**
  * `Content-Type: video/x-flv`
  * `Connection: close` *(Crucial to prevent stream bleeding and ensure ffmpeg pipes die instantly upon client disconnect)*
* **Connection Behavior:** Uses `yt-dlp` running through a Cloudflare WARP proxy (`socks5://127.0.0.1:40000`) to fetch the mp4 stream, which is instantly piped into `ffmpeg` encoding `flv1` on-the-fly and piped to the `res` object.
* **Response Type:** Raw `FLV` binary stream.

### `GET /stream_flv_v2`
An experimental/alternate streaming endpoint identical to `/stream_flv`.
* **Query Parameters:**
  * `v`: The YouTube Video ID.
* **Headers Sent:** `Content-Type: video/x-flv`, `Connection: close`.
* **Response Type:** Raw `FLV` binary stream.

---

## 2. Manga Backend (`manga-backend/manga-server.js`)
The Manga service interacts with `GoTube` and the internal dashboard, allowing manga to be read as slideshows on the PSP.

### `GET /api/gotube/search`
Searches for manga titles across multiple sources (`mangapill`, `mangahere`, `comick`, `mangadex`, `rac`).
* **Query Parameters:**
  * `q`: The search query.
* **Response Type:** `XML` (GoTube compliant OpenSearch format).

### `GET /api/gotube/chapters`
Retrieves a list of chapters for a specific manga.
* **Query Parameters:**
  * `id`: The internal manga ID in the format `providerKey:mangaId` (e.g., `mangapill:12345`).
* **Response Type:** `XML` (GoTube compliant).

### `GET /api/gotube/stream_flv`
Converts chapter pages into a slideshow FLV video stream.
* **Query Parameters:**
  * `chapterId`: The target chapter ID.
* **Headers Sent:**
  * `Content-Type: video/x-flv`
  * `Connection: keep-alive` *(Used here because image downloading and stitching into ffmpeg's concat demuxer is less susceptible to socket bleeding than direct continuous data piping, though it is manually killed on socket close).*
* **Connection Behavior:** Downloads images sequentially to `/tmp/manga_{chapterId}`, resizes them to 480x272, and spawns `ffmpeg` with `-f concat` to stream a 1fps slideshow (encoded at 24fps for PSP compatibility).
* **Response Type:** Raw `FLV` binary stream.

*(Additional internal Dashboard endpoints for Web UI: `/api/search`, `/api/chapters/:id`, `/api/set-session`, `/api/image-info/:index`, `/image/:index` which return JSON and JPEG respectively).*

---

## 3. SpotiFLAC Backend (`spotiflac-backend/spotiflac-server_azure.js`)
The SpotiFLAC service bridges YouTube Music to the PSP as an audio streaming platform.

### `GET /search`
Searches YouTube Music for songs, albums, or playlists.
* **Query Parameters:**
  * `q`: The search query. Supports prefix `@` for albums and `!` for playlists.
  * `page`: (Optional) Pagination.
* **Response Type:** `JSON` array of results.

### `GET /get_stream_link`
Provides the PSP with the direct stream link to `/stream` for a specific song ID.
* **Query Parameters:**
  * `id`: The song ID.
* **Response Type:** Text / String (The URL itself).

### `GET /stream`
Streams an audio track, accompanied by a spinning thumbnail, transcoded into FLV format.
* **Query Parameters:**
  * `id`: The YouTube Music ID. Optionally includes the thumbnail URL separated by `|||`.
* **Headers Sent:**
  * `Content-Type: video/x-flv`
  * `Connection: keep-alive`
* **Connection Behavior:** Uses `yt-dlp` to extract the `bestaudio`, piping it to `ffmpeg`. Simultaneously, `ffmpeg` takes the album cover thumbnail, applies a circular mask and rotation effect, and outputs a 480x272 FLV video with `libmp3lame` audio. Concurrency is strictly limited to 2 active transcodes to protect the server.
* **Response Type:** Raw `FLV` binary stream.
