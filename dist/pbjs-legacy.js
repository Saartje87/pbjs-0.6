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
 * Build date 2013-08-27 13:53
 */
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

	PB.$.fn.transition = function ( properties ) {

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
