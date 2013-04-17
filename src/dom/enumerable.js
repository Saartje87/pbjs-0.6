PB.overwrite(PB.$.fn, {

	/**
	 *
	 */
	// should be forEach
	each: function ( fn ) {

		var _args = slice.call( arguments, 1 ),
			i = 0;

		for( ; i < this.length; i++ ) {

			fn.apply(this[i], _args);
		}

		return this;
	},

	/**
	 *
	 */
	filter: function ( filter ) {

		var res = [],
			i = 0,
			filterIsString = typeof filter === 'string';

		for( ; i < this.length; i++ ) {

			if( filterIsString ) {

				if( PB.$.selector.matches(this[i], filter) ) {

					res.push(this[i]);
				}
			} else if ( filter(this[i]) === true ) {

				res.push(this[i]);
			}
		}

		return new this.constructor(res);
	}
});
