filter = function(){

    var tempElement =  $("<input type='text' />");

    function match(source,target){
       if(!source || !target) return false; 

       //exact match
       if(source.indexOf(target) >= 0) return true;

       //pinyin match
       //if(py.getHans(source,target)) return true;
       try{
           var pinyin = py.convert(source).join("");
           if(pinyin.indexOf(target) >= 0) return true;
       }
       catch(err){}

       return false;
    }

    return{
        filter:function(dataSourceList,queryText){
            var result = [];
            $.each(dataSourceList,function(n,value) {
                //console.log(n+":"+value.title);
                if(match(value.title,queryText) || match(value.url,queryText)) 
                   result.push(value); 
                } 
            );
            return result;
        },
        //list here like: {title:"",url:"",sourceType:"",relevancy:0}
        merge:function(list1,list2){
            var merged = [];

            function hasnotAdded(element, index, array) {
                if(merged.some(function(e){ return e.title === element.title;})){
                    return false;
                }
                else {
                    merged.push(element);
                    return true;
                }
            }

            return list1.filter(hasnotAdded).concat(list2.filter(hasnotAdded));

            return merged;
        }
    };
}();

suggestions = function(){

    function query(txt){
        var bookMarkResult = bookMarkProvider.query(txt);
        var historyResult = historyProvider.query(txt);
        var popDomainResult = popDomainsProvider.query(txt);

        var res = filter.merge(historyResult,bookMarkResult);
        res = filter.merge(res,popDomainResult);

        addRelevancy(res);
        res.sort(function(a,b){
           return a.relevancy >= b.relevancy ? -1:1;
        });
        return res.slice(0,11); //only return 10 results
    }

    //relevancy is a integer, larger integer represent larger relevancy
    function addRelevancy(mergedList){
        mergedList.forEach(function(element,n,arrary){
            //fist, we must reset relevancy to 0, or it will increase repeatly when every words typed
            element.relevancy = 0;

            if(element.sourceType === "bookmark") element.relevancy += 10;
            if(element.sourceType === "history") element.relevancy += 7;
            if(element.sourceType === "popdomain") element.relevancy += 5;

            //check if this url has beed visited
            var visitedCount =  window.db.getUrlVisitedCount(element.url);
            //normalize(归一化)
            var ratio = window.db.getMaxCount() / 100,
            

            if(visitedCount > 0) {element.relevancy += 5};
        });
    }

    function refreshDataSource(){
        bookMarkProvider.refresh();
        historyProvider.refresh();
        popDomainsProvider.refresh();
    }

    return {
        init:function(){
            refreshDataSource();     
        },
        getSuggestion : function(txt){
            //console.log("get suggestion:"+txt);
            return query(txt); 
        }
    }; 

}();


//every data provider has two public methods:
// 1. query     query suggestions in it's datasource
// 2. refresh   refresh datasource
//
//

popDomainsProvider = function(){
     function refreshInternal(){
         //data was defined in popDomains.js
     }

    function queryInternal(txt){
        if(window.popDomains && window.popDomains.length > 0){
            return filter.filter(window.popDomains,txt);
        }
    }

    return{
        query:function(txt){
                  return queryInternal(txt);          
        },
        refresh:function(){
                  refreshInternal(); 
        }
    };
}();

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
            return filter.filter(this.historyCache,txt);
        }
    }

    return{
        query:function(txt){
                  return queryInternal(txt);          
        },
        refresh:function(){
                  refreshInternal(); 
        }
    };
}();

bookMarkProvider = function(){

    var bookMarksCache;

    function refreshInternal(){
        var me = this;
        this.bookMarksCache =  null; 
        chrome.bookmarks.getTree(function(bookMarkNodes){
            me.bookMarksCache = travelBookMarks(bookMarkNodes); 
        });
    }

    function queryInternal(txt){
        if(this.bookMarksCache){
            return filter.filter(this.bookMarksCache,txt);
        }
    }

    function travelBookMarks(bookMarks)
    {
        var bookmark;
        var results = [];
        var toVisit = bookMarks.reverse();
        while (toVisit.length > 0) {
            bookmark = toVisit.pop();
            if (bookmark.children) {
                toVisit.push.apply(toVisit, bookmark.children.reverse());
            }
            else{
                results.push({title:bookmark.title,url:bookmark.url,sourceType:"bookmark",relevancy:0});
            }
        }
        return results;
    }

    return{
        query:function(txt){
                  return queryInternal(txt);          
        },
        refresh:function(){
                  refreshInternal(); 
        }
    };
}();

suggestions.init();
