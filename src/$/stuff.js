PB.overwrite($.prototype, {

	each: function ( fn ) {

		var _args = slice.call( arguments, 1 );

		for( var i = 0; i < this.length; i++ ) {

			fn.apply(this[i], _args);
		}

		return this;
	},

	/**
	 * Returns true if the first element in the set has the given class name.
	 */
	hasClass: function ( className ) {

		return (' '+this.context.className+' ').indexOf(' '+className+' ') >= 0;
	},

	/**
	 * Add class(es) to every element in the set.
	 */
	addClass: function ( classNames ) {

		var i = 0,
			classList = classNames.split(' '),
			className,
			j;

		for( ; i < this.length; i++ ) {
			
			className = ' '+this[i].className+' ';

			for( j = 0; j < classList.length; j++ ) {

				// Skip if element already got the class
				if( className.indexOf(' '+classList[j]+' ') >= 0 ) {
				
					continue;
				}
				
				// Add class
				this[i].className += (this[i].className ? ' ' : '')+classList[j];
			}
		}

		return this;
	},

	/**
	 * Removes class(es) from every element in the set.
	 */
	removeClass: function ( classNames ) {

		var i = 0,
			classList = classNames.split(' '),
			l = classList.length,
			className,
			j;

		for( ; i < this.length; i++ ) {

			className = ' '+this[i].className+' ';

			for( j = 0; j < l; j++ ) {
				
				// Already exists
				if( className.indexOf(' '+classList[j]+' ') >= 0 ) {
				
					className = className.replace(' '+classList[j]+' ', ' ');
				}
			}

			// Trim whitespaces
			className = className.replace(/^\s|\s$/g, '');

			// Update class list
			if( className ) {

				this[i].className = className;
			}
			// Remove class attribute
			else {

				this[i].removeAttribute('class');
			}
		}

		return this;
	},

	/**
	 * Set data for every element in the set.
	 */
	setData: function ( data ) {

		var i = 0,
			storage;

		data = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			storage = domGetStorage(this[i]);
			storage.data = storage.data || {};

			PB.overwrite(storage.data, data);
		}

		return this;
	},

	/**
	 * Get data from first element in the set.
	 *
	 * @todo if key is not given, return all data? Merge memory data with data- attibute? 
	 */
	getData: function ( key ) {

		// Read 'data-' attribute
		var storage = domGetStorage(this[0]),
			data;

		// Read from memory if set
		if( storage.data ) {

			data = storage.data[key];
		} 

		// No data set yet, try from 'data-' attribute
		if( data === undefined ) {

			data = this[0].getAttribute('data-'+key);
		}

		return data;
	},

	/**
	 * Remove data for every element in the set.
	 */
	removeData: function ( key ) {

		var i = 0,
			id;

		for( ; i < this.length; i++ ) {

			this[i].removeAttribute('data-'+key);

			id = this[i].__PBID__;

			if( !id || !PB.$.cache[id] ) {

				continue;
			}

			delete PB.$.cache[id].data[key];
		}

		return this;
	},

	/**
	 * Set the given attribute(s) for every element in de set.
	 */
	setAttr: function ( data ) {

		var i = 0,
			key;

		data = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			for( key in data ) {

				this[i].setAttribute(key, data[key]);
			}
		}

		return this;
	},

	/**
	 * Get the attribute value from the first element in the set.
	 */
	getAttr: function ( key ) {

		return this[0].getAttribute(key);
	},

	/**
	 * Remove the given attribute(s) for every element in de set.
	 */
	removeAttr: function ( key ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			this[i].removeAttribute(key);
		}

		return this;
	},

	/**
	 * Set the given value for every element in the set.
	 */
	setValue: function ( value ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			this[i].value = value;
		}

		return this;
	},

	/**
	 * Get the value from the first element in the set.
	 */
	getValue: function () {

		return this[0].value;
	},

	/**
	 * Shows every element in the set.
	 */
	show: function () {

		var style,
			i = 0;

		for( ; i < this.length; i++ ) {

			style = this[i].style;

			if( style.display === 'none' ) {

				style.display = domGetStorage(this[i])['css-display'] || 'block';
			}
		}

		return this;
	},

	/**
	 * Hides every element in the set.
	 */
	hide: function () {

		var style,
			i = 0;

		for( ; i < this.length; i++ ) {

			style = this[i].style;

			if( style.display !== 'none' ) {

				// Store css display value
				domGetStorage(this[i])['css-display'] = PB.$(this[i]).getStyle('display');

				// Hide element
				style.display = 'none';
			}
		}

		return this;
	},

	/**
	 * Returns boolean whether the first element in the set is visible or not.
	 */
	isVisible: function () {

		var element = PB.$(this[0]);

		return element.getStyle('display') !== 'none' && element.getStyle('opacity') > 0;
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

		// Return null
		return null;
	},

	empty: function () {

		return this.setHtml('');
	},

	clone: function ( deep ) {

		var ret = [],
			children,
			i = 0,
			l;

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

				for ( ; i < length; i++) {

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

	setText: function ( value ) {

		var i = 0;

		// Empty elements
		this.setHtml('');

		// Append text to every element
		for( ; i < this.length; i++ ) {

			this[i].appendChild(doc.createTextNode(value));
		}

		return this;
	},

	getText: function () {

		return this[0].textContent || this[0].nodeValue;
	}
});
