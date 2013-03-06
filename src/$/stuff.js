PB.overwrite($.prototype, {

	/*
	addClass: function ( classNames ) {

		classNames = classNames.split(' ');

		return this.each(function () {

			for( var i = 0; i < classNames.length; i++ ) {
				
				// Already exists
				if( (' '+this.context.className+' ').indexOf(' '+classNames[i]+' ') >= 0 ) {
				
					continue;
				}
			
				this.context.className += (this.context.className ? ' ' : '')+classNames[i];
			}
		});
	},

	each: function ( fn ) {

		for( var i = 0; i < this.length; i++ ) {

			this.context = this[i];

			fn.apply(this, arguments);
		}

		this.context = this[0];

		return this;
	},*/

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
			cache,
			id;

		data = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			id = this[i].__PBID__ || (this[i].__PBID__ = PB.id());

			cache = PB.$.cache[id]|| (PB.$.cache[id] = {});
			cache.data = cache.data || {};

			PB.overwrite(cache.data, data);
		}

		return this;
	},

	/**
	 * Get data from first element in the set.
	 */
	getData: function ( key ) {

		// Read 'data-' attribute
		var id = this[0].__PBID__ || (this[0].__PBID__ = PB.id()),
			data;

		// Read from memory if set
		if( PB.$.cache[id] && PB.$.cache[id].data ) {

			data = PB.$.cache[id].data[key];
		} else {

			data = this[0].getAttribute('data-'+key);
		}

		return data;
	},

	/**
	 * Remove data for every element in the set.
	 */
	removeData: function ( key ) {

		var i = 0,
			cache,
			id;

		for( ; i < this.length; i++ ) {

			this[i].removeAttribute('data-'+key);

			id = this[i].__PBID__;
			cache = PB.$.cache[id];

			if( !cache || !cache.data ) {

				continue;
			}

			delete cache.data[key];
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

	setValue: function () {


	},

	getValue: function () {

		
	},

	show: function () {


	},

	hide: function () {

		
	},

	isVisible: function () {


	}
});
