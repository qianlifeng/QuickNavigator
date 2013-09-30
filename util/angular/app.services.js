angular.module('app.services', []).
    service("$url", function () {
        var a = document.createElement('a');

        this.getParameter = function (name) {
            return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
        };

        this.isUrl = function(url){
            return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/.test(url);
        };

        this.addProtocal = function(url){
            if(url !== "" && url.indexOf("http:") !== 0 && url.indexOf("https:") !== 0){
                url = "http://" + url;
            }
            return url;
        }

        this.getDomainUrl = function(url){
            //give https://www.baidu.com/test/df
            //return http://www.baidu.com
            a.href = url;
            return a.protocol+"//"+a.hostname+ (a.port ? ":"+a.port:"");
            
            //var newUrl = "";
            //var reg = /^(.*?\.[a-z]{1,3})(\/.*)?$/gi;
            //var urlArrary = reg.exec(url);
            //if(urlArrary && urlArrary.length >= 2){
                //if(urlArrary[1].indexOf("http") !== 0){
                    //newUrl = "http://";
                //}
                //newUrl += urlArrary[1];
            //}
            //return newUrl;
        }
    })
    .service("$dom",function($rootScope){
        this.isActiveElementInEdit = function()
        {
            var focusableElements, noFocus, nodeName;
            if (document.activeElement.isContentEditable) {
                return true;
            }
            nodeName = document.activeElement.nodeName.toLowerCase();
            noFocus = ["radio", "checkbox","submit"];
            if (nodeName === "input" && noFocus.indexOf(document.activeElement.type) === -1) {
                return true;
            }
            focusableElements = ["textarea", "select"];
            return focusableElements.indexOf(nodeName) >= 0;
        }

        $(document).bind("keyup",function(e){
            $rootScope.$broadcast("keyUpOnPage",e);
        });
    })
    .service("$chrome",function($rootScope){
        var connect = chrome.extension.connect({name: "connect"});
        connect.onMessage.addListener(function(msg){
            $rootScope.$broadcast("chromeMsg",msg);
        });       

        this.postMsg = function(msg){
            connect.postMessage(msg);   
        };
    });
