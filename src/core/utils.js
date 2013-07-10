/**
 * Get unique id inside PB
 *
 * @return {Number}
 */
PB.id = function () {

	return ++uid;
};

/**
 * Get currect timestamp in milliseconds
 *
 * @return {Number}
 */
PB.now = Date.now || function () { return new Date().getTime(); };

/**
 * Overwrite properties or methods in target object
 */
PB.overwrite = function ( target, source ) {

	var key;

	for( key in source ) {

		if( source.hasOwnProperty(key) ) {

			target[key] = source[key];
		}
	}

	return target;
};

/**
 * Extend object
 *
 * Existing values will not be overwritten
 */
PB.extend = function ( target, source ) {

	var key;

	for( key in source ) {

		if( source.hasOwnProperty(key) && target[key] === undefined ) {

			target[key] = source[key];
		}
	}

	return target;
};

/**
 * Return a deep clone of the given object
 *
 * @return {Object} clone
 */
PB.clone = function ( source ) {

	var clone,
		key;

	if( source === null || typeof source !== 'object' ) {

		return source;
	}

	clone = PB.type(source) === 'object' ? {} : [];

	for( key in source ) {

		if( source.hasOwnProperty(key) ) {

			clone[key] = PB.clone(source[key]);
		}
	}

	return clone;
};

/**
 * Walk trough object
 *
 * When returning true in the callback method, the crawling stops
 * 
 * fn arguments: key, value
 * 
 * @param {Object}
 * @param {Function}
 * @param {Object}
 * @return {Void}
 */
PB.each = function ( collection, fn, context ) {

	var prop;

	if ( !collection || typeof fn !== 'function' ) {

		return;
	}

	for( prop in collection ) {

		if( collection.hasOwnProperty(prop) && fn.call(context, prop, collection[prop], collection) === true ) {

			return;
		}
	}
};

/**
 * Create array of array like object
 *
 * @return {Array}
 */
PB.toArray = function ( arr ) {

	var i = 0,
		result = [],
		length = arr.length;

	for( ; i < length; i++ ) {

		result[i] = arr[i];
	}

	return result;
};

/**
 * Returns te primitive type of the given variable
 *
 * PB.type([]) -> array
 * PB.type('') -> string
 * PB.type({}) -> object
 *
 * @param {mixed}
 * @return {String}
 */
PB.type = function ( mixed ) {
		
	var type = toString.call(mixed);
		
	return type.substr(8, type.length - 9).toLowerCase();
};

/**
 * Log given arguments in the browser console if existing, otherwise dispose the arguments
 */
PB.log = function () {

	if( typeof console !== 'undefined' && typeof console.log === 'function' ) {

		var args = PB.toArray(arguments);

		args.unshift('pbjs:');

		console.log.apply(console, args);
	}
};

/**
 * Put back previous value of PB global and returns current PB (pbjs) object
 *
 * @return {Object} 
 */
PB.noConflict = function () {

	if( window.PB === PB ) {

		window.PB = OLD_PB;
	}

	return PB;
};
