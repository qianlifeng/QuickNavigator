//every data provider has two public methods:
// 1. query     query suggestions in it's datasource
// 2. init      init datasource
dataProviderModule.service("popDomainProvider", function ($cfg) {
	
	this.async = false;	
	
    this.query =  function(txt,asyncFunc){
        if(window.popDomains && window.popDomains.length > 0){
            return window.popDomains.find(txt);
        }
    };

    this.init = function(){
	
	};
});
