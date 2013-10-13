angular.module('app.services', []).
    service("$url", function () {

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
        };

        this.isDomainUrl = function(url){
          return /^(.*)?\.[a-z]{1,3}\/?$/.test(url);  
        };

        this.getDomainUrl = function(url){
            //give https://www.baidu.com/test/df
            //return http://www.baidu.com
            if(url !== "" && url.indexOf("http:") !== 0 && url.indexOf("https:") !== 0){
                url = "http://" + url;
            }
            var a = document.createElement('a');
            a.href = url;
            return a.protocol+"//"+a.hostname+ (a.port ? ":"+a.port:"");
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
        $(document).bind("keydown",function(e){
            $rootScope.$broadcast("keyDownOnPage",e);
        });
    })
    .service("$cfg",function($log){
        var cfgCache = null;

        this.dataProviders = [
            "bookMarkProvider",
            "historyProvider",
            "popDomainProvider",
            "closedTabProvider",
            "mostRecentUseProvider",
            "baiduSuggestionProvider",
            "iFeelLuckyProvider",
            "IPProvider",
            "commandProvider"
        ];

        this.defaultCfg = {
            version:11,
            activeProviders:this.dataProviders,
            hotkey:"F",
            excludeSuggestions:[],
            maxResult:5,
            overrideDefaultOmniboxHotkey:false
        };


        this.isProviderEnabled = function(p){
            return this.getCfg().activeProviders.indexOf(p) >= 0;   
        };

        this.getCfg = function(){
            if(localStorage.QuickNavigatorUserCfgDirty && localStorage.QuickNavigatorUserCfgDirty === "true"){
                cfgCache = null;
                localStorage.QuickNavigatorUserCfgDirty === "false";
            }

            if(cfgCache!=null) return cfgCache;

            var cfg = localStorage.QuickNavigatorUserCfg;
            if(cfg){
                try{
                    var tempCache = JSON.parse(cfg);
                    if(tempCache.version && tempCache.version >= this.defaultCfg.version){
                        cfgCache = tempCache;
                    }
                    else{
                        cfgCache = this.defaultCfg;
                        this.saveCfg(cfgCache);
                    }
                }
                catch(e){
                    $log.log("parse config error, loading default config");
                    cfgCache = this.defaultCfg;
                    this.saveCfg(this.defaultCfg);
                }
            }
            else{
                cfgCache = this.defaultCfg;
                this.saveCfg(cfgCache);
            }
            return cfgCache;
        };

        this.saveCfg = function(userCfg){
            localStorage.QuickNavigatorUserCfg = JSON.stringify(userCfg);
            $log.log("config saved");
        };
    });
