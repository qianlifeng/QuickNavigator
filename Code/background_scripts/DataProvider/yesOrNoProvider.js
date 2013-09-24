var yesOrNoProvider = function(){
    return {
        query:function(txt){
               var yesOrNo = [];
               yesOrNo.push({title:"确定",url:"alert('test');",sourceType:"Command",relevancy:10}); 
               yesOrNo.push({title:"取消",url:"",sourceType:"Command",relevancy:0}); 
               return yesOrNo; 
        },
        init:function(){ }
    };
}();
