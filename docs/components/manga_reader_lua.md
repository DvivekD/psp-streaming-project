# MangaReader Lua Implementation

## Overview
The MangaReader application is a Lua-based frontend for the PSP that allows users to read manga efficiently. Due to the PSP's strict memory constraints, careful image buffer management is critical.

## Image Buffer Management and VRAM Limits
The PSP has 2MB of VRAM (Video RAM) and a relatively small amount of main memory. When loading images in Lua (e.g., using Lua Player Plus or similar interpreters), uncompressed images can quickly exhaust available memory. An 800x600 image consumes significantly more memory when loaded into a texture than its compressed JPEG/PNG file size. Therefore, the MangaReader only loads the current, previous, and next pages into memory. Preloading beyond this causes out-of-memory crashes.

## Garbage Collection Fixes
Historically, PSP Lua scripts relied on explicit memory management functions like `image.free(img)` to unload textures from memory. However, mixing manual memory management with Lua's automatic Garbage Collection (GC) often led to memory leaks, dangling pointers, or hard crashes during page transitions.
To resolve this, the implementation has shifted from manual `image.free()` calls to standard Lua Garbage Collection. By properly setting image object references to `nil` when they are no longer needed (e.g., `currentPageImage = nil`) and explicitly invoking `collectgarbage("collect")` during page turns, we ensure that both main memory and VRAM are reliably cleared without risking the instability of manual deallocation functions.

## Continuous Mode Pagination Logic
The continuous mode allows a seamless reading experience where scrolling past the bottom of a page automatically loads and transitions to the next page.
- **Scroll Detection:** The logic tracks the Y-offset of the current image. When `Y-offset + ScreenHeight >= ImageHeight`, the user has reached the bottom.
- **Transition:** Upon reaching the bottom (and with further D-pad DOWN input), the next page is loaded, and the Y-offset is reset to 0 (top of the new page).
- **Preloading:** During continuous scrolling, a background coroutine (or state machine step) prepares the file path for the next page, allowing for minimal blocking when the transition occurs.
