var yesOrNoProvider = function(){
    return {
        query:function(txt,asyncFunc){
               var yesOrNo = [];
               yesOrNo.push({title:"确定",url:"alert('test');",sourceType:"Command",relevancy:10}); 
               yesOrNo.push({title:"取消",url:"",providerName:"yesOrNoProvider",relevancy:0}); 
               return yesOrNo; 
        },
        async:false,
        init:function(){ }
    };
}();