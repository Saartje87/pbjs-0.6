/*!
 * pbjs JavaScript Framework v0.6.0
 * http://saartje87.github.com/pbjs
 *
 * Includes Qwery
 * https://github.com/ded/qwery
 *
 * Copyright 2013 Niek Saarberg
 * Licensed MIT
 *
 * Build date 2013-03-01 00:03
 */

(function ( name, context, definition ) {
	
	this[name] = definition( context );

})('PB', this, function ( context ) {

"use strict";

var PB = {},

	// Previous PB
	_PB = context.PB,
	
	// Unique id, fetch from previous PB or start from 0
	uid = _PB ? _PB.id() : 0,
	
	// References
	slice = Array.prototype.slice,
	toString = Object.prototype.toString,
	undefined;

// Define version
PB.VERSION = '0.6.0';

/**
 * Get unique id inside PB
 *
 * @return number
 */
PB.id = function () {

	return ++uid;
}

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
}

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
}

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
}

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
PB.each = function ( collection, fn, scope ) {

	var prop;

	if ( !collection || typeof fn !== 'function' ) {

		return;
	}

	for( prop in collection ) {

		if( collection.hasOwnProperty(prop) && fn.call(scope, prop, collection[prop], collection) === true ) {

			return;
		}
	}
}

/**
 * 
 */
PB.toArray = function ( collection ) {

	if( toString.call(collection) === '[object Object]' && collection.length ) {

		var result = [],
			length = collection.length,
			i = 0;

		for( ; i < length; i++ ) {

			result[i] = collection[i];
		}

		return result;
	}

	return slice.call(collection);
}

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
}

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
}

/**
 * Create a wrapper function that makes it possible to call the parent method
 * trough 'this.parent()'
 */
function createClassResponser ( method, parentMethod ) {

    return function () {

        var _parent = this.parent,
            result;

        this.parent = parentMethod;

        result = method.apply( this, arguments );

        this.parent = _parent;

        return result;
    };
}

/**
 * OOP in javascript, insprired by Prototypejs and Base
 *
 * If one argument is given it is used as base
 */
PB.Class = function ( parentClass, base ) {

	var constructor,
        klass,
        name,
        ancestor,
        property,
        parentPrototype;

        // Handle arguments
	if( !base ) {

		base = parentClass;
		parentClass = null;
	} else {

		parentPrototype = parentClass.prototype;
	}

	// Set our constructor
	constructor = base.construct;

    // Setup the class constructor
    if( typeof constructor === 'function' ) {

        if( parentClass && parentPrototype.construct ) {

            var _parent;

            klass = function () {

                var _constructor = constructor;

                constructor = function () {

                    var _parent = this.parent;

                    this.parent = parentPrototype.construct;

                    _constructor.apply( this, arguments );

                    this.parent = _parent;
                }

                if( typeof constructor === 'function' ) {
                    
                    constructor.apply( this, arguments );
                }
            };
        } else {

            klass = base.construct;
        }
    } else if ( parentClass && parentPrototype.construct ) {
    	
        klass = function () {
        	
        	parentPrototype.construct.apply( this, arguments );
        };
    } else {

        klass = function () {};
    }

    // Fill our prototype
    for( name in base ) {
    	
        if( base.hasOwnProperty(name) ) {

            property = base[name];

            ancestor = parentClass ? parentPrototype[name] : false;

            if( typeof ancestor === 'function' && typeof property === 'function' ) {

                property = createClassResponser( property, ancestor );
            }

            klass.prototype[name] = property;
        }
    }
    
    // For every parent method / property thats not added
    if( parentClass ) {

		PB.extend(klass.prototype, parentPrototype);
    }

	return klass;
};

PB.Observer = PB.Class({
	
	/**
	 * Use constructor to declare class properties
	 *
	 * Childs with own contruct method should call the parent method `this.parent()`
	 */
	construct: function () {
		
		this.listeners = {};
	},
	
	/**
	 * Attach listener to object
	 *
	 * @param {String} type
	 * @param {Function} callback
	 * @param {Object} context
	 */
	on: function ( type, fn, context ) {
		
		var types = type.split(' '),
			i = types.length;
	
		if( typeof fn !== 'function' ) {
			
			throw new TypeError('PB.Observer error, fn is not a function');
		}
		
		while( i-- ) {
			
			type = types[i];
			
			if( !this.listeners[type] ) {
				
				this.listeners[type] = [];
			}
			
			this.listeners[type].push({
				
				fn: fn,
				context: context
			});
		}
		
		return this;
	},
	
	/**
	 * Detach listener from object
	 *
	 * @param {String} type
	 * @param {Function} callback
	 */
	off: function ( type, fn ) {
		
		var listeners = this.listeners[type],
			i;
		
		// Remove all listeners
		if( !type ) {
			
			this.listeners = {};
			return this;
		}
		
		// No listeners attached
		if( !listeners ) {
			
			return this;
		}
		
		// Remove all listening to `type`
		if( !fn ) {
			
			listeners.length = 0;
			return this;
		}
		
		i = listeners.length;
		
		while( i-- ) {
			
			if( listeners[i].fn === fn ) {
				
				listeners.splice(i, 1);
			}
		}
		
		if( !listeners.length ) {
			
			delete this.listeners[type];
		}
		
		return this;
	},
	
	/**
	 * Invoke listeners of given type
	 *
	 * @param {String}
	 * @return this
	 */
	emit: function ( type ) {

		var listeners = this.listeners[type],
			args = slice.call( arguments, 1 ),
			i = 0;
	
		if( !listeners ) {

			return this;
		}

		for( ; i < listeners.length; i++ ) {

			listeners[i].fn.apply(listeners[i].context, args);
		}

		return this;
	}
});

