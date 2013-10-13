dataProviderModule.service("commandProvider", function ($cfg,$injector) {
        this.query = function(txt,asyncFunc){
            if(txt === "") return [];

            var suggestion = [];

            $cfg.getCfg().activeProviders.forEach(function(provider){
                var providerService = $injector.get(provider); 
                if(typeof providerService.hotkey !== "undefined" && providerService.hotkey === txt){
                    suggestion.push({
                            title:providerService.name,
                            url:"javascript:$scope.switchToAdvancedMode('" + providerService.name + "','"+provider+"');",
                            providerName:"commandProvider"});  
                }
            });

            return suggestion;
        };
        this.async = false;
        this.applyRelevancy = true;
        this.relevancy = 1000;
        this.name = "命令";
        this.description = "命令";
        this.init = function(){ };


        this.template = 
            "<div class='omniboxReset omnibox-suggestions-top'>"+ 
                "<div class='omniboxReset omnibox-suggestions-icon'>"+ 
                    "<img class='omniboxReset' ng-src='{{item.url | domainIconUrl}}' ng-imgonerror='images/file.ico'>"+ 
                "</div>"+ 
                "<a class='omniboxReset omnibox-suggestions-title' ng-click='navigate(false,item.url,item.title,item.providerName)' href='{{item.url}}' ng-bind-html-unsafe='item.title | hightlightSearch:input'></a>"+ 
            "</div>"+ 
            "<div class='omniboxReset omnibox-suggestions-bottom'>"+ 
                "<div class='omniboxReset omnibox-suggestions-sourcetype'>{{item.provider}} {{item.relevancy}}</div>"+ 
                "<div class='omniboxReset omnibox-suggestions-url'>进入 {{item.title}} 选择模式</div>"+ 
            "</div>";
});
