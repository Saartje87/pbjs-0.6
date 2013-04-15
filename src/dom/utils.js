// Element cache
PB.$.cache = {};

/**
 * Get cache entry by element
 *
 * Will create new cache entry if not existing
 */
function domGetStorage ( element ) {

	var id = element.__PBID__ || (element.__PBID__ = PB.id());

	return PB.$.cache[id] || (PB.$.cache[id] = {});
}

/**
 * Merges first 2 values to a single object
 *
 * @param {Object} arguments
 * @return {Object}
 */
function argsToObject ( args ) {

	var obj;

	// Force arguments to object
	if( args.length === 2 ) {

		obj = {};
		obj[args[0]] = args[1];
	}

	return obj || args[0];
}

// Hook storage
PB.$.hooks = {};

/**
 * Register new hook
 *
 * Note that hooks are not stacking, hook with same name will
 * be overwriten
 */
PB.$.hook = function ( name, fn ) {

	if( typeof fn !== 'function' ) {

		throw new TypeError('fn must be a function');
	}

	PB.$.hooks[name] = fn;
};
