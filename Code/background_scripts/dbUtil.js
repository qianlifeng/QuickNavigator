window.db = (function(){
    
   var maxCache;

	return {
		saveVisitedUrl:function(url){
            var urls;
            try{
                urls =JSON.parse(localStorage['QuickNavigator_VisitedURL']);
                if(!urls || url.length == 0 || !(urls instanceof Array)) urls = [];
            }
            catch(err){
                urls = [];
            }


            var hasStoraged = false;
            for(var i = 0; i < urls.length; i++){
                if(urls[i].url === url){
                    urls[i].visitedCount = urls[i].visitedCount + 1;
                    hasStoraged = true;
                    break;
                }                
            }

            if(!hasStoraged) urls.push({url:url,visitedCount:1});
            maxCache = null;

            localStorage['QuickNavigator_VisitedURL']= JSON.stringify(urls);
        },
        getUrlVisitedCount:function(url){
            try{
                var urls = JSON.parse(localStorage['QuickNavigator_VisitedURL']);
                if(!urls) return 0;

               for(var i = 0; i < urls.length; i++){
                    if(urls[i].url === url){
                        return urls[i].visitedCount;
                    } 
               }
            }
            catch(err){}

            return 0;
        },
        getMaxCount:function(){
          if(maxCache) return maxCache;

          var max = 0;
          try{
                var urls = JSON.parse(localStorage['QuickNavigator_VisitedURL']);
                if(!urls) return 0;

               for(var i = 0; i < urls.length; i++){
                    if(urls[i].visitedCount > max){
                        max = urls[i].visitedCount;
                    } 
               }
          }
          catch(err){}

          maxCache = max;
          return max;           
        }
	};
})();