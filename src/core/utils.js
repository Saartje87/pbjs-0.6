/**
 * Get unique id inside PB
 *
 * @return number
 */
PB.id = function () {

	return ++uid;
};

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
 * @param object
 * @param function
 * @param object
 * @return void
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
 * 
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

/** Move to PB.$
 * Executes script in global scope
 *
 * @param {String}
 * @return {Void}
 * /
PB.globalEval = function ( text ) {

	if( window.execScript ) {

		window.execScript( text );
	} else {

		var script = doc.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.text = text;
		doc.head.appendChild(script);
		doc.head.removeChild(script);
	}
}*/

/**
 * 
 */
PB.noConflict = function () {

	if( window.PB === PB ) {

		window.PB = _PB;
	}

	return PB;
};
