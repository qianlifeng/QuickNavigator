suggestions = function(){
    function query(txt,dataProvider,applyRelevancy,maxResult,asyncFunc){
        dataProvider = dataProvider.split(',');
        var res = [];
        dataProvider.forEach(function(element,index,arrary){
            res = res.merge(window[element].query(txt,asyncFunc));
        });

        if(applyRelevancy) {
            addRelevancy(res);
            res.sort(function(a,b){
                return a.relevancy >= b.relevancy ? -1:1;
            });
        }
        return res.slice(0,maxResult);
    }

    //relevancy is a integer, larger integer represent larger relevancy
    function addRelevancy(mergedList){
        mergedList.forEach(function(element,n,arrary){
            //fist, we must reset relevancy to 0, or it will increase repeatly when every words typed
            element.relevancy = 0;

            if(element.sourceType === "bookmark") element.relevancy += 10;
            if(element.sourceType === "history") element.relevancy += 7;
            if(element.sourceType === "popdomain") element.relevancy += 5;

            //check if this url has beed visited
            var visitedCount =  window.db.getUrlVisitedCount(element.url);
            //normalize(归一化)
            var ratio = window.db.getMaxCount() / 100;
            visitedCount = Math.round(visitedCount / ratio ); 
            if(visitedCount > 0) {
                element.relevancy += visitedCount;
            }

            //top domain should have larger relevancy
            if(/^(.*)?\.[a-z]{1,3}\/?$/.test(element.url)) element.relevancy += 2;
        });
    }

    return {
        init:function(){
            config.dataProvider.forEach(function(element,n,arrary){
                console.log("init dataProvider "+element);
                window[element].init();
            });
        },

        getSuggestion : function(txt,dataProvider,applyRelevancy,maxResult,asyncFunc){
            return query(txt,dataProvider,applyRelevancy,maxResult,asyncFunc); 
        }
    }; 
}();

suggestions.init();
