/**
 * Add qwery to pbjs
 *
 * Using ready method to ensure qwery is loaded
 */
if( !supportQuerySelectorAll ) {

	PB.$.selector.find = function ( expression, element ) {

		return qwery(expression, element);
	};
}

if( !supportMatchesSelector ) {

	PB.$.selector.matches = function ( element, expression ) {

		return qwery.is(element, expression);
	};
}