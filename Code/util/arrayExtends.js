 Array.prototype.find=function(queryText){

    var result = [];
    $.each(this,function(n,value) {
        if(match(value.title,queryText) || match(value.url,queryText)) 
           result.push(value); 
        } 
    );
    return result;

    function match(source,target){
       source = source.toLowerCase();
       if(!source || !target) return false; 

       //exact match
       if(source.indexOf(target) >= 0) return true;

       //pinyin match
       //var matchPositions = py.getHans(source,target);
       //if(matchPositions) return true;
       try{
           var pinyin = py.convert(source).join("");
           if(pinyin.indexOf(target) >= 0 && py.getHans(source,target)) return true;
       }
       catch(err){}

       return false;
    }
};

Array.prototype.merge = function(list){
    //list here like: {title:"",url:"",sourceType:"",relevancy:0}
    var merged = [];
    function hasnotAdded(element, index, array) {
        if(merged.some(function(e){ return e.title === element.title;})){
            return false;
        }
        else {
            merged.push(element);
            return true;
        }
    }

    return this.filter(hasnotAdded).concat(list.filter(hasnotAdded));
};
