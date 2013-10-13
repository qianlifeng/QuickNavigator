dataProviderModule.service("closedTabProvider", function ($cfg) {
    var hasBindEvents = false;
    var tabInfos = {};
    var closedTabs = [];
	
	this.async = false;	
    this.applyRelevancy = true;
    this.relevancy = 1;
    this.hotkey = "u";
    this.name = "最近关闭标签";
    this.description = "最近关闭标签";

    function RegisteEvents(){
        hasBindEvents = true;
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
            tabInfos[tabId] = tab;
        });
        
        chrome.tabs.onRemoved.addListener(function(tabId,removeInfo) {
            if(tabInfos[tabId]){
                var tab = tabInfos[tabId];
                console.log("tab closed:"+tab.title+tab.url);
                closedTabs.push({title:tab.title,url:tab.url,providerName:"closedTabProvider",closedDate:new Date().getTime()}); 
                closedTabs.sort(function(x,y){return x.closedDate > y.closedDate ? -1:1;});
                delete tabInfos[tabId];
            }
        }); 
    }
	
	this.query = function(txt,asyncFunc) {
        if(txt === ""){
            return closedTabs;
        }

        return closedTabs.find(txt);
    };
	
	this.init = function(){
        if(!hasBindEvents) RegisteEvents();
    };
});
