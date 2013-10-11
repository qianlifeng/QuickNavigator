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
        }

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

        var dataProviders = [
            {name:"bookMarkProvider",relevancy:10,text:"书签"},
            {name:"historyProvider",relevancy:7,text:"历史记录"},
            {name:"popDomainProvider",relevancy:1,text:"流行网站"},
            {name:"closedTabProvider",relevancy:1,text:"最近关闭标签"},
            {name:"mostRecentUseProvider",relevancy:15,text:"经常使用"},
            {name:"baiduSuggestionProvider",relevancy:1,text:"百度"},
            {name:"iFeelLuckyProvider",relevancy:1,text:"我猜猜"},
            {name:"commandProvider",relevancy:1000,text:"命令"}
        ];

        var commands= {
            normal:{
                //每个模式的唯一标识符
                key:"normal",
                //显示输入框前面的文字
                text:"",
                //触发的热键，这里的触发条件是指输hotkey之后按tab键
                hotkey:"",
                //是否禁用
                disabled:false,
                //是否根据相关性排序后显示建议
                applyRelevancy:true,
                //选择建议项之后，是否将选中的项目记入MRU
                applyMRU:true,
                //如果clientCommand不为空，则优先执行JS
                clientCommand:"",
                //最大的建议数量【如果本地存储件中存在相同的配置项目，则优先读取用户设置的本地存储值】
                maxResult:8,
                //数据源
                dataProvider:"bookMarkProvider,historyProvider,popDomainProvider,mostRecentUseProvider,baiduSuggestionProvider,iFeelLuckyProvider,commandProvider"
            },
            closedTab:{
                key:"closedTab",
                text:"最近关闭标签",
                description:"显示最近关闭的标签页",
                hotkey:"u",
                disabled:false,
                applyRelevancy:false,
                maxResult:8,
                applyMRU:true,
                clientCommand:"javascript:$scope.switchToAdvancedMode();",
                dataProvider:"closedTabProvider"
            }, 
            closeNavigator:{
                key:"closeNavigator",
                text:"在此页面暂时关闭导航",
                hotkey:"c",
                disabled:false,
                applyRelevancy:false,
                applyMRU:false,
                maxResult:2,
                clientCommand:"javascript:$scope.disabled = true;$scope.showOmnibox = 'hidden';",
                dataProvider:""
            },
            mru:{
                key:"mru",
                text:"最常访问网站",
                hotkey:"m",
                disabled:false,
                applyRelevancy:false,
                applyMRU:true,
                maxResult:5,
                clientCommand:"javascript:$scope.switchToAdvancedMode();",
                dataProvider:"mostRecentUseProvider"
            }
        }; 

        this.defaultCfg = {
            version:9,
            dataProvider:dataProviders,
            commands:commands,
            hotkey:"F",
            overrideDefaultOmniboxHotkey:false
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
