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
				options.effect = PB.String.decamelize(args[i]);
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

		// Force computation, some browsers (atleast firefox) need to calculate the current styles
		// before it will apply the end styles.
		doc.defaultView.getComputedStyle( this );

		/* if doc.defaultView.getComputedStyle( this ); doest not work, use the this
		PB.each(properties, function ( property ) {
			
			element.getStyle( property, true );
		});*/

		// Start transition
		element.setStyle(properties);

		// Our callback is handles with timeout, an easy crossbrowser solution.
		// Todo: could this lead to a memory leak? Timer (closure that leads to the parent function..)
		data.timer = setTimeout(function () {

			// Make sure the element still exists
			if( !element[0] ) {

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
		}, (options.duration*1000)+60);	// Add a small delay, so the animation is realy finished

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
		data.end.transition = '';

		// Stop animation
		if( gotoEnd ) {

			// Some browsers (firefox) has real trouble stopping a transition. So reset
			// all styles and force style re-calculation by the browser.
			PB.each(data.end, function ( property ) {
				
				element
					.setStyle(property, '')
					.getStyle(property, true);
			});
		} else {

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
