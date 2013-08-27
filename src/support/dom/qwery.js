/**
 * Add qwery to pbjs
 *
 * Using ready method to ensure qwery is loaded
 */
PB.ready(function ( PB ) {

	if( !document.querySelectorAll ) {

		PB.$.selector.find = qwery;
	}

	if( !(docElement.matchesSelector || docElement.mozMatchesSelector || docElement.webkitMatchesSelector || docElement.oMatchesSelector || docElement.msMatchesSelector) ) {

		PB.$.selector.matches = qwery.is;
	}
});