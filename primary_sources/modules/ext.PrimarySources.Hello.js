console.log("Hello World!");

//var title = mw.config.get('wgTitle');

// https://www.mediawiki.org/wiki/ResourceLoader/Core_modules

function getExternalDataRandomItem() {
    $.ajax({
        url: FREEBASE_ENTITY_DATA_URL.replace(/\{\{qid\}\}/, 'any') +
        '?dataset=' + dataset
    }).done(function(data) {
        var newQid = data[0].statement.split(/\t/)[0];
        document.location.href = 'https://www.wikidata.org/wiki/' + newQid;
    }).fail(function() {
        return reportError('Could not obtain random Primary Sources item');
    });
}

function reportError(error) {
    mw.notify(
        error,
        {autoHide: false, tag: 'ps-error'}
    );
}