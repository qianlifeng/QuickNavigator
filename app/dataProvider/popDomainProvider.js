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
    this.applyRelevancy = true;
    this.relevancy = 3;
    this.name = "流行网站";
    this.description = "流行网站";
    this.init = function(){ };
});
