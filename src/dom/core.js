var window = context,
	doc = window.document,
	docElement = doc.documentElement;

/**
 * Create PB.$ global
 */
PB.$ = function ( selector ) {

	// Handle false argument
	if( !selector ) {

		return null;
	}

	// Already extended
	if( selector instanceof Dom ) {

		return selector;
	}

	// If already a node, return new Dom instance
	// element and document nodes are valid
	if( selector.nodeType === 1 || selector.nodeType === 9 || selector === window ) {

		return new Dom( selector );
	}

	// Handle string argument
	if( typeof selector === 'string' ) {

		// Element id given
		if( selector.charAt(0) === '#' ) {

			// Select element
			selector = doc.getElementById(selector.substr(1));

			// Element not found
			if( !selector ) {

				return null;
			}

			return new Dom( selector );
		}
		// Create element
		else if ( selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' ) {

			// Create element
			return PB.$.buildFragment(selector);
		}
	}

	/* When doing this we should validate that only elements are parsed...
	if( PB.type(selector) === 'array' ) {

		return new Dom( selector );
	}
	*/

	return null;
};

/**
 * Return collection by css selector
 */
PB.$$ = function ( selector ) {

	return new Dom(document).find(selector);
};

/**
 * Dom constructor
 */
function Dom ( collection ) {

	var i = 0;

	if( collection.nodeName || collection === window ) {

		this[0] = collection;
		i = 1;
	} else if ( 'length' in collection ) {

		for( i = 0; i < collection.length; i++ ) {

			this[i] = collection[i];
		}
	}

	this.length = i;
}

Dom.prototype.constructor = Dom;

// For extending PB.$ methods
PB.$.fn = Dom.prototype;
