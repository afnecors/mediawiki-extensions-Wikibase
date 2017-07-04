( function ( mw, $ ) {
    'use strict';

    mw.API = {
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

}( mediaWiki, jQuery ) );