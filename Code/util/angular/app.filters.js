angular.module('app.filters', [])
    .filter("providerName",function(){
        return function(providerName) {
            config.dataProvider.forEach(function(item){ 
                if(item.name === providerName){
                    providerName = item.text;
                }
            });

            return providerName;
        };
    })
    .filter("hightlightSearch",function($sce){
        return function(source,words) {
            if(words === "")return source;

            var matched = '';

            //exact match
            var r = new RegExp(words,"gi");
            matched = source.replace(r, "<span class=\"quickNavigator-omnibox-suggestions-highlight\">"+words+"</span>"); 
            if(source !== matched) return matched; 

            //pinyin match 
            var matchResult = py.getHans(source,words);
            if(matchResult && matchResult.length > 0){
                var startIndex = matchResult[0];
                var endIndex = matchResult[matchResult.length-1];
                matched = source.substr(0,startIndex)+ "<span class=\"quickNavigator-omnibox-suggestions-highlight\">"+source.substr(startIndex,endIndex-startIndex+1)+"</span>"+source.substr(endIndex+1);
                if(source !== matched) return matched;
            }

            return $sce.trustAsHtml(source);
        };
    });