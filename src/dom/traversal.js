PB.overwrite(PB.$.fn, {

	/**
	 * Returns the parent node of the first element in the set.
	 *
	 * @return {Object} PB.$
	 */
	parent: function () {

		return PB.$(this[0].parentNode);
	},

	/**
	 * Returns the children for the first element in the set.
	 * When element has no children it will return null
	 *
	 * @return {Object} PB.$ or null
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
	 *
	 * @param {Number}
	 * @return {Object} PB.$ or null
	 */
	childAt: function( index ) {

		var children = this.children();

		return children && children[index] ? PB.$(children[index]) : null;
	},

	/**
	 * Returns the first child from the first element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	firstChild: function () {

		return PB.$(this[0].firstElementChild || this[0].firstChild);
	},

	/**
	 * Returns the first child from the first element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	lastChild: function () {

		return PB.$(this[0].lastElementChild || this[0].lastChild);
	},

	/**
	 * Returns the first element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	first: function () {

		return PB.$(this[0]);
	},

	/**
	 * Returns the last element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	last: function () {

		return PB.$(this[this.length-1]);
	},

	/**
	 * Retrieve next sibling from first element in set
	 *
	 * @return {Object} PB.$ or null
	 */
	next: function () {

		return PB.$(this[0].nextElementSibling || this[0].nextSibling);
	},

	/**
	 * Retrieve previous sibling from first element in set
	 *
	 * @return {Object} PB.$ or null
	 */
	prev: function () {

		return PB.$(this[0].previousElementSibling || this[0].previousSibling);
	},

	/**
	 * Retrieve next sibling from first element in set
	 *
	 * @param {String} css expression
	 * @param {Number} number of parent to follow
	 * @return {Object} PB.$ or null
	 */
	closest: function ( expression, maxDepth ) {

		var node = this[0];

		maxDepth = maxDepth || 50;

		do {

			if( PB.$.selector.matches( node, expression ) ) {

				return node;
			}

			if( !--maxDepth ) {

				break;
			}

		} while ( node = node.parentNode );

		return null;
	},

	/**
	 * 
	 *
	 * @return {Object} PB.$ or null
	 */
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

	/**
	 * Check whether first element in the set contains the given element
	 *
	 * @param {mixed} valid PB.$ argument
	 * @return {Boolean}
	 */
	contains: function ( element ) {

		var node = this[0];

		element = PB.$(element);

		if( !node || !element ) {

			return false;
		}

		return node.contains
			? node.contains(element[0])
			: !!(node.compareDocumentPosition(element[0]) & 16);
	},

	/**
	 * Returns all matched elements by CSS expression for every element in the set.
	 *
	 * @param {String} css expression
	 * @return {Object} PB.$ or null
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
	 * Check whether the given selector matches all elements in the set
	 *
	 * @param {String} css expression
	 * @return {Boolean}
	 */
	matches: function ( expression ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// Using qwery for selector validation
			if( !PB.$.selector.matches(this[i], expression) ) {

				return false;
			}
		}

		return true;
	}
});