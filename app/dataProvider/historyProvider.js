dataProviderModule.service("historyProvider", function ($cfg) {

    var historyCache = [];
    var size = 10000;

    this.applyRelevancy = true;
    this.relevancy = 10;
    this.name = "历史记录";
    this.description = "历史记录";
	this.async = false;
    this.init = function(){
        var me = this;
        this.historyCache =  []; 
        chrome.history.search({
            text: "",
            maxResults: this.size,
            startTime: 0
        }, function(history) {
            var _i, _len, _ref;
            history.sort(_compareHistoryByUrl);
            history.forEach(function(element,n,arrary){
               me.historyCache.push({title:element.title,url:element.url,providerName:"historyProvider"}); 
            });
            //chrome.history.onVisited.addListener(_this.onPageVisited.bind(_this));
            //chrome.history.onVisitRemoved.addListener(_this.onVisitRemoved.bind(_this));
      });
    }

    function _compareHistoryByUrl(a, b) {
      if (a.url === b.url) {
        return 0;
      }
      if (a.url > b.url) {
        return 1;
      }
      return -1;
    }

    this.query = function(txt,asyncFunc){
        if(this.historyCache && this.historyCache.length > 0){
            var now =  new Date().getTime();
            var items = this.historyCache.find(txt);
            console.log("histroyProvider time:"+ (new Date().getTime() - now).toString());
            return items;
        }
    }

});
