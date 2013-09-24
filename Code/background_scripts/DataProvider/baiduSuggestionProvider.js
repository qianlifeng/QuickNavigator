var baiduSuggestionProvider = function(){
    return {
        query:function(txt){
            var suggestion = [];
            var reg = /s:\[(.*)?\]\}/gi;
            var s = $.ajax({
                type: "GET",
                url:"http://suggestion.baidu.com/su?cb=&wd="+txt,
                async:false
            }).responseText;

           var urlArrary = reg.exec(s);
           var firstMatch = urlArrary[1].split(",")[0];
           suggestion.push({title:firstMatch,url:"http://www.baidu.com/s?wd="+txt,sourceType:"百度",relevancy:1000}); 
           return suggestion; 
        },
        init:function(){ }
    };
}();
