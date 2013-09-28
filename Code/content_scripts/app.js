angular.module("app",  ["app.services","app.directives"])
    .controller("omnibox", function($scope,$chrome,$dom,$url) {
        $scope.init = function(){ 
            $scope.showOmnibox = false;
            $scope.disabled = false;
            $scope.input = "";
            $scope.mode = "normal";
        };

        $scope.sendRequest = function(){
            var me = this;
            if(typeof this.requestTimer !== "undefined") clearTimeout(this.requestTimer);
            this.requestTimer = setTimeout(function(){
                $chrome.postMsg({
                    name: "requestSuggestions",
                    suggestionMode: $scope.mode,
                    value:$scope.input
                });
            },200);
        }

        $scope.switchToAdvancedMode = function(){
            for(var i in config.suggestionMode){
                var mode = config.suggestionMode[i];
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
        }

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

            switch(e.keyCode){
                case 8:  //back
                    if($scope.input === "" && $scope.mode === "normal") 
                    {
                        $scope.sendMRURequest();
                        return;
                    }
                    break;

                case 13:  //enter
                    var url = $scope.suggestions[$scope.currentIndex].url;
                    var title = $scope.suggestions[$scope.currentIndex].title;
                    var providerName = $scope.suggestions[$scope.currentIndex].providerName;
                   
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
        }


        $scope.navigate = function(openInNewTab,url,title,providerName){
             if(url.indexOf("javascript:") == 0){
                 js =  url.substring(11);
                 eval(js);
                 return;
             }

             $chrome.postMsg({
                 name: "requestNavigate",
                 url:url,
                 title:title,
                 sourceTypep:providerName
             });

             //there is no suggestions
             if(url === ""){
                 if($url.isUrl($scope.input)) 
                     {
                         url = $scope.input;
                     }
                     else{
                         url =  "http://www.baidu.com/s?wd="+ this.input.val();
                     }
             }
             url = $url.addProtocal(url); 

             if(openInNewTab){
                 window.open(url, '_blank');
             }
             else{
                 window.location.href = url;
             }

             closeOmnibox();
        }

        $scope.sendMRURequest = function(){
            chrome.extension.sendMessage({name: "getOptions",option:"disableMRU"}, function(response) {
                if(response.responseHandler === 'options' && response.option === "disableMRU"){
                    if(!response.value){
                        $chrome.postMsg({
                            name: "requestSuggestions",
                            suggestionMode: "mru"
                        });
                    }
                }
            }); 
        }

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

            if($scope.currentIndex == 0){
                $scope.currentIndex = $scope.suggestions.length - 1;
            }
            else{
                $scope.currentIndex--; 
            }

            $scope.suggestions[$scope.currentIndex].selected = true;
        }

        // I first add ng-controller to body tag
        // but found it maybe conflict with current exsited ng-controllers in default page
        // so I put keyup event registered in service and then broadcast it.
         $scope.$on("keyUpOnPage",function(event,e){
             $scope.$apply(function () {
                 if(e.keyCode === 70){
                     if(!$dom.isActiveElementInEdit() && !$scope.disabled
                        && (typeof this.lastKeyUpTime === "undefined" || new Date().getTime() - this.lastKeyUpTime >= 150))
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


        $scope.$on("chromeMsg", function (event,msg) {
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
                    $scope.suggestions = $.merge($scope.suggestions,msg.value);
                } 
            });
        });

        $scope.openOmnibox = function () {
            $scope.showOmnibox = true; 
            this.lastActiveElement = document.activeElement;
            $scope.input = "";
            $scope.tag = "";
            $scope.focus = true;
        };

        $scope.closeOmnibox = function () {
            $scope.input = "";
            $scope.tag = "";
            $scope.showOmnibox = false; 
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
