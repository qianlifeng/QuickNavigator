angular.module('app.filters', [])
    .filter("providerName",function($cfg){
        var dataProviders = $cfg.getCfg().dataProvider;
        return function(providerName) {
            dataProviders.forEach(function(item){ 
                if(item.name === providerName){
                    providerName = item.text;
                }
            });

            return providerName;
        };
    })
    .filter("domainIconUrl",function($url){
        return function(url) {
            if(url === "") return chrome.extension.getURL("images/file.ico");

            var domainUrl =  $url.getDomainUrl(url);
            return domainUrl + "/favicon.ico";
        };
    })
    .filter("hightlightSearch",function(){
        return function(source,words) {
            if(words === "")return source;

            var matched = '';

            //exact match
            var r = new RegExp(words,"gi");
            matched = source.replace(r, "<span class=\"omnibox-suggestions-highlight\">"+words+"</span>"); 
            if(source !== matched) return matched; 

            //pinyin match 
            var matchResult = py.getHans(source,words);
            if(matchResult && matchResult.length > 0){
                var startIndex = matchResult[0];
                var endIndex = matchResult[matchResult.length-1];
                matched = source.substr(0,startIndex)+ "<span class=\"omnibox-suggestions-highlight\">"+source.substr(startIndex,endIndex-startIndex+1)+"</span>"+source.substr(endIndex+1);
                if(source !== matched) return matched;
            }

            return source;
        };
    });
  
