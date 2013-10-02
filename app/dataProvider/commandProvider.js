dataProviderModule.service("commandProvider", function ($cfg) {
        this.query = function(txt,asyncFunc){
            var suggestion = [];
            for(var i in $cfg.suggestionMode){
                var mode = $cfg.suggestionMode[i];
                if(mode.hotkey === "none") continue;
                if(mode.hotkey === txt){
                    suggestion.push({title:mode.text,url:mode.clientCommand,providerName:"commandProvider"});  
                }
            }
            return suggestion;
        };
        this.async = false;
        this.init = function(){ };
});
