angular.module("app",  ["ngSanitize","app.services","app.directives","app.filters"])
    .run(function($rootScope) {
        $rootScope.safeApply = function(fn) {
            var phase = this.$root.$$phase;
            if(phase == '$apply' || phase == '$digest') {
                if(fn && (typeof(fn) === 'function')) {
                    fn();
                }
            } else {
                this.$apply(fn);
            }
        };
    })
    .controller("omnibox", function($scope,$dom,$url,$log) {

        var msgConnect;
        var cfg;
        $scope.showOmnibox = "hidden";
        $scope.disabled = false;
        $scope.input = "";
        $scope.dataProvider = "";

        $scope.init = function(){ 
            msgConnect = chrome.extension.connect({name: "connect"});
            msgConnect.onMessage.addListener(getMsgFromBg);
			
			$log.log("init quick navigator");
            $scope.loadCfg();
        };

        $scope.loadCfg = function(){
            chrome.extension.sendMessage({name: "getOptions"}, function(response) {
                if(response.name === 'options'){
                    cfg = response.value;
                }
            });
        }

        $scope.sendRequest = function(){
            var me = this;
            if(typeof this.requestTimer !== "undefined") clearTimeout(this.requestTimer);
            this.requestTimer = setTimeout(function(){
                msgConnect.postMessage({
                    name: "requestSuggestions",
                    dataProvider: $scope.dataProvider,
                    context: {
                        title: document.title
                    } ,
                    value:$scope.input
                });
            },200);
        };

        $scope.switchToAdvancedMode = function(){
            for(var i in cfg.commands){
                var command = cfg.commands[i];
                if(command.hotkey === "") continue;
                if(command.hotkey === $scope.input){
                    $scope.tag = command.text;
                    $scope.dataProvider = command.key;
                    $scope.input = "";
                    $scope.sendRequest();
                    break;
                }
            }
        };

        $scope.onKeyDown = function(e){
            //block all ctrl+key
            if(e.ctrlKey) return false;

            switch(e.keyCode){
                case 8:  //back
                    if($scope.input === "" && $scope.dataProvider === "") 
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
            msgConnect.postMessage({
                name: "requestSuggestions",
                dataProvider: "mostRecentUseProvider",
                context: {
                    title: document.title
                } ,
                value:$scope.input
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

         $scope.$on("keyDownOnPage",function(event,e){
             // I first  add ng-controller to body tag
             // but found it maybe conflict with current exsited ng-controllers in default page
             // so I put keyup event registered in service and then broadcast it.
             if((String.fromCharCode(e.keyCode) === cfg.hotkey.toUpperCase() && e.ctrlKey === false) 
                 || (e.keyCode === 76 && e.ctrlKey === true && cfg.overrideDefaultOmniboxHotkey)){
                 if(!$dom.isActiveElementInEdit() && !$scope.disabled && (typeof this.lastKeyUpTime === "undefined" || new Date().getTime() - this.lastKeyUpTime >= 150))
                 {
                     $scope.openOmnibox();
                     $scope.sendMRURequest();
                     e.stopPropagation();
                     e.preventDefault();
                 }
             }
             else if(e.keyCode === 27){  
                 //esc
                 $scope.closeOmnibox();
             }

             //didn't count ctrl key down time, otherwise, ctrl+l time will be too short 
             if(e.ctrlKey !== true) this.lastKeyUpTime = new Date().getTime();
         });

        function getMsgFromBg(msg) {
            $log.log("get message from background: "+msg.name);
            $scope.safeApply(function () {
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
            $scope.safeApply(function () {
                $scope.showOmnibox = "quickNavigator-omnibox-show";
                this.lastActiveElement = document.activeElement;
                $scope.input = "";
                $scope.tag = "";
                $scope.focus = true;
            });
        };

        $scope.closeOmnibox = function () {
            $scope.safeApply(function () {
                $scope.input = "";
                $scope.tag = "";
                $scope.showOmnibox = "hidden"; 
                $scope.dataProvider = "";
                $scope.focus = false;
                $scope.suggestions = [];
                if(this.lastActiveElement){
                    this.lastActiveElement.focus();
                }
            });
        };
    });

$(function(){
    chrome.extension.sendMessage({name: "loadTemplate"}, function(html){
        $(document.body).append(html);
        angular.bootstrap($("#quickNavigator-omnibox"), ["app"]);
    }); 
});
