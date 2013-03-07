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
 * Build date 2013-03-07 09:44
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

var $,
	window = context,
	doc = window.document,
	docElement = doc.documentElement,
	body = doc.body;

/**
 * Create PB.$ global
 */
PB.$ = function ( selector ) {

	// Handle false argument
	if( !selector ) {

		return null;
	}

	// If already a node, return new $
	if( selector.nodeType ) {

		return new $( selector );
	}

	// Handle string argument
	if( typeof selector === 'string' ) {

		// Element id given
		if( selector.charAt(0) === '#' ) {

			// Select element
			selector = doc.getElementById(selector.substr(1));

			// Element not found
			if( !selector ) {

				return null;
			}

			return new $( selector );
		}
		// Create element
		else if ( selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' ) {

			// Create element
		}
	}

	/* When doing this we should validate that only elements are parsed...
	if( PB.type(selector) === 'array' ) {

		return new $( selector );
	}
	*/

	return null;
}

/**
 * Return collection by css selector
 */
PB.$$ = function ( selector ) {

	return new $(document).find(selector);
}

// Element cache
PB.$.cache = {};

/**
 * Get cache entry by element
 *
 * Will create new cache entry if not existing
 */
function getCacheEntry ( element ) {

	var id = element.__PBID__ || (element.__PBID__ = PB.id());

	return PB.$.cache[id] || (PB.$.cache[id] = {});
}

/**
 * $ constructor
 */
$ = function ( collection ) {

	var i = 0;

	if( collection.length ) {

		for( i = 0; i < collection.length; i++ ) {

			this[i] = collection[i];
		}
	} else {

		this[0] = collection;
	}

	this.length = i || 1;
	//this.context = this[0];
}

$.prototype.constructor = $;

// For extending PB.$ methods
PB.$.fn = $.prototype;

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
}

	// Used for tests
var div = document.createElement('div'),
	// Vendor prefixes
	vendorPrefixes = 'O ms Moz Webkit'.split(' '),
	// Styles that could require a vendor prefix
	stylesUsingPrefix = 'animationName transform transition transitionProperty transitionDuration transitionTimingFunction boxSizing backgroundSize boxReflect'.split(' '),
	// All styles that require a prefix are stored in here
	prefixStyles = {

		// Crossbrowser float property
		'float': (div.style.cssFloat !== undefined) ? 'cssFloat' : 'styleFloat'
	},
	// Do not add units to the given styles
	skipUnits = {
		
		zIndex: true,
		zoom: true,
		fontWeight: true,
		opacity: true
	};

/**
 * Map all styles that need a prefix in the browsers its executed to styles with prefix.
 *
 * Example result:
 * prefixStyles = {
 * 	boxSizing: 'MozBoxSizing'
 * }
 */
PB.each(stylesUsingPrefix, function ( i, prop ) {

	var translateProp;

	// Browser support property without prefix
	if( prop in div.style ) {

		return;
	}

	translateProp = prop.charAt(0).toUpperCase()+prop.substr(1);
	i = vendorPrefixes.length;

	while ( i-- ) {

		if( vendorPrefixes[i]+translateProp in div.style ) {

			return prefixStyles[prop] = vendorPrefixes[i]+translateProp;
		}
	}
});

// Free memory
div = null;

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

