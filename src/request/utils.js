// Declare methods, then assign to namespace
// more or less an idea to create less annanomous functions.

/**
 * Translate object to query string
 *
 * @param {Object/Array}
 * @param {String} for internal usage
 * @return {String}
 */
function buildQueryString ( queryObject, prefix ) {

	var query = '',
		key,
		value,
		type = PB.type(queryObject);

	// Validate 
	if( type !== 'array' && type !=='object' ) {

		throw new TypeError(type+' given.');
	}

	if( type === 'array' || type ==='object' ) {

		for( key in queryObject ) {

			if( queryObject.hasOwnProperty(key) ) {

				value = queryObject[key];

				if( value !== null && typeof value === 'object' ) {

					query += buildQueryString( value, prefix ? prefix+'['+key+']' : key );
				} else {

					query += encodeURIComponent(prefix ? prefix+(type === 'array' ? '[]' : '['+key+']') : key)
						+'='+encodeURIComponent( value )+'&';
				}
			}
		}
	}

	return prefix ? query : query.replace(/&$/, '');
}

/**
 * Translate query string to object
 *
 * Can handle url or query string
 *
 * @param {String}
 * @return {Object}
 */
function parseQueryString ( str ) {

	var parts = {},
		part;
	
	str = str.indexOf('?') !== -1 ? str.substr( str.indexOf('?') + 1 ) : str;
	
	str.split('&').forEach(function ( entry ) {
		
		part = entry.split('=');
		
		parts[decodeURIComponent(part[0])] = decodeURIComponent(part[1]);
	});
	
	return parts;
}

PB.overwrite(PB.Request, {
	
	buildQueryString: buildQueryString,
	parseQueryString: parseQueryString
});

/*
PB.each({get: 'GET', post: 'POST', put: 'PUT', del: 'DELETE'}, function ( key, value ) {
	
	// arguments -> url, data, success, error ?
	PB[key] = function ( options ) {
		
		var request = new PB.Request(options),
			success = options.onSuccess,
			err = options.onError;

		if( success ) {

			request.on('success', success);
		}

		if( err ) {

			request.on('error', err);
		}

		return request.send();
	}
});*/
