/**
 * Convert string to html nodes
 *
 * @param {String} html
 * @return {Object} PB.$
 */
PB.$.buildFragment = function ( html ) {
	
	var fragment = doc.createElement('div'),
		children;

	// Table elements should be created in an table
	// html: '<td></td>' wrap with:
	fragment.innerHTML = html;

	// Return the childeren
	children = PB.$(fragment).children();

	fragment = null;

	return children;
}
