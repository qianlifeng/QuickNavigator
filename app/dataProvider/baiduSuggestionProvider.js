dataProviderModule.service("baiduSuggestionProvider", function ($cfg) {
        this.query = function(txt,asyncFunc){
            var suggestion = [];
            var reg = /s:\[(.*)?\]\}/gi;
            $.get("http://suggestion.baidu.com/su?cb=&wd="+txt)
            .always(function(d){
                   var urlArrary = reg.exec(d.responseText);
                   if(typeof urlArrary !== "undefined" && typeof urlArrary[1] !== "undefined"){
                       var firstMatch = urlArrary[1].split(",")[0];
                       suggestion.push({title:firstMatch,url:"http://www.baidu.com/s?wd="+firstMatch,providerName:"baiduSuggestionProvider",searchItem:txt}); 
                       asyncFunc(suggestion);
                   }
            });

           return suggestion; 
        };
        this.async = true;
        this.init = function(){ };
});
