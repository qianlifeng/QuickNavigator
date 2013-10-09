dataProviderModule.service("mostRecentUseProvider", function ($cfg) {
    this.async = false;

    this.init = function(){ }

    this.query = function(txt,asyncFunc){
        if($cfg.getCfg().commands.mru.disabled) return [];

        var urls = db.getVisitedURLs();
        urls.sort(function(a,b){
            return b.visitedCount - a.visitedCount; 
        });
        var mruLists = [];

        //todo:remove only visit one time url when urls.count > 500
        urls.forEach(function(element,n,arrary){
            mruLists.push({title:element.title,url:element.url,providerName:"mostRecentUseProvider",relevancy:element.visitedCount}); 
        });

        if(typeof txt === "undefined" || txt === "") return mruLists;
        return mruLists.find(txt); 
    };
});
