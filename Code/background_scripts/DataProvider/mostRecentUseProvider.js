var mostRecentUseProvider = function(){
    return {
        query:function(txt){
               var urls = db.getVisitedURLs();
               urls.sort(function(a,b){
                    return b.visitedCount - a.visitedCount; 
               });
               var mruLists = [];
               var maxMRUCount =  config.getMRUCount();
               urls = urls.slice(0,maxMRUCount);
               urls.forEach(function(element,n,arrary){
                   mruLists.push({title:element.title,url:element.url,sourceType:"MRU",relevancy:element.visitedCount}); 
               });
               return mruLists; 
        },
        init:function(){ }
    };
}();
