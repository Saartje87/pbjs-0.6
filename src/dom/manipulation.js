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
	}
});