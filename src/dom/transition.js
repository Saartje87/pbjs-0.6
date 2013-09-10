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
