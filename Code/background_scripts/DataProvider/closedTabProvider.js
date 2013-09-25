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
                closedTabs.push({title:tab.title,url:tab.url,sourceType:"ClosedTab",relevancy:0,closedDate:new Date().getTime()}); 
                closedTabs.sort(function(x,y){return x.closedDate > y.closedDate ? -1:1;});
                delete tabInfos[tabId];
            }
        }); 
    }

    return {
        query:function(txt,asyncFunc) {
            if(txt === ""){
                return closedTabs;
            }

            return closedTabs.find(txt);
        },
        async:false,
        init:function(){
            if(!hasBindEvents) RegisteEvents();
        }
    };
}();
