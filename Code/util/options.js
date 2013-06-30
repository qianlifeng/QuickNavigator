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
        }
    };
})();


$(function(){
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
});
