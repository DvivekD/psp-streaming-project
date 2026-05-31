var YouTubex = new Object();
YouTubex.rev = 2;
YouTubex.SearchDesc = "YouTube by Xiphirx";
YouTubex.Name = "YouTubex";
YouTubex.Search	= function (keyword, page){
	var result = new Object();
	result.bypage = 20;// modifiable
	result.start = (page-1)*result.bypage+1;//&begin=250000
	var sortBy = "relevance";
	var catSpecified = false;
	
	if (keyword.charAt(0) == '$')
	{
		var keywordBu = keyword;
		var kpos = keyword.indexOf(" ");
		var category = keyword.substring(1, kpos);
		keyword = keyword.substring(kpos+1);
		catSpecified = true;
	}
	
	PSPTube.log(keyword+"\n");
	
	if (keyword.charAt(0) == '@')
	{
		sortBy = "published";
		PSPTube.log("Sort = published\n");
	}
	
	
	if (catSpecified == false)
	{
		c=GetContents('http://upbackup67dev.duckdns.org/feeds/api/videos?q='+escape(keyword)+'&start-index='+result.start+'&max-results='+result.bypage+'&orderby='+sortBy+'&racy=include&v=1');
		PSPTube.log("No Category\n");
	}
	else
	{
		c=GetContents('http://upbackup67dev.duckdns.org/feeds/api/videos?q='+escape(keyword)+'&start-index='+result.start+'&max-results='+result.bypage+'&orderby='+sortBy+'&racy=include&category='+category+'&v=1');
		PSPTube.log("Category specified\nCategory = "+category+"\n");
	}

	result.total     = ext("<openSearch:totalResults>");
	result.VideoInfo = new Array();
	v = {attr:2};
	v.id = 0;
	v.Title = "YouTube Search Help";
	v.Description = "@query = search by upload date\n$category query = search in a category";
	v.URL = '';

	result.VideoInfo.push(v);
	while(p=c.indexOf("<entry",p)+1){
		v = {attr:2};//neither IDA|npp find this string ...0=RD 1= 2=SRD 3=S
		v.id            = ext("<id>http://upbackup67dev.duckdns.org/feeds/api/videos/","</id>");
		v.Title         = ext("<title type='text'>");
		v.Description   = ext("content type='text'>")+'\nUploader:'+ext("<name>");
		v.CommentCount  = ext("countHint='")*1;
		v.Tags          = ext("keywords>").replace(/,/g,"");
		v.LengthSeconds = ext("ds='")*1;
		v.RatingAvg     = ext("average='")*1;
		v.RatingCount   = ext("numRaters='")*1;
		v.MylistCount   = ext("favoriteCount='")*1;
		v.ViewCount     = ext("viewCount='")*1;
		v.ThumbnailURL  = 'http://upbackup67dev.duckdns.org/vi/'+v.id+'/default.jpg';
		v.SaveFilename  = v.id+".flv";
		v.URL	          = 'YouTubex.play("'+v.id+'")';
		result.VideoInfo.push(v);
	}
	result.end       = result.start-1+result.VideoInfo.length;
	return result;
}
YouTubex.play = function (id){
	return "http://upbackup67dev.duckdns.org/get_video?video_id="+id;
}
SiteList.push(YouTubex);



