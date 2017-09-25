( function ( ps ) {
    'use strict';

    var global = {};

    global.DEBUG = JSON.parse(localStorage.getItem('f2w_debug')) || false;
    global.FAKE_OR_RANDOM_DATA =
        JSON.parse(localStorage.getItem('f2w_fakeOrRandomData')) || false;

    global.CACHE_EXPIRY = 60 * 60 * 1000;

    global.WIKIDATA_ENTITY_DATA_URL =
        'https://www.wikidata.org/wiki/Special:EntityData/{{qid}}.json';
    global.FREEBASE_ENTITY_DATA_URL =
        'https://tools.wmflabs.org/wikidata-primary-sources/entities/{{qid}}';
    global.FREEBASE_STATEMENT_APPROVAL_URL =
        'https://tools.wmflabs.org/wikidata-primary-sources/statements/{{id}}' +
        '?state={{state}}&user={{user}}';
    global.FREEBASE_STATEMENT_SEARCH_URL =
        'https://tools.wmflabs.org/wikidata-primary-sources/statements/all';
    global.FREEBASE_DATASETS =
        'https://tools.wmflabs.org/wikidata-primary-sources/datasets/all';
    global.FREEBASE_SOURCE_URL_BLACKLIST = 'https://www.wikidata.org/w/api.php' +
        '?action=parse&format=json&prop=text' +
        '&page=Wikidata:Primary_sources_tool/URL_blacklist';
    global.FREEBASE_SOURCE_URL_WHITELIST = 'https://www.wikidata.org/w/api.php' +
        '?action=parse&format=json&prop=text' +
        '&page=Wikidata:Primary_sources_tool/URL_whitelist';

    global.WIKIDATA_API_COMMENT =
        'Added via [[Wikidata:Primary sources tool]]';

    global.STATEMENT_STATES = {
        approved: 'approved',
        wrong: 'wrong',
        duplicate: 'duplicate',
        blacklisted: 'blacklisted',
        unapproved: 'unapproved'
    };
    global.STATEMENT_FORMAT = 'v1';

    /* jshint ignore:start */
    /* jscs: disable */
    global.HTML_TEMPLATES = {
        qualifierHtml:
        '<div class="wikibase-listview">' +
        '<div class="wikibase-snaklistview listview-item">' +
        '<div class="wikibase-snaklistview-listview">' +
        '<div class="wikibase-snakview listview-item">' +
        '<div class="wikibase-snakview-property-container">' +
        '<div class="wikibase-snakview-property" dir="auto">' +
        '{{qualifier-property-html}}' +
        '</div>' +
        '</div>' +
        '<div class="wikibase-snakview-value-container" dir="auto">' +
        '<div class="wikibase-snakview-typeselector"></div>' +
        '<div class="wikibase-snakview-value wikibase-snakview-variation-valuesnak" style="height: auto; width: 100%;">' +
        '<div class="valueview valueview-instaticmode" aria-disabled="false">' +
        '{{qualifier-object}}' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<!-- wikibase-listview -->' +
        '</div>' +
        '</div>' +
        '</div>',
        sourceHtml:
        '<div class="wikibase-referenceview listview-item wikibase-toolbar-item new-source">' + // Remove wikibase-reference-d6e3ab4045fb3f3feea77895bc6b27e663fc878a wikibase-referenceview-d6e3ab4045fb3f3feea77895bc6b27e663fc878a
        '<div class="wikibase-referenceview-heading new-source">' +
        '<div class="wikibase-edittoolbar-container wikibase-toolbar-container">' +
        '<span class="wikibase-toolbar wikibase-toolbar-item wikibase-toolbar-container">' +
        '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-add">' +
        '<a class="f2w-button f2w-source f2w-approve" href="#" data-statement-id="{{statement-id}}" data-property="{{data-property}}" data-object="{{data-object}}" data-source="{{data-source}}" data-qualifiers="{{data-qualifiers}}"><span class="wb-icon"></span>approve reference</a>' +
        '</span>' +
        '</span>' +
        ' ' +
        /* TODO: Broken by the last changes.
         '<span class="wikibase-toolbar wikibase-toolbar-item wikibase-toolbar-container">' +
         '[' +
         '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-edit">' +
         '<a class="f2w-button f2w-source f2w-edit" href="#" data-statement-id="{{statement-id}}" data-property="{{data-property}}" data-object="{{data-object}}" data-source-property="{{data-source-property}}" data-source-object="{{data-source-object}}" data-qualifiers="{{data-qualifiers}}">edit</a>' +
         '</span>' +
         ']' +
         '</span>' +*/
        '<span class="wikibase-toolbar wikibase-toolbar-item wikibase-toolbar-container">' +
        '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-remove">' +
        '<a class="f2w-button f2w-source f2w-reject" href="#" data-statement-id="{{statement-id}}" data-property="{{data-property}}" data-object="{{data-object}}" data-source="{{data-source}}" data-qualifiers="{{data-qualifiers}}"><span class="wb-icon"></span>reject reference</a>' +
        '</span>' +
        '</span>' +
        '</div>' +
        '</div>' +
        '<div class="wikibase-referenceview-listview">' +
        '<div class="wikibase-snaklistview listview-item">' +
        '<div class="wikibase-snaklistview-listview">' +
        '{{source-html}}' +
        '<!-- wikibase-listview -->' +
        '</div>' +
        '</div>' +
        '<!-- [0,*] wikibase-snaklistview -->' +
        '</div>' +
        '</div>',
        sourceItemHtml:
        '<div class="wikibase-snakview listview-item">' +
        '<div class="wikibase-snakview-property-container">' +
        '<div class="wikibase-snakview-property" dir="auto">' +
        '{{source-property-html}}' +
        '</div>' +
        '</div>' +
        '<div class="wikibase-snakview-value-container" dir="auto">' +
        '<div class="wikibase-snakview-typeselector"></div>' +
        '<div class="wikibase-snakview-value wikibase-snakview-variation-valuesnak" style="height: auto;">' +
        '<div class="valueview valueview-instaticmode" aria-disabled="false">' +
        '{{source-object}}' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        statementViewHtml:
        '<div class="wikibase-statementview listview-item wikibase-toolbar-item new-object">' + // Removed class wikibase-statement-q31$8F3B300A-621A-4882-B4EE-65CE7C21E692
        '<div class="wikibase-statementview-rankselector">' +
        '<div class="wikibase-rankselector ui-state-disabled">' +
        '<span class="ui-icon ui-icon-rankselector wikibase-rankselector-normal" title="Normal rank"></span>' +
        '</div>' +
        '</div>' +
        '<div class="wikibase-statementview-mainsnak-container">' +
        '<div class="wikibase-statementview-mainsnak" dir="auto">' +
        '<!-- wikibase-snakview -->' +
        '<div class="wikibase-snakview">' +
        '<div class="wikibase-snakview-property-container">' +
        '<div class="wikibase-snakview-property" dir="auto">' +
        '{{property-html}}' +
        '</div>' +
        '</div>' +
        '<div class="wikibase-snakview-value-container" dir="auto">' +
        '<div class="wikibase-snakview-typeselector"></div>' +
        '<div class="wikibase-snakview-value wikibase-snakview-variation-valuesnak" style="height: auto;">' +
        '<div class="valueview valueview-instaticmode" aria-disabled="false">{{object}}</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="wikibase-statementview-qualifiers">' +
        '{{qualifiers}}' +
        '<!-- wikibase-listview -->' +
        '</div>' +
        '</div>' +
        '<!-- wikibase-toolbar -->' +
        '<span class="wikibase-toolbar-container wikibase-edittoolbar-container">' +
        '<span class="wikibase-toolbar-item wikibase-toolbar wikibase-toolbar-container">' +
        '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-add">' +
        '<a class="f2w-button f2w-property f2w-approve" href="#" data-statement-id="{{statement-id}}" data-property="{{data-property}}" data-object="{{data-object}}" data-qualifiers="{{data-qualifiers}}" data-sources="{{data-sources}}"><span class="wb-icon"></span>approve claim</a>' +
        '</span>' +
        '</span>' +
        ' ' +
        '<span class="wikibase-toolbar-item wikibase-toolbar wikibase-toolbar-container">' +
        '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-remove">' +
        '<a class="f2w-button f2w-property f2w-reject" href="#" data-statement-id="{{statement-id}}" data-property="{{data-property}}" data-object="{{data-object}}" data-qualifiers="{{data-qualifiers}}" data-sources="{{data-sources}}"><span class="wb-icon"></span>reject claim</a>' +
        '</span>' +
        '</span>' +
        '</span>' +
        '<div class="wikibase-statementview-references-container">' +
        '<div class="wikibase-statementview-references-heading">' +
        '<a class="ui-toggler ui-toggler-toggle ui-state-default">' + // Removed ui-toggler-toggle-collapsed
        '<span class="ui-toggler-icon ui-icon ui-icon-triangle-1-s ui-toggler-icon3dtrans"></span>' +
        '<span class="ui-toggler-label">{{references}}</span>' +
        '</a>' +
        '</div>' +
        '<div class="wikibase-statementview-references wikibase-toolbar-item">' + // Removed style="display: none;"
        '<!-- wikibase-listview -->' +
        '<div class="wikibase-listview">' +
        '{{sources}}' +
        '</div>' +
        '<div class="wikibase-addtoolbar-container wikibase-toolbar-container">' +
        '<!-- [' +
        '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-add">' +
        '<a href="#">add reference</a>' +
        '</span>' +
        '] -->' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',
        mainHtml:
        '<div class="wikibase-statementgroupview listview-item" id="{{property}}">' +
        '<div class="wikibase-statementgroupview-property new-property">' +
        '<div class="wikibase-statementgroupview-property-label" dir="auto">' +
        '{{property-html}}' +
        '</div>' +
        '</div>' +
        '<!-- wikibase-statementlistview -->' +
        '<div class="wikibase-statementlistview wikibase-toolbar-item">' +
        '<div class="wikibase-statementlistview-listview">' +
        '<!-- [0,*] wikibase-statementview -->' +
        '{{statement-views}}' +
        '</div>' +
        '<!-- [0,1] wikibase-toolbar -->' +
        '<span class="wikibase-toolbar-container"></span>' +
        '<span class="wikibase-toolbar-wrapper">' +
        '<div class="wikibase-addtoolbar-container wikibase-toolbar-container">' +
        '<!-- [' +
        '<span class="wikibase-toolbarbutton wikibase-toolbar-item wikibase-toolbar-button wikibase-toolbar-button-add">' +
        '<a href="#">add</a>' +
        '</span>' +
        '] -->' +
        '</div>' +
        '</span>' +
        '</div>' +
        '</div>'
    };

    global.qid = null;

    global.qid = getQid();
    if (!global.qid) {
        return debug.log('Did not manage to load the QID.');
    }

    ps.global = global;
}( primarySources ) );