PB.overwrite($.prototype, {

	/**
	 * Set inline css style(s) for every element in the set.
	 */
	setStyle: function ( styles ) {

		var i = 0,
			prop,
			value;

		styles = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			for( prop in styles ) {

				value = styles[prop];

				// Use hook
				if( PB.$.hooks['setStyle.'+prop] ) {

					PB.$.hooks['setStyle.'+prop]( this[i], value );
				}
				// Use normal setter
				else {

					// Add px when value is a number and property is a px value
					if( typeof value === 'number' && !skipUnits[prop] ) {
						
						value += 'px';
					}

					// IE throws error when setting a non valid value
					try {

						// Make sure we use the correct style name
						this[i].style[prefixStyles[prop] || prop] = value;
					} catch (e) {}
				}
			}
		}

		return this;
	},

	/**
	 * Get css style from the first element in the set.
	 *
	 * @todo build for currentStyle
	 */
	getStyle: function ( styleName, calculated ) {

		var value;

		// Need prefix?
		styleName = prefixStyles[styleName] || styleName;
		value = this[0].style[styleName];

		if( calculated || !value || value === 'auto' ) {

			value = doc.defaultView.getComputedStyle( this[0], null )[styleName];
		}

		if( styleName === 'opacity' ) {
			
			return value ? parseFloat(value) : 1.0;
		}

		// Parse to int when value is a pixel value
		return /^-?[\d.]+px$/i.test( value ) ? parseInt(value, 10) : value;
	}
});
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
			cache;

		data = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			cache = getCacheEntry(this[i]);
			cache.data = cache.data || {};

			PB.overwrite(cache.data, data);
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
		var cache = getCacheEntry(this[0]),
			data;

		// Read from memory if set
		if( cache.data ) {

			data = cache.data[key];
		} 

		// No data set yet, try from 'data-' attribute
		if( data === undefined ) {

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
	 * Shows every element in the set.
	 */
	show: function () {

		var style,
			i = 0;

		for( ; i < this.length; i++ ) {

			style = this[i].style;

			if( style.display === 'none' ) {

				style.display = getCacheEntry(this[i])['css-display'] || 'block';
			}
		}

		return this;
	},

	/**
	 * Hides every element in the set.
	 */
	hide: function () {

		var style,
			i = 0;

		for( ; i < this.length; i++ ) {

			style = this[i].style;

			if( style.display !== 'none' ) {

				// Store css display value
				getCacheEntry(this[i])['css-display'] = PB.$(this[i]).getStyle('display');

				// Hide element
				style.display = 'none';
			}
		}

		return this;
	},

	/**
	 * Returns boolean whether the first element in the set is visible or not.
	 */
	isVisible: function () {

		var element = PB.$(this[0]);

		return element.getStyle('display') !== 'none' && element.getStyle('opacity') > 0;
	}
});

PB.overwrite($.prototype, {

	/**
	 * Returns the parent node of the first element in the set.
	 */
	parent: function () {

		return new this.constructor(this[0].parentNode);
	},

	/**
	 * Returns the children for the first element in the set.
	 */
	children: function () {

		var node = this[0].firstChild,
			i = 0,
			elements = [];

		do {

			// Only add element nodes
			if( node.nodeType === 1 ) {

				elements[i++] = node;
			}
		} while( node = node.nextSibling );

		return new this.constructor(elements);
	},

	/**
	 * Returns the first child from the first element in the set.
	 */
	firstChild: function () {

		var node = this[0].firstElementChild || this[0].firstChild;

		// Find first element node
		while( node && node.nodeType !== 1 ) {

			node = node.nextSibling;
		}

		return PB.$(node);
	},

	lastChild: function () {

		var node = this[0].lastElementChild || this[0].lastChild;

		// Find first element node
		while( node && node.nodeType !== 1 ) {

			node = node.previousSibling;
		}

		return PB.$(node);
	},

	/**
	 * Returns the first element in the set.
	 */
	first: function () {

		return new this.constructor(this[0]);
	},

	/**
	 * Returns the last element in the set.
	 */
	last: function () {

		return new this.constructor(this[this.length-1]);
	},

	next: function () {


	},

	prev: function () {


	},

	closest: function () {


	},

	/**
	 * Returns all matched elements by CSS expression for every element in the set.
	 */
	find: function ( expression ) {

		var i = 0,
			l = this.length,
			j, k, r,
			result,
			elements;
		
		for( ; i < l; i++ ) {
			
			if( i === 0 ) {
				
				elements = qwery(expression, this[i]);
			} else {
				
				result = qwery(expression, this[i]);
				
				for ( j = 0, k = elements.length, r = result.length; j < r; j++ ) {
					
					// Only add unique value
					if( elements.indexOf(result[j]) === -1 ) {
						
						elements[k++] = result[j];
					}
				}
			}
		}
		
		// we should return an unique set
		return new this.constructor(elements);
	}
});
/**
 * Request class
 *
 * 
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
			// Assign query string or null/false/undefined/empty string
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
