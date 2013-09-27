var baiduSuggestionProvider = function(){
    return {
        query:function(txt,asyncFunc){
            var suggestion = [];
            var reg = /s:\[(.*)?\]\}/gi;
            $.get("http://suggestion.baidu.com/su?cb=&wd="+txt)
            .always(function(d){
                   var urlArrary = reg.exec(d.responseText);
                   if(typeof urlArrary !== "undefined"){
                       var firstMatch = urlArrary[1].split(",")[0];
                       suggestion.push({title:firstMatch,url:"http://www.baidu.com/s?wd="+firstMatch,providerName:"baiduSuggestionProvider",searchItem:txt}); 
                       asyncFunc(suggestion);
                   }
            });

           return suggestion; 
        },
        async:true,
        init:function(){ }
    };
}();
