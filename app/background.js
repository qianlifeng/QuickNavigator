angular.module("app.background",  ["app.services","app.services.dataProviders","app.directives","app.filters"])
.controller("background", function($scope,$dom,$url,$cfg,$injector) {

    $scope.init = function(){
        chrome.extension.onConnect.addListener(function(tunnel) {
            if(tunnel.name === "connect"){
                tunnel.onMessage.addListener(function(msg){
                    switch(msg.name){
                        case "requestSuggestions":
                            getSuggestions(tunnel,msg);
                        break;

                        case "requestNavigate":
                            logNavigateInfo(msg);
                        break;
                    }
                });
            }
        });

        chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {   
            switch(msg.name){
                case "getOptions":
                    getOptions(msg,sendResponse); 
                break;

                case "loadTemplate":
                    loadTemplate(msg,sendResponse); 
                break;
            }

            return true;
        });

        chrome.omnibox.onInputStarted.addListener(function(){
            chrome.omnibox.setDefaultSuggestion({
                description: '直接在森亮航海见识寻找: %s'
            });
        });

        chrome.omnibox.onInputChanged.addListener(function(text, suggest){
            var s = getSuggestionsFromOmnibox(text); 
            var suggestions= [];
            s.forEach(function(element){
                suggestions.push({content:element.url,description:element.title});
            });
            // Set first suggestion as the default suggestion
            chrome.omnibox.setDefaultSuggestion({description:suggestions[0].description});
            // Remove the first suggestion from the array since we just suggested it
            suggestions.shift();
            // Suggest the remaining suggestions
            suggest(suggestions);
        });

        initDataProviders();
    };

    function getSuggestionsFromOmnibox(text){
         text = text.replace(" ", "");
         var mode = $cfg.suggestionMode["normal"];
         var maxResult = $cfg.getSuggestionsCount();
         return query(text,mode.dataProvider,mode.applyRelevancy,maxResult); 
    }

    function initDataProviders(){
        $cfg.dataProvider.forEach(function(element){
            var dataProviderService = $injector.get(element.name)
            dataProviderService.init();
            console.log("init dataProvider "+element.name);
        }); 
    }

    function getSuggestions(tunnel,msg){
        var text = msg.value;
        var mode = $cfg.suggestionMode[msg.suggestionMode];
        var maxResult = $cfg.getSuggestionsCount();
        if(mode.key === "mru"){
            maxResult = $cfg.getMRUCount();
        }
        var res = query(text,mode.dataProvider,mode.applyRelevancy,maxResult,function(d){
            tunnel.postMessage({
                name: "responseSuggestionsAsync",
                value: d
            });
        });
        tunnel.postMessage({
            name: "responseSuggestions",
            value: res
        }); 
    }

    function query(txt,dataProvider,applyRelevancy,maxResult,asyncFunc){
        dataProvider = dataProvider.split(',');
        var res = [];
        dataProvider.forEach(function(element){
			var dataProviderService = $injector.get(element)
            res = res.merge(dataProviderService.query(txt,asyncFunc));
        });

        if(applyRelevancy) {
            addRelevancy(res);
            res.sort(function(a,b){
                return a.relevancy >= b.relevancy ? -1:1;
            });
        }
        return res.slice(0,maxResult);
    }

    function addRelevancy(mergedList){
        //relevancy is a integer, larger integer represent larger relevancy
        mergedList.forEach(function(element){
            //fist, we must reset relevancy to 0, or it will increase repeatly when every words typed
            element.relevancy = 0;

            $cfg.dataProvider.forEach(function(provider){
                if(provider.name === element.providerName){
                    element.relevancy += provider.relevancy;
                }
            });

            //check if this url has beed visited
            var visitedCount =  window.db.getUrlVisitedCount(element.url);
            //normalize(归一化)
            var ratio = window.db.getMaxCount() / 100;
            visitedCount = Math.round(visitedCount / ratio ); 
            if(visitedCount > 0) {
                element.relevancy += visitedCount;
            }

            //top domain should have larger relevancy
            if(/^(.*)?\.[a-z]{1,3}\/?$/.test(element.url)) element.relevancy += 2;
        });
    }

    function getOptions(msg,sendResponse){
        switch(msg.option){
            case "disableMRU":
                var disabled = $cfg.getMRUDisabled();
                sendResponse({name:"options",option:"disableMRU",value:disabled});
            break;
        }
    }

    function logNavigateInfo(msg){
        window.db.saveVisitedUrl(msg.url,msg.title,msg.sourceType);
    }

    function loadTemplate(msg,sendResponse){
        $.ajax({
            url: chrome.extension.getURL("app/view/template.html"),
            dataType: "html",
            success:sendResponse 
        });
    }
});
