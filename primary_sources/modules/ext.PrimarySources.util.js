( function ( mw, ps) {
    console.log("PrimarySources - util");

    var util = {
        reportError : function (error) {
            mw.notify(
                error,
                { autoHide: false, tag: 'ps-error' }
            );
        },
        getPossibleDatasets : function (callback) {
            var now = Date.now();
            if (localStorage.getItem('f2w_dataset')) {
                var blacklist = JSON.parse(localStorage.getItem('f2w_dataset'));
                if (!blacklist.timestamp) {
                    blacklist.timestamp = 0;
                }
                if (now - blacklist.timestamp < ps.global.CACHE_EXPIRY) {
                    return callback(blacklist.data);
                }
            }
            $.ajax({
                url: ps.global.FREEBASE_DATASETS
            }).done(function(data) {
                localStorage.setItem('f2w_dataset', JSON.stringify({
                    timestamp: now,
                    data: data
                }));
                return callback(data);
            }).fail(function() {
                debug.log('Could not obtain datasets');
            });
        }
    };


    // TODO check why there aren't cookie in mw obj
    // ps.util.dataset = mw.cookie.get('ps-dataset', null, '');
    util.dataset = '';
    // var datasetLabel = (dataset === '') ? 'Primary Sources' : dataset;
    util.datasetLabel = 'PrimarySources';

    ps.util = util;

} ( mediaWiki, primarySources ) );