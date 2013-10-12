dataProviderModule.service("iFeelLuckyProvider", function ($cfg,$log) {
        var lastQuery = null;

        this.query = function(txt,asyncFunc){
            //because google search api has limition,
            //so we need to limit search frequency.
            if(txt.length <= 3) return [];

            if(lastQuery !== null && (new Date().getTime() - lastQuery) < 500) return [];

            $log.log("google I feel lucky");
            lastQuery = new Date().getTime();
            var suggestion = [];
            $.get("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q="+txt)
            .always(function(d){
                   var res =JSON.parse(d.responseText);
                   if(res.responseStatus === 200 && res.responseData.results.length > 0){
                        var url = res.responseData.results[0].url;
                        var title = res.responseData.results[0].title;
                        suggestion.push({title:title,url:url,providerName:"iFeelLuckyProvider",searchItem:txt}); 
                        asyncFunc(suggestion);
                   }
            });

           return suggestion; 
        };
        this.async = true;
        this.applyRelevancy = true;
        this.relevancy = 1;
        this.name = "我猜猜";
        this.description = "google I feel lucky 结果";
        this.init = function(){ };
});
