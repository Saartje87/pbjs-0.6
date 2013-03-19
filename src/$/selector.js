// Native query selector
var matches = docElement.matchesSelector || docElement.mozMatchesSelector || docElement.webkitMatchesSelector || docElement.oMatchesSelector || docElement.msMatchesSelector;

PB.$.selector = {
	
	/**
	 * Native
	 */
	find: function ( selector, node ) {

		return PB.toArray(node.querySelectorAll(selector));
	},

	/**
	 * Compare node to selector
	 */
	matches: function ( node, selector ) {

		return matches.call(node, selector);
	}
};
