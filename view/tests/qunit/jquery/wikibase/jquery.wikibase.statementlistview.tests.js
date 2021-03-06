/**
 * @license GPL-2.0+
 * @author H. Snater < mediawiki@snater.com >
 */
( function ( $, wb, QUnit ) {
	'use strict';

	var statementviewListItemAdapter = wb.tests.getMockListItemAdapter(
		'statementview',
		function () {
			var _value = this.options.value;
			this.startEditing = function () {};
			this.value = function ( newValue ) {
				if ( arguments.length ) {
					_value = newValue;
				}
				return _value;
			};
		}
	);

	/**
	 * @param {Object} [options={}]
	 * @param {jQuery} [$node]
	 * @return {jQuery}
	 */
	var createStatementlistview = function ( options, $node ) {
		options = $.extend( {
			getAdder: function () {
				return {
					destroy: function () {}
				};
			},
			getListItemAdapter: function () {
				return statementviewListItemAdapter;
			},
			value: new wb.datamodel.StatementList()
		}, options || {} );

		$node = $node || $( '<div/>' ).appendTo( 'body' );

		return $node
			.addClass( 'test_statementlistview' )
			.statementlistview( options );
	};

	QUnit.module( 'jquery.wikibase.statementlistview', QUnit.newMwEnvironment( {
		teardown: function () {
			$( '.test_statementlistview' ).each( function () {
				var $statementlistview = $( this ),
					statementlistview = $statementlistview.data( 'statementlistview' );

				if ( statementlistview ) {
					statementlistview.destroy();
				}

				$statementlistview.remove();
			} );
		}
	} ) );

	QUnit.test( 'Create & destroy', function ( assert ) {
		assert.expect( 3 );
		var $statementlistview = createStatementlistview(),
			statementlistview = $statementlistview.data( 'statementlistview' );

		assert.ok(
			statementlistview instanceof $.wikibase.statementlistview,
			'Created widget.'
		);

		statementlistview.destroy();

		assert.ok(
			$statementlistview.data( 'statementlistview' ) === undefined,
			'Destroyed widget.'
		);

		$statementlistview = createStatementlistview( {
			value: new wb.datamodel.StatementList( [
				new wb.datamodel.Statement( new wb.datamodel.Claim(
					new wb.datamodel.PropertyNoValueSnak( 'P1' )
				) )
			] )
		} );
		statementlistview = $statementlistview.data( 'statementlistview' );

		assert.ok(
			statementlistview instanceof $.wikibase.statementlistview,
			'Created widget with filled wb.datamodel.StatementList instance.'
		);
	} );

	QUnit.test( 'value()', function ( assert ) {
		assert.expect( 4 );
		var statementList1 = new wb.datamodel.StatementList( [ new wb.datamodel.Statement(
				new wb.datamodel.Claim( new wb.datamodel.PropertyNoValueSnak( 'P1' ) )
			) ] ),
			statementList2 = new wb.datamodel.StatementList( [ new wb.datamodel.Statement(
				new wb.datamodel.Claim( new wb.datamodel.PropertyNoValueSnak( 'P2' ) )
			) ] ),
			$statementlistview = createStatementlistview( {
				value: statementList1
			} ),
			statementlistview = $statementlistview.data( 'statementlistview' );

		assert.ok(
			statementlistview.value().equals( statementList1 ),
			'Retrieved value.'
		);

		statementlistview.value( statementList2 );

		assert.ok(
			statementlistview.value().equals( statementList2 ),
			'Retrieved value after setting a new value.'
		);

		var statementlistviewListview = statementlistview.$listview.data( 'listview' ),
			statementlistviewListviewLia = statementlistviewListview.listItemAdapter(),
			$statementview = statementlistviewListview.items().first(),
			statementview = statementlistviewListviewLia.liInstance( $statementview ),
			statement = new wb.datamodel.Statement(
				new wb.datamodel.Claim( new wb.datamodel.PropertyNoValueSnak( 'P3' ) )
			);

		statementview.value = function () {
			return statement;
		};

		assert.ok(
			statementlistview.value().equals( new wb.datamodel.StatementList( [ statement ] ) ),
			'Retrieved current value after setting a new value on the statementview encapsulated by '
				+ 'the statementlistview.'
		);

		assert.ok(
			statementlistview.option( 'value' ).equals( statementList2 ),
			'Retrieved value still persisting via option().'
		);
	} );

	QUnit.test( 'enterNewItem', function ( assert ) {
		assert.expect( 2 );
		var $statementlistview = createStatementlistview(),
			statementlistview = $statementlistview.data( 'statementlistview' );

		assert.equal(
			statementlistview.$listview.data( 'listview' ).items().length,
			0,
			'Plain widget has no items.'
		);

		statementlistview.enterNewItem();

		assert.equal(
			statementlistview.$listview.data( 'listview' ).items().length,
			1,
			'Increased number of items after calling enterNewItem().'
		);
	} );

}( jQuery, wikibase, QUnit ) );
