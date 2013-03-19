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
 * Build date 2013-03-19 20:33
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
}

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

		var item = this._queue.shift(),
			self = this;

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

	// Already extended
	if( selector instanceof $ ) {

		return selector;
	}

	// If already a node, return new $ instance
	// element and document nodes are valid
	if( selector.nodeType === 1 || selector.nodeType === 9 || selector === window ) {

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
			return PB.$.buildFragment(selector);
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

/**
 * $ constructor
 */
$ = function ( collection ) {

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

$.prototype.constructor = $;

// For extending PB.$ methods
PB.$.fn = $.prototype;

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

		// Add normal property to prefixStyles, so we know the browers supports the css property
		return prefixStyles[prop] = prop;
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

		// If a hook is specified use the hook
		if( PB.$.hooks['setStyle.'+styleName] ) {

			return PB.$.hooks['getStyle.'+styleName]( this[0] );
		}

		// Need prefix?
		styleName = prefixStyles[styleName] || styleName;
		value = this[0].style[styleName];

		if( calculated || !value || value === 'auto' ) {

			value = window.getComputedStyle( this[0], null )[styleName];
		}

		if( styleName === 'opacity' ) {
			
			return value ? parseFloat(value) : 1.0;
		}

		// Parse to int when value is a pixel value
		return /^-?[\d.]+px$/i.test( value ) ? parseInt(value, 10) : value;
	}
});

/**
 * Convert arguments to ordered object
 */
function morphArgsToObject ( args ) {

	// Default options
	var options = {
		
		duration: .4,
		effect: 'ease'
	};
	
	// Loop trough args
	for( var i = 1 ; i < args.length; i++ ) {

		switch( typeof args[i] ) {
			
			case 'function':
				options.fn = args[i];
				break;

			case 'number':
				options.duration = args[i];
				break;
		
			case 'string':
				// easeInOut -> ease-in-out
				options.effect = args[i].replace(/[A-Z]/g, function ( chr ) {

					return '-'+chr.toLowerCase();
				});
				break;
		}
	}
	
	return options;
}

// Detect browser feature
$.prototype.morph = !!prefixStyles.transition ?
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
}

$.prototype.stop = function ( gotoEnd ) {

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
}

