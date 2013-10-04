PB.overwrite(PB.$.fn, {
	
	/**
	 * PB.$('#element').append('<div>Append me</div>');
	 */
	append: function ( target ) {

		var i = 0;

		target = PB.$(target);

		for( ; i < target.length; i++ ) {

			this[0].appendChild(target[i]);
		}

		return this;
	},

	/**
	 * PB.$('<div>Append me</div>').appendTo('#element');
	 */
	appendTo: function ( target ) {

		var i = 0;

		target = PB.$(target);

		for( ; i < this.length; i++ ) {

			target[0].appendChild(this[i]);
		}

		return this;
	},

	/**
	 * PB.$('#element').prepend('<div>Prepend me</div>');
	 */
	prepend: function ( target ) {

		var i = 0,
			firstChild = this[0].firstElementChild || this[0].firstChild;

		target = PB.$(target);

		for( ; i < target.length; i++ ) {

			if( firstChild ) {

				this[0].insertBefore(target[i], firstChild);
			} else {

				this[0].appendChild(target[i]);
			}
		}

		return this;
	},

	/**
	 * PB.$('<div>Prepend me</div>').prependTo('#element');
	 */
	prependTo: function ( target ) {

		var i = 0,
			firstChild;

		target = PB.$(target);
		firstChild = target[0].firstElementChild || target[0].firstChild;

		for( ; i < this.length; i++ ) {

			if( firstChild ) {

				target[0].insertBefore(this[i], firstChild);
			} else {

				target[0].appendChild(this[i]);
			}
		}

		return this;
	},

	/**
	 * PB.$('<div>Append me</div>').insertBefore('#element');
	 */
	insertBefore: function ( target ) {

		var i = 0;

		target = PB.$(target);

		for( ; i < this.length; i++ ) {

			target[0].parentNode.insertBefore(this[i], target[0]);
		}

		return this;
	},

	/**
	 * PB.$('<div>Append me</div>').insertAfter('#element');
	 */
	insertAfter: function ( target ) {

		var i = 0,
			next;

		target = PB.$(target);
		next = target[0].nextElementSibling || target[0].nextSibling;

		for( ; i < this.length; i++ ) {

			if( next ) {

				target[0].parentNode.insertBefore(this[i], next);
			} else {

				target[0].appendChild(this[i]);
			}
		}

		return this;
	},

	/**
	 * PB.$('<div>Replacement</div>').replace('#element');
	 */
	replace: function ( target ) {

		target = PB.$(target);

		// Insert collection
		this.insertBefore(target);

		// Remove target
		target.remove();

		return this;
	},

	/**
	 * Remove every element in the set.
	 */
	remove: function () {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// Remove data
			delete PB.$.cache[this[i].__PBID__];

			// Remove element
			if( this[i].parentNode ) {

				this[i].parentNode.removeChild( this[i] );
			}

			// Clear reference to element
			delete this[i];
		}

		this.length = 0;

		// Return null
		return null;
	},

	empty: function () {

		return this.setHtml('');
	},

	clone: function ( deep ) {

		var ret = [],
			children,
			i = 0;

		// 
		for( ; i < this.length; i++ ) {

			// Clone element, and add to collection
			ret[i] = this[i].cloneNode( deep );
			
			// Remove id and __PBID__ attribute / expando
			ret[i].removeAttribute('id');
			ret[i].removeAttribute('__PBID__');

			// When cloning children make sure all id and __PBID__ attributes / expandos are removed.
			if( deep ) {

				children = PB.$(ret[i]).find('*');

				for ( ; i < children.length; i++) {

					children[i].removeAttribute('id');
					children[i].removeAttribute('__PBID__');
				}
			}
		}

		return new this.constructor(ret);
	},

	/**
	 * Set the `HTML` for every element in the set.
	 */
	// Should we make an option to parse script tags?
	setHtml: function ( value ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// There are some browser (IE,NokiaBrowser) that do not support innerHTML on table elements, in this case we should use
			// appendChild.
			try {

				this[i].innerHTML = value;
			} catch (e) {

				// Remove all childs
				PB.$(this[i]).children().remove();

				// Check for certain node names, in case of tbody|tr|td we have to use a 'special' approach
				// in which we create the element with a wrapper.
				// Should we put this code 'PB.$.buildFragment' ? 
				if( /^<tbody/i.test(value) ) {

					PB.$('<table>'+value+'</table>').firstChild()
						.appendTo(this[i]);
				} else if ( /^<tr/i.test(value) ) {

					PB.$('<table><tbody>'+value+'<tbody></table>').firstChild().children()
						.appendTo(this[i]);
				} else if ( /^<td/i.test(value) ) {

					PB.$('<table><tbody><tr>'+value+'</tr><tbody></table>').firstChild().firstChild().children()
						.appendTo(this[i]);
				} else {

					PB.$(value).appendTo(this[i]);
				}
			}
		}

		return this;
	},

	/**
	 * Get the `HTML` of first element in the set.
	 */
	getHtml: function () {

		return this[0].innerHTML;
	},

	/**
	 *
	 */
	setText: function ( value ) {

		var i = 0;

		// Append text to every element
		for( ; i < this.length; i++ ) {

			this[i].textContent = value;
		}

		return this;
	},

	/**
	 *
	 */
	getText: function () {

		return this[0].textContent;
	}
});