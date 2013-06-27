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
 * Build date 2013-06-27 18:22
 */
(function ( name, context, definition ) {
	
	this[name] = definition( context );

})('PB', this, function ( context ) {

'use strict';

var PB = {},

	// Previous PB
	OLD_PB = context.PB,
	
	// Unique id, fetch from previous PB or start from 0
	uid = OLD_PB ? OLD_PB.id() : 0,
	
	// References
	slice = Array.prototype.slice,
	toString = Object.prototype.toString;

// Define version
PB.VERSION = '0.6.0';

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
 * @param object
 * @param function
 * @param object
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

/*  // Set Const.prototype.__proto__ to Super.prototype
  function inherit (Const, Super) {
    function F () {}
    F.prototype = Super.prototype;
    Const.prototype = new F();
    Const.prototype.constructor = Const;
  }*/

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

            klass = function () {

                var _constructor = constructor;

                constructor = function () {

                    var _parent = this.parent;

                    this.parent = parentPrototype.construct;

                    _constructor.apply( this, arguments );

                    this.parent = _parent;
                };

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
	 * Child with own contruct method should call the parent method `this.parent()`
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

PB.Queue = PB.Class(PB.Observer, {
	
	construct: function () {

		var self = this; 

		// Constuct Observer
		this.parent();

		// 
		this._queue = [];

		// Wrap run for next callback
		this.next = function () {

			self.run();
		};

		return this;
	},

	queue: function ( fn, context ) {

		this._queue.push({

			fn: fn,
			context: context
		});

		return this;
	},

	run: function () {

		var item = this._queue.shift();

		if( !item ) {

			return;
		}

		item.fn.call(item.fn.context, this.next);

		return this;
	},

	stop: function () {

		this._queue.unshift(undefined);

		return this;
	},

	clear: function () {

		this._queue.length = 0;

		return this;
	}
});

var window = context,
	doc = window.document,
	docElement = doc.documentElement,
	$doc = new Dom(document);

/**
 * Create PB.$ global
 */
PB.$ = function ( selector ) {

	// Handle false argument
	if( !selector ) {

		return null;
	}

	// Already extended
	if( selector instanceof Dom ) {

		return selector;
	}

	// If already a node, return new Dom instance
	// element and document nodes are valid
	if( selector.nodeType === 1 || selector.nodeType === 9 || selector === window ) {

		return new Dom( selector );
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

			return new Dom( selector );
		}
		// Create element
		else if ( selector.charAt(0) === '<' && selector.charAt(selector.length - 1) === '>' ) {

			// Create element
			return PB.$.buildFragment(selector);
		}
		// user querySelector
		else {

			return $doc.find(selector);
		}
	}

	/* When doing this we should validate that only elements are parsed...
	if( PB.type(selector) === 'array' ) {

		return new Dom( selector );
	}
	*/

	return null;
};

/**
 * Return collection by css selector
 */
PB.$$ = function ( selector ) {

	PB.log('Usage of PB.$$ is deprecated');

	// Already PB Dom object
	if( selector instanceof Dom ) {

		return selector;
	}

	return $doc.find(selector);
};

/**
 * Dom constructor
 */
function Dom ( collection ) {

	var i = 0;

	if( collection.nodeName || collection === window ) {

		this[0] = collection;
		i = 1;
	} else if ( 'length' in collection ) {

		for( i = 0; i < collection.length; i++ ) {

			this[i] = collection[i];
		}
	}

	this.length = i;
}

Dom.prototype.constructor = Dom;

// For extending PB.$ methods
PB.$.fn = Dom.prototype;

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

			if( !id || !PB.$.cache[id] ) {

				continue;
			}

			delete PB.$.cache[id].data[key];
		}

		return this;
	}
});
	// Used for tests
var div = document.createElement('div'),
	// Vendor prefixes
	// We could probably drop ms :) http://www.impressivewebs.com/dropping-ms-vendor-prefixes-ie10/
	vendorPrefixes = 'O ms Moz Webkit'.split(' '),
	// Styles that could require a vendor prefix
	stylesUsingPrefix = 'animationName animationDuration transform transition transitionProperty transitionDuration transitionTimingFunction boxSizing backgroundSize boxReflect'.split(' '),
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
 *     boxSizing: 'MozBoxSizing'
 * }
 */
PB.each(stylesUsingPrefix, function ( i, prop ) {

	var translateProp;

	// Browser support property without prefix
	if( prop in div.style ) {

		// Add normal property to prefixStyles, so we know the browers supports the css property
		prefixStyles[prop] = prop;
		return;
	}

	translateProp = prop.charAt(0).toUpperCase()+prop.substr(1);
	i = vendorPrefixes.length;

	while ( i-- ) {

		if( vendorPrefixes[i]+translateProp in div.style ) {

			// Prefix found
			prefixStyles[prop] = vendorPrefixes[i]+translateProp;
			return;
		}
	}
});

// Free memory
div = null;