PB.overwrite($.prototype, {
	
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
PB.overwrite($.prototype, {

	width: function () {

		return this.getStyle('width', true);
	},

	innerWidth: function () {

		return this.getStyle('width', true) + this.getStyle('paddingLeft', true) + this.getStyle('paddingRight', true);
	},

	outerWidth: function () {

		return this.innerWidth() + this.getStyle('borderLeftWidth', true) + this.getStyle('borderRightWidth', true);
	},

	scrollWidth: function () {

		return this[0].scrollWidth;
	},

	height: function () {

		return this.getStyle('height', true);
	},

	innerHeight: function () {

		return this.getStyle('height', true) + this.getStyle('paddingTop', true) + this.getStyle('paddingBottom', true);
	},

	outerHeight: function () {

		return this.innerHeight() + this.getStyle('borderTopWidth', true) + this.getStyle('borderBottomWidth', true);
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
		}
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
	}
});
PB.overwrite($.prototype, {

	each: function ( fn ) {

		var _args = slice.call( arguments, 1 );

		for( var i = 0; i < this.length; i++ ) {

			fn.apply(this[i], _args);
		}

		return this;
	},

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
	 */
	isVisible: function () {

		var element = PB.$(this[0]);

		return element.getStyle('display') !== 'none' && element.getStyle('opacity') > 0;
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
			i = 0,
			l;

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

		var node = this[0].firstElementChild || this[0].firstChild,
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

	closest: function () {


	},

	contains: function () {


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
/**
 * 'Extend the event object'
 *
 * Methods declared in here are later available trough the event object
 */
PB.$.Event = {

	/**
	 * Short for preventDefault() and stopPropagation()
	 */
	stop: function stop () {
		
		this.preventDefault();
	    this.stopPropagation();
	},
	
	/**
	 * Mousewheel normalisation
	 * 
	 * Thanks Mootools
	 *
	 * @return {Number}
	 */
	getWheel: function () {
		
		if( pbEvent.rmousescroll.test(this.type) ) {

			return this.wheelDelta ? this.wheelDelta / 120 : -(this.detail || 0) / 3;
		}
		
		return 0;
	}
};

/**
 * Browser support
 */
var domEvent = {

	// Browser using old event model
	isLegacy: !!(window.attachEvent && !window.addEventListener),

	// Regexp to detect mousewheel event
	rmousescroll: /DOMMouseScroll|mousewheel|wheel/,
	
	// Event types that should fired trough node.`type`()
	rhtmlevent: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,

	// Mouse events, used for emit detection
	rmouseevent: /^(?:click|mouse(?:down|up|over|move|out))$/,
	
	// Support mouseenter/leave
	supportmouseenterleave: 'onmouseenter' in docElement && 'onmouseleave' in docElement
};

/**
 * Detect legacy browser (ie 7/8 supported)
 *
 * Opera implemented both event systems but isn't a legacy browser so
 * checking for addEventListener
 */
if( domEvent.isLegacy ) {
	
	PB.overwrite(PB.$.Event, {
		
		/**
		 * Prevents further propagation of the current event.
		 */
		stopPropagation: function () {
			
			this.cancelBubble = true;
		},
		
		/**
		 * Cancels the event if it is cancelable, without stopping further propagation of the event.
		 */
		preventDefault: function () {
			
			this.returnValue = false;
		}
	});
}

/**
 * Extend event object at runtime
 *
 * For older browsers (IE7/8) we normalize the event object
 */
function domExtendEvent ( event, element ) {

	PB.overwrite(event, PB.Event);

	// Enough extending for modern browsers
	if( !domEvent.isLegacy ) {

		return event;
	}

	// Add target
	event.target = event.srcElement || element;

	// Add currentTarget
	event.currentTarget = element;

	// set relatedTarget
	if( event.type === 'mouseover' || event.type === 'mouseenter' ) {
	
		event.relatedTarget = event.fromElement;
	} else if ( event.type === 'mouseout' || event.type === 'mouseleave' ) {
	
		event.relatedTarget = event.toElement;
	}

	// Set pageX/pageY
	if( event.pageX === undefined ) {

		event.pageX = event.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0);
		event.pageY = event.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0);
	}

	// Set which
	event.which = (event.keyCode === undefined) ? event.charCode : event.keyCode;

	// Normalize mousebutton codes to W3C standards
	// Left: 0, Middle: 1, Right: 2
	event.which = (event.which === 0 ? 1 : (event.which === 4 ? 2: (event.which === 2 ? 3 : event.which)));

	return event;
}

/**
 * Return a function wrapper that handles the scope and event extending
 */
function eventResponder ( fn, element, context ) {
		
	return function ( event ) {
		
		// Extend event
		event = domExtendEvent( event, element );
		
		// Execute callback, use context as scope otherwise the given element
		fn.call( context || element, event );
	};
}

/**
 * Attach event to element
 */
function domAddEvent ( element, name, fn, context ) {

	var storage = domGetStorage(element),
		i = 0,
		data,
		responder;

	// Create storage entries if not defined
	storage.eventData = storage.eventData || {};
	storage.eventData[name] = storage.eventData[name] || [];

	data = storage.eventData[name];

	// If the callback is already registered, skip to next
	for( ; i < data.length; i++ ) {

		if( data[i].fn === fn ) {

			return;
		};
	}

	// Create responder, pass element as PB.$ object
	responder = eventResponder( fn, PB.$(element), context );

	// Add cache entry
	data[i] = {

		fn: fn,
		responder: responder
	};

	// Favor addEventListener for event binding
	if( window.addEventListener ) {

		element.addEventListener(name, responder, false);
	} else {

		element.attachEvent('on'+name, responder);
	}
}

/**
 * Remove event from element
 */
function domRemoveEvent ( element, name, fn ) {

	var data = domGetStorage(element).eventData,
		cachedEntry,
		i = data[name].length;

	// Find cache entry
	while ( i-- ) {
		
		if( data[name][i].fn === fn ) {
			
			cachedEntry = data[name][i];
			data[name].splice(i, 1);
			break;
		}
	}

	// No entry in cache
	if( !cachedEntry ) {
		
		return;
	}

	// Remove event
	if( window.removeEventListener ) {

		element.removeEventListener(name, cachedEntry.responder, false);
	} else {

		element.detachEvent('on'+name, cachedEntry.responder);
	}
}

/**
 * Purge all events from element
 */
function domPurgeEvents ( element ) {

	var storage = domGetStorage(element),
		data = storage.eventData,
		cachedEntry,
		i;

	// Get names from cache, click etc..
	for( name in data ) {
		
		if( data.hasOwnProperty(name) ) {
			
			cachedEntry = data[name];
			
			for( i = 0; i < cachedEntry.length; i++ ) {
				
				domRemoveEvent( element, name, cachedEntry[i].fn );
			}
		}
	}
	
	// Remove from eventCache
	delete storage.eventData;
}

PB.overwrite($.prototype, {

	/**
	 * Add event(s) to every element in the set. Multiple event types can be given seperated by a whitespace.
	 *
	 * @param {String}
	 * @param {Function}
	 * @param {Object}
	 * @return this
	 */
	on: function ( name, fn, context ) {

		var i = 0,
			names = name.split(' '),
			l = names.length,
			j;

		for( ; i < this.length; i++ ) {

			for( j = 0; j < l; j++ ) {

				domAddEvent(this[i], names[j], fn, context);
			}
		}

		return this;
	},

	once: function () {

		
	},

	off: function ( name, fn ) {

		var i = 0,
			j,
			data;

		for( ; i < this.length; i++ ) {

			data = domGetStorage(this[i]).eventData;

			// No events
			if( !data && (name && !data[name]) ) {

				continue;
			}

			// Remove all events from element
			if( !name && !fn ) {

				domPurgeEvents( this[i] );
			}
			// Remove all listeners from given event name
			else if ( !fn ) {

				// Loop trough storage to get the original fn
				for( j = 0; j < data[name].length; j++ ) {

					domRemoveEvent( this[i], name, data[name][i].fn );
				}

				// Free memory
				delete data[name];
			}
			// Remove 
			else {

				domRemoveEvent( this[i], name, fn );
			}
		}

		return this;
	},

	emit: function ( type ) {

		var i = 0,
			element,
			event;

		for( ; i < this.length; i++ ) {

			element = this[i];

			// Handle html events, see _Event.HTMLEvents
			// Trigger direct trough node method for HTMLEvents and INPUT type
			// Input check is done for FireFox, failes to trigger input[type=file] with click event
			if( element.nodeName === 'INPUT' || domEvent.rhtmlevent.test(type) ) {

				element[type]();
			}
			// Dispatch trigger W3C event model
			else if( doc.createEvent ) {

				if ( domEvent.rmouseevent.test(type) ) {

					event = doc.createEvent('MouseEvents');

					event.initMouseEvent(
						type, true, true, window,		// type, canBubble, cancelable, view,
						0, 0, 0, 0, 0,					// detail, screenX, screenY, clientX, clientY,
						false, false, false, false,		// ctrlKey, altKey, shiftKey, metaKey,
						0, null);						// button, relatedTarget

					element.dispatchEvent(event);
				} else {

					event = doc.createEvent('Events');

					event.initEvent( type, true, true );

					element.dispatchEvent(event);
				}
			}
			// Dispatch trough legacy event model
			else {

				event = doc.createEventObject();
				element.fireEvent('on'+type, event);
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
}

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

		return matches.call(node, selector);
	}
};

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
			
			if( match[1] ) {

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
					if( value.lastIndexOf('%') > 0 ) {

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
		}
	}

	// Free memory
	div = null;
})(PB);

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

/*!
  * @preserve Qwery - A Blazing Fast query selector engine
  * https://github.com/ded/qwery
  * copyright Dustin Diaz 2012
  * MIT License
  */

(function (name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else context[name] = definition()
})('qwery', this, function () {
  var doc = document
    , html = doc.documentElement
    , byClass = 'getElementsByClassName'
    , byTag = 'getElementsByTagName'
    , qSA = 'querySelectorAll'
    , useNativeQSA = 'useNativeQSA'
    , tagName = 'tagName'
    , nodeType = 'nodeType'
    , select // main select() method, assign later

    , id = /#([\w\-]+)/
    , clas = /\.[\w\-]+/g
    , idOnly = /^#([\w\-]+)$/
    , classOnly = /^\.([\w\-]+)$/
    , tagOnly = /^([\w\-]+)$/
    , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
    , splittable = /(^|,)\s*[>~+]/
    , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
    , splitters = /[\s\>\+\~]/
    , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
    , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
    , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
    , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
    , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
    , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
    , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
    , tokenizr = new RegExp(splitters.source + splittersMore.source)
    , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')

  var walker = {
      ' ': function (node) {
        return node && node !== html && node.parentNode
      }
    , '>': function (node, contestant) {
        return node && node.parentNode == contestant.parentNode && node.parentNode
      }
    , '~': function (node) {
        return node && node.previousSibling
      }
    , '+': function (node, contestant, p1, p2) {
        if (!node) return false
        return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
      }
    }

  function cache() {
    this.c = {}
  }
  cache.prototype = {
    g: function (k) {
      return this.c[k] || undefined
    }
  , s: function (k, v, r) {
      v = r ? new RegExp(v) : v
      return (this.c[k] = v)
    }
  }

  var classCache = new cache()
    , cleanCache = new cache()
    , attrCache = new cache()
    , tokenCache = new cache()

  function classRegex(c) {
    return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
  }

  // not quite as fast as inline loops in older browsers so don't use liberally
  function each(a, fn) {
    var i = 0, l = a.length
    for (; i < l; i++) fn(a[i])
  }

  function flatten(ar) {
    for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
    return r
  }

  function arrayify(ar) {
    var i = 0, l = ar.length, r = []
    for (; i < l; i++) r[i] = ar[i]
    return r
  }

  function previous(n) {
    while (n = n.previousSibling) if (n[nodeType] == 1) break;
    return n
  }

  function q(query) {
    return query.match(chunker)
  }

  // called using `this` as element and arguments from regex group results.
  // given => div.hello[title="world"]:foo('bar')
  // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
  function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
    var i, m, k, o, classes
    if (this[nodeType] !== 1) return false
    if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
    if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
    if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
      for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
    }
    if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
    if (wholeAttribute && !value) { // select is just for existance of attrib
      o = this.attributes
      for (k in o) {
        if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
          return this
        }
      }
    }
    if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
      // select is for attrib equality
      return false
    }
    return this
  }

  function clean(s) {
    return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
  }

  function checkAttr(qualify, actual, val) {
    switch (qualify) {
    case '=':
      return actual == val
    case '^=':
      return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
    case '$=':
      return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
    case '*=':
      return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
    case '~=':
      return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
    case '|=':
      return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
    }
    return 0
  }

  // given a selector, first check for simple cases then collect all base candidate matches and filter
  function _qwery(selector, _root) {
    var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
      , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      , dividedTokens = selector.match(dividers)

    if (!tokens.length) return r

    token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
    if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
    if (!root) return r

    intr = q(token)
    // collect base candidates to filter
    els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
      function (r) {
        while (root = root.nextSibling) {
          root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
        }
        return r
      }([]) :
      root[byTag](intr[1] || '*')
    // filter elements according to the right-most part of the selector
    for (i = 0, l = els.length; i < l; i++) {
      if (item = interpret.apply(els[i], intr)) r[r.length] = item
    }
    if (!tokens.length) return r

    // filter further according to the rest of the selector (the left side)
    each(r, function (e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
    return ret
  }

  // compare element to a selector
  function is(el, selector, root) {
    if (isNode(selector)) return el == selector
    if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?

    var selectors = selector.split(','), tokens, dividedTokens
    while (selector = selectors.pop()) {
      tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
      dividedTokens = selector.match(dividers)
      tokens = tokens.slice(0) // copy array
      if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
        return true
      }
    }
    return false
  }

  // given elements matching the right-most part of a selector, filter out any that don't match the rest
  function ancestorMatch(el, tokens, dividedTokens, root) {
    var cand
    // recursively work backwards through the tokens and up the dom, covering all options
    function crawl(e, i, p) {
      while (p = walker[dividedTokens[i]](p, e)) {
        if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
          if (i) {
            if (cand = crawl(p, i - 1, p)) return cand
          } else return p
        }
      }
    }
    return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
  }

  function isNode(el, t) {
    return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
  }

  function uniq(ar) {
    var a = [], i, j;
    o:
    for (i = 0; i < ar.length; ++i) {
      for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
      a[a.length] = ar[i]
    }
    return a
  }

  function arrayLike(o) {
    return (typeof o === 'object' && isFinite(o.length))
  }

  function normalizeRoot(root) {
    if (!root) return doc
    if (typeof root == 'string') return qwery(root)[0]
    if (!root[nodeType] && arrayLike(root)) return root[0]
    return root
  }

  function byId(root, id, el) {
    // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
    return root[nodeType] === 9 ? root.getElementById(id) :
      root.ownerDocument &&
        (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
          (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
  }

  function qwery(selector, _root) {
    var m, el, root = normalizeRoot(_root)

    // easy, fast cases that we can dispatch with simple DOM calls
    if (!root || !selector) return []
    if (selector === window || isNode(selector)) {
      return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
    }
    if (selector && arrayLike(selector)) return flatten(selector)
    if (m = selector.match(easy)) {
      if (m[1]) return (el = byId(root, m[1])) ? [el] : []
      if (m[2]) return arrayify(root[byTag](m[2]))
      if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
    }

    return select(selector, root)
  }

  // where the root is not document and a relationship selector is first we have to
  // do some awkward adjustments to get it to work, even with qSA
  function collectSelector(root, collector) {
    return function (s) {
      var oid, nid
      if (splittable.test(s)) {
        if (root[nodeType] !== 9) {
          // make sure the el has an id, rewrite the query, set root to doc and run it
          if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
          s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
          collector(root.parentNode || root, s, true)
          oid || root.removeAttribute('id')
        }
        return;
      }
      s.length && collector(root, s, false)
    }
  }

  var isAncestor = 'compareDocumentPosition' in html ?
    function (element, container) {
      return (container.compareDocumentPosition(element) & 16) == 16
    } : 'contains' in html ?
    function (element, container) {
      container = container[nodeType] === 9 || container == window ? html : container
      return container !== element && container.contains(element)
    } :
    function (element, container) {
      while (element = element.parentNode) if (element === container) return 1
      return 0
    }
  , getAttr = function () {
      // detect buggy IE src/href getAttribute() call
      var e = doc.createElement('p')
      return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
        function (e, a) {
          return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
            e.getAttribute(a, 2) : e.getAttribute(a)
        } :
        function (e, a) { return e.getAttribute(a) }
    }()
  , hasByClass = !!doc[byClass]
    // has native qSA support
  , hasQSA = doc.querySelector && doc[qSA]
    // use native qSA
  , selectQSA = function (selector, root) {
      var result = [], ss, e
      try {
        if (root[nodeType] === 9 || !splittable.test(selector)) {
          // most work is done right here, defer to qSA
          return arrayify(root[qSA](selector))
        }
        // special case where we need the services of `collectSelector()`
        each(ss = selector.split(','), collectSelector(root, function (ctx, s) {
          e = ctx[qSA](s)
          if (e.length == 1) result[result.length] = e.item(0)
          else if (e.length) result = result.concat(arrayify(e))
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      } catch (ex) { }
      return selectNonNative(selector, root)
    }
    // no native selector support
  , selectNonNative = function (selector, root) {
      var result = [], items, m, i, l, r, ss
      selector = selector.replace(normalizr, '$1')
      if (m = selector.match(tagAndOrClass)) {
        r = classRegex(m[2])
        items = root[byTag](m[1] || '*')
        for (i = 0, l = items.length; i < l; i++) {
          if (r.test(items[i].className)) result[result.length] = items[i]
        }
        return result
      }
      // more complex selector, get `_qwery()` to do the work for us
      each(ss = selector.split(','), collectSelector(root, function (ctx, s, rewrite) {
        r = _qwery(s, ctx)
        for (i = 0, l = r.length; i < l; i++) {
          if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
        }
      }))
      return ss.length > 1 && result.length > 1 ? uniq(result) : result
    }
  , configure = function (options) {
      // configNativeQSA: use fully-internal selector or native qSA where present
      if (typeof options[useNativeQSA] !== 'undefined')
        select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
    }

  configure({ useNativeQSA: true })

  qwery.configure = configure
  qwery.uniq = uniq
  qwery.is = is
  qwery.pseudos = {}

  return qwery
});
