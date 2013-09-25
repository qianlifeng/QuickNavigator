var mostRecentUseProvider = function(){
    return {
        query:function(txt,asyncFunc){
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
               
               if(typeof txt === "undefined" || txt === "") return mruLists;
               return mruLists.find(txt); 
        },
        async:false,
        init:function(){ }
    };
}();
