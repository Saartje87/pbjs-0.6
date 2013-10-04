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
 * Build date 2013-10-04 10:35
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

                    var _parent;

                    if( !this ) {

                        return _constructor.apply( this, arguments );
                    }

                    _parent = this.parent;

                    this.parent = parentPrototype.construct;

                    _constructor.apply( this, arguments );

                    this.parent = _parent;
                };

                if( typeof constructor === 'function' ) {
                    
                    return constructor.apply( this, arguments );
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

		return new Dom(selector);
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

			return $doc.find(selector, true);
		}
	}

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
};

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
	},

	/**
	 * Serialize form data
	 *
	 * Will throw an error if no form is found in set
	 *
	 * @param {Object} formData
	 */
	serializeForm: function () {

		var i = 0,
			j = 0,
			data = {},
			formElements,
			element,
			type,
			isGroup = /radio|checkbox/i,
			exclude = /file|undefined|reset|button|submit|fieldset/i;

		for( ; i < this.length; i++ ) {

			if( this[i].nodeName === 'FORM' ) {

				formElements = this[i].elements;

				for( ; j < formElements.length; j++ ) {

					element = formElements[j];
					type = element.type;

					if( element.name && !exclude.test(type) && !(isGroup.test(type) && !element.checked) ) {

						data[element.name] = new this.constructor(element).getValue();
					}
				}

				return data;
			}
		}

		// No form element given
		throw new Error('Form not found'); // A tought, where selector is css expression 'Form not found ['+this.selector+']'
	}
});
	// Used for tests
