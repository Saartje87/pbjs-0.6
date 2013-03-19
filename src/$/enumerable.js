/**
 *
 */
function domFilter ( filter ) {

	var res = [],
		i = 0;

	for( ; i < this.length; i++ ) {

		if( typeof filter === 'string' ) {

			if( PB.$.selector.matches(this[i], filter) ) {

				res.push(this[i]);
			}
		} else if ( filter.call(null, this[i]) === true ) {

			res.push(this[i]);
		}
	}

	return new this.constructor(res);
}

PB.overwrite(PB.$.fn, {

	filter: domFilter
});
