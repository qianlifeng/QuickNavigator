angular.module("app.directives", [])
    .directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    if(!scope.$$phase) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });
                        event.preventDefault();
                    }
                }
            });
        };
    })
    .directive('ngImgonerror', function ($parse) {
        return function (scope, element, attrs) {
            element[0].onerror = function() {
                element[0].src = chrome.extension.getURL(attrs.ngImgonerror);
            };
        };
    })
    .directive("ngFocusme", function($timeout, $parse) {
        return function(scope, element, attrs) {
            scope.$watch(attrs.ngFocusme, function(value) {
                if(value === true) { 
                    $timeout(function() {
                        element[0].focus(); 
                    });
                }
            });
            // set attribute value to 'false' on blur event:
            element.bind("blur", function() {
                if(!scope.$$phase) {
                    scope.$apply($parse(attrs.ngFocusme).assign(scope, false));
                }
            });
        };
    })
    .directive('ngCompileTemplate', function ($compile) {

        var linker = function(scope, element, attrs) {
            element.html(scope.item.template).show();
            $compile(element.contents())(scope);
        }

        return {
            restrict: "E",
            rep1ace: true,
            link: linker,
            scope: {
                item:"=",
                input:"="
            }
        };
    });
