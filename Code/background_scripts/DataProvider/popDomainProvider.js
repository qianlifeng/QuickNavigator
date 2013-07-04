//every data provider has two public methods:
// 1. query     query suggestions in it's datasource
// 2. init      init datasource
popDomainProvider = function(){
    function queryInternal(txt){
        if(window.popDomains && window.popDomains.length > 0){
            return window.popDomains.find(txt);
        }
    }

    return{
        query:function(txt){
              return queryInternal(txt);          
        },
        init:function(){ }
    };
}();
