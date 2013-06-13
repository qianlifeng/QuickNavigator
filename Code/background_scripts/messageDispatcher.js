chrome.extension.onConnect.addListener(function(port) {
    console.log("init connect ==> " + port.name);

    if(port.name == "keydown"){
        port.onMessage.addListener(function(msg) {
            console.log("get connect message ==> " + msg);

            if(msg.requestHandler === "requestSuggestions"){
                var text = msg.value;
                if(text){
                    var res = suggestions.getSuggestion(text);
                    port.postMessage({
                        requestHandler: "responseSuggestions",
                        value: res
                    });
                }
            }
        });
    }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {   
    console.log("short message ==> get "+request.act+" request");

    if (request.act == "get"){
    }

    //这里要返回true表明了要等待异步发送给sender
    return true;
});
