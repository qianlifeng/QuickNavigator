angular.module("app.background",  ["app.services","app.services.dataProviders","app.directives","app.filters"])
.controller("background", function($scope,$dom,$url,$cfg,$injector,defaultTemplate) {

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
                    sendResponse({name:"options",value:$cfg.getCfg()});
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
         //request from default omnibox (usually triggered by Ctrl + L)
         text = text.replace(" ", "");
         return query(text,""); 
    }

    function initDataProviders(){
        $cfg.dataProviders.forEach(function(element){
            var dataProviderService = $injector.get(element)
            dataProviderService.init();
            console.log("init available dataProvider "+element);
        }); 
    }

    function getSuggestions(tunnel,msg){
        var text = msg.value;
        var dataProvider = msg.dataProvider;
        if(dataProvider === "" || typeof dataProvider === "undefined"){
            //get all active data provider
            dataProvider = $cfg.getCfg().activeProviders;
        }
        else{
            var allProviders = dataProvider.split(',');
            dataProvider = [];
            allProviders.forEach(function(e){
                if($cfg.isProviderEnabled(e)) dataProvider.push(e);
            });

        }

        var res = query(text,dataProvider,function(d){
            tunnel.postMessage({
                name: "responseSuggestionsAsync",
                value: excludeSuggestions(addTemplate(d))
            });
        });
        tunnel.postMessage({
            name: "responseSuggestions",
            value: res
        }); 
    }

    function addTemplate(items){
        items.forEach(function(item){
            var dataProviderService = $injector.get(item.providerName);
            item.provider = dataProviderService.name;
            if(typeof dataProviderService.template != "undefined" && dataProviderService.template !== ""){
                item.template = dataProviderService.template;
            }
            else{
                item.template = defaultTemplate;
            }
        }); 
        return items;
    }

    function query(txt,dataProvider,asyncFunc){
        var applyRelevancy = true;
        if(dataProvider.length === 1) {
            applyRelevancy = $injector.get(dataProvider[0]).applyRelevancy;  
        }

        var res = [];
        dataProvider.forEach(function(element){
			var dataProviderService = $injector.get(element);
            var tempResult = dataProviderService.query(txt,asyncFunc);
            tempResult =  addTemplate(tempResult); 
            res = res.merge(tempResult);
        });

        if(applyRelevancy) {
            addRelevancy(res);
            res.sort(function(a,b){
                return a.relevancy >= b.relevancy ? -1:1;
            });
        }

        res = res.slice(0, $cfg.getCfg().maxResult * 2);
        res = excludeSuggestions(res);
        res = res.slice(0, $cfg.getCfg().maxResult);
        return res;
    }

    function excludeSuggestions(items){
        if($cfg.getCfg().excludeSuggestions.length ===0) return items;

        var newSuggestions = [];
        items.forEach(function(item){
            $cfg.getCfg().excludeSuggestions.forEach(function(excludeItem){
                if((typeof item.url !== "undefined" && item.url.indexOf(excludeItem) > -1) || 
                   (typeof item.title !== "undefined" && item.title.indexOf(excludeItem) > -1))
                {
                    
                }
                else{
                    newSuggestions.push(item);
                }
            });
        });
        return newSuggestions;
    }

    function addRelevancy(mergedList){
        //relevancy is a integer, larger integer represent larger relevancy
        mergedList.forEach(function(element){
            var dataProviderService = $injector.get(element.providerName);

            //fist, we must reset relevancy to 0, or it will increase repeatly when every words typed
            element.relevancy = 0;
            element.relevancy += dataProviderService.relevancy;

            //check if this url has beed visited
            var visitedCount =  window.db.getUrlVisitedCount(element.url);
            //normalize(归一化)
            var ratio = window.db.getMaxCount() / 100;
            visitedCount = Math.round(visitedCount / ratio ); 
            if(visitedCount > 0) {
                element.relevancy += visitedCount;
            }

            if($url.isDomainUrl(element.url)) element.relevancy += 2;
        });
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
