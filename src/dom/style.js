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
