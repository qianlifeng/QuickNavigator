dataProviderModule.service("mostRecentUseProvider", function () {
    this.async = false;
    this.init = function(){ }
    this.applyRelevancy = true;
    this.relevancy = 15;
    this.dataProvider = "mostRecentUseProvider";
    this.name = "经常使用";
    this.description = "经常使用";

    this.query = function(txt,asyncFunc){

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
