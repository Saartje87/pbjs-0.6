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
 * Build date 2013-08-26 23:17
 */
(function ( context ) {

'use strict';

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
		
		if ( this === null || PB.type(object) === object ) {

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
	}
	
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
			targetNode,
			hook = PB.$.hooks['setStyle.'+styleName],
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
			if( !/px$/.test(value) ) {

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

// Clear memory
div = null;

/**
 * Event fixes across browser
 *
 * IE < 9
 */
var doc = context.document,
	docElement = doc.documentElement,
	body = doc.body;

// Check if browser is using an old event model
if( context.attachEvent && !context.addEventListener ) {

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

		context.detachEvent('onunload', destroyCache);
	}

	// Destroy cache in case of older IE browsers
	context.attachEvent('onunload', destroyCache);
}

})();
