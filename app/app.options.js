angular.module("app.options",  ["app.services","app.directives","app.filters"])
    .config(function($interpolateProvider){
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })
    .controller("options", function($scope,$dom,$url,$cfg) {

        $scope.availableHotkey = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

        $scope.cfg = $cfg.getCfg();
        $scope.dataProviders = $cfg.dataProviders;

        $scope.init = function(){
            if(typeof Mustache !== "undefined") {
                $('body').html(Mustache.render($('body').html(), chrome.i18n.getMessage));
            }
        };

        $scope.save = function(){
            $cfg.saveCfg($scope.cfg);
            localStorage.QuickNavigatorUserCfgDirty = "true";
            alert("Saved");
        };
    });
