var config = (function(){
    var dataProvider = [
        "bookMarkProvider",
        "historyProvider",
        "popDomainProvider",
        "closedTabProvider",
        "yesOrNoProvider",
        "mostRecentUseProvider",
        "baiduSuggestionProvider",
    ];

    var suggestionMode = {
        normal:{
            //每个模式的唯一标识符
            key:"normal",
            //显示输入框前面的文字
            text:"",
            //触发的热键，这里的触发条件是指输hotkey之后按tab键，none表示没有
            hotkey:"none",
            //是否禁用
            disabled:false,
            //是否根据相关性排序后显示建议
            applyRelevancy:true,
            //选择建议项之后，是否将选中的项目记入MRU
            applyMRU:true,
            //最大的建议数量【如果本地存储件中存在相同的配置项目，则优先读取用户设置的本地存储值】
            maxResult:8,
            //数据源
            dataProvider:"bookMarkProvider,historyProvider,popDomainProvider,baiduSuggestionProvider"
        },
        closedTab:{
            key:"closedTab",
            text:"最近关闭标签",
            hotkey:"u",
            disabled:false,
            applyRelevancy:false,
            maxResult:8,
            applyMRU:true,
            dataProvider:"closedTabProvider"
        }, 
        closeNavigator:{
            key:"closeNavigator",
            text:"在此页面暂时关闭导航",
            hotkey:"c",
            disabled:false,
            applyRelevancy:false,
            applyMRU:false,
            maxResult:2,
            dataProvider:"yesOrNoProvider"
        },
        mru:{
            key:"mru",
            text:"most recent use",
            hotkey:"none",
            disabled:false,
            applyRelevancy:false,
            applyMRU:true,
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
