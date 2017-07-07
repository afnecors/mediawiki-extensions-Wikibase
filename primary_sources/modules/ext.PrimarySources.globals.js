/**
 * Global vars.
 *
 */

( function ( mw, $ ) {
    'use strict';

    var PrimarySources = {};
    PrimarySources.API = {
        'WIKIDATA_ENTITY_DATA_URL' :
            'https://www.wikidata.org/wiki/Special:EntityData/{{qid}}.json',
        'FREEBASE_ENTITY_DATA_URL' :
            'https://tools.wmflabs.org/wikidata-primary-sources/entities/{{qid}}',
        'FREEBASE_STATEMENT_APPROVAL_URL' :
        'https://tools.wmflabs.org/wikidata-primary-sources/statements/{{id}}' +
        '?state={{state}}&user={{user}}',
        'FREEBASE_STATEMENT_SEARCH_URL' :
            'https://tools.wmflabs.org/wikidata-primary-sources/statements/all',
        'FREEBASE_DATASETS' :
            'https://tools.wmflabs.org/wikidata-primary-sources/datasets/all',
        'FREEBASE_SOURCE_URL_BLACKLIST' : 'https://www.wikidata.org/w/api.php' +
        '?action=parse&format=json&prop=text' +
        '&page=Wikidata:Primary_sources_tool/URL_blacklist',
        'FREEBASE_SOURCE_URL_WHITELIST' : 'https://www.wikidata.org/w/api.php' +
        '?action=parse&format=json&prop=text' +
        '&page=Wikidata:Primary_sources_tool/URL_whitelist'
    };

    PrimarySources.qid = null;

    PrimarySources.getPossibleDatasets = function (callback) {
        var now = Date.now();
        if (localStorage.getItem('f2w_dataset')) {
            var blacklist = JSON.parse(localStorage.getItem('f2w_dataset'));
            if (!blacklist.timestamp) {
                blacklist.timestamp = 0;
            }
            if (now - blacklist.timestamp < CACHE_EXPIRY) {
                return callback(blacklist.data);
            }
        }
        $.ajax({
            url: FREEBASE_DATASETS
        }).done(function(data) {
            localStorage.setItem('f2w_dataset', JSON.stringify({
                timestamp: now,
                data: data
            }));
            return callback(data);
        }).fail(function() {
            debug.log('Could not obtain datasets');
        });
    };

    mw.PrimarySources = PrimarySources;
}( mediaWiki, jQuery ) );