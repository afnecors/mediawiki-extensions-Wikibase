/**
 * Main JavaScript for the Primary Sources extension.
 *
 */
( function ( mw, $ ) {
    'use strict';

    // TODO enable cookies
    //var dataset = mw.cookie.get('ps-dataset', null, '');
    var dataset = '';

    /**
     * Create a menu list item that navigate to a random
     * wikidata item with suggested data
     *
     */
    (function createPrimarySourcesRandomMenuItem() {
        var datasetLabel = (dataset === '') ? 'Primary Sources' : dataset;

        // Create menu item
        var portletLink = mw.util.addPortletLink(
            'p-navigation', // id
            '#', // href
            'Random ' + datasetLabel + ' item', // text
            'n-random-ps', // id
            'Load a new random ' + datasetLabel + ' item', // tooltip
            '', // accesskey
            '#n-help' // nextnode
        );

        // Handle click
        $( portletLink ).click( function ( e ) {
            e.preventDefault();
            e.target.innerHTML = '<img src="https://upload.wikimedia.org/' +
                'wikipedia/commons/f/f8/Ajax-loader%282%29.gif" class="ajax"/>';
            $.ajax({
                url: mw.PrimarySources.API['FREEBASE_ENTITY_DATA_URL'].replace(/\{\{qid\}\}/, 'any') +
                '?dataset=' + dataset
            }).done(function(data) {
                var newQid = data[0].statement.split(/\t/)[0];
                document.location.href = 'https://www.wikidata.org/wiki/' + newQid;
            }).fail(function() {
                return reportError('Could not obtain random Primary Sources item');
            });
        });
    })();

    /**
     * Create a MediaWiki notification with custom message
     *
     * @param error
     */
    function reportError(error) {
        mw.notify(
            error,
            {autoHide: false, tag: 'ps-error'}
        );
    }

    /**
     * Get the ID of the current page item
     *
     * @returns {boolean|String}
     */
    function getQid() {
        var qidRegEx = /^Q\d+$/;
        var title = mw.config.get('wgTitle');
        return qidRegEx.test(title) ? title : false;
    }

}( mediaWiki, jQuery ) );


// function createPrimarySourcesFilterMenuItem() {
//     // TODO refactor and import configDialog() and listDialog()
//     mw.loader.using(
//         ['jquery.tipsy', 'oojs-ui', 'wikibase.dataTypeStore'], function() {
//             windowManager = new OO.ui.WindowManager();
//             $('body').append(windowManager.$element);
//
//             var configButton = $('<span>')
//                 .attr({
//                     id: 'ps-config-button',
//                     title: 'Primary Sources options'
//                 })
//                 .tipsy()
//                 .appendTo(portletLink);
//             configDialog(configButton);
//
//             var listButton = $(mw.util.addPortletLink(
//                 'p-tb',
//                 '#',
//                 'Primary Sources list',
//                 'n-ps-list',
//                 'List statements from Primary Sources'
//             ));
//             listDialog(listButton);
//         });
// }