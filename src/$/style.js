	// Used for tests
var div = document.createElement('div'),
	// Vendor prefixes
	// We could probably drop ms :) http://www.impressivewebs.com/dropping-ms-vendor-prefixes-ie10/
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
