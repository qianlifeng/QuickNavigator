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
    .service("$cfg",function(){
        this.dataProvider = [
            {name:"bookMarkProvider",relevancy:10,text:"书签"},
            {name:"historyProvider",relevancy:7,text:"历史记录"},
            {name:"popDomainProvider",relevancy:1,text:"流行网站"},
            {name:"closedTabProvider",relevancy:1,text:"最近关闭标签"},
            {name:"mostRecentUseProvider",relevancy:15,text:"经常使用"},
            {name:"baiduSuggestionProvider",relevancy:1,text:"百度"},
            {name:"commandProvider",relevancy:1000,text:"命令"}
        ];

        this.suggestionMode = {
            normal:{
                //每个模式的唯一标识符
                key:"normal",
                //显示输入框前面的文字
                text:"",
                //触发的热键，这里的触发条件是指输hotkey之后按tab键，none表示没有
                hotkey:"none",
                //是否禁用
                disabled:false,
                //是否根据相关性排序后显示建议
                applyRelevancy:true,
                //选择建议项之后，是否将选中的项目记入MRU
                applyMRU:true,
                //最大的建议数量【如果本地存储件中存在相同的配置项目，则优先读取用户设置的本地存储值】
                maxResult:8,
                //数据源
                dataProvider:"bookMarkProvider,historyProvider,popDomainProvider,mostRecentUseProvider,baiduSuggestionProvider,commandProvider"
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
                clientCommand:"javascript:$scope.disabled = true;$scope.showOmnibox = false;",
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

        this.disableMRU = function(val){
            localStorage.QuickNavigator_DisableMRU = val.toString();
        };

        this.getMRUDisabled = function(){
            var disabled = localStorage.QuickNavigator_DisableMRU;
            if(disabled){
                return disabled == "true"?true:false;
            }
            return this.suggestionMode.mru.disabled;
        };

        this.setMRUCount = function(val){
            localStorage.QuickNavigator_MRUCount = val.toString();
        };

        this.getMRUCount = function(){
            if(typeof localStorage.QuickNavigator_MRUCount === "undefined") return this.suggestionMode.mru.maxResult;
            return parseInt(localStorage.QuickNavigator_MRUCount,10);
        };

        this.setSuggestionsCount = function(val){
            localStorage.QuickNavigator_SuggestionsCount = val.toString();
        };

        this.getSuggestionsCount = function(){
            if(typeof localStorage.QuickNavigator_SuggestionsCount === "undefined") return this.suggestionMode.normal.maxResult;
            return parseInt(localStorage.QuickNavigator_SuggestionsCount,10);
        };
    });
