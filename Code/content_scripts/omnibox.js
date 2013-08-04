omnibox = function(){

    var box,input,lastActiveElement,keydownConnect,lastKeyUpTime,lastEveryKeyUpTime,lastSuggestions;
    //keycodes that omnibox accept
    var whiteList = [
            8 //back
        ];

    function initDom(){
        var boxHTML = "<div id=\"quickNavigator-omnibox\" class=\"quickNavigator-omnibox-Container omniboxReset\">"+
                "<div class=\"quickNavigator-omnibox-SearchArea omniboxReset\">"+
                    "<div class='quickNavigator-omnibox-textbox' id='quickNavigator-omnibox-textbox-id'>"+
                        "<div class='quickNavigator-omnibox-tag' id='quickNavigator-omnibox-tag-id' data-mode='normal'></div><div class='quickNavigator-omnibox-inputDiv'><input id=\"quickNavigator-omnibox-input\" type=\"text\" /></div>"+
                    "</div>"+
                "</div>"+
                "<div style='clear:both;'></div>"+
                "<ul class=\"quickNavigator-omnibox-Result-ul omniboxReset\"></ul>\n</div>";
        $(document.body).append(boxHTML);
        this.box = $("#quickNavigator-omnibox");
        this.textbox= $("#quickNavigator-omnibox-textbox-id");
        this.input = $("#quickNavigator-omnibox-input");
        this.tag = $("#quickNavigator-omnibox-tag-id");
        this.tag.attr("data-mode",config.suggestionMode.normal.key);
        this.ul = $("#quickNavigator-omnibox .quickNavigator-omnibox-Result-ul");
    }

    function initConnectTunnel(){
        var me = this;
        keydownConnect = chrome.extension.connect({name: "keydown"});
        keydownConnect.onMessage.addListener(function(msg) {
            //console.log("get connect message from bg ==> " + msg);
            if(msg.requestHandler === "responseSuggestions"){
                showSuggestions(msg.value); 
                me.lastSuggestions = msg.value; 
            }
        });
    }

    function showSuggestions(suggestionList){
        this.ul.html("");
        if(!suggestionList || suggestionList.length === 0){
            return;
        }

        var currentSearch = this.input.val();
        var me = this;
        $.each(suggestionList,function(n,value) {
            var title = highlightSearchWords(value.title,currentSearch);
            var url = highlightSearchWords(value.url,currentSearch);
            var li = $("<li></li>").addClass("omniboxReset");

            var topContainer = $("<div></div>").addClass("quickNavigator-omnibox-suggestions-top omniboxReset");
            var sourceTypeElement = $("<div></div>").addClass("quickNavigator-omnibox-suggestions-sourcetype omniboxReset").html(value.sourceType);
            
            var iconElement = $("<div></div>").addClass("quickNavigator-omnibox-suggestions-icon omniboxReset");
            var reg = /^(.*?\.[a-z]{1,3})(\/.*)?$/gi;
            var urlArrary = reg.exec(value.url);
            var iconUrl = "";
            if(urlArrary && urlArrary.length >= 2){
                if(urlArrary[1].indexOf("http") !== 0){
                    iconUrl = "http://";
                }
                iconUrl += urlArrary[1] + "/favicon.ico";
            }
            var iconImg = $("<img src='"+iconUrl+"'/>");
            var titleElement = $("<a></a>").addClass("quickNavigator-omnibox-suggestions-title omniboxReset").html(title).attr("href",value.url);
            titleElement.click(function(){
                navigate(false,value.url);
            });
            iconImg.appendTo(iconElement);
            iconElement.appendTo(topContainer);
            sourceTypeElement.appendTo(topContainer);
            titleElement.appendTo(topContainer);

            var bottomContainer = $("<div></div>").addClass("quickNavigator-omnibox-suggestions-bottom omniboxReset");
            var urlElement = $("<div></div>").addClass("quickNavigator-omnibox-suggestions-url omniboxReset").html(url+" "+value.relevancy);
            var urlHiddenElement = $("<div></div>").addClass("quickNavigator-omnibox-suggestions-url-hidden omniboxReset").html(value.url);
            urlElement.appendTo(bottomContainer);
            urlHiddenElement.appendTo(bottomContainer);

            topContainer.appendTo(li);
            bottomContainer.appendTo(li);
            li.appendTo(me.ul);
        });

        this.ul.children("li").eq(0).addClass("quickNavigator-omnibox-Result-li-selected");
    }

    function highlightSearchWords(source,words){
        if(words === "")return source;

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

    function calculateInputWidth(){
        if(this.tag) {
            var totalWidth = this.textbox.outerWidth();
            var tagWidth = this.tag.outerWidth(); 
            this.input.parent().width(totalWidth - tagWidth - 3);
        }
    }

    function bindEvents(){
        var me = this;
        $(window).resize(function(){
            calculateInputWidth();
        });

        $(document).bind("keyup",function(e){
              switch(e.keyCode){
                case 27: //esc
                    closeOmnibox();
                    e.stopPropagation();
                    e.preventDefault(); 
                    break;   

                case 79: //o
                    if(!isEditable(document.activeElement) ){
                        showOmnibox(); 
                        sendMRURequest(); 

                        e.preventDefault();
                        e.stopPropagation();
                        return false; // preventDefault event
                    }
                    break;
              }
        });

        this.input.bind("keydown",function(e){
            switch(e.keyCode){
                //tab is not trigger in keyup event 
                case 9: //tab
                    e.stopPropagation();
                    e.preventDefault(); 
                    switchToAdvancedMode();
                    break;

                case 13: //enter
                    var url = me.ul.find(".quickNavigator-omnibox-Result-li-selected .quickNavigator-omnibox-suggestions-url-hidden").text();
                    if(me.lastSuggestions && url){
                        $.each(me.lastSuggestions,function(n,value) {
                            if(value.url === url){
                                keydownConnect.postMessage({
                                    requestHandler: "requestNavigate",
                                    url:url,
                                    title:value.title,
                                    sourceType:value.sourceType
                                });
                            }
                        });
                    }
                    if(e.shiftKey){
                        navigate(true,url);
                    }
                    else {
                        navigate(false,url);
                    }
                    closeOmnibox();
                    e.stopPropagation();
                    e.preventDefault(); 
                    break;

                case 38: //up
                    movePreSelected();
                    e.stopPropagation();
                    e.preventDefault(); 
                    break;

                case 40: //down
                    moveNextSelected();
                    e.stopPropagation();
                    e.preventDefault(); 
                    break;
            }
        });

        this.input.bind("keyup",function(e){
            //only accept a-z 0-9 and whitelist to trigger sendrequest()
            if((e.keyCode < 48 || e.keyCode > 90) && whiteList.indexOf(e.keyCode) === -1) return true;

            switch(e.keyCode){
                case 8:  //back
                    if(me.input.val() === "" && me.tag.attr("data-mode") === "normal") 
                    {
                       sendMRURequest();
                       return;
                    }
                    break;
            }
            sendRequest();
        });
    }

    //triggered by tab button
    function switchToAdvancedMode(){
        for(var i in config.suggestionMode){
            var mode = config.suggestionMode[i];
            if(mode.hotkey === "none") continue;
            if(mode.hotkey === this.input.val()){
                this.tag.html(mode.text);
                this.tag.attr("data-mode",mode.key);
                this.input.val("");
                this.tag.css("display","block");
                calculateInputWidth();
                sendRequest();
                break;
            }
        }
    }

    function sendMRURequest(){
        var me = this;
        chrome.extension.sendMessage({requestHandler: "getOptions",option:"disableMRU"}, function(response) {
             if(response.responseHandler === 'options' && response.option === "disableMRU"){
                if(!response.value){
                   keydownConnect.postMessage({
                        requestHandler: "requestSuggestions",
                        suggestionMode: "mru"
                    });
                }
            }
        }); 
    }

    function sendRequest(){
        var me = this;
        if(typeof this.requestTimer !== "undefined") clearTimeout(this.requestTimer);
        this.requestTimer = setTimeout(function(){
            var mode = me.tag.attr("data-mode");
            keydownConnect.postMessage({
                requestHandler: "requestSuggestions",
                suggestionMode: mode,
                value:me.input.val()
            });
        },200);
    }

    function navigate(openInNewTab,uri){
        var url;
        if(uri === null){
            url = this.ul.find(".quickNavigator-omnibox-Result-li-selected .quickNavigator-omnibox-suggestions-url-hidden").text();
            if(!url) return;
        }
        else{
           url = uri; 
        }

        if(url.indexOf("http:") !== 0 && url.indexOf("https:") !== 0){
            url = "http://" + url;
        }

        if(openInNewTab){
            window.open(url, '_blank');
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
        this.tag.css("display","none");
        this.tag.attr("data-mode","normal");
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
                 bindEvents();
             } 
    };
}();

$(function(){
    omnibox.init();
});
