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
