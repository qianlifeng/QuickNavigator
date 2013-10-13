dataProviderModule.service("IPProvider", function ($cfg,$log) {
        this.query = function(txt,asyncFunc){
            if(txt !== "ip") return [];

            var suggestion = [];
            $.get("http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json")
            .always(function(d){
                var item = JSON.parse(d);
                suggestion.push({title:"您的IP地址："+item.city,url:"",providerName:"IPProvider",searchItem:txt}); 
                asyncFunc(suggestion);
            });

           return suggestion; 
        };
        this.async = true;
        this.applyRelevancy = true;
        this.relevancy = 300;
        this.name = "IP";
        this.description = "IP";
        this.init = function(){ };
});
