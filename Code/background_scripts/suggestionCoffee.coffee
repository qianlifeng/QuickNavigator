class dataProvider
    dataCache = []

    refresh: ->
    query: (term)->

class bookMarkProvider extends dataProvider
    refresh: ->
    query: (term)->

class historyProvider extends dataProvider
    s = 5
    _internalMethod= ->

    #public methods
    refresh: -> super().dataCache
    query: (term)->

class popDomainProvider extends dataProvider
    refresh: ->
    query: (term)->
