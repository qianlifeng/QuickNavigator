dataProviderModule.service("commandProvider", function ($cfg) {
        this.query = function(txt,asyncFunc){
            if(txt === "") return [];

            var suggestion = [];

            //var commands = $cfg.getCfg().commands;
            //for(var index in commands){
                //var command = commands[index];
                //if(command.hotkey === txt && command.disabled === false){
                    //suggestion.push({title:command.text,url:command.clientCommand,providerName:"commandProvider"});  
                    //break;
                //}
            //}
            return suggestion;
        };
        this.async = false;
        this.applyRelevancy = true;
        this.relevancy = 1000;
        this.name = "命令";
        this.description = "命令";
        this.init = function(){ };
});
