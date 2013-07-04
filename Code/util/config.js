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
        applyRelevancy:true,
        dataProvider:"bookMarkProvider,historyProvider,popDomainProvider"
    },
    closedTab:{
        key:"closedTab",
        text:"Closed Tabs",
        hotkey:"u",
        applyRelevancy:false,
        dataProvider:"closedTabProvider"
    },
    mru:{
        key:"mru",
        text:"most recent use",
        hotkey:"none",
        applyRelevancy:false,
        dataProvider:"mostRecentUseProvider"
    }
};