PB.overwrite(PB.$.fn, {

	/**
	 * Set inline css style(s) for every element in the set.
	 *
	 * @return {Object} this
	 */
	setStyle: function ( styles ) {

		var i = 0,
			prop,
			value;

		styles = argsToObject(arguments);

		for( ; i < this.length; i++ ) {

			for( prop in styles ) {

				if( styles.hasOwnProperty(prop) ) {

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
		}

		return this;
	},

	/**
	 * Get css style from the first element in the set.
	 *
	 * @todo build for currentStyle
	 */
	getStyle: function ( styleName, calculated ) {

		var value,
			// Get prefixed style name or current style name
			prefixStyleName = prefixStyles[styleName] || styleName;

		// Store inline value
		value = this[0].style[prefixStyleName];

		if( calculated || !value || value === 'auto' ) {

			value = window.getComputedStyle( this[0], null )[prefixStyleName];

			// IE 9 sometimes return auto.. In this case we force the value to 0
			if( value === 'auto' ) {

				value = 0;
			}
		}

		if( styleName === 'opacity' ) {
			
			value = value ? parseFloat(value) : 1.0;
		}
		// Parse to int when value is a pixel value
		else {

			value = (/^-?[\d.]+px$/i).test( value ) ? parseInt(value, 10) : value;
		}

		// If a hook is specified use the hook
		return PB.$.hooks['getStyle.'+styleName] ? PB.$.hooks['getStyle.'+styleName]( this[0], value, prefixStyleName ) : value;
	}
});

/**
 * Convert arguments to ordered object
 */
function morphArgsToObject ( args ) {

	// Default options
	var i = 1,
		effect,
		options = {
			
			duration: 0.4,
			effect: 'ease'
		};
	
	// Loop trough args
	for( ; i < args.length; i++ ) {

		switch( typeof args[i] ) {
			
			case 'function':
				options.fn = args[i];
				break;

			case 'number':
				options.duration = args[i];
				break;
		
			case 'string':
				// easeInOut -> ease-in-out
				effect = args[i].replace(/([A-Z])/g, '-$1').toLowerCase();

				if( /^linear|ease|ease-in|ease-out|ease-in-out|cubic-bezier\(.*?\)$/.test(effect) ) {

					options.effect = effect;
				}
				break;
		}
	}
	
	return options;
}

// Detect browser feature
PB.$.fn.morph = !!prefixStyles.transition ?
/**
 * Morph current css styles to given css styles for every element in the set.
 */
function ( properties ) {

	// Normalize arguments
	var options = morphArgsToObject( arguments );

	return this.each(function () {

		var element = PB.$(this),
			data = element.getData('morph') || {},
			currentStyles = {

				transition: 'all '+options.duration+'s '+options.effect+' 0s'
			};

		// Stop current animation, will stop animating with current styles
		if( data.running ) {

			element.stop(false);
		}

		// Store 
		data.end = properties;
		data.fn = options.fn;
		data.running = true;

		// Calculate current styles
		PB.each(properties, function ( property ) {
			
			currentStyles[property] = element.getStyle( property, true );
		});

		// Set the current styles inline
		element.setStyle(currentStyles);

		// Force redraw, for some browsers (atleast firefox). Otherwise there will be no animation
		this.offsetHeight;

		// Start transition
		element.setStyle(properties);

		// Our callback is handles with timeout, an easy crossbrowser solution.
		// Todo: could this lead to a memory leak? Timer (closure that leads to the parent function..)
		// Maybe use the correct event
		data.timer = setTimeout(function () {

			// Make sure the element still exists
			if( !element[0].parentNode ) {

				return;
			}

			//
			data.running = false;

			// Remove transition
			element.setStyle({
				
				transition: ''
			});

			// Trigger callback
			if( data.fn ) {
				
				data.fn( element );
			}
		}, (options.duration*1000)+50);	// Add a small delay, so the animation is realy finished

		// Store morph data
		element.setData('morph', data);
	});
} :
/**
 * Set styles directly for every element. This is used when the
 * browser does not support css transitions.
 */
function ( properties ) {

	// Normalize arguments
	var options = morphArgsToObject( arguments ),
		i = 0;

	// Set css styles
	this.setStyle(properties);

	// Trigger callbacks, if given
	if( options.fn ) {
		
		for( ; i < this.length; i++ ) {

			options.fn( PB.$(this[i]) );
		}
	}

	return this;
};

PB.$.fn.stop = function ( gotoEnd ) {

	return this.each(function () {

		var element = PB.$(this),
			data = element.getData('morph');

		if( !data || !data.running ) {
			
			return;
		}

		// Assign default value
		gotoEnd = (gotoEnd === undefined) ? true : !!gotoEnd;

		// Not running anymore
		data.running = false;

		// Clear the callback
		clearTimeout( data.timer );

		// Clear transition
		data.end.transition = 'none 0s ease 0s';

		// Stop animation
		if( !gotoEnd ) {

			// Get current styles to 'pause' our transition
			PB.each(data.end, function ( property ) {

				data.end[property] = element.getStyle(property, true);
			});
		}

		// Set ending styles
		element.setStyle(data.end);

		// Trigger callback
		if( gotoEnd && data.fn ) {
			
			data.fn( this );
		}
	});
};

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
	},

	/**
	 * Remove every element in the set.
	 */
	remove: function () {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// Remove data
			delete PB.$.cache[this[i].__PBID__];

			// Remove element
			if( this[i].parentNode ) {

				this[i].parentNode.removeChild( this[i] );
			}

			// Clear reference to element
			delete this[i];
		}

		// Return null
		return null;
	},

	empty: function () {

		return this.setHtml('');
	},

	clone: function ( deep ) {

		var ret = [],
			children,
			i = 0;

		// 
		for( ; i < this.length; i++ ) {

			// Clone element, and add to collection
			ret[i] = this[i].cloneNode( deep );
			
			// Remove id and __PBID__ attribute / expando
			ret[i].removeAttribute('id');
			ret[i].removeAttribute('__PBID__');

			// When cloning children make sure all id and __PBID__ attributes / expandos are removed.
			if( deep ) {

				children = PB.$(ret[i]).find('*');

				for ( ; i < length; i++) {

					children[i].removeAttribute('id');
					children[i].removeAttribute('__PBID__');
				}
			}
		}

		return new this.constructor(ret);
	},

	/**
	 * Set the `HTML` for every element in the set.
	 */
	// Should we make an option to parse script tags?
	setHtml: function ( value ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// There are some browser (IE,NokiaBrowser) that do not support innerHTML on table elements, in this case we should use
			// appendChild.
			try {

				this[i].innerHTML = value;
			} catch (e) {

				// Remove all childs
				PB.$(this[i]).children().remove();

				// Check for certain node names, in case of tbody|tr|td we have to use a 'special' approach
				// in which we create the element with a wrapper.
				// Should we put this code 'PB.$.buildFragment' ? 
				if( /^<tbody/i.test(value) ) {

					PB.$('<table>'+value+'</table>').firstChild()
						.appendTo(this[i]);
				} else if ( /^<tr/i.test(value) ) {

					PB.$('<table><tbody>'+value+'<tbody></table>').firstChild().children()
						.appendTo(this[i]);
				} else if ( /^<td/i.test(value) ) {

					PB.$('<table><tbody><tr>'+value+'</tr><tbody></table>').firstChild().firstChild().children()
						.appendTo(this[i]);
				} else {

					PB.$(value).appendTo(this[i]);
				}
			}
		}

		return this;
	},

	/**
	 * Get the `HTML` of first element in the set.
	 */
	getHtml: function () {

		return this[0].innerHTML;
	},

	setText: function ( value ) {

		var i = 0;

		// Empty elements
		this.setHtml('');

		// Append text to every element
		for( ; i < this.length; i++ ) {

			this[i].appendChild(doc.createTextNode(value));
		}

		return this;
	},

	getText: function () {

		return this[0].textContent || this[0].nodeValue || '';
	}
});
PB.overwrite(PB.$.fn, {

	width: function () {

		if( this[0] === window ) {

			// Return viewport width, excluding toolbars/scrollbars
			// Using docElement.clientWidth for IE7/8
			return window.innerWidth || docElement.clientWidth;
		} else if ( this[0] === doc ) {

			// Return document size
			return Math.max(docElement.clientWidth, docElement.offsetWidth, docElement.scrollWidth);
		}

		return this.getStyle('width', true);
	},

	innerWidth: function () {

		return this.width() + this.getStyle('paddingLeft', true) + this.getStyle('paddingRight', true);
	},

	outerWidth: function ( includeMargin ) {

		var outerWidth = this.innerWidth() + this.getStyle('borderLeftWidth', true) + this.getStyle('borderRightWidth', true);

		if( includeMargin ) {

			outerWidth += this.getStyle('marginLeft', true) + this.getStyle('marginRight', true);
		}

		return outerWidth;
	},

	scrollWidth: function () {

		return this[0].scrollWidth;
	},

	height: function () {

		if( this[0] === window ) {

			// Return viewport width, excluding toolbars/scrollbars
			// Using docElement.clientWidth for IE7/8
			return window.innerHeight || docElement.clientHeight;
		} else if ( this[0] === doc ) {

			// Return document size
			return Math.max(docElement.clientHeight, docElement.offsetHeight, docElement.scrollHeight);
		}

		return this.getStyle('height', true);
	},

	innerHeight: function () {

		return this.height() + this.getStyle('paddingTop', true) + this.getStyle('paddingBottom', true);
	},

	outerHeight: function ( includeMargin ) {

		var outerHeight = this.innerHeight() + this.getStyle('borderTopWidth', true) + this.getStyle('borderBottomWidth', true);

		if( includeMargin ) {

			outerHeight += this.getStyle('marginTop', true) + this.getStyle('marginBottom', true);
		}

		return outerHeight;
	},

	scrollHeight: function () {

		return this[0].scrollHeight;
	},

	setScroll: function ( position ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			if( position.top !== undefined ) {

				this[i].scrollTop = position.top;
			}

			if( position.left !== undefined ) {

				this[i].scrollLeft = position.left;
			}
		}

		return this;
	},

	getScroll: function () {

		return {

			top: this[0].scrollTop,
			left: this[0].scrollLeft
		};
	},

	// position
	position: function () {

		var box = this[0].getBoundingClientRect();

		return {

			top: box.top + (window.scrollY || window.pageYOffset),
			left: box.left + (window.scrollX || window.pageXOffset)
		};
	},

	offset: function () {

		var element = this[0],
			box = {

				top: 0,
				left: 0
			};

		while( element ) {

			box.top += element.offsetTop;
			box.left += element.offsetLeft;

			element = element.offsetParent;

			if( !element || PB.$(element).getStyle('position') !== 'static' ) {

				break;
			}
		}

		return box;
	},

	/**
	 * Returns true if the first element in the set has the given class name.
	 */
	hasClass: function ( className ) {

		return (' '+this[0].className+' ').indexOf(' '+className+' ') >= 0;
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
	 * Shows every element in the set.
	 */
	show: function () {

		var style,
			i = 0;

		for( ; i < this.length; i++ ) {

			style = this[i].style;

			if( style.display === 'none' ) {

				style.display = domGetStorage(this[i])['css-display'] || 'block';
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
				domGetStorage(this[i])['css-display'] = PB.$(this[i]).getStyle('display');

				// Hide element
				style.display = 'none';
			}
		}

		return this;
	},

	/**
	 * Returns boolean whether the first element in the set is visible or not.
	 *
	 * - rename to shown ?
	 */
	isVisible: function () {

		var element = PB.$(this[0]);

		return element.getStyle('display') !== 'none' && element.getStyle('opacity') > 0;
	}
});
PB.overwrite(PB.$.fn, {

	/**
	 * Returns the parent node of the first element in the set.
	 */
	parent: function () {

		return PB.$(this[0].parentNode);
	},

	/**
	 * Returns the children for the first element in the set.
	 */
	children: function () {

		var node = this[0].firstElementChild || this[0].firstChild,
			i = 0,
			elements = [];

		if( !node ) {

			return null;
		}

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

		return PB.$(this[0].firstElementChild || this[0].firstChild);
	},

	/**
	 * Returns the first child from the first element in the set.
	 */
	lastChild: function () {

		return PB.$(this[0].lastElementChild || this[0].lastChild);
	},

	/**
	 * Returns the first element in the set.
	 */
	first: function () {

		return PB.$(this[0]);
	},

	/**
	 * Returns the last element in the set.
	 */
	last: function () {

		return PB.$(this[this.length-1]);
	},

	next: function () {

		return PB.$(this[0].nextElementSibling || this[0].nextSibling);
	},

	prev: function () {

		return PB.$(this[0].previousElementSibling || this[0].previousSibling);
	},

	closest: function ( expression, maxDepth ) {

		var node = this[0];

		maxDepth = maxDepth || 50;

		do {

			if( PB.$.selector.matches( node, expression ) ) {

				return node;
			}

			if( !--maxDepth ) {

				break;
			}

		} while ( node = node.parentNode );

		return null;
	},

	indexOf: function ( element ) {

		var i = 0;

		element = PB.$(element);

		if( !element ) {

			return -1;
		}

		for( ; i < this.length; i++ ) {

			if( this[i] === element[0] ) {

				return i;
			}
		}

		return -1;
	},

	/**
	 * Gets a child element from the parent at a specied index.
	 */
	childAt: function( index ) {

		var children = this.children();

		return children && children[index] ? PB.$(children[index]) : null;
	},

	contains: function () {


	},

	/**
	 * Returns all matched elements by CSS expression for every element in the set.
	 */
	find: function ( expression ) {

		var i = 0,
			j, k, r,
			result,
			elements;
		
		for( ; i < this.length; i++ ) {
			
			if( i === 0 ) {
				
				elements = PB.$.selector.find(expression, this[i]);
			} else {
				
				result = PB.$.selector.find(expression, this[i]);
				
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
	},

	/**
	 *
	 */
	matches: function ( selector ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// Using qwery for selector validation
			if( !PB.$.selector.matches(this[i], selector) ) {

				return false;
			}
		}

		return true;
	}
});
	// Does browser support mouseenter and mouseleave
var mouseenterleave = 'onmouseenter' in docElement && 'onmouseleave' in docElement,
	// Contains all event that should be triggered `manual` node.focus()
	rmanualevent = /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,

	standardEvents = 'type target defaultPrevented bubbles'.split(' '),

	mouseEvents = 'altKey ctrlKey metaKey shiftKey which pageX pageY'.split(' ');

/**
 *
 */
function Event ( originalEvent, element ) {

	var type = originalEvent.type,
		key;

	this.originalEvent = originalEvent;
	this.currentTarget = element;

	// Extend with standard event properties
	this.extend(standardEvents);

	// Any hooks for this event.type ?
	for( key in Event.hooks ) {

		if( Event.hooks.hasOwnProperty(key) && Event.hooks[key].matches.test(type) ) {

			Event.hooks[key].hook(this, originalEvent);
		}
	}
}

Event.prototype = {

	/**
	 * Extend event with original event
	 *
	 * @param {Array} filled with property names that should be copied
	 */
	extend: function ( properties ) {

		var i = 0,
			l = properties.length;

		// Populate
		for( ; i < l; i++ ) {

			this[properties[i]] = this.originalEvent[properties[i]];
		}
	},

	/**
	 *
	 */
	preventDefault: function () {

		this.defaultPrevented = true;

		this.originalEvent.preventDefault();
	},

	/**
	 *
	 */
	stopPropagation: function () {

		this.originalEvent.stopPropagation();
	},

	/**
	 * Short for preventDefault() and stopPropagation()
	 */
	stop: function () {

		this.preventDefault();
		this.stopPropagation();
	},

	/**
	 * Checks whether the event target matches the given selector
	 *
	 * @param {String} css selector
	 * @return {Boolean}
	 */
	matchesSelector: function ( selector ) {

		var target = this.target;

		do {

			// When selector matches target set as currentTarget
			if( PB.$.selector.matches(target, selector) ) {

				this.currentTarget = target;
				return true;
			}

			// No need to look further then the target that listens to the event
			if( target === this.currentTarget ) {

				return false;
			}

		} while ( target = target.parentNode );

		// No match
		return false;
	}
};

Event.hooks = {

	/**
	 * Extend mouse 
	 */
	mouse: {

		matches: /(!?mouse|click|drag|focusin|focusout)/,
		hook: function ( event, originalEvent ) {

			// Extend with standard event properties
			event.extend(mouseEvents);

			if( originalEvent.relatedTarget ) {

				event.relatedTarget = originalEvent.relatedTarget;
			}
		}
	},

	/**
	 * Normalize wheelDelta crossbrowser
	 */
	mousewheel: {

		matches: /^(?:DOMMouseScroll|mousewheel|wheel)$/,
		hook: function ( event, originalEvent ) {

			event.wheelDelta = originalEvent.wheelDelta
				? originalEvent.wheelDelta / 120
				: -(originalEvent.detail || 0) / 3;
		}
	}
};

// Expose
PB.$.Event = Event;

/**
 * Register event
 *
 * @param {Object} element node
 * @param {String} event name
 * @param {Function} handler
 * @param {Object} handler context
 * @param {String} css selector
 */
function register ( element, eventName, handler, context, selector ) {

	var storage = domGetStorage(element),
		entries,
		entry,
		i;

	// Store element
	storage.element = element;

	// Create event storage
	if( !storage.eventData ) {

		storage.eventData = {};
	}

	if( !storage.eventData[eventName] ) {

		storage.eventData[eventName] = [];
	}

	entries = storage.eventData[eventName];
	i = entries.length;

	// Do not register same handler twice
	while ( i-- ) {

		if( entries.handler === handler ) {

			return;
		}
	}

	// Store handler and responder se we know wich event to remove when calling `off`
	entry = {

		handler: handler,
		responder: eventResponder(element.__PBID__, eventName, handler, context, selector)
	};

	entries.push(entry);

	// [Chrome] Map to correct event name
	if( !mouseenterleave && (eventName === 'mouseenter' || eventName === 'mouseleave') ) {

		eventName = (eventName === 'mouseenter') ? 'mouseover' : 'mouseout';
	}

	// Attach event
	if( window.addEventListener ) {

		element.addEventListener(eventName, entry.responder, false);
	} else {

		element.attachEvent('on'+eventName, entry.responder);
	}
}

/**
 * Unregister event
 *
 * @param {Object} element node
 * @param {String} event name
 * @param {Function} handler
 */
function unregister ( element, eventName, handler ) {

	var storage = domGetStorage(element),
		entries = storage.eventData && storage.eventData[eventName],
		entry,
		i;

	if( !entries ) {

		return;
	}

	i = entries.length;

	// Find cache entry
	while ( i-- ) {
		
		if( entries[i].handler === handler ) {
			
			entry = entries[i];
			entries.splice(i, 1);
			break;
		}
	}

	// No entry in cache
	if( !entry ) {
		
		return;
	}

	// Remove event
	if( window.removeEventListener ) {

		element.removeEventListener(eventName, entry.responder, false);
	} else {

		element.detachEvent('on'+eventName, entry.responder);
	}
}

/**
 * Create a wrapper arround the original event
 *
 * @param {Number} element pbid
 * @param {String} event name
 * @param {Function} handler
 * @param {Object} handler context
 * @param {String} css selector
 */
function eventResponder ( pbid, eventName, handler, context, selector ) {

	return function ( originalEvent ) {

		var element = PB.$.cache[pbid].element,
			event = new Event(originalEvent, element),
			relatedTarget;

		// If selector is given, test selector
		if( selector && !event.matchesSelector(selector) ) {

			return;
		}

		// When selector is given, currentTarget is now the selected element
		element = event.currentTarget;

		// [Chrome] Workaround to support for mouseenter / mouseleave
		// Inspired by blog.stchur.com/2007/03/15/mouseenter-and-mouseleave-events-for-firefox-and-other-non-ie-browsers/
		if( !mouseenterleave && (eventName === 'mouseleave' || eventName === 'mouseenter') ) {

			relatedTarget = event.relatedTarget;

			if( element === relatedTarget || element.contains(relatedTarget) ) {

				return;
			}

			event.type = eventName;
		}
		
		// Execute callback, use context as scope otherwise the given element
		handler.call( context || element, event );
	};
}

// Export
PB.overwrite(PB.$.fn, {

	/**
	 * Add event listener to every element in the set
	 *
	 * @param {String} event name
	 * @param {String} *optional css selector
	 * @param {Function} handler
	 * @param {Object} handler context
	 * @return 
	 */
	on: function ( eventName, selector, handler, context ) {
		
		var types = eventName.split(' '),
			l = types.length,
			i = 0,
			j;

		if( typeof selector === 'function' ) {

			context = handler;
			handler = selector;
			selector = null;
		}

		if( typeof handler !== 'function' ) {

			throw new TypeError();
		}

		// Loop trough every elements in set
		for( ; i < this.length; i++ ) {

			// For every element we get to bind the given event(s)
			for( j = 0; j < l; j++ ) {

				//this[i].addEventListener(types[i], callback, false);
				register(this[i], types[j], handler, context, selector);
			}
		}

		return this;
	},

	/**
	 * Remove event listener(s) for every element in the set
	 *
	 * When `handler` is undefined all handlers attached to the event name are removed.
	 * When `eventName` is undefined all handlers for all types are removed
	 *
	 * @param {String} event name
	 * @param {Function} handler
	 * @return {Object} this
	 */
	off: function ( eventName, handler ) {

		var i = 0,
			entries,
			j;

		for( ; i < this.length; i++ ) {

			entries = domGetStorage(this[i]).eventData;

			// No events stored
			if( !entries && (eventName && !entries[eventName]) ) {

				continue;
			}

			// When no event name is given destroy all events
			if( !eventName ) {

				// Remove all event listeners
				for( j in entries ) {

					if( entries.hasOwnProperty(j) ) {

						// Remove events by event name
						new Dom(this[i]).off(j);
					}
				}
			}
			// When no handler is given destoy all events attached to the event name
			else if ( !handler ) {

				// Remove all event listeners for given event name
				for( j = 0; j < entries[eventName].length; j++ ) {

					unregister( this[i], eventName, entries[eventName][j].handler );
				}

				// Remove property
				delete entries[name];
			}
			// Remove a single event, must match eventName and handler to be removed
			else {

				// Remove event listener by event name and handler
				unregister(this[i], eventName, handler);
			}
		}

		return this;
	},
	
	/**
	 * Trigger hmtl event
	 *
	 * @param {String} event name
	 * @return {Object} this
	 */
	emit: function ( eventName ) {

		var i = 0,
			manual = rmanualevent.test(eventName),
			evt;

		// translate mouseenter/mouseleave if needed

		for( ; i < this.length; i++ ) {

			// Some events need manual trigger, like element.focus()
			if( manual || (this[i].nodeName === 'input' && eventName === 'click') ) {

				this[i][eventName]();
			}
			// W3C
			else if( doc.createEvent ) {

				evt = doc.createEvent('HTMLEvents');
				evt.initEvent(eventName, true, true, window, 1);
				this[i].dispatchEvent(evt);
			}
			// IE
			else {

				this[i].fireEvent('on'+eventName, doc.createEventObject());
			}
		}

		return this;
	}
});

/**
 * Convert string to html nodes
 *
 * @param {String} html
 * @return {Object} PB.$
 */
PB.$.buildFragment = function ( html ) {
	
	var fragment = doc.createElement('div'),
		children;

	// Table elements should be created in an table
	// html: '<td></td>' wrap with:
	fragment.innerHTML = html;

	// Return the childeren
	children = PB.$(fragment).children();

	fragment = null;

	return children;
};

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

// Animation handler
PB.Animation = function Animation ( options ) {

	this.running = false;
	// this.startAt;
	// this.endAt;
	// this.timer;

	this.duration = options.duration * 1000;
	this.onTick = options.onTick || function () {};
	this.timerFunction = PB.Animation.effects[options.effect] || PB.Animation.effects.ease;
	this.data = options.data;
};

PB.overwrite(PB.Animation.prototype, {

	start: function () {

		this.startAt = +new Date();
		this.endAt = this.startAt + this.duration;
		this.running = true;

		this.tick();
	},

	stop: function () {

		clearTimeout(this.timer);

		this.running = false;
	},

	tick: function () {

		var time = +new Date(),
			self = this,
			// Position in animation from 0.0 - 1.0
			position = this.timerFunction(1 - ((this.endAt - time) / this.duration ));
	
		if( time >= this.endAt ) {
		
			this.onTick(1, this.data, this);
			this.stop();
		
			return;
		}

		this.onTick(position, this.data, this);

		this.timer = setTimeout(function () {

			self.tick();
		}, 1000 / 60);
	}
});

//Should be reconsidered
PB.Animation.effects = {

	linear: function ( t ) {
	
		return t;
	},

	ease: function ( t ) {
	
		return t;
	},

	'ease-in': function ( t ) {
	
		return t*t;
	},

	'ease-out': function ( t ) {
	
		return -1*t*(t-2);
	},

	'ease-in-out': function ( t ) {
	
		return t;
	},

	bounce: function ( t ) {

		if (t < (1/2.75)) {

			return (7.5625*t*t);
		} else if (t < (2/2.75)) {

			return (7.5625*(t-=(1.5/2.75))*t + 0.75);
		} else if (t < (2.5/2.75)) {

			return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
		} else {
			return (7.5625*(t-=(2.625/2.75))*t + 0.984375);
		}
	}
};
// Native query selector
var matches = docElement.matchesSelector || docElement.mozMatchesSelector || docElement.webkitMatchesSelector || docElement.oMatchesSelector || docElement.msMatchesSelector;

PB.$.selector = {
	
	/**
	 * Native
	 */
	find: function ( selector, node ) {

		return PB.toArray(node.querySelectorAll(selector));
	},

	/**
	 * Compare node to selector
	 */
	matches: function ( node, selector ) {

		// #22 matchesSelector only avaible for element nodes
		if( node.nodeType !== 1 ) {

			return false;
		}

		return matches.call(node, selector);
	}
};

/**
 * PB.ready
 */
(function ( PB ) {

	var doc = window.document,
		ready = doc.readyState === 'complete',
		fn,
		queue = [];

	// When browser supports addEventListener, DOMContentLoaded is existing
	if( doc.addEventListener ) {

		doc.addEventListener('DOMContentLoaded', fn = function () {

			doc.removeEventListener('DOMContentLoaded', fn);
			runQueue();
		});
	}
	// For IE7/8 check readystatechange event
	else {

		doc.attachEvent('onreadystatechange', fn = function () {

			if( doc.readyState === 'complete' ) {

				doc.detachEvent('onreadystatechange', fn);
				runQueue();
			}
		});
	}

	/**
	 * Call every function in queue
	 *
	 * @return {Void}
	 */
	function runQueue () {

		var callback;

		ready = true;

		while( callback = queue.shift() ) {

			callback(PB);
		}
	}

	/**
	 * Handle callback, call callback imidiatily when document is ready else queue. And call
	 * when document is ready.
	 *
	 * @return {Void}
	 */
	function onDomReady ( callback ) {

		if( ready ) {

			callback(PB);
		} else {

			queue.push(callback);
		}
	}

	// Expose
	PB.ready = onDomReady;
})( PB );
// Support for older browsers
(function ( PB ) {

	if( !Function.prototype.bind ) {

		Function.prototype.bind = function ( oThis ) {

			if( typeof this !== "function" ) {

				// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs = Array.prototype.slice.call(arguments, 1), 
				fToBind = this, 
				fNOP = function () {},
				fBound = function () {

					return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
				};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();

			return fBound;
		};
	}

})(PB);
// Support for older browsers
(function ( PB, undefined ) {

	// pbjs not defined..
	if( !PB ) {

		return;
	}

	var div = document.createElement('div'),
		ropacity = /alpha\(opacity=(.*)\)/i,
		rpixel = /^-?[\d.]+px$/i;

	// IE < 9 opacity support
	if( div.style.opacity === undefined ) {

		/**
		 * Set opacity trough filter property
		 *
		 * @param {Object} node element
		 * @param {Float} opacity range 0.0-1.0
		 */
		PB.$.hook('setStyle.opacity', function ( element, value ) {
			
			// Make sure element got layout
			if( !element.currentStyle || !element.currentStyle.hasLayout ) {

				element.style.zoom = 1;
			}
			
			// Set opacity
			element.style.filter = 'alpha(opacity='+(value*100)+')';
		});

		/**
		 * Get opacity as float 0.0-1.0 from filter property
		 *
		 * @param {Object} node element
		 * @return {Float}
		 */
		PB.$.hook('getStyle.opacity', function ( element ) {
			
			var filter = element.style.filter || element.currentStyle.filter,
				match = filter && filter.match(ropacity);
			
			if( match && match[1] ) {

				return parseFloat(match[1]) / 100;
			}

			return 1.0;
		});
	}

	// 
	if( 'currentStyle' in div && !window.getComputedStyle ) {

		/**
		 * Overwrite getStyle when browser does not support getComputedStyle
		 *
		 * IE's currentStyle wont return calculated values so we also calculate non
		 * pixel values.
		 *
		 * @param {String} style
		 * @param {Boolean} 
		 * @return {String/Number} 
		 */
		PB.$.fn.getStyle = function ( styleName, calculated ) {

			var value,
				div,
				targetNode;

			// If a hook is specified use the hook
			if( PB.$.hooks['setStyle.'+styleName] ) {

				return PB.$.hooks['getStyle.'+styleName]( this[0] );
			}

			// Get inline value
			value = this[0].style[styleName];

			// Do some magic when no value or when it should be calculated
			if( calculated || !value || value === 'auto' ) {

				// Substract borders from offsetWidth and offsetHeight
				if( styleName === 'width' ) {

					return this[0].offsetWidth - this.getStyle('borderLeftWidth', true) - this.getStyle('borderRightWidth', true);
				}

				if( styleName === 'height' ) {

					return this[0].offsetHeight - this.getStyle('borderTopWidth', true) - this.getStyle('borderBottomWidth', true);
				}

				// Get current style
				value = this[0].currentStyle[styleName];

				// Awesomo trick! from http://blog.stchur.com/2006/09/20/converting-to-pixels-with-javascript/
				// Calculate non pixel values
				if( !/px$/.test(value) ) {

					div = document.createElement('div');
					div.style.cssText = 'visbility: hidden; position: absolute; line-height: 0;';

					// 
					if( value === 'auto' || value.lastIndexOf('%') > 0 ) {

						targetNode = this[0].parentNode;
						div.style.height = value;
					} else {

						div.style.borderStyle = 'solid';
						div.style.borderBottomWidth = '0';
						div.style.borderTopWidth = value;
					}

					// Make sure we got an element
					targetNode = targetNode || document.body;

					// Append div so we can get the offsetHeight
					targetNode.appendChild(div);
					value = div.offsetHeight;
					targetNode.removeChild(div);

					// Clear memory
					div = null;

					// No need to run regex
					return value;
				}
			}

			// Parse to int when value is a pixel value
			return rpixel.test( value ) ? parseInt(value, 10) : value;
		};
	}

	// Create a fallback for the morph method if transition are not supported
	if( !('transition' in div.style) && !('MozTransition' in div.style) && !('WebkitTransition' in div.style) ) {

		PB.$.fn.morph = function ( properties ) {

			// Normalize arguments
			var options = morphArgsToObject( arguments );

			this.stop(false);

			return this.each(function () {

				var element = PB.$(this),
					currentStyles = {},
					styleValueDiff = {},
					animation;

				// Calculate current styles
				PB.each(properties, function ( property ) {
					
					currentStyles[property] = element.getStyle( property, true );
				});

				// Calculate the difference between the given and current styles
				PB.each(properties, function ( property ) {

					var value = properties[property];

					value = /^-?[\d.]+px$/i.test( value ) ? parseInt(value, 10) : value;
					
					styleValueDiff[property] = value - currentStyles[property];
				});

				animation = new PB.Animation({

					duration: options.duration,
					effect: options.effect,
					onTick: function ( pos ) {

						PB.each(styleValueDiff, function ( style, value ) {

							element.setStyle(style, currentStyles[style]+(value*pos));
						});

						if( pos === 1 && options.fn ) {

							options.fn( element );
						}
					}
				}).start();

				element.setData('morph', animation);
			});
		};

		PB.$.fn.stop = function ( gotoEnd ) {

			return this.each(function () {

				var element = PB.$(this),
					animation = element.getData('morph');

				if( !animation || !animation.running ) {
					
					return;
				}

				// Assign default value
				gotoEnd = (gotoEnd === undefined) ? true : !!gotoEnd;

				animation.stop();

				// Trigger callback
				if( gotoEnd && animation.fn ) {
					
					animation.fn( this );
				}
			});
		};
	}

	// Free memory
	div = null;
})(PB);

/**
 * Event fixes across browser
 *
 * IE < 9
 */
(function ( context, PB ) {

	var window = context,
		doc = window.document,
		docElement = doc.documentElement,
		body = doc.body;

	// Check if browser is using an old event model
	if( !window.attachEvent && window.addEventListener ) {

		return;
	}

	PB.overwrite(PB.$.Event.hooks, {

		fixes: {

			matches: /(!?)/,
			hook: function ( event, originalEvent ) {

				event.target = originalEvent.srcElement || originalEvent.toElement;
			}
		},

		mouseIe: {

			matches: /(!?mouse|click|focus|drag)/,
			hook: function ( event, originalEvent ) {

				event.pageX = originalEvent.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0);
				event.pageY = originalEvent.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0);

				if( originalEvent.fromElement ) {

					event.relatedTarget = originalEvent.fromElement;
				}

				// Set which
				event.which = (originalEvent.keyCode === undefined) ? originalEvent.charCode : originalEvent.keyCode;

				// Normalize mousebutton codes to W3C standards
				// Left: 0, Middle: 1, Right: 2
				event.which = (event.which === 0 ? 1 : (event.which === 4 ? 2: (event.which === 2 ? 3 : event.which)));
			}
		}
	});

	/**
	 * Prevents further propagation of the current event.
	 */
	PB.$.Event.prototype.stopPropagation = function () {
		
		this.defaultPrevented = true;
		this.cancelBubble = true;
	};
	
	/**
	 * Cancels the event if it is cancelable, without stopping further propagation of the event.
	 */
	PB.$.Event.prototype.preventDefault = function () {
		
		this.returnValue = false;
	};

	/**
	 * Destroy element cache
	 *
	 * We added element to cache entry so make sure there are no 
	 * references that could stick
	 */
	function destroyCache () {

		PB.$.cache = null;

		window.detachEvent('onunload', destroyCache);
	}

	// Destroy cache in case of older IE browsers
	window.attachEvent('onunload', destroyCache);
	
})(context || this, PB);

