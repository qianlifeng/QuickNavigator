omnibox = function(){

    var box,input,lastActiveElement,keydownConnect;

    function initDom(){
        var boxHTML = "<div id=\"quickNavigator-omnibox\" class=\"quickNavigator-omnibox-Container omniboxReset\">\n  <div class=\"quickNavigator-omnibox-SearchArea omniboxReset\">\n    <input id=\"quickNavigator-omnibox-input\" type=\"text\" />\n  </div>\n  <ul class=\"quickNavigator-omnibox-Result-ul omniboxReset\"></ul>\n</div>";
        $(document.body).append(boxHTML);
        this.box = $("#quickNavigator-omnibox");
        this.input = $("#quickNavigator-omnibox-input");
    }

    function initConnectTunnel(){
        keydownConnect = chrome.extension.connect({name: "keydown"});
        keydownConnect.onMessage.addListener(function(msg) {
          //console.log("get connect message from bg ==> " + msg);
          if(msg.requestHandler === "responseSuggestions"){

          }
        });
    }

    function bindHotKey(){
      $(document).bind('keydown','o', function(e){
           if(!isEditable(document.activeElement) ){
               showOmnibox(); 
               return false; // preventDefault event
           }
      });  

      this.input.bind('keydown', 'esc', function(e){
           closeOmnibox(); 
      });

      var me = this;
      this.input.bind("keyup",function(e){
          console.log(me.input.val());
          keydownConnect.postMessage({
              requestHandler: "requestSuggestions",
              value:me.input.val()
          });
      });

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
    };

    function showOmnibox(){
        this.lastActiveElement = document.activeElement;
        this.box.css("display","block"); 
        this.input.val("");
        this.input.focus();
    };

    function closeOmnibox(){
        this.input.val("");
        this.input.blur(); //一定要取消焦点，否则下次打不开box
        this.box.css("display","none");
        if(this.lastActiveElement){
            this.lastActiveElement.focus();
        }
    };

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
