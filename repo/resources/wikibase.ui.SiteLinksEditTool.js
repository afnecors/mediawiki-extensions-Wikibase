/**
 * JavasSript for 'Wikibase' edit form for an items site links
 * @see https://www.mediawiki.org/wiki/Extension:Wikibase
 * 
 * @since 0.1
 * @file wikibase.ui.PropertyEditTool.js
 * @ingroup Wikibase
 *
 * @licence GNU GPL v2+
 * @author Daniel Werner < daniel.werner at wikimedia.de >
 */

/**
 * Module for 'Wikibase' extensions user interface functionality for editing the site links of an item.
 */
window.wikibase.ui.SiteLinksEditTool = function( subject ) {
	window.wikibase.ui.PropertyEditTool.call( this, subject );
};

window.wikibase.ui.SiteLinksEditTool.prototype = new window.wikibase.ui.PropertyEditTool();
$.extend( window.wikibase.ui.SiteLinksEditTool.prototype, {
	
	/**
	 * @see wikibase.ui.PropertyEditTool._getValueElems()
	 */
	_getValueElems: function() {
		var pairs = new $();
		var dds = this._subject.children( 'dt' );
		
		dds.each( function() {
			// add dd's as well
			var pair = $( this ).add( $( this ).next( 'dd' ) );
			pairs = pairs.add( pair );
		} );
		return pairs;
	},
	
	getEditableValuePrototype: function() {
		return window.wikibase.ui.PropertyEditTool.EditableDescription;
	},
	
	allowsMultipleValues: true
} );