var requestXMLHttpRequest = 'XMLHttpRequest' in context;

/*
PB.Request.defaultSend
PB.Request.defaultSuccess
PB.Request.defaultError
PB.Request.defaultEnd
PB.Request.defaultAbort

PB.Request.default('success', function () {
	
})

// Add callback for all PB.Request instances
PB.Request.add('success', function () {});
PB.Request.global('success', function () {});
PB.Request.forAll('success', function () {});
PB.Request.all('success', function () {});
*/

/**
 * Request class
 *
 * 
 */
PB.Request = PB.Class(PB.Observer, {

	// Xhr, instance of XMLHttpRequest
	xhr: null,
	
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
			xhr = this.getTransport(),
			url = options.url,
			method = options.method.toUpperCase(),
			// Assign query string or null/false/undefined/empty string
			query = PB.type(options.data) === 'object' ? PB.Request.buildQueryString( options.data ) : options.data;

		// Clear previous abort timer
		clearTimeout(this.abortTimer);

		// Add query string to url for GET / DELETE request types
		if( query && (method === 'GET' || method === 'PUT') ) {

			url += (url.indexOf('?') === -1 ? '?' : '&')+query;
			query = null;
		}

		// Attach onreadystatechange listener
		if( async ) {

			xhr.onreadystatechange = this.onreadystatechange.bind(this);
		}

		// Open connection
		xhr.open( method, url, async );

		// Set post / put header
		if( method === 'POST' || method === 'PUT' ) {

			xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded; charset='+this.charset );
		}

		// Set headers
		PB.each(options.headers, function( name, val ){

			xhr.setRequestHeader( name, val );
		});

		// Emit send event
		this.emit( 'send', xhr, 0 );

		// Send the request
		xhr.send( query || null );

		if( options.timeout > 0 ) {

			this.abortTimer = setTimeout(this.abort.bind(this), options.timeout*1000);
		}

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

		// Cleanup memory
		this.xhr.onreadystatechange = null;
		
		this.xhr.abort();

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
		
		// Match header and headers
		if( key.substr(0, 6) === 'header' ) {

			PB.overwrite(this.options.headers, value);
		} else {

			this.options[key] = value;
		}

		return this;
	},

	/**
	 * Get new transport object
	 *
	 * @return {XmlHttpRequest}
	 */
	getTransport: function () {

		// IE < 8 has troubles with a reusable xmlHttpRequest object
		// In this case we always return a new xmlHttpRequest instance
		if( this.xhr && requestXMLHttpRequest ) {

			return this.xhr;
		}

		// Abort previous request if any
		if( this.xhr ) {

			this.xhr.abort();
		}

		this.xhr = requestXMLHttpRequest ?
			new XMLHttpRequest() :
			new ActiveXObject('Microsoft.XMLHTTP');

		return this.xhr;
	},

	/**
	 * Handle onreadystatechange event
	 */
	onreadystatechange: function () {

		var xhr = this.xhr,
			options = this.options,
			type;

		// Request has finished
		if( xhr.readyState === 4 ) {

			clearTimeout(this.abortTimer);

			xhr.responseJSON = null;

			switch ( xhr.status ) {

				case 200:
				case 201:
				case 204:
				case 304:
					type = 'success';

					// If request is a json call then decode json response
					if( options.json || xhr.getResponseHeader('Content-type').indexOf( 'application/json' ) >= 0 ) {

						try {
							
							xhr.responseJSON = JSON.parse( xhr.responseText );
						} catch ( e ) {}
					}
					break;
				default:
					type = 'error';
			}

			// Cleanup memory
			this.xhr.onreadystatechange = null;

			// Emit error or success and end
			this.emit(type, xhr, xhr.status);
			this.emit('end', xhr, xhr.status);
		}
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

		// Note, Do not send headers when requesting crossdomain requests
		'X-Requested-With': 'XMLHttpRequest',
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
	},
	encoding: 'UTF-8',
	// Todo: timeout
	timeout: 0,
	// Is crossdomain request
	crossdomain: false
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

					query += encodeURIComponent(prefix ? prefix+(type === 'array' ? '[]' : '['+key+']') : key)+
						'='+encodeURIComponent( value )+'&';
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
	
	// Remove forEach
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
PB.get('file.json', {foo: 'bar'}, function ( t ) {
	
	alert("Done!");
});

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
