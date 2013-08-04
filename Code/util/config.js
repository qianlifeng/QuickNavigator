var config = (function(){
    var dataProvider = [
        "bookMarkProvider",
        "historyProvider",
        "popDomainProvider",
        "closedTabProvider",
        "mostRecentUseProvider"
    ];

    var suggestionMode = {
        normal:{
            key:"normal",
            text:"",
            hotkey:"none",
            disabled:false,
            applyRelevancy:true,
            maxResult:8,
            dataProvider:"bookMarkProvider,historyProvider,popDomainProvider"
        },
        closedTab:{
            key:"closedTab",
            text:"Closed Tabs",
            hotkey:"u",
            disabled:false,
            applyRelevancy:false,
            maxResult:8,
            dataProvider:"closedTabProvider"
        },
        mru:{
            key:"mru",
            text:"most recent use",
            hotkey:"none",
            disabled:false,
            applyRelevancy:false,
            maxResult:5,
            dataProvider:"mostRecentUseProvider"
        }
    };


    return {
        dataProvider:dataProvider,
        suggestionMode:suggestionMode,
        disableMRU:function(val){
            localStorage.QuickNavigator_DisableMRU = val.toString();
        },
        getMRUDisabled:function(){
            var disabled = localStorage.QuickNavigator_DisableMRU;
            if(disabled){
                return disabled == "true"?true:false;
            }
            return suggestionMode.mru.disabled;
        },
        setMRUCount:function(val){
            localStorage.QuickNavigator_MRUCount = val.toString();
        },
        getMRUCount:function(){
            if(typeof localStorage.QuickNavigator_MRUCount === "undefined") return suggestionMode.mru.maxResult;
            return parseInt(localStorage.QuickNavigator_MRUCount,10);
        },
        setSuggestionsCount:function(val){
            localStorage.QuickNavigator_SuggestionsCount = val.toString();
        },
        getSuggestionsCount:function(){
            if(typeof localStorage.QuickNavigator_SuggestionsCount === "undefined") return suggestionMode.normal.maxResult;
            return parseInt(localStorage.QuickNavigator_SuggestionsCount,10);
        },
    };
})();