/**
 * pbjs request class
 *
 * OOP way to requesting file from server
 */
PB.Request = PB.Class(PB.Observer, {

	// Supported states, note that not all states would be triggerd
	// by the XMLHttpRequest object
	stateTypes: 'unsent opened headers loading end'.split(' '),

	// Transport, instance of XMLHttpRequest
	transport: null,
	
	/**
	 * Construct new class instance
	 *
	 * Set request defaults
	 *
	 * @param {Object} options
	 * @return this
	 */
	construct: function ( options ) {

		// Set default options
		this.options = PB.clone(PB.Request.defaults);
		
		// Init observer
		this.parent();

		// Overwrite default options
		PB.overwrite(this.options, options);
	},
	
	/**
	 * Send request
	 *
	 * @return this
	 */
	send: function () {
		
		var options = this.options,
			async = options.async,
			request = this.getTransport(),
			url = options.url,
			method = options.method.toUpperCase(),
			query = PB.type(options.data) === 'object' ? PB.Request.buildQueryString( options.data ) : options.data;

		// Add query string to url for GET / DELETE request types
		if( query && (method === 'GET' || method === 'PUT') ) {

			url += (url.indexOf('?') === -1 ? '?' : '&')+query;
			query = null;
		}

		// Attach onreadystatechange listener
		if( async ) {

			request.onreadystatechange = this.onreadystatechange.bind(this);
		}

		// Open connection
		request.open( method, url, async );

		// Set post / put header
		if( method === 'POST' || method === 'PUT' ) {

			request.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded; charset='+this.charset );
		}

		// Set headers
		PB.each(options.headers, function( name, val ){

			request.setRequestHeader( name, val );
		});

		// Emit send event
		this.emit( 'send', this.transport, 0 );

		// Send the request
		request.send( query || null );

		// Handle synchrone callback
		if( !async ) {

			this.onreadystatechange();
		}

		return this;
	},
	
	/**
	 * Abort the request
	 *
	 * @return this
	 */
	abort: function () {
		
		this.transport.abort();

		this.emit('abort');

		return this;
	},
	
	/**
	 * Set option, key value
	 *
	 * @param {String}
	 * @param {String/Object/Array/Function/Number}
	 */
	set: function ( key, value ) {
		
		if( key.substr(0, 6) === 'header' ) {

			PB.overwrite(this.options.headers, value);
		}

		this.options[key] = value;

		return this;
	},

	/**
	 * Get new transport object
	 */
	getTransport: function () {

		// IE < 8 has troubles with a reusable xmlHttpRequest object
		// In this case we always return a new xmlHttpRequest instance
		if( this.transport && window.XMLHttpRequest ) {

			return this.transport;
		}

		if( window.XMLHttpRequest ) {

			return this.transport = new XMLHttpRequest();
		}
		// Older IE < 8
		else {

			// Abort previous request if any
			if( this.transport ) {

				this.transport.abort();
			}

			try {

	            return this.transport = new ActiveXObject('MSXML2.XMLHTTP.3.0');
	        } catch(e) {}
		}

		throw new Error('Browser doesn`t support XMLHttpRequest');
	},

	/**
	 * Handle onreadystatechange event
	 */
	onreadystatechange: function () {

		var transport = this.transport,
			options = this.options,
			type = 'error';

		// Request has finished
		if( transport.readyState === 4 ) {

			transport.responseJSON = null;

			// Request successfull
			if( transport.status >= 200 && transport.status < 300 ) {

				// Handle JSON response
				if( options.json || transport.getResponseHeader('Content-type').indexOf( 'application/json' ) >= 0 ) {

					try {
						
						transport.responseJSON = JSON.parse( transport.responseText );
					} catch ( e ) {}
				}

				type = 'success';
			}

			// Emit error or success
			this.emit( type, transport, transport.status, type );

			// Cleanup memory
			this.transport.onreadystatechange = null;
		}

		type = this.stateTypes[transport.readyState];

		// Emit state change
		this.emit( type, transport, transport.readyState === 4 ? transport.status : 0, type );
	}
});

/**
 * Request defaults
 */
PB.Request.defaults = {

	url: '',
	// Default request method
	method: 'GET',
	// Default async requests
	async: true,
	// Force datatypes, only one could be true..
	json: false,
	// IE10 has somehing different in this.. find out and normalize
	xml: false,
	// {}
	data: null,
	// Todo: implement auth
	// {user: 'xxx', pass: 'xxx'}
	auth: null,
	// Default request headers
	headers: {

		'X-Requested-With': 'PBJS-'+PB.VERSION,
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
	},
	encoding: 'UTF-8',
	// Todo: timeout
	timeout: 0
};

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

return PB;
});
