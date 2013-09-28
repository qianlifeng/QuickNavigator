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
    });
