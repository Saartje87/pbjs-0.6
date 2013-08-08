PB.overwrite(PB.$.fn, {

	/**
	 * Returns the parent node of the first element in the set.
	 */
	parent: function () {

		return PB.$(this[0].parentNode);
	},

	/**
	 * Returns the children for the first element in the set.
	 */
	children: function () {

		var node = this[0].firstElementChild || this[0].firstChild,
			i = 0,
			elements = [];

		if( !node ) {

			return null;
		}

		do {

			// Only add element nodes
			if( node.nodeType === 1 ) {

				elements[i++] = node;
			}
		} while( node = node.nextSibling );

		return elements.length ? new this.constructor(elements) : null;
	},

	/**
	 * Returns the child from the first element in the set at a specifed index.
	 */
	childAt: function( index ) {

		var children = this.children();

		return children && children[index] ? PB.$(children[index]) : null;
	},

	/**
	 * Returns the first child from the first element in the set.
	 */
	firstChild: function () {

		return PB.$(this[0].firstElementChild || this[0].firstChild);
	},

	/**
	 * Returns the first child from the first element in the set.
	 */
	lastChild: function () {

		return PB.$(this[0].lastElementChild || this[0].lastChild);
	},

	/**
	 * Returns the first element in the set.
	 */
	first: function () {

		return PB.$(this[0]);
	},

	/**
	 * Returns the last element in the set.
	 */
	last: function () {

		return PB.$(this[this.length-1]);
	},

	next: function () {

		return PB.$(this[0].nextElementSibling || this[0].nextSibling);
	},

	prev: function () {

		return PB.$(this[0].previousElementSibling || this[0].previousSibling);
	},

	closest: function ( expression, maxDepth ) {

		var node = this[0];

		maxDepth = maxDepth || 50;

		do {

			if( PB.$.selector.matches( node, expression ) ) {

				return PB.$(node);
			}

			if( !--maxDepth ) {

				break;
			}

		} while ( node = node.parentNode );

		return null;
	},

	indexOf: function ( element ) {

		var i = 0;

		element = PB.$(element);

		if( !element ) {

			return -1;
		}

		for( ; i < this.length; i++ ) {

			if( this[i] === element[0] ) {

				return i;
			}
		}

		return -1;
	},

	contains: function () {


	},

	/**
	 * Returns all matched elements by CSS expression for every element in the set.
	 */
	find: function ( expression ) {

		var i = 0,
			j, k, r,
			result,
			elements;
		
		for( ; i < this.length; i++ ) {
			
			if( i === 0 ) {
				
				elements = PB.$.selector.find(expression, this[i]);
			} else {
				
				result = PB.$.selector.find(expression, this[i]);
				
				for ( j = 0, k = elements.length, r = result.length; j < r; j++ ) {
					
					// Only add unique value
					if( elements.indexOf(result[j]) === -1 ) {
						
						elements[k++] = result[j];
					}
				}
			}
		}
		
		// we should return an unique set
		return elements.length ? new this.constructor(elements) : null;
	},

	/**
	 *
	 */
	matches: function ( selector ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// Using qwery for selector validation
			if( !PB.$.selector.matches(this[i], selector) ) {

				return false;
			}
		}

		return true;
	}
});