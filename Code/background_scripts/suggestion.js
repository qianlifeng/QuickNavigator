filter = function(){

    var tempElement =  $("<input type='text' />");

    function match(source,target){
       if(!source || !target) return false; 

       //exact match
       if(source.indexOf(target) > 0) return true;

       //pinyin match
       try{
           var pinyin = py.convert(source).join("");
           if(pinyin.indexOf(target) > 0) return true;
       }
       catch(err){}

       return false;
    }

    return{
        filter:function(dataSourceList,queryText){
            var result = [];
            $.each(dataSourceList,function(n,value) {
                if(match(value.title,queryText) || match(value.url,queryText)) 
                   result.push(value); 
                } 
            );
            return result;
        },
        //list here like: {title:"",url:"",sourceType:""}
        merge:function(list1,list2){
            var merged = [];

            function hasnotAdded(element, index, array) {
                if(merged.some(function(e){ e.title === element.title})){
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
        var result = [];
        var bookMarkResult = bookMarkProvider.query(txt);
        return filter.merge(result,bookMarkResult);
    }

    function refreshDataSource(){
        bookMarkProvider.refresh();
    }

    return {
        init:function(){
            refreshDataSource();     
        },
        getSuggestion : function(txt){
            console.log("get suggestion:"+txt);
            return query(txt); 
        }
    }; 

}();


//every data provider has two public methods:
// 1. query     query suggestions in it's datasource
// 2. refresh   refresh datasource
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
                results.push({title:bookmark.title,url:bookmark.url,sourceType:"bookmark"});
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
