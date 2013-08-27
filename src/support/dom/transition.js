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
