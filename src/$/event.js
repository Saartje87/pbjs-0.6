/**
 * 'Extend the event object'
 *
 * Methods declared in here are later available trough the event object
 */
PB.$.Event = {

	/**
	 * Short for preventDefault() and stopPropagation()
	 */
	stop: function stop () {
		
		this.preventDefault();
	    this.stopPropagation();
	},
	
	/**
	 * Mousewheel normalisation
	 * 
	 * Thanks Mootools
	 *
	 * @return {Number}
	 */
	getWheel: function () {
		
		if( pbEvent.rmousescroll.test(this.type) ) {

			return this.wheelDelta ? this.wheelDelta / 120 : -(this.detail || 0) / 3;
		}
		
		return 0;
	}
};

/**
 * Browser support
 */
var domEvent = {

	// Browser using old event model
	legacy: !!(window.attachEvent && !window.addEventListener),

	// Regexp to detect mousewheel event
	rmousescroll: /DOMMouseScroll|mousewheel|wheel/,
	
	// Event types that should fired trough node.`type`()
	rhtmlevent: /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,

	// Mouse events, used for emit detection
	rmouseevent: /^(?:click|mouse(?:down|up|over|move|out))$/,
	
	// Support mouseenter/leave
	supportmouseenterleave: 'onmouseenter' in docElement && 'onmouseleave' in docElement
};

/**
 * Extend event object at runtime
 *
 * For older browsers (IE7/8) we normalize the event object
 */
function domExtendEvent ( event, element ) {

	PB.overwrite(event, PB.Event);

	return event;
}

/**
 * Return a function wrapper that handles the scope and event extending
 */
function eventResponder ( fn, element, context ) {
		
	return function ( event ) {
		
		// Extend event
		event = domExtendEvent( event, element );
		
		// Execute callback, use context as scope otherwise the given element
		fn.call( context || element, event );
	};
}

/**
 *
 */
function domAddEvent ( element, name, fn, context ) {

	var storage = domGetStorage(element),
		i = 0,
		data,
		responder;

	// Create storage entries if not defined
	storage.eventData = storage.eventData || {};
	storage.eventData[name] = storage.eventData[name] || [];

	data = storage.eventData[name];

	// If the callback is already registered, skip to next
	for( ; i < data.length; i++ ) {

		if( data[i].fn === fn ) {

			return;
		};
	}

	// Create responder
	responder = eventResponder( fn, this, context );

	// Add cache entry
	data[i] = {

		fn: fn,
		responder: responder
	};

	// Favor addEventListener for event binding
	if( window.addEventListener ) {

		element.addEventListener(name, responder, false);
	} else {

		element.attachEvent('on'+name, responder);
	}
}

/**
 *
 */
function domRemoveEvent ( element, name, fn ) {

	var data = domGetStorage(element).eventData,
		cachedEntry,
		i = data[name].length;

	// Find cache entry
	while ( i-- ) {
		
		if( data[name][i].fn === fn ) {
			
			cachedEntry = data[name][i];
			data[name].splice(i, 1);
			break;
		}
	}

	// No entry in cache
	if( !cachedEntry ) {
		
		return;
	}

	// Remove event
	if( window.removeEventListener ) {

		element.removeEventListener(name, cachedEntry.responder, false);
	} else {

		element.detachEvent('on'+name, cachedEntry.responder);
	}
}

/**
 *
 */
function domPurgeEvents ( element ) {

	console.log('domPurgeEvents');

	var storage = domGetStorage(element),
		data = storage.eventData,
		cachedEntry,
		i;

	// Get names from cache, click etc..
	for( name in data ) {
		
		if( data.hasOwnProperty(name) ) {
			
			cachedEntry = data[name];
			
			for( i = 0; i < cachedEntry.length; i++ ) {
				
				domRemoveEvent( element, name, cachedEntry[i].fn );
			}
		}
	}
	
	// Remove from eventCache
	delete storage.eventData;
}

PB.overwrite($.prototype, {

	/**
	 * Add event(s) to every element in the set. Multiple event types can be given seperated by a whitespace.
	 *
	 * @param {String}
	 * @param {Function}
	 * @param {Object}
	 * @return this
	 */
	on: function ( name, fn, context ) {

		var i = 0,
			names = name.split(' '),
			l = names.length,
			j;

		for( ; i < this.length; i++ ) {

			for( j = 0; j < l; j++ ) {

				domAddEvent(this[i], names[j], fn, context);
			}
		}

		return this;
	},

	once: function () {

		
	},

	off: function ( name, fn ) {

		var i = 0,
			j,
			data;

		for( ; i < this.length; i++ ) {

			data = domGetStorage(this[i]).eventData;

			// No events
			if( !data && (name && !data[name]) ) {

				continue;
			}

			// Remove all events from element
			if( !name && !fn ) {

				domPurgeEvents( this[i] );
			}
			// Remove all listeners from given event name
			else if ( !fn ) {

				// Loop trough storage to get the original fn
				for( j = 0; j < data[name].length; j++ ) {

					domRemoveEvent( this[i], name, data[name][i].fn );
				}

				// Free memory
				delete data[name];
			}
			// Remove 
			else {

				domRemoveEvent( this[i], name, fn );
			}
		}

		return this;
	},

	emit: function ( type ) {

		var i = 0,
			element,
			event;

		for( ; i < this.length; i++ ) {

			element = this[i];

			// Handle html events, see _Event.HTMLEvents
			// Trigger direct trough node method for HTMLEvents and INPUT type
			// Input check is done for FireFox, failes to trigger input[type=file] with click event
			if( element.nodeName === 'INPUT' || domEvent.rhtmlevent.test(type) ) {

				element[type]();
			}
			// Dispatch trigger W3C event model
			else if( doc.createEvent ) {

				if ( domEvent.rmouseevent.test(type) ) {

					event = doc.createEvent('MouseEvents');

					event.initMouseEvent(
						type, true, true, window,		// type, canBubble, cancelable, view,
						0, 0, 0, 0, 0,					// detail, screenX, screenY, clientX, clientY,
						false, false, false, false,		// ctrlKey, altKey, shiftKey, metaKey,
						0, null);						// button, relatedTarget

					element.dispatchEvent(event);
				} else {

					event = doc.createEvent('Events');

					event.initEvent( type, true, true );

					element.dispatchEvent(event);
				}
			}
			// Dispatch trough legacy event model
			else {

				event = doc.createEventObject();
				element.fireEvent('on'+type, event);
			}
		}

		return this;
	}
});