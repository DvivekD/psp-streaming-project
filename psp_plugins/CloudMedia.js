var CloudMedia = new Object();
CloudMedia.rev = 1;
CloudMedia.SearchDesc = "Anime and Movies";
CloudMedia.Name = "CloudMedia";

CloudMedia.Search = function (keyword, page) {
    var result = new Object();
    result.bypage = 20;
    result.start = (page - 1) * result.bypage + 1;
    
    var isMovie = false;
    if (keyword.charAt(0) == '$') {
        isMovie = true;
        keyword = keyword.substring(1).replace(/^\s+/, "");
    }
    
    var type = isMovie ? "movie" : "anime";
    var serverUrl = "http://20.24.21.215:8082";
    var searchUrl = serverUrl + "/search_media?type=" + type + "&query=" + escape(keyword);
    
    PSPTube.log("CloudMedia Search: " + searchUrl + "\n");
    
    var jsonString = GetContents(searchUrl);
    
    result.VideoInfo = new Array();
    result.total = 0;
    
    // Fallback error item
    var err = {attr:2};
    err.id = "0";
    err.Title = "CloudMedia Search Info";
    err.Description = "Prefix with $ to search Movies instead of Anime. (e.g., $oppenheimer)";
    err.ThumbnailURL = "";
    err.SaveFilename = "info.flv";
    err.URL = "";
    result.VideoInfo.push(err);

    if (jsonString && jsonString.indexOf("success") !== -1) {
        var response = eval("(" + jsonString + ")");
        if (response.success && response.data) {
            result.total = response.data.length;
            for (var i = 0; i < response.data.length; i++) {
                var item = response.data[i];
                var v = {attr:2};
                v.id = item.id;
                v.Title = item.title || "Unknown Title";
                v.Description = type.toUpperCase() + "\n" + (item.releaseDate || item.type || "");
                v.ThumbnailURL = item.image || item.img || "";
                v.SaveFilename = v.id + ".flv";
                // Pass type alongside id
                v.URL = 'CloudMedia.play("' + type + '||' + v.id + '")';
                result.VideoInfo.push(v);
            }
        }
    }
    
    result.end = result.start - 1 + result.VideoInfo.length;
    return result;
}

CloudMedia.play = function (args) {
    var splitArgs = args.split("||");
    var type = splitArgs[0];
    var id = splitArgs[1];
    var episodeId = id; 
    
    if (type === "anime") {
        episodeId = id + "-episode-1";
    }

    var serverUrl = "http://20.24.21.215:8082";
    var linkUrl = serverUrl + "/get_stream_link?type=" + type + "&id=" + escape(id) + "&episodeId=" + escape(episodeId);
    
    PSPTube.log("Fetching stream: " + linkUrl + "\n");
    var rawM3u8 = GetContents(linkUrl);
    
    if (!rawM3u8 || rawM3u8 === "ERROR") {
        return ""; // Fails silently on PSP
    }
    
    var playUrl = serverUrl + "/play?url=" + escape(rawM3u8) + "&id=" + escape(id);
    return playUrl;
}

SiteList.push(CloudMedia);
