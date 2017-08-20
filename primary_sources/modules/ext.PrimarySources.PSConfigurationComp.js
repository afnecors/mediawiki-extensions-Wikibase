/**
 *
 * PrimarySources Configuration component.
 *
 * When the user clicks on the gear icon next to the Random Primary Sources item link
 * in the main menu on the left sidebar, a modal window will open;
 * the user can search and select which dataset to use;
 *
 */

( function ( mw, ps ) {
    console.log('Primary Sources - PSConfigurationComp');

    var windowManager;

    /**
     * Create configuration clickable icon.
     *
     */
    mw.loader.using(
        ['jquery.tipsy', 'oojs-ui', 'wikibase.dataTypeStore'], function() {
            windowManager = new OO.ui.WindowManager();
            $('body').append(windowManager.$element);

            var configButton = $('<span>')
                .attr({
                    id: 'ps-config-button',
                    title: 'Primary Sources options'
                })
                .tipsy()
                .appendTo(ps.confLink);
            configDialog(configButton);
        });

    /**
     * Modal where the user can search and select which dataset to use.
     *
     * @param button
     */
    function configDialog(button) {

        // Constructor
        function ConfigDialog(config) {
            ConfigDialog.super.call(this, config);
        }

        // https://www.mediawiki.org/wiki/OOjs
        OO.inheritClass(ConfigDialog, OO.ui.ProcessDialog);

        ConfigDialog.static.name = 'ps-config';
        ConfigDialog.static.title = 'Primary Sources configuration';
        ConfigDialog.static.size = 'large';
        ConfigDialog.static.actions = [
            { action: 'save', label: 'Save', flags: ['primary', 'constructive'] },
            { label: 'Cancel', flags: 'safe' }
        ];

        ConfigDialog.prototype.initialize = function() {
            ConfigDialog.super.prototype.initialize.apply(this, arguments);

            this.dataset = new OO.ui.ButtonSelectWidget({
                items: [new OO.ui.ButtonOptionWidget({
                    data: '',
                    label: 'All sources'
                })]
            });

            var dialog = this;

            ps.util.getPossibleDatasets(function(datasets) {
                for (var datasetId in datasets) {
                    dialog.dataset.addItems([new OO.ui.ButtonOptionWidget({
                        data: datasetId,
                        label: datasetId,
                    })]);
                }
            });

            this.dataset.selectItemByData(ps.util.dataset);

            var fieldset = new OO.ui.FieldsetLayout({
                label: 'Dataset to use'
            });
            fieldset.addItems([this.dataset]);

            this.panel = new OO.ui.PanelLayout({
                padded: true,
                expanded: false
            });
            this.panel.$element.append(fieldset.$element);
            this.$body.append(this.panel.$element);
        };

        ConfigDialog.prototype.getActionProcess = function(action) {
            if (action === 'save') {
                //TODO cookie
                //mw.cookie.set('ps-dataset', this.dataset.getSelectedItem().getData());
                return new OO.ui.Process(function() {
                    location.reload();
                });
            }

            return ConfigDialog.super.prototype.getActionProcess.call(this, action);
        };

        ConfigDialog.prototype.getBodyHeight = function() {
            return this.panel.$element.outerHeight(true);
        };

        windowManager.addWindows([new ConfigDialog()]);

        // Open modal on click
        button.click(function() {
            windowManager.openWindow('ps-config');
        });
    }


} ( mediaWiki, primarySources ));