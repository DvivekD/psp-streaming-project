name = "Cloud Media (Anime & Movies)";
serverUrl = "http://20.24.21.215:8082";

function search(query, isMovie) {
    var type = isMovie ? "movie" : "anime";
    var searchUrl = serverUrl + "/search_media?type=" + type + "&query=" + escape(query);
    
    // Fetch JSON from Azure
    var jsonString = util.getURL(searchUrl); 
    if (!jsonString || jsonString.indexOf("success") === -1) {
        gotube.addList("Search Failed or Timed Out", "", "", "");
        return;
    }
    
    var response = eval("(" + jsonString + ")"); 
    
    if (response.success && response.data && response.data.length > 0) {
        for (var i = 0; i < response.data.length; i++) {
            var item = response.data[i];
            var img = item.image || item.img || "";
            // title, function, argument, thumbnail
            gotube.addList(item.title, "playMedia", type + "||" + item.id, img);
        }
    } else {
        gotube.addList("No results found.", "", "", "");
    }
}

// In GoTube menus, we need a way to distinct a search between Anime and Movies.
// We will just expose Anime for now as default, or we can use the plugin's built-in hooks if available.
// Actually, GoTube passes query to `search` natively. 
// We will just assume anime for default search unless they type "movie:" prefix.
function search_override(query) {
    var isMovie = false;
    if (query.toLowerCase().indexOf("movie:") === 0) {
        isMovie = true;
        query = query.substring(6).replace(/^\s+/, "");
    } else if (query.toLowerCase().indexOf("anime:") === 0) {
        query = query.substring(6).replace(/^\s+/, "");
    }
    search(query, isMovie);
}

// Standard GoTube function hook
search = search_override;

function playMedia(args) {
    var splitArgs = args.split("||");
    var type = splitArgs[0];
    var id = splitArgs[1];
    
    // For Movies, id and episodeId are usually the same or just passing id works.
    // For Anime, we need to fetch episodes. Since GoTube JS is simple, we will automatically play Episode 1
    // or fetch the episode list. To keep it simple, we just play the first episode/media directly.
    var episodeId = id; 
    
    if (type === "anime") {
        // Gogoanime episode IDs are usually id + "-episode-1"
        episodeId = id + "-episode-1";
    }

    var linkUrl = serverUrl + "/get_stream_link?type=" + type + "&id=" + escape(id) + "&episodeId=" + escape(episodeId);
    var rawM3u8 = util.getURL(linkUrl);
    
    if (!rawM3u8 || rawM3u8 === "ERROR") {
        gotube.addList("Failed to extract stream.", "", "", "");
        return;
    }
    
    // Pass the raw link to the ffmpeg pipe on Azure
    var playUrl = serverUrl + "/play?url=" + escape(rawM3u8) + "&id=" + escape(id);
    gotube.play(playUrl);
}
