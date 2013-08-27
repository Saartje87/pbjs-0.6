/**
 * Add qwery to pbjs
 */
if( !document.querySelectorAll ) {

	PB.$.selector.find = qwery;
}

if( !(docElement.matchesSelector || docElement.mozMatchesSelector || docElement.webkitMatchesSelector || docElement.oMatchesSelector || docElement.msMatchesSelector) ) {

	PB.$.selector.matches = qwery.is;
}
