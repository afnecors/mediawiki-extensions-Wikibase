( function ( mw, ps) {
    console.log("PrimarySources - util");

    var util = {};

    /**
     * Print in console log only if global var DEBUG is True
     *
     * @type {{log: log}}
     */
    util.debug = {
        log: function(message) {
            if (ps.global.DEBUG) {
                console.log('PST: ' + message);
            }
        }
    };

    /**
     * Print a tooltip with custo error message
     * @param error
     */
    util.reportError = function (error) {
        mw.notify(
            error,
            {autoHide: false, tag: 'ps-error'}
        );
    };

    /**
     *
     * @param callback
     * @returns {*}
     */
    util.getPossibleDatasets = function (callback) {
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
            util.debug.log('Could not obtain datasets');
        });
    };

    /**
     * Get id of current item
     * @returns {boolean}
     */
    util.getQid = function () {
        var qidRegEx = /^Q\d+$/;
        var title = mw.config.get('wgTitle');
        return qidRegEx.test(title) ? title : false;
    };

    /**
     * Check if a string is a URL
     * @param url
     * @returns {*}
     */
    // "http://research.google.com/pubs/vrandecic.html"
    util.isUrl = function (url) {
        if (typeof URL !== 'function') {
            return url.indexOf('http') === 0;
        }

        try {
            url = new URL(url.toString());
            return url.protocol.indexOf('http') === 0 && url.host;
        } catch (e) {
            return false;
        }
    };

    /**
     * Convert TSV to JSON
     * @param value
     * @returns {*}
     */
    util.tsvValueToJson = function (value) {
        // From https://www.wikidata.org/wiki/Special:ListDatatypes and
        // https://de.wikipedia.org/wiki/Wikipedia:Wikidata/Wikidata_Spielwiese
        // https://www.wikidata.org/wiki/Special:EntityData/Q90.json

        // Q1
        var itemRegEx = /^Q\d+$/;

        // P1
        var propertyRegEx = /^P\d+$/;

        // @43.3111/-16.6655
        var coordinatesRegEx = /^@([+\-]?\d+(?:.\d+)?)\/([+\-]?\d+(?:.\d+))?$/;

        // fr:"Les Misérables"
        var languageStringRegEx = /^(\w+):("[^"\\]*(?:\\.[^"\\]*)*")$/;

        // +2013-01-01T00:00:00Z/10
        /* jshint maxlen: false */
        var timeRegEx = /^[+-]\d+-\d\d-\d\dT\d\d:\d\d:\d\dZ\/\d+$/;
        /* jshint maxlen: 80 */

        // +/-1234.4567
        var quantityRegEx = /^[+-]\d+(\.\d+)?$/;

        if (itemRegEx.test(value)) {
            return {
                type: 'wikibase-item',
                value: {
                    'entity-type': 'item',
                    'numeric-id': parseInt(value.replace(/^Q/, ''))
                }
            };
        } else if (propertyRegEx.test(value)) {
            return {
                type: 'wikibase-property',
                value: {
                    'entity-type': 'property',
                    'numeric-id': parseInt(value.replace(/^P/, ''))
                }
            };
        } else if (coordinatesRegEx.test(value)) {
            var latitude = value.replace(coordinatesRegEx, '$1');
            var longitude = value.replace(coordinatesRegEx, '$2');
            return {
                type: 'globe-coordinate',
                value: {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    altitude: null,
                    precision: computeCoordinatesPrecision(latitude, longitude),
                    globe: 'http://www.wikidata.org/entity/Q2'
                }
            };
        } else if (languageStringRegEx.test(value)) {
            return {
                type: 'monolingualtext',
                value: {
                    language: value.replace(languageStringRegEx, '$1'),
                    text: JSON.parse(value.replace(languageStringRegEx, '$2'))
                }
            };
        } else if (timeRegEx.test(value)) {
            var parts = value.split('/');
            return {
                type: 'time',
                value: {
                    time: parts[0],
                    timezone: 0,
                    before: 0,
                    after: 0,
                    precision: parseInt(parts[1]),
                    calendarmodel: 'http://www.wikidata.org/entity/Q1985727'
                }
            };
        } else if (quantityRegEx.test(value)) {
            return {
                type: 'quantity',
                value: {
                    amount: value,
                    unit: '1'
                }
            };
        } else {
            value = JSON.parse(value);
            if (util.isUrl(value)) {
                return {
                    type: 'url',
                    value: normalizeUrl(value)
                };
            } else {
                return {
                    type: 'string',
                    value: value
                };
            }
        }
    };

    /**
     * Convert JSON to TSV
     * @param dataValue
     * @param dataType
     * @returns {*}
     */
    util.jsonToTsvValue = function (dataValue, dataType) {
        if (!dataValue.type) {
            util.debug.log('No data value type given');
            return dataValue.value;
        }
        switch (dataValue.type) {
            case 'quantity':
                return dataValue.value.amount;
            case 'time':
                var time = dataValue.value.time;

                // Normalize the timestamp
                if (dataValue.value.precision < 11) {
                    time = time.replace('-01T', '-00T');
                }
                if (dataValue.value.precision < 10) {
                    time = time.replace('-01-', '-00-');
                }

                return time + '/' + dataValue.value.precision;
            case 'globecoordinate':
                return '@' + dataValue.value.latitude + '/' + dataValue.value.longitude;
            case 'monolingualtext':
                return dataValue.value.language + ':' + JSON.stringify(dataValue.value.text);
            case 'string':
                var str = (dataType === 'url') ? util.normalizeUrl(dataValue.value)
                    : dataValue.value;
                return JSON.stringify(str);
            case 'wikibase-entityid':
                switch (dataValue.value['entity-type']) {
                    case 'item':
                        return 'Q' + dataValue.value['numeric-id'];
                    case 'property':
                        return 'P' + dataValue.value['numeric-id'];
                }
        }
        util.debug.log('Unknown data value type ' + dataValue.type);
        return dataValue.value;
    };

    /**
     * Normalize url
     * @param url
     * @returns {*}
     */
    util.normalizeUrl = function (url) {
        try {
            return (new URL(url.toString())).href;
        } catch (e) {
            return url;
        }
    };

    /**
     * Get decimal digits of a number
     * Example number = "2.718", it returns "3"
     * @param number
     * @returns {number}
     */
    util.numberOfDecimalDigits = function (number) {
        var parts = number.split('.');
        if (parts.length < 2) {
            return 0;
        }
        return parts[1].length;
    };


    util.escapeHtml = function (html) {
        return html
            .replace(/&/g, '&amp;') // &
            .replace(/</g, '&lt;') // <
            .replace(/>/g, '&gt;') // >
            .replace(/\"/g, '&quot;'); // "
    };

    util.isBlackListedBuilder = function (blacklistedSourceUrls) {
        return function(url) {
            try {
                var url = new URL(url);
            } catch (e) {
                return false;
            }

            for (var i in blacklistedSourceUrls) {
                if (url.host.indexOf(blacklistedSourceUrls[i]) !== -1) {
                    return true;
                }
            }
            return false;
        };
    };


    // TODO check why there aren't cookie in mw obj
    // ps.util.dataset = mw.cookie.get('ps-dataset', null, '');
    util.dataset = '';
    // var datasetLabel = (dataset === '') ? 'Primary Sources' : dataset;
    util.datasetLabel = 'PrimarySources';

    ps.util = util;

} ( mediaWiki, primarySources ) );