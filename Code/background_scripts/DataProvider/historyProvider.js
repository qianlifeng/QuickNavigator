historyProvider = function(){
    var historyCache = [];
    var size = 10000;

     function refreshInternal(){
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
               me.historyCache.push({title:element.title,url:element.url,sourceType:"history",relevancy:0}); 
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

    function queryInternal(txt){
        if(this.historyCache && this.historyCache.length > 0){
            return this.historyCache.find(txt);
        }
    }

    return{
        query:function(txt,asyncFunc){
                  return queryInternal(txt);          
        },
        async:false,
        init:function(){
                  refreshInternal(); 
        }
    };
}();
