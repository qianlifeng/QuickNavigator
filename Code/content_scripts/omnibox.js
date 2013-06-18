omnibox = function(){

    var box,input,lastActiveElement,keydownConnect,lastKeyUpTime,lastEveryKeyUpTime;

    function initDom(){
        var boxHTML = "<div id=\"quickNavigator-omnibox\" class=\"quickNavigator-omnibox-Container omniboxReset\">\n  <div class=\"quickNavigator-omnibox-SearchArea omniboxReset\">\n    <input id=\"quickNavigator-omnibox-input\" type=\"text\" />\n  </div>\n  <ul class=\"quickNavigator-omnibox-Result-ul omniboxReset\"></ul>\n</div>";
        $(document.body).append(boxHTML);
        this.box = $("#quickNavigator-omnibox");
        this.input = $("#quickNavigator-omnibox-input");
        this.ul = $("#quickNavigator-omnibox .quickNavigator-omnibox-Result-ul");
    }

    function initConnectTunnel(){
        keydownConnect = chrome.extension.connect({name: "keydown"});
        keydownConnect.onMessage.addListener(function(msg) {
            //console.log("get connect message from bg ==> " + msg);
            if(msg.requestHandler === "responseSuggestions"){
                showSuggestions(msg.value); 
            }
        });
    }

    function showSuggestions(suggestionList){
        if(!suggestionList || suggestionList.length == 0){
            this.ul.html("");
            return;
        }

        var currentSearch = this.input.val();
        var html = "";
        $.each(suggestionList,function(n,value) {
            var title = highlightSearchWords(value.title,currentSearch);
            var url = highlightSearchWords(value.url,currentSearch);
            html += "<li class=\"omniboxReset\">\n<div class=\"quickNavigator-omnibox-suggestions-top omniboxReset\"><p class=\"quickNavigator-omnibox-suggestions-sourcetype omniboxReset\">"+value.sourceType+"</p>"
            +"<p  class=\"quickNavigator-omnibox-suggestions-title omniboxReset\">"+title+"</p></div>"
            +"<div class=\"quickNavigator-omnibox-suggestions-bottom omniboxReset\"><p class=\"quickNavigator-omnibox-suggestions-url omniboxReset\">"+url+"</p>&nbsp;&nbsp;<p>"+value.relevancy+"</p>"
            +"<p class=\"quickNavigator-omnibox-suggestions-url-hidden omniboxReset\">"+value.url+"</p></div></li>";
        });

        this.ul.html(html);
        this.ul.children("li").eq(0).addClass("quickNavigator-omnibox-Result-li-selected");
    }

    function highlightSearchWords(source,words){
        var matched = '';

        //exact match
        var r = new RegExp(words,"gi");
        matched = source.replace(r, "<span class=\"quickNavigator-omnibox-suggestions-highlight\">"+words+"</span>"); 
        if(source !== matched) return matched; 

        //pinyin match 
        var matchResult = py.getHans(source,words);
        if(matchResult && matchResult.length > 0){
            var startIndex = matchResult[0];
            var endIndex = matchResult[matchResult.length-1];
            matched = source.substr(0,startIndex)+ "<span class=\"quickNavigator-omnibox-suggestions-highlight\">"+source.substr(startIndex,endIndex-startIndex+1)+"</span>"+source.substr(endIndex+1);
            if(source !== matched) return matched;
        }

        return source;
    }

    function bindHotKey(){
        $(document).bind('keydown','o', function(e){
            if(!isEditable(document.activeElement) ){
                showOmnibox(); 
                //list MRU items
                //todo:
                return false; // preventDefault event
            }
        });  

        var me = this;
        this.input.bind("keydown",function(e){
            switch(e.keyCode){
                case 38: //up
                    movePreSelected();
                    e.stopPropagation();
                    e.preventDefault(); 
                    return; 

               case 40://down
                    moveNextSelected();
                    e.stopPropagation();
                    e.preventDefault(); 
                    return; 

               case 27: //esc
                    closeOmnibox();
                    e.stopPropagation();
                    e.preventDefault(); 
                    return; 

               case 13:
                    var url = me.ul.find(".quickNavigator-omnibox-Result-li-selected .quickNavigator-omnibox-suggestions-url-hidden").html();
                    if(url){
                        keydownConnect.postMessage({
                            requestHandler: "requestNavigate",
                            query:me.input.val(),
                            selectUrl:url
                        });
                    }
                    e.shiftKey ? navigate(true):navigate(false);
                    closeOmnibox();
                    e.stopPropagation();
                    e.preventDefault(); 
                    return; 
            }
        });

        this.input.bind("keyup",function(e){
            switch(e.keyCode){
                case 27: //esc
                case 13: //enter
                case 37: //left
                case 38: //up
                case 39: //right
                case 40: //down
                    return;
            }
            sendRequest();
            //me.lastEveryKeyUpTime =new Date().getTime();
            //if(me.lastKeyUpTime == null || (me.lastKeyUpTime && new Date().getTime() - me.lastKeyUpTime > 500)){
                //if(me.lastKeyUpTime == null) createEndTypingInterval(200);
                //me.lastKeyUpTime = new Date().getTime();

                //console.log("send request");
                //sendRequest();
            //}
        });
    }

    function sendRequest(){
        if(this.input.val().length > 0){
                    keydownConnect.postMessage({
                        requestHandler: "requestSuggestions",
                        value:this.input.val()
                    });
        }
        else{
            this.ul.html(""); 
        }
    }

    function createEndTypingInterval(ms){
        var me = this;
        var id = setInterval(function(){
           //console.log("show");
           if(me.lastEveryKeyUpTime &&  new Date().getTime() - me.lastEveryKeyUpTime > ms){
               //console.log("end");
               sendRequest();
               me.lastKeyUpTime = null;
               clearInterval(id);
           }
        },ms);
    }

    function navigate(openInNewTab){
        var url = this.ul.find(".quickNavigator-omnibox-Result-li-selected .quickNavigator-omnibox-suggestions-url-hidden").html();
        if(!url) return;

        if(url.indexOf("http:") !== 0){
            url = "http://" + url;
        }

        if(openInNewTab){
            window.open(url, '_blank') 
        }else{
            window.location.href = url;
        }
    }

    function moveNextSelected(){
        var selected = this.ul.children("li[class*='quickNavigator-omnibox-Result-li-selected']");
        selected.removeClass("quickNavigator-omnibox-Result-li-selected"); 
        var next = selected.next();
        if(next.length > 0){
            next.addClass("quickNavigator-omnibox-Result-li-selected"); 
        }
        else{
            this.ul.children("li").eq(0).addClass("quickNavigator-omnibox-Result-li-selected"); 
        }
    }
    function movePreSelected(){
        var selected = this.ul.children("li[class*='quickNavigator-omnibox-Result-li-selected']");
        selected.removeClass("quickNavigator-omnibox-Result-li-selected"); 
        var prev = selected.prev();
        if(prev.length > 0){
            prev.addClass("quickNavigator-omnibox-Result-li-selected"); 
        }
        else{
            this.ul.children("li").last().addClass("quickNavigator-omnibox-Result-li-selected"); 
        }
    }

    function isEditable(target)
    {
        var focusableElements, noFocus, nodeName;
        if (target.isContentEditable) {
            return true;
        }
        nodeName = target.nodeName.toLowerCase();
        noFocus = ["radio", "checkbox","submit"];
        if (nodeName === "input" && noFocus.indexOf(target.type) === -1) {
            return true;
        }
        focusableElements = ["textarea", "select"];
        return focusableElements.indexOf(nodeName) >= 0;
    }

    function showOmnibox(){
        this.lastActiveElement = document.activeElement;
        this.box.css("display","block"); 
        this.input.val("");
        this.input.focus();
    }

    function closeOmnibox(){
        this.input.val("");
        this.input.blur(); //一定要取消焦点，否则下次打不开box
        this.box.css("display","none");
        this.ul.html("");
        if(this.lastActiveElement){
            this.lastActiveElement.focus();
        }
    }

    return{
        init:function(){
                 initDom();     
                 initConnectTunnel();
                 bindHotKey();
             } 
    };
}();

$(function(){
    omnibox.init();
});
