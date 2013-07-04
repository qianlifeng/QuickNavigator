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
            return this.bookMarksCache.find(txt);
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
        init:function(){
                  refreshInternal(); 
        }
    };
}();
