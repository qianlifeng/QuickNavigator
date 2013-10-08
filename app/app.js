angular.module("app",  ["ngSanitize","app.services","app.directives","app.filters"])
    .controller("omnibox", function($scope,$dom,$url,$cfg,$log) {

        var msgConnect;

        $scope.init = function(){ 
            $scope.showOmnibox = "hidden";
            $scope.disabled = false;
            $scope.input = "";
            $scope.mode = "normal";

            msgConnect = chrome.extension.connect({name: "connect"});
            msgConnect.onMessage.addListener(getMsgFromBg);
			
			$log.log("init quick navigator");
        };

        $scope.sendRequest = function(){
            var me = this;
            if(typeof this.requestTimer !== "undefined") clearTimeout(this.requestTimer);
            this.requestTimer = setTimeout(function(){
                msgConnect.postMessage({
                    name: "requestSuggestions",
                    suggestionMode: $scope.mode,
                    value:$scope.input
                });
            },200);
        };

        $scope.switchToAdvancedMode = function(){
            for(var i in $cfg.suggestionMode){
                var mode = $cfg.suggestionMode[i];
                if(mode.hotkey === "none") continue;
                if(mode.hotkey === $scope.input){
                    $scope.tag = mode.text;
                    $scope.mode = mode.key;
                    $scope.input = "";
                    //calculateInputWidth();
                    $scope.sendRequest();
                    break;
                }
            }
        };

        $scope.onKeyUp = function(e){
            //keycodes that omnibox accept
            //only accept a-z 0-9 and whitelist to trigger sendrequest()
            var whiteList = [
                8, //back
                13, //enter
                38, //up
                40 //down
            ];

            if((e.keyCode < 48 || e.keyCode > 90) && whiteList.indexOf(e.keyCode) === -1) return true;
            //block all ctrl+key
            if(e.ctrlKey) return false;

            switch(e.keyCode){
                case 8:  //back
                    if($scope.input === "" && $scope.mode === "normal") 
                    {
                        $scope.sendMRURequest();
                        return;
                    }
                    break;

                case 13:  //enter
                    var url  = "";
                    var title  = $scope.input;
                    var providerName  = "";
                    if($scope.suggestions.length !== 0){
                        url = $scope.suggestions[$scope.currentIndex].url;
                        title = $scope.suggestions[$scope.currentIndex].title;
                        providerName = $scope.suggestions[$scope.currentIndex].providerName;
                    }

                    if(e.shiftKey){
                        $scope.navigate(true,url,title,providerName);
                    }
                    else {
                        $scope.navigate(false,url,title,providerName);
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    return;

                case 38: //up
                    movePreSelected();
                    e.stopPropagation();
                    e.preventDefault();
                    return;

                case 40: //down
                    moveNextSelected();
                    e.stopPropagation();
                    e.preventDefault();
                    return;
            }

            $scope.sendRequest(); 
            e.stopPropagation();
            e.preventDefault();
        };

        $scope.navigate = function(openInNewTab,url,title,providerName){
             if(url.indexOf("javascript:") === 0){
                 js =  url.substring(11);
                 eval(js);
                 return;
             }

             //there is no suggestions
             if(url === ""){
                 if($url.isUrl($scope.input)) 
                     {
                         url = $scope.input;
                     }
                     else{
                         url =  "http://www.baidu.com/s?wd="+ $scope.input;
                     }
             }
             url = $url.addProtocal(url); 
             msgConnect.postMessage({
                 name: "requestNavigate",
                 url:url,
                 title:title,
                 sourceTypep:providerName
             });

             $scope.closeOmnibox();
             setTimeout(function(){
                 if(openInNewTab){
                     window.open(url, '_blank');
                 }
                 else{
                     window.location.href = url;
                 }
             },10);
        };

        $scope.sendMRURequest = function(){
            chrome.extension.sendMessage({name: "getOptions",option:"disableMRU"}, function(response) {
                if(response.name === 'options' && response.option === "disableMRU"){
                    if(!response.value){
                        msgConnect.postMessage({
                            name: "requestSuggestions",
                            suggestionMode: "mru"
                        });
                    }
                }
            }); 
        };

        function moveNextSelected(){
            $scope.suggestions[$scope.currentIndex].selected = false;

            if($scope.currentIndex == $scope.suggestions.length - 1){
                $scope.currentIndex = 0; 
            }
            else{
                $scope.currentIndex++; 
            }

            $scope.suggestions[$scope.currentIndex].selected = true;
        }

        function movePreSelected(){
            $scope.suggestions[$scope.currentIndex].selected = false;

            if($scope.currentIndex === 0){
                $scope.currentIndex = $scope.suggestions.length - 1;
            }
            else{
                $scope.currentIndex--; 
            }

            $scope.suggestions[$scope.currentIndex].selected = true;
        }

        // I first  add ng-controller to body tag
        // but found it maybe conflict with current exsited ng-controllers in default page
        // so I put keyup event registered in service and then broadcast it.
         $scope.$on("keyUpOnPage",function(event,e){
             $scope.$apply(function () {
                 if(e.keyCode === 70 || (e.keyCode === 76 && e.ctrlKey === true)){
                     if(!$dom.isActiveElementInEdit() && !$scope.disabled && (typeof this.lastKeyUpTime === "undefined" || new Date().getTime() - this.lastKeyUpTime >= 150))
                    {
                        $scope.openOmnibox();
                        $scope.sendMRURequest();
                    }
                 }
                 else if(e.keyCode === 27){  
                     //esc
                     $scope.closeOmnibox();
                 }

                 this.lastKeyUpTime = new Date().getTime();
             });
         });

        function getMsgFromBg(msg) {
            $log.log("get message from background: "+msg.name);
            $scope.$apply(function () {
                msg.value.forEach(function(suggest,index,arrary){
                    suggest.selected = false;
                });
                if(msg.name === "responseSuggestions"){
                    $scope.suggestions = msg.value;
                    if($scope.suggestions && $scope.suggestions.length > 0){
                        $scope.currentIndex = 0;
                        $scope.suggestions[0].selected = true;
                    }
                }
                else if(msg.name === "responseSuggestionsAsync"){
                    if(msg.value && msg.value.length > 0 && msg.value[0].searchItem === $scope.input){
                        $scope.suggestions = $.merge($scope.suggestions,msg.value);
                        if($scope.suggestions.length == 1){
                            $scope.currentIndex = 0;
                            $scope.suggestions[0].selected = true;
                        }
                    }
                } 
            });
        }

        $scope.openOmnibox = function () {
            $scope.showOmnibox = "quickNavigator-omnibox-show";
            this.lastActiveElement = document.activeElement;
            $scope.input = "";
            $scope.tag = "";
            $scope.focus = true;
        };

        $scope.closeOmnibox = function () {
            $scope.input = "";
            $scope.tag = "";
            $scope.showOmnibox = "quickNavigator-omnibox-hide"; 
            $scope.mode = "normal";
            $scope.focus = false;
            $scope.suggestions = [];
            if(this.lastActiveElement){
                this.lastActiveElement.focus();
            }
        };
    });

$(function(){
    chrome.extension.sendMessage({name: "loadTemplate"}, function(html){
        $(document.body).append(html);
        angular.bootstrap($("#quickNavigator-omnibox"), ["app"]);
    }); 
});
