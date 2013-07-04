closedTabProvider = function(){
    var hasBindEvents = false;
    var tabInfos = {};
    var closedTabs = [];

    function RegisteEvents(){
        hasBindEvents = true;
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            tabInfos[tabId] = tab;
        });
        
        chrome.tabs.onRemoved.addListener(function(tabId,removeInfo) {
            if(tabInfos[tabId]){
                var tab = tabInfos[tabId];
                console.log("tab closed:"+tab.title+tab.url);
                closedTabs.push({title:tab.title,url:tab.url,sourceType:"ClosedTab",relevancy:0}); 
                delete tabInfos[tabId];
            }
        }); 
    }

    return {
        query:function(txt) {
            if(txt === "") return closedTabs.reverse();

            return closedTabs.find(txt);
        },
        init:function(){
            if(!hasBindEvents) RegisteEvents();
        }
    };
}();
