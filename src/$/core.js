var $,
	window = context,
	doc = window.document,
	docElement = doc.documentElement,
	body = doc.body;

/**
 * Create PB.$ global
 */
PB.$ = function ( selector ) {

	// Handle false argument
	if( !selector ) {

		return null;
	}

	// If already a node, return new $ instance
	// element and document nodes are valid
	if( selector.nodeType === 1 || selector.nodeType === 9 ) {

		return new $( selector );
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

			return new $( selector );
		}
		// Create element
		else if ( selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' ) {

			// Create element
			return PB.$.buildFragment(selector);
		}
	}

	/* When doing this we should validate that only elements are parsed...
	if( PB.type(selector) === 'array' ) {

		return new $( selector );
	}
	*/

	return null;
}

/**
 * Return collection by css selector
 */
PB.$$ = function ( selector ) {

	return new $(document).find(selector);
}

/**
 * $ constructor
 */
$ = function ( collection ) {

	var i = 0;

	if( collection.length ) {

		for( i = 0; i < collection.length; i++ ) {

			this[i] = collection[i];
		}
	} else {

		this[0] = collection;
	}

	this.length = i || 1;
	//this.context = this[0];
}

$.prototype.constructor = $;

// For extending PB.$ methods
PB.$.fn = $.prototype;
