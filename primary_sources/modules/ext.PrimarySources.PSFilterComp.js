/**
 *
 * PrimarySources Filter component.
 *
 * When the user clicks on the Primary Sources filter link (currently Primary Sources list),
 * a modal window will open; the user can view a table of suggested statements with eventual
 * references by building filters in several ways.
 *
 */
( function ( mw ) {
    console.log('Primary Sources - PSFilterComp');

    mw.loader.using(
        ['jquery.tipsy', 'oojs-ui', 'wikibase.dataTypeStore'], function() {
            var listButton = $(mw.util.addPortletLink(
                'p-tb',
                '#',
                'Primary Sources list',
                'n-ps-list',
                'List statements from Primary Sources'
            ));
            listDialog(listButton);
        });

    function listDialog(button) {

        /**
         * A row displaying a statement
         *
         * @class
         * @extends OO.ui.Widget
         * @cfg {Object} [statement] the statement to display
         */
        function StatementRow(config) {
            StatementRow.super.call(this, config);

            this.statement = config.statement;
            var widget = this;
            var numberOfSnaks = this.statement.qualifiers.length + 1;

            var htmlCallbacks = [
                getValueHtml(this.statement.subject),
                getValueHtml(this.statement.predicate),
                getValueHtml(this.statement.object, this.statement.predicate)
            ];
            this.statement.qualifiers.forEach(function(qualifier) {
                htmlCallbacks.push(getValueHtml(qualifier.qualifierProperty));
                htmlCallbacks.push(
                    getValueHtml(qualifier.qualifierObject, qualifier.qualifierProperty)
                );
            });

            $.when.apply(this, htmlCallbacks).then(function() {
                var subjectHtml = arguments[0];
                var propertyHtml = arguments[1];
                var objectHtml = arguments[2];

                var approveButton = new OO.ui.ButtonWidget({
                    label: 'Approve',
                    flags: 'constructive'
                });
                approveButton.connect(widget, {click: 'approve'});

                var rejectButton = new OO.ui.ButtonWidget({
                    label: 'Reject',
                    flags: 'destructive'
                });
                rejectButton.connect(widget, {click: 'reject'});

                var buttonGroup = new OO.ui.ButtonGroupWidget({
                    items: [approveButton, rejectButton]
                });

                // Main row
                widget.$element
                    .attr('data-id', widget.statement.id)
                    .append(
                        $('<tr>').append(
                            $('<td>')
                                .attr('rowspan', numberOfSnaks)
                                .html(subjectHtml),
                            $('<td>')
                                .attr('rowspan', numberOfSnaks)
                                .html(propertyHtml),
                            $('<td>')
                                .attr('colspan', 2)
                                .html(objectHtml),
                            $('<td>')
                                .attr('rowspan', numberOfSnaks)
                                .append(buttonGroup.$element)
                        )
                    );

                // Qualifiers
                for (var i = 3; i < arguments.length; i += 2) {
                    widget.$element.append(
                        $('<tr>').append(
                            $('<td>').html(arguments[i]),
                            $('<td>').html(arguments[i + 1])
                        )
                    );
                }

                // Check that the statement don't already exist
                getClaims(widget.statement.subject, widget.statement.predicate,
                    function(err, statements) {
                        for (var i in statements) {
                            buildValueKeysFromWikidataStatement(statements[i]);
                            if ($.inArray(
                                    widget.statement.key,
                                    buildValueKeysFromWikidataStatement(statements[i])
                                ) !== -1) {
                                widget.toggle(false).setDisabled(true);
                                if (widget.statement.source.length === 0) {
                                    setStatementState(widget.statement.id,
                                        STATEMENT_STATES.duplicate).done(function() {
                                        debug.log(widget.statement.id + ' tagged as duplicate');
                                    });
                                }
                            }
                        }
                    });
            });
        }
        OO.inheritClass(StatementRow, OO.ui.Widget);
        StatementRow.static.tagName = 'tbody';

        StatementRow.prototype.approve = function() {
            var widget = this;

            this.showProgressBar();
            createClaim(
                this.statement.subject,
                this.statement.predicate,
                this.statement.object,
                this.statement.qualifiers
            ).fail(function(error) {
                return reportError(error);
            }).done(function() {
                if (this.statement.source.length > 0) {
                    return; // TODO add support of source review
                }
                setStatementState(widget.statement.id, STATEMENT_STATES.approved)
                    .done(function() {
                        widget.toggle(false).setDisabled(true);
                    });
            });
        };

        StatementRow.prototype.reject = function() {
            var widget = this;

            this.showProgressBar();
            setStatementState(widget.statement.id, STATEMENT_STATES.wrong)
                .done(function() {
                    widget.toggle(false).setDisabled(true);
                });
        };

        StatementRow.prototype.showProgressBar = function() {
            var progressBar = new OO.ui.ProgressBarWidget();
            progressBar.$element.css('max-width', '100%');
            this.$element.empty()
                .append(
                    $('<td>')
                        .attr('colspan', 4)
                        .append(progressBar.$element)
                );
        };

        /**
         * The main dialog
         *
         * @class
         * @extends OO.ui.Widget
         */
        function ListDialog(config) {
            ListDialog.super.call(this, config);
        }
        OO.inheritClass(ListDialog, OO.ui.ProcessDialog);
        ListDialog.static.name = 'ps-list';
        ListDialog.static.title = 'Primary Sources statement list (in development)';
        ListDialog.static.size = 'larger';
        ListDialog.static.actions = [
            {label: 'Close', flags: 'safe'}
        ];

        ListDialog.prototype.initialize = function() {
            ListDialog.super.prototype.initialize.apply(this, arguments);

            var widget = this;

            // Selection form
            this.datasetInput = new OO.ui.DropdownInputWidget();
            getPossibleDatasets(function(datasets) {
                var options = [{data: '', label: 'All sources'}];
                for (var datasetId in datasets) {
                    options.push({data: datasetId, label: datasetId});
                }
                widget.datasetInput.setOptions(options)
                    .setValue(dataset);
            });

            this.propertyInput = new OO.ui.TextInputWidget({
                placeholder: 'PXX',
                validate: /^[pP]\d+$/
            });

            this.valueInput = new OO.ui.TextInputWidget({
                placeholder: 'Filter by value like item id'
            });

            var loadButton = new OO.ui.ButtonInputWidget({
                label: 'Load',
                flags: 'progressive',
                type: 'submit'
            });
            loadButton.connect(this, {click: 'onOptionSubmit'});

            var fieldset = new OO.ui.FieldsetLayout({
                label: 'Query options',
                classes: ['container']
            });
            fieldset.addItems([
                new OO.ui.FieldLayout(this.datasetInput, {label: 'Dataset'}),
                new OO.ui.FieldLayout(this.propertyInput, {label: 'Property'}),
                new OO.ui.FieldLayout(this.valueInput, {label: 'Value'}),
                new OO.ui.FieldLayout(loadButton)
            ]);
            var formPanel = new OO.ui.PanelLayout({
                padded: true,
                framed: true
            });
            formPanel.$element.append(fieldset.$element);

            // Main panel
            var alertIcon = new OO.ui.IconWidget({
                icon: 'alert'
            });
            var description = new OO.ui.LabelWidget({
                label: 'This feature is currently in active development. ' +
                'It allows to list statements contained in Primary Sources ' +
                'and do action on them. Statements with qualifiers or sources ' +
                'are hidden.'
            });
            this.mainPanel = new OO.ui.PanelLayout({
                padded: true,
                scrollable: true
            });
            this.mainPanel.$element.append(alertIcon.$element, description.$element);

            // Final layout
            this.stackLayout = new OO.ui.StackLayout({
                continuous: true
            });
            this.stackLayout.addItems([formPanel, this.mainPanel]);
            this.$body.append(this.stackLayout.$element);
        };

        ListDialog.prototype.onOptionSubmit = function() {
            this.mainPanel.$element.empty();
            this.table = null;
            this.parameters = {
                dataset: this.datasetInput.getValue(),
                property: this.propertyInput.getValue(),
                value: this.valueInput.getValue(),
                offset: 0,
                limit: 100
            };
            this.alreadyDisplayedStatementKeys = {};

            this.executeQuery();
        };

        ListDialog.prototype.executeQuery = function() {
            var widget = this;

            var progressBar = new OO.ui.ProgressBarWidget();
            progressBar.$element.css('max-width', '100%');
            widget.mainPanel.$element.append(progressBar.$element);

            searchStatements(this.parameters)
                .fail(function() {
                    progressBar.$element.remove();
                    var description = new OO.ui.LabelWidget({
                        label: 'No statements found.'
                    });
                    widget.mainPanel.$element.append(description.$element);
                })
                .done(function(statements) {
                    progressBar.$element.remove();

                    widget.parameters.offset += widget.parameters.limit;
                    widget.displayStatements(statements);

                    // We may assume that more statements remains
                    if (statements.length > 0) {
                        widget.nextStatementsButton = new OO.ui.ButtonWidget({
                            label: 'Load more statements',
                        });
                        widget.nextStatementsButton.connect(
                            widget,
                            {click: 'onNextButtonSubmit'}
                        );
                        widget.mainPanel.$element.append(
                            widget.nextStatementsButton.$element
                        );
                    }
                });
        };

        ListDialog.prototype.onNextButtonSubmit = function() {
            this.nextStatementsButton.$element.remove();
            this.executeQuery();
        };

        ListDialog.prototype.displayStatements = function(statements) {
            var widget = this;

            if (this.table === null) { // Initialize the table
                this.initTable();
            }

            statements.map(function(statement) {
                statement.key = statement.subject + '\t' +
                    statement.predicate + '\t' +
                    statement.object;
                statement.qualifiers.forEach(function(qualifier) {
                    statement.key += '\t' + qualifier.qualifierProperty + '\t' +
                        qualifier.qualifierObject;
                });
                if (statement.key in widget.alreadyDisplayedStatementKeys) {
                    return; // Don't display twice the same statement
                }
                widget.alreadyDisplayedStatementKeys[statement.key] = true;

                var row = new StatementRow({
                    statement: statement
                });
                widget.table.append(row.$element);
            });
        };

        ListDialog.prototype.initTable = function() {
            this.table = $('<table>')
                .addClass('wikitable')
                .css('width', '100%')
                .append(
                    $('<thead>').append(
                        $('<tr>').append(
                            $('<th>').text('Subject'),
                            $('<th>').text('Property'),
                            $('<th>').attr('colspan', 2).text('Object'),
                            $('<th>').text('Action')
                        )
                    )
                );
            this.mainPanel.$element.append(this.table);
        };

        ListDialog.prototype.getBodyHeight = function() {
            return window.innerHeight - 100;
        };

        windowManager.addWindows([new ListDialog()]);

        button.click(function() {
            windowManager.openWindow('ps-list');
        });
    }

} ( mediawiki ) );