var div = document.createElement('div'),
	//
	rpixel = /^-?[\d.]+px$/i,
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

					// Add px when value is a number and property is a px value
					if( typeof value === 'number' && !skipUnits[prop] ) {
						
						value += 'px';
					}

					// Use hook
					if( PB.$.hooks['setStyle.'+prop] ) {

						PB.$.hooks['setStyle.'+prop](this[i], value);
					}
					// Use normal setter
					else {

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
			prefixStyleName = prefixStyles[styleName] || styleName,
			hook = PB.$.hooks['getStyle.'+styleName];

		// Store inline value
		value = this[0].style[prefixStyleName];

		if( calculated || !value || value === 'auto' ) {

			value = window.getComputedStyle(this[0], null)[prefixStyleName];

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

			value = rpixel.test(value) ? parseInt(value, 10) : value;
		}

		// If a hook is specified use the hook
		return hook ? hook(this[0], value, prefixStyleName) : value;
	}
});

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

		this.length = 0;

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

				for ( ; i < children.length; i++) {

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

	/**
	 *
	 */
	setText: function ( value ) {

		var i = 0;

		// Append text to every element
		for( ; i < this.length; i++ ) {

			this[i].textContent = value;
		}

		return this;
	},

	/**
	 *
	 */
	getText: function () {

		return this[0].textContent;
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

	/**
	 * Get scroll position left/top from the first element in the set.
	 *
	 * When first element is not element node, this will return position of scroll in viewport
	 *
	 * @return {Object} {top: x, left: x}
	 */
	getScroll: function () {

		return {

			top: this[0].nodeType === 1 ? this[0].scrollTop : Math.max(docElement.scrollTop, doc.body.scrollTop),
			left: this[0].nodeType === 1 ? this[0].scrollLeft : Math.max(docElement.scrollLeft, doc.body.scrollLeft)
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

		var i = 0;

		for( ; i < this.length; i++ ) {

			this[i].style.display = domGetStorage(this[i])['css-display'] || 'block';
		}

		return this;
	},

	/**
	 * Hides every element in the set.
	 */
	hide: function () {

		var display,
			i = 0;

		for( ; i < this.length; i++ ) {

			display = PB.$(this[i]).getStyle('display');

			// Store css display value
			if( display !== 'none' ) {

				domGetStorage(this[i])['css-display'] = display;
			}

			// Hide element
			this[i].style.display = 'none';
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
	 *
	 * @return {Object} PB.$
	 */
	parent: function () {

		return PB.$(this[0].parentNode);
	},

	/**
	 * Returns the children for the first element in the set.
	 * When element has no children it will return null
	 *
	 * @return {Object} PB.$ or null
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

		return elements.length ? new this.constructor(elements) : null;
	},

	/**
	 * Returns the child from the first element in the set at a specifed index.
	 *
	 * @param {Number}
	 * @return {Object} PB.$ or null
	 */
	childAt: function( index ) {

		var children = this.children();

		return children && children[index] ? PB.$(children[index]) : null;
	},

	/**
	 * Returns the first child from the first element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	firstChild: function () {

		return PB.$(this[0].firstElementChild || this[0].firstChild);
	},

	/**
	 * Returns the first child from the first element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	lastChild: function () {

		return PB.$(this[0].lastElementChild || this[0].lastChild);
	},

	/**
	 * Returns the first element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	first: function () {

		return PB.$(this[0]);
	},

	/**
	 * Returns the last element in the set.
	 *
	 * @return {Object} PB.$ or null
	 */
	last: function () {

		return PB.$(this[this.length-1]);
	},

	/**
	 * Retrieve next sibling from first element in set
	 *
	 * @return {Object} PB.$ or null
	 */
	next: function () {

		return PB.$(this[0].nextElementSibling || this[0].nextSibling);
	},

	/**
	 * Retrieve previous sibling from first element in set
	 *
	 * @return {Object} PB.$ or null
	 */
	prev: function () {

		return PB.$(this[0].previousElementSibling || this[0].previousSibling);
	},

	/**
	 * Retrieve next sibling from first element in set
	 *
	 * @param {String} css expression
	 * @param {Number} number of parent to follow
	 * @return {Object} PB.$ or null
	 */
	closest: function ( expression, maxDepth ) {

		var node = this[0];

		maxDepth = maxDepth || 50;

		do {

			if( PB.$.selector.matches( node, expression ) ) {

				return PB.$(node);
			}

			if( !--maxDepth ) {

				break;
			}

		} while ( node = node.parentNode );

		return null;
	},

	/**
	 * 
	 *
	 * @return {Object} PB.$ or null
	 */
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
	 * Check whether first element in the set contains the given element
	 *
	 * @param {mixed} valid PB.$ argument
	 * @return {Boolean}
	 */
	contains: function ( element ) {

		var node = this[0];

		element = PB.$(element);

		if( !node || !element ) {

			return false;
		}

		return node.contains
			? node.contains(element[0])
			: !!(node.compareDocumentPosition(element[0]) & 16);
	},

	/**
	 * Returns all matched elements by CSS expression for every element in the set.
	 *
	 * @param {String} css expression
	 * @param {Boolean} *default false* true => find method return null if no elements matched
	 * @return {Object} PB.$ or null
	 */
	find: function ( expression, nullable ) {

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
		return elements.length || !nullable ? new this.constructor(elements) : null;
	},

	/**
	 * Check whether the given selector matches all elements in the set
	 *
	 * @param {String} css expression
	 * @return {Boolean}
	 */
	matches: function ( expression ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			// Using qwery for selector validation
			if( !PB.$.selector.matches(this[i], expression) ) {

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

	mouseEvents = 'altKey ctrlKey metaKey shiftKey which pageX pageY which'.split(' ');

/**
 *
 */
function Event ( originalEvent, element ) {

	var hooks = Event.hooks,
		type = originalEvent.type,
		key;

	this.originalEvent = originalEvent;
	this.currentTarget = element;

	// Extend with standard event properties
	this.extend(standardEvents);

	// Any hooks for this event.type ?
	for( key in Event.hooks ) {

		if( hooks.hasOwnProperty(key) && hooks[key].matches.test(type) ) {

			hooks[key].hook(this, originalEvent);
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

		var element = PB.$.cache[pbid] && PB.$.cache[pbid].element,
			event,
			relatedTarget;

		if( !element ) {

			return;
		}

		event = new Event(originalEvent, element);

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

			if( element === relatedTarget || (element.contains && element.contains(relatedTarget)) ) {

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

			// Some events need manual trigger, like element.focus() make sure the method exsits on given element
			if( (manual && eventName in this[i]) || (this[i].nodeName === 'input' && eventName === 'click') ) {

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
PB.Queue = PB.Class({

	construct: function () {

		this.stack = [];
		this.length = 0;
		this.state = PB.Queue.STATE_IDLE;

		this._next = this.next.bind(this);
	},

	add: function ( fn, context ) {

		this.length++;

		this.stack.unshift(fn.bind(context || fn, this._next));

		return this;
	},

	run: function () {

		var i = 0,
			queue = this.stack,
			fn;

		if( this.state === PB.Queue.STATE_INPROGRESS || !queue.length ) {

			return this;
		}

		this.state = PB.Queue.STATE_INPROGRESS;

		fn = this.stack.pop();

		fn();

		return this;
	},

	next: function () {

		this.state = PB.Queue.STATE_IDLE;

		this.run();
	},

	empty: function () {

		this.stack.length = 0;
		this.state = PB.Queue.STATE_IDLE;
	}
});

PB.Queue.STATE_IDLE = 0;
PB.Queue.STATE_INPROGRESS = 1;

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

/**
 * Css transition function
 *
 * Uses hooks for animation fallbacks
 *
 * @param {Object} Css properties to be animated
 */
PB.$.fn.transition = function ( properties ) {

	// Normalize arguments
	var options = morphArgsToObject(arguments);

	options.properties = properties;

	PB.$.hooks['transition'].call(this, options);

	return this;
};

PB.$.hook('transition', function ( options ) {

	return this.each(function () {

		var element = PB.$(this),
			queue = element.getData('pbjs-fx-queue'),
			properties = options.properties;

		if( !queue ) {

			queue = new PB.Queue();
			element.setData('pbjs-fx-queue', queue);
		}

		queue.add(function ( next, data ) {

			var data = {},
				currentStyles = {

					transition: 'all '+options.duration+'s '+options.effect+' 0s'
				};

			// Store 
			data.end = properties;
			data.fn = options.fn;

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

				next();
			}, (options.duration*1000)+50);	// Add a small delay, so the animation is realy finished
		});

		queue.run();
	});
});

if( !prefixStyles.transition ) {

	/**
	 * Set styles directly for every element. This is used when the
	 * browser does not support css transitions.
	 */
	PB.$.hook('transition', function ( properties, options ) {

		// Normalize arguments
		var i = 0;

		// Set css styles
		this.setStyle(properties);

		// Trigger callbacks, if given
		if( options.fn ) {
			
			for( ; i < this.length; i++ ) {

				options.fn( PB.$(this[i]) );
			}
		}

		return this;
	});
}

/**
 * Stop animation, if any in queue, start next
 */
PB.$.fn.stop = function ( gotoEnd, clearQueue ) {

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

PB.$.fn.morph = PB.$.fn.transition;
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
var supportXMLHttpRequest = 'XMLHttpRequest' in context;

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
		if( this.xhr && supportXMLHttpRequest ) {

			return this.xhr;
		}

		// Abort previous request if any
		if( this.xhr ) {

			this.xhr.abort();
		}

		this.xhr = supportXMLHttpRequest ?
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

(function ( context ) {

//'use strict';

var PB = context.PB,
	
	// References
	slice = Array.prototype.slice,
	toString = Object.prototype.toString;

// Date
PB.extend(Date, {
	
	now: function () {
		
		return +new Date;
	}
});

// Function
PB.extend(Function.prototype, {
	
	/**
	 * Created a wrapper function around the `this` object
	 * 
	 * @param mixed scope
	 * @param [mixed] additional arguments
	 * @return function
	 */
	bind: function ( scope/*, arg1, argN*/ ) {
		
		var _args = slice.call(arguments, 1),
			fn = this;

		if( typeof this !== 'function' ) {

			throw new TypeError();
		}

		return function () {

			return fn.apply(scope, _args.concat(slice.call(arguments, 0)));
		};
	}
});

// Object
PB.extend(Object, {
	
	/**
	 * Retrieve keys from object as array
	 * 
	 * @param object object
	 * @return array
	 */
	keys: function ( object ) {

		var result = [],
			key;
		
		if ( this === null || PB.type(object) === 'object' ) {

			throw new TypeError();
		}

		for( key in object ) {
				
			if( object.hasOwnProperty(key) ) {

				result.push(key);
			}
		}

		return result;
	}
});

/**
 * Implementation to check if object is an array
 *
 * @param mixed object
 * @return boolean
 */
PB.extend(Array, {
	
	isArray: function ( object) {
		
		return PB.is('Array', object);
	}
});

PB.extend(Array.prototype, {
	
	/**
	 * Iterate trough array
	 *
	 * @param function fn
	 * @param mixed scope
	 * @param void
	 */
	forEach: function ( fn, scope ) {
		
		if ( this === null || typeof fn !== 'function' ) {

			throw new TypeError();
		}
		
		var length = this.length,
			i = 0;
		
		while ( i < length ) {
			
			fn.call(scope, this[i], i, this);
			
			i++;
		}
	},
	
	/**
	 * Searches the given array for a value and returns the found index or -1 if none found
	 *
	 * Note! Comparsion is done with ===
	 *
	 * @param mixed searchValue
	 * @param integer startIndex
	 * @return integer
	 */
	indexOf: function ( searchValue, startIndex ) {
		
		if ( this === null ) {

			throw new TypeError();
		}
		
		var length = this.length;
		
		startIndex = startIndex || 0;
		
		if( length <= startIndex || length === 0 ) {
			
			return -1;
		}
		
		while( startIndex < length ) {
			
			if ( this[startIndex] === searchValue ) {
				
				return startIndex;
			}
			
			startIndex++;
		}

	    return -1;
	},
	
	/**
	 * Searches the given array reversed for a value and returns the found index or -1 if none found
	 *
	 * Note! Comparsion is done with ===
	 *
	 * @param mixed searchValue
	 * @param integer stopIndex
	 * @return integer
	 */
	lastIndexOf: function ( searchValue, stopIndex ) {
		
		if ( this === null ) {

			throw new TypeError();
		}
		
		var length = this.length;
		
		stopIndex = stopIndex || 0;
		
		if( length <= stopIndex || length === 0 ) {
			
			return -1;
		}
		
		while( stopIndex <= length ) {
		
			length--;
			
			if ( this[length] === searchValue ) {
				
				return length;
			}
		}

	    return -1;
	},
	
	/**
	 * Iterate trough array and return new array with filtered values
	 *
	 * @param function fn
	 * @param scope mixed
	 * @return array
	 */
	filter: function ( fn, scope ) {
		
		if ( this === null || typeof fn !== "function" ) {
			
			throw new TypeError();
		}

		var result = [],
			i = 0,
			length = this.length;
		
		while ( i < length ) {
			
			if( !!fn.call(scope, this[i], i, this) ) {

				result.push( this[i] );
			}
			
			i++;
		}

		return result;
	},
	
	/**
	 * Return new array with modified values
	 *
	 * @param function fn
	 * @param mixed scope
	 * @return boolean
	 */
	map: function ( fn, scope ) {
		
		if ( this === null || typeof fn !== "function" ) {

			throw new TypeError();
		}

		var length = this.length,
			result = new Array( length ),
			i = 0;
		
		while ( i < length ) {
			
			if( i in this ) {
				
				result[i] = fn.call(scope, this[i], i, this);
			}

			i++;
		}

		return result;
	}
});

var doc = context.document,
	docElement = doc.documentElement,
	body = doc.body,

	div = document.createElement('div'),
	style = div.style

	legacyEventModel = context.attachEvent && !context.addEventListener,
	supportsTextContent = div.textContent !== undefined,
	supportsOpacityProperty = style.opacity !== undefined,
	supportsGetComputedStyle = !!window.getComputedStyle,
	supportsCssTransition = 'transition' in style || 'MozTransition' in style || 'WebkitTransition' in style,
	supportQuerySelectorAll = !!document.querySelectorAll,
	supportMatchesSelector = !!(docElement.matchesSelector || docElement.mozMatchesSelector || docElement.webkitMatchesSelector || docElement.oMatchesSelector || docElement.msMatchesSelector);

// Clear memory
div = null;

var ropacity = /alpha\(opacity=(.*)\)/i,
	rpixel = /^-?[\d.]+px$/i,
	rnum = /^-?[\d.]/;

// IE < 9 opacity support
if( !supportsOpacityProperty ) {

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
if( !supportsGetComputedStyle ) {

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
			targetNode,
			hook = PB.$.hooks['getStyle.'+styleName],
			node = this[0];

		// If a hook is specified use the hook
		if( hook ) {

			return hook(node);
		}

		// Get inline value
		value = node.style[styleName];

		// Do some magic when no value or when it should be calculated
		if( calculated || !value || value === 'auto' ) {

			// Substract borders from offsetWidth and offsetHeight
			if( styleName === 'width' ) {

				return node.offsetWidth - this.getStyle('borderLeftWidth', true) - this.getStyle('borderRightWidth', true);
			}

			if( styleName === 'height' ) {

				return node.offsetHeight - this.getStyle('borderTopWidth', true) - this.getStyle('borderBottomWidth', true);
			}

			// Get current style
			value = node.currentStyle[styleName];

			// Awesomo trick! from http://blog.stchur.com/2006/09/20/converting-to-pixels-with-javascript/
			// Calculate non pixel values

			// Is not a pixel number
			//if( value && !rpixel.test(value) && !rnum.test(value) ) {
			if( value && /em|%|pt|border/.test(value) ) {

				div = document.createElement('div');
				div.style.cssText = 'visbility: hidden; position: absolute; line-height: 0;';

				// 
				if( value === 'auto' || value.lastIndexOf('%') > 0 ) {

					targetNode = node.parentNode;
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
		return rpixel.test(value) ? parseInt(value, 10) : value;
	};
}

// Create a fallback for the morph method if transition are not supported
if( !supportsCssTransition ) {

	PB.$.hook('transition', function ( options ) {

		this.stop(false);

		return this.each(function () {

			var element = PB.$(this),
				queue = element.getData('pbjs-fx-queue'),
				properties = options.properties;

			if( !queue ) {

				queue = new PB.Queue();
				element.setData('pbjs-fx-queue', queue);
			}

			queue.add(function ( next, data ) {

				var //element = PB.$(this),
					currentStyles = {},
					styleValueDiff = {},
					animation;

				// Calculate current styles
				PB.each(properties, function ( property ) {
					
					currentStyles[property] = element.getStyle(property, true);
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

						if( pos === 1 ) {

							options.fn && options.fn( element );

							next();
						}
					}
				}).start();

				element.setData('morph', animation);
			});

			queue.run();
		});
	});

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

/**
 * Event normalisation for browsers with older event model
 */
if( legacyEventModel ) {

	PB.overwrite(PB.$.Event.hooks, {

		fixes: {

			matches: /(!?)/,
			hook: function ( event, originalEvent ) {

				event.target = originalEvent.srcElement || originalEvent.toElement;

				// Add correct value for which
				event.which = (event.keyCode === undefined) ? event.charCode : event.keyCode;

				// Normalize mouse button codes..
				// left: 0, middle: 1, right: 2
				event.which = (event.which === 0 ? 1 : (event.which === 4 ? 2: (event.which === 2 ? 3 : event.which)));
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
				event.which = originalEvent.keyCode || originalEvent.charCode;

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
		
		this.originalEvent.defaultPrevented = true;
		this.originalEvent.cancelBubble = true;
	};

	/**
	 * Cancels the event if it is cancelable, without stopping further propagation of the event.
	 */
	PB.$.Event.prototype.preventDefault = function () {
		
		this.originalEvent.returnValue = false;
	};

	/**
	 * Destroy element cache
	 *
	 * We added element to cache entry so make sure there are no 
	 * references that could stick
	 */
	function destroyCache () {

		PB.$.cache = null;

		context.detachEvent('onunload', destroyCache);
	}

	// Destroy cache in case of older IE browsers
	context.attachEvent('onunload', destroyCache);
}

/**
 * Add qwery to pbjs
 *
 * Using ready method to ensure qwery is loaded
 */
if( !supportQuerySelectorAll ) {

	PB.$.selector.find = function ( expression, element ) {

		return qwery(expression, element);
	};
}

if( !supportMatchesSelector ) {

	PB.$.selector.matches = function ( element, expression ) {

		return qwery.is(element, expression);
	};
}
if( !supportsTextContent ) {

	/**
	 *
	 */
	PB.$.fn.setText = function ( value ) {

		var i = 0;

		// Empty elements
		this.setHtml('');

		// Append text to every element
		for( ; i < this.length; i++ ) {

			this[i].appendChild(doc.createTextNode(value));
		}

		return this;
	};

	/**
	 *
	 */
	PB.$.fn.getText = function () {

		return this[0].innerText;
	};
}

})(this);

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
