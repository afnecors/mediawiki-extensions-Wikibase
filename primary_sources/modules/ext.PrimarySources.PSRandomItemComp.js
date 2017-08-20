/**
 * PrimarySources Random item component.
 *
 * The user can jump to a random Item containing suggested statements
 * by clicking on the Random Primary Sources item link located in the
 * main menu on the left sidebar; the item will be randomly picked from
 * the datasets selected in the Primary Sources configuration.
 *
 */

( function PSRandomItemComp( mw, ps ) {
    console.log('Primary Sources - PSRandomItemComp');

    var portletLink = $(mw.util.addPortletLink(
        'p-navigation',
        '#',
        'Random ' + ps.util.datasetLabel + ' item',
        'n-random-ps',
        'Load a new random ' + ps.util.datasetLabel + ' item',
        '',
        '#n-help'
    ));

    portletLink.children().click(function(e) {
        e.preventDefault();
        e.target.innerHTML = '<img src="https://upload.wikimedia.org/' +
            'wikipedia/commons/f/f8/Ajax-loader%282%29.gif" class="ajax"/>';
        $.ajax({
            url: ps.global.FREEBASE_ENTITY_DATA_URL.replace(/\{\{qid\}\}/, 'any') +
            '?dataset=' + ps.util.dataset
        }).done(function(data) {
            var newQid = data[0].statement.split(/\t/)[0];
            document.location.href = 'https://www.wikidata.org/wiki/' + newQid;
        }).fail(function() {
            return ps.util.reportError('Could not obtain random Primary Sources item');
        });
    });

    ps.confLink = portletLink;

} ( mediaWiki, primarySources ) );