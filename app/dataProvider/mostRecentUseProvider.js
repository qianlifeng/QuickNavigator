var mostRecentUseProvider = function(){
    var injector = angular.injector(['ng', 'TheModule']);

    injector.invoke(['theService', function(theService){
        theService.setCurrent([
            {text:'learn angular', done:true},
            {text:'build an angular app', done:false}
        ]);
    }]);

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
                   mruLists.push({title:element.title,url:element.url,providerName:"mostRecentUseProvider",relevancy:element.visitedCount}); 
               });
               
               if(typeof txt === "undefined" || txt === "") return mruLists;
               return mruLists.find(txt); 
        },
        async:false,
        init:function(){ }
    };
}();
