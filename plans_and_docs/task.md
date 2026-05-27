# Anime Streaming on PSP 3000 (GoTube & yt2009 Integration)

## Completed
- [x] Re-verify YouTube streaming on iPhone hotspot (172.20.10.2)
- [x] Plan architecture for anime integration

## Phase 3: Setup Backend dependencies
- [ ] Install `@consumet/extensions` in `C:\yt2009`
- [ ] Create `anime_backend.js` containing search, episode listing, and video transcoding logic
- [ ] Inject anime Express routes in `C:\yt2009\back\backend.js`
- [ ] Create a thumbnail proxy `/anime/thumb` in `C:\yt2009\back\backend.js` to serve anime covers to the PSP

## Phase 4: Create GoTube PSP Plugin
- [ ] Create `Animex.js` plugin in `E:\PSP\GAME\GoTube\site`
- [ ] Implement list browsing flow:
  - Search returns anime titles
  - Clicking an anime queries episodes
  - Selecting an episode streams FLV via `/anime/play`

## Phase 5: Testing and Polish
- [ ] Validate server endpoints return valid GData XML
- [ ] Test transcoding quality and caching
- [ ] Test the user flow on real PSP hardware
- [ ] Create the `walkthrough.md` report
