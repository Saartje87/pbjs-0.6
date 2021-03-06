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
