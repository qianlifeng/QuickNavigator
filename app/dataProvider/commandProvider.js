var commandProvider = function(){
    return {
        query:function(txt,asyncFunc){
            var suggestion = [];
            for(var i in config.suggestionMode){
                var mode = config.suggestionMode[i];
                if(mode.hotkey === "none") continue;
                if(mode.hotkey === txt){
                    suggestion.push({title:mode.text,url:mode.clientCommand,providerName:"commandProvider"});  
                }
            }
            return suggestion;
        },
        async:false,
        init:function(){ }
    };
}();
