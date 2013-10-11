var dataProviderModule = angular.module('app.services.dataProviders', ['app.services'])
    .config(function($provide) {
        var template = 
            "<div class='omniboxReset omnibox-suggestions-top'>"+ 
                "<div class='omniboxReset omnibox-suggestions-icon'>"+ 
                    "<img class='omniboxReset' ng-src='{{item.url | domainIconUrl}}' ng-imgonerror='images/file.ico'>"+ 
                "</div>"+ 
                "<a class='omniboxReset omnibox-suggestions-title' ng-click='navigate(false,item.url,item.title,item.providerName)' href='{{item.url}}' ng-bind-html-unsafe='item.title | hightlightSearch:input'></a>"+ 
            "</div>"+ 
            "<div class='omniboxReset omnibox-suggestions-bottom'>"+ 
                "<div class='omniboxReset omnibox-suggestions-sourcetype'>{{item.providerName | providerName}} {{item.relevancy}}</div>"+ 
                "<div class='omniboxReset omnibox-suggestions-url' ng-bind-html-unsafe='item.url | hightlightSearch:input'></div>"+ 
            "</div>";

        $provide.constant("defaultTemplate", template); 
    });
