var Animex = new Object();
Animex.rev = 1;
Animex.SearchDesc = "Anime via AnimeSaturn";
Animex.Name = "Animex";
Animex.Search = function (keyword, page){
	var result = new Object();
	result.bypage = 20;
	result.start = (page-1)*result.bypage+1;
	
	PSPTube.log("Anime Search: " + keyword + " Page: " + page + "\n");
	
	c=GetContents('http://upbackup67dev.duckdns.org/anime/api/videos?q='+escape(keyword)+'&start-index='+result.start+'&max-results='+result.bypage+'&v=1');

	result.total     = ext("<openSearch:totalResults>") * 1;
	result.VideoInfo = new Array();
	
	while(p=c.indexOf("<entry",p)+1){
		v = {attr:2};
		v.id            = ext("<id>http://upbackup67dev.duckdns.org/anime/id/","</id>");
		v.Title         = ext("<title type='text'>");
		v.Description   = ext("content type='text'>");
		v.ThumbnailURL  = ext("<media:thumbnail url='","'/>");
		v.SaveFilename  = v.id+".flv";
		v.URL	          = 'Animex.play("'+v.id+'")';
		result.VideoInfo.push(v);
	}
	result.end       = result.start-1+result.VideoInfo.length;
	return result;
}
Animex.play = function (id){
	return "http://upbackup67dev.duckdns.org/anime/play?episode_id="+id;
}
SiteList.push(Animex);
