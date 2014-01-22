PB.overwrite(PB.$.fn, {

	/**
	 * Set the given attribute(s) for every element in de set.
	 */
	setAttr: function ( data ) {

		var i = 0,
			key;

		data = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			for( key in data ) {

				if( data.hasOwnProperty(key) ) {

					this[i].setAttribute(key, data[key]);
				}
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

		// No data found yet, try from 'data-' attribute
		if( data === undefined ) {

			data = this[0].getAttribute('data-'+key);
		}

		return data;
	},

	/**
	 * Remove data from every element in the set.
	 */
	removeData: function ( key ) {

		var i = 0,
			id;

		for( ; i < this.length; i++ ) {

			this[i].removeAttribute('data-'+key);

			id = this[i].__PBID__;

			if( !id || !PB.$.cache[id] || !PB.$.cache[id].data ) {

				continue;
			}

			delete PB.$.cache[id].data[key];
		}

		return this;
	},

	/**
	 * Checks every element in the set.
	 */
	check: function () {

		var i = 0,
			elem;

		for( ; i < this.length; i++ ) {

			elem = this[i];

			if( elem.checked === undefined ) {
				continue;
			}

			elem.checked = true;
		}
	},

	/**
	 * Unchecks every element in the set.
	 */
	uncheck: function () {

		var i = 0,
			elem;

		for( ; i < this.length; i++ ) {

			elem = this[i];

			if( elem.checked === undefined ) {
				continue;
			}

			elem.checked = false;
		}
	},

	/**
	 * Serialize form data
	 *
	 * Will throw an error if no form is found in set
	 *
	 * @param {Object} formData
	 */
	serializeForm: function () {

		var i = 0,
			j = 0,
			data = {},
			formElements,
			element,
			type,
			isGroup = /radio|checkbox/i,
			exclude = /file|undefined|reset|button|submit|fieldset/i;

		for( ; i < this.length; i++ ) {

			if( this[i].nodeName === 'FORM' ) {

				formElements = this[i].elements;

				for( ; j < formElements.length; j++ ) {

					element = formElements[j];
					type = element.type;

					if( element.name && !exclude.test(type) && !(isGroup.test(type) && !element.checked) ) {

						data[element.name] = new this.constructor(element).getValue();
					}
				}

				return data;
			}
		}

		// No form element given
		throw new Error('Form not found'); // A tought, where selector is css expression 'Form not found ['+this.selector+']'
	}
});