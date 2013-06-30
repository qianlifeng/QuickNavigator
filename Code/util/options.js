var options = (function(){
    
    return {
        disableMRU:function(val){
           localStorage.QuickNavigator_DisableMRU = val.toString();
        },
        getMRUDisabled:function(){
           var disabled = localStorage.QuickNavigator_DisableMRU;
           if(disabled){
                return disabled == "true"?true:false;
           }
           return false;
        },
        setMRUCount:function(val){
           localStorage.QuickNavigator_MRUCount = val.toString();
        },
        getMRUCount:function(){
           if(!localStorage.QuickNavigator_MRUCount) return 3;
           return parseInt(localStorage.QuickNavigator_MRUCount,10);
        },
        setSuggestionsCount:function(val){
           localStorage.QuickNavigator_SuggestionsCount = val.toString();
        },
        getSuggestionsCount:function(){
           if(!localStorage.QuickNavigator_SuggestionsCount) return 10;
           return parseInt(localStorage.QuickNavigator_SuggestionsCount,10);
        }
    };
})();

$(function(){
    //////////////////////////////////////////////MRU
    if(options.getMRUDisabled()){
        $("#disableMRU").attr("checked","checked");
    }
    $("#disableMRU").click(function(){
        if($(this).attr("checked") === "checked"){
           options.disableMRU(true); 
        }
        else{
           options.disableMRU(false); 
        }
    });
    $("#MRUCount").val(options.getMRUCount());
    $("#MRUCount").change(function(){
        var val = $.trim($(this).val());
        options.setMRUCount(val);
    });
    $("#suggestionsCount").val(options.getSuggestionsCount());
    $("#suggestionsCount").change(function(){
        var val = $.trim($(this).val());
        options.setSuggestionsCount(val);
    });
});
