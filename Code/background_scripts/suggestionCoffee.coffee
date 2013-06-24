class DataProvider
    _dataCache = []

    _pushData = (url,title,relevancy = 0)->
        _dataCache.push
            url:url
            title:title
            relevancy:relevancy

    _sortByRelevancy = ->
        _dataCache.sort (a,b)->
            if a.relevancy >= b.relevancy then 1 else -1

    refresh: ->
        _dataCache = []

    query: (term)->
        _pushData "u","t",2
        _pushData "u","t",1
        _sortByRelevancy()
        for item in _dataCache
          alert item.relevancy

class BookMarkProvider extends dataProvider
    refresh: ->
    query: (term)->

class HistoryProvider extends dataProvider
    _internalMethod = ->

    #public methods
    refresh: -> super().dataCache
    query: (term)->

class PopDomainProvider extends dataProvider
    refresh: ->
        if not window.popDomains?
            console.log "popdomain is null, please check"

    query: (term)->
      super(term)

pop = new popDomainProvider()
pop.query()
