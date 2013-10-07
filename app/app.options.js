angular.module("app.options",  ["app.services","app.directives","app.filters"])
    .config(function($interpolateProvider){
        $interpolateProvider.startSymbol('[[').endSymbol(']]');
    })
    .controller("options", function($scope,$dom,$url,$cfg) {
        $scope.init = function(){
            if(typeof Mustache !== "undefined") {
                $('body').html(Mustache.render($('body').html(), chrome.i18n.getMessage));
            }

            if($cfg.getMRUDisabled()){
                $("#disableMRU").attr("checked","checked");
            }
            $("#disableMRU").click(function(){
                if($(this).attr("checked") === "checked"){
                    $cfg.disableMRU(true); 
                }
                else{
                    $cfg.disableMRU(false); 
                }
            });
            $("#MRUCount").val($cfg.getMRUCount());
            $("#MRUCount").change(function(){
                var val = $.trim($(this).val());
                $cfg.setMRUCount(val);
            });
            $("#suggestionsCount").val($cfg.getSuggestionsCount());
            $("#suggestionsCount").change(function(){
                var val = $.trim($(this).val());
                $cfg.setSuggestionsCount(val);
            }); 
        };
    });
