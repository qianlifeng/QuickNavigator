angular.module("app.options",  ["app.services","app.directives","app.filters"])
    .config(function($interpolateProvider){
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })
    .controller("options", function($scope,$dom,$url,$cfg) {

        $scope.availableHotkey = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

        $scope.cfg = $cfg.getCfg();
        $scope.availableProviders = [];
        $cfg.dataProviders.forEach(function(element){
            if($scope.cfg.activeProviders.indexOf(element) >= 0){
                $scope.availableProviders.push({name:element,checked:true});
            }
            else{
                $scope.availableProviders.push({name:element,checked:false});
            }
        });

        $scope.init = function(){
            if(typeof Mustache !== "undefined") {
                $('body').html(Mustache.render($('body').html(), chrome.i18n.getMessage));
            }
        };

        $scope.addExcludeSuggestions = function(){
            var item = $scope.newExcludeSuggestions;
            var index = $scope.cfg.excludeSuggestions.indexOf(item);
            if(index === -1){
                $scope.cfg.excludeSuggestions.push(item);
            }

            $scope.newExcludeSuggestions = "";
        };

        $scope.removeExcludeSuggestions = function(item){
            var index = $scope.cfg.excludeSuggestions.indexOf(item);
            if(index > -1) {
                $scope.cfg.excludeSuggestions.splice(index, 1);
            }
        };

        $scope.save = function(){
            var checkedProviders = [];
            $scope.availableProviders.forEach(function(p){
                if(p.checked){
                    checkedProviders.push(p.name);
                }
            });
            $scope.cfg.activeProviders = checkedProviders;

            $cfg.saveCfg($scope.cfg);
            $('#savedModal').modal();
        };
    });
