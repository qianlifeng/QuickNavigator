dataProviderModule.service("bookMarkProvider", function ($cfg) {

    var bookMarksCache;

    this.async = false;
    this.init = function(){
        var me = this;
        this.bookMarksCache =  null; 
        chrome.bookmarks.getTree(function(bookMarkNodes){
            me.bookMarksCache = travelBookMarks(bookMarkNodes); 
        });
    }

    this.query =  function(txt,asyncFunc){
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
                results.push({title:bookmark.title,url:bookmark.url,providerName:"bookMarkProvider"});
            }
        }
        return results;
    }
});
