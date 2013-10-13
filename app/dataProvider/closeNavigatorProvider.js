dataProviderModule.service("closeNavigatorProvider", function ($cfg) {
	
	this.async = false;	
    this.applyRelevancy = true;
    this.relevancy = 1000;
    this.name = "关闭插件";
    this.description = "在当前页面关闭本插件";

	this.query = function(txt,asyncFunc) {
        var suggestion = [];
        if(txt === "c"){
            suggestion.push({
                title: this.name,
                url:"javascript:$scope.disabled = true;$scope.closeOmnibox();",
                providerName:"closeNavigatorProvider"});  
        }
        return suggestion;
    };
	
	this.init = function(){};
});
