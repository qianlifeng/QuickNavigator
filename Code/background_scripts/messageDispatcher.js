chrome.extension.onConnect.addListener(function(port) {
    console.log("init connect ==> " + port.name);

    if(port.name == "connect"){
        port.onMessage.addListener(function(msg) {
            //console.log("get connect message ==> " + msg);
            if(msg.name === "requestSuggestions"){
                var text = msg.value;
                var mode = config.suggestionMode[msg.suggestionMode];
                var maxResult = config.getSuggestionsCount();
                if(mode.key === "mru"){
                    maxResult = config.getMRUCount();
                }
                var res = suggestions.getSuggestion(text,mode.dataProvider,mode.applyRelevancy,maxResult,function(d){
                    port.postMessage({
                        name: "responseSuggestionsAsync",
                        value: d
                    });
                });
                port.postMessage({
                    name: "responseSuggestions",
                    value: res
                });
            }
            else if(msg.name === "requestNavigate"){
                window.db.saveVisitedUrl(msg.url,msg.title,msg.sourceType);
            }
        });
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {   
    console.log("short message ==> get "+request.name+" request");
    if (request.name == "getOptions"){
        switch(request.option){
            case "disableMRU":
                var disabled = config.getMRUDisabled();
            sendResponse({responseHandler:"options",option:"disableMRU",value:disabled});
            break;
        }
    }
    else if (request.name == "loadTemplate"){
        $.ajax({
            url: chrome.extension.getURL("template.html"),
            dataType: "html",
            success: sendResponse
        });
    }

    //这里要返回true表明了要等待异步发送给sender
    return true;
});
