var dataProvider = [
    "bookMarkProvider",
    "historyProvider",
    "popDomainProvider",
    "closedTabProvider"
];

var suggestionMode = {
    normal:{
        key:"normal",
        text:"",
        hotkey:"none",
        dataProvider:"bookMarkProvider,historyProvider,popDomainProvider"
    },
    closedTab:{
        key:"closedTab",
        text:"Closed Tabs",
        hotkey:"u",
        dataProvider:"closedTabProvider"
    }
};
