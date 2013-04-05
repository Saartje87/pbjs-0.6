	// Browser using an old event model
var legacy = !!(window.attachEvent && !window.addEventListener),
	// Does browser support mouseenter and mouseleave
	mouseenterleave = 'onmouseenter' in docElement && 'onmouseleave' in docElement,
	// Contains all event that should be triggered `manual` node.focus()
	rmanualevent = /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	// Regexp to detect mousewheel event
	rmousescroll = /^(?:DOMMouseScroll|mousewheel|wheel)$/;

// Methods that extend the native event object
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
		
		if( rmousescroll.test(this.type) ) {

			return this.wheelDelta ? this.wheelDelta / 120 : -(this.detail || 0) / 3;
		}
		
		return 0;
	}
};

/**
 * Detect legacy browser (ie 7/8 supported)
 *
 * Opera implemented both event systems but isn't a legacy browser so
 * checking for addEventListener
 */
if( legacy ) {
	
	PB.overwrite(PB.$.Event, {
		
		/**
		 * Prevents further propagation of the current event.
		 */
		stopPropagation: function () {
			
			this.cancelBubble = true;
		},
		
		/**
		 * Cancels the event if it is cancelable, without stopping further propagation of the event.
		 */
		preventDefault: function () {
			
			this.returnValue = false;
		}
	});
}

/**
 * Add event listener to every element in the set
 *
 * @param {String} event name
 * @param {String} *optional css expression
 * @param {Function} handler
 * @param {Object} handler context
 * @return 
 */
function on ( eventName, expression, handler, context ) {
	
	var types = eventName.split(' '),
		l = types.length,
		i = 0,
		j;

	if( typeof expression === 'function' ) {

		context = handler;
		handler = expression;
		expression = null;
	}

	if( typeof handler !== 'function' ) {

		throw new TypeError();
	}

	// Loop trough every elements in set
	for( ; i < this.length; i++ ) {

		// For every element we get to bind the given event(s)
		for( j = 0; j < l; j++ ) {

			//this[i].addEventListener(types[i], callback, false);
			register(this[i], types[j], handler, context, expression);
		}
	}

	return this;
}

/**
 * Remove event listener(s) for every element in the set
 *
 * When `handler` is undefined all handlers attached to the event name are removed.
 * When `eventName` is undefined all handlers for all types are removed
 *
 * @param {String} event name
 * @param {Function} handler
 * @return {Object} this
 */
function off ( eventName, handler ) {

	var i = 0,
		entries,
		j;

	for( ; i < this.length; i++ ) {

		entries = domGetStorage(this[i]).eventData;

		// No events stored
		if( !entries && (eventName && !entries[eventName]) ) {

			continue;
		}

		// When no event name is given destroy all events
		if( !eventName ) {

			// Remove all event listeners
			for( j in entries ) {

				if( entries.hasOwnProperty(j) ) {

					// Remove events by event name
					new $(this[i]).off(j);
				}
			}
		}
		// When no handler is given destoy all events attached to the event name
		else if ( !handler ) {

			// Remove all event listeners for given event name
			for( j = 0; j < entries[eventName].length; j++ ) {

				unregister( this[i], eventName, entries[eventName][j].handler );
			}

			// Remove property
			delete entries[name];
		}
		// Remove a single event, must match eventName and handler
		else {

			// Remove event listener by event name and handler
			unregister(this[i], eventName, handler);
		}
	}

	return this;
}

/**
 * Register event
 *
 * @param {Object} element node
 * @param {String} event name
 * @param {Function} handler
 * @param {Object} handler context
 * @param {String} css expression
 */
function register ( element, eventName, handler, context, expression ) {

	var storage = domGetStorage(element),
		entries,
		entry,
		i;

	// Store element
	storage.element = element;

	// Create event storage
	if( !storage.eventData ) {

		storage.eventData = {};
	}

	if( !storage.eventData[eventName] ) {

		storage.eventData[eventName] = [];
	}

	entries = storage.eventData[eventName];
	i = entries.length;

	// Do not register same handler twice
	while ( i-- ) {

		if( entries.handler === handler ) {

			return;
		}
	}

	// Store handler and responder se we know wich event to remove when calling `off`
	entry = {

		handler: handler,
		responder: eventResponder(element.__PBID__, eventName, handler, context, expression)
	};

	entries.push(entry);

	// [Chrome] Map to correct event name
	if( !mouseenterleave && (eventName === 'mouseenter' || eventName === 'mouseleave') ) {

		eventName = (eventName === 'mouseenter') ? 'mouseover' : 'mouseout';
	}

	// Attach event
	if( window.addEventListener ) {

		element.addEventListener(eventName, entry.responder, false);
	} else {

		element.attachEvent('on'+eventName, entry.responder);
	}
}

/**
 * Unregister event
 *
 * @param {Object} element node
 * @param {String} event name
 * @param {Function} handler
 */
function unregister ( element, eventName, handler ) {

	var storage = domGetStorage(element),
		entries = storage.eventData && storage.eventData[eventName],
		entry,
		i;

	if( !entries ) {

		return;
	}

	i = entries.length;

	// Find cache entry
	while ( i-- ) {
		
		if( entries[i].handler === handler ) {
			
			entry = entries[i];
			entries.splice(i, 1);
			break;
		}
	}

	// No entry in cache
	if( !entry ) {
		
		return;
	}

	// Remove event
	if( window.removeEventListener ) {

		element.removeEventListener(eventName, entry.responder, false);
	} else {

		element.detachEvent('on'+eventName, entry.responder);
	}
}

/**
 * Create a wrapper arround the original event
 *
 * @param {Number} element pbid
 * @param {String} event name
 * @param {Function} handler
 * @param {Object} handler context
 * @param {String} css expression
 */
function eventResponder ( pbid, eventName, handler, context, expression ) {

	return function ( event ) {

		var element = PB.$.cache[pbid].element,
			matchedElement = false,
			target;
		
		// Extend event
		event = extendEvent( event, element );

		//matchedElement = expression && matchedElement = new $(target).closest(expression);

		// If css expression is given and the expression does not matches the target or a parent
		// stop the event.
		if( expression ) {

			target = event.target;

			do {

				if( PB.$.selector.matches(target, expression) ) {

					matchedElement = true;
					break;
				}

			} while ( target !== element && (target = target.parentNode) );

			// When no element matched, stop event
			if( !matchedElement ) {

				return;
			}
		}

		// [Chrome] Workaround to support for mouseenter / mouseleave
		if( !mouseenterleave && eventName === 'mouseleave' ) {

			if( event.currentTarget.contains(event.relatedTarget) ) {

				return;
			}
		}
		
		// Execute callback, use context as scope otherwise the given element
		handler.call( context || element, event );
	};
}

/**
 * Extend event functionality and normalize event object for crossbrowser compatibility
 *
 * @param {Object} event object
 * @param {Object} element node
 * @return {Object} event object
 */
function extendEvent ( event, element ) {

	PB.overwrite(event, PB.$.Event);

	// Enough extending for modern browsers
	if( !legacy ) {

		return event;
	}

	// Add target
	event.target = event.srcElement || element;

	// Add currentTarget
	event.currentTarget = element;

	// set relatedTarget
	if( event.type === 'mouseover' || event.type === 'mouseenter' ) {
	
		event.relatedTarget = event.fromElement;
	} else if ( event.type === 'mouseout' || event.type === 'mouseleave' ) {
	
		event.relatedTarget = event.toElement;
	}

	// Set pageX/pageY
	if( event.pageX === undefined ) {

		event.pageX = event.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0);
		event.pageY = event.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0);
	}

	// Set which
	event.which = (event.keyCode === undefined) ? event.charCode : event.keyCode;

	// Normalize mousebutton codes to W3C standards
	// Left: 0, Middle: 1, Right: 2
	event.which = (event.which === 0 ? 1 : (event.which === 4 ? 2: (event.which === 2 ? 3 : event.which)));

	return event;
}

/**
 * Destroy element cache
 *
 * We added element to cache entry so make sure there are no 
 * references that could stick
 */
function destroyCache () {

	PB.$.cache = null;
}

/**
 * 
 */
function emit ( eventName ) {

	var i = 0,
		manual = rmanualevent.test(eventName),
		evt;

	// translate mouseenter/mouseleave id needed

	for( ; i < this.length; i++ ) {

		if( manual || (this[i].nodeName === 'input' && eventName === 'click') ) {

			this[i][eventName]();
		}

		// W3C
		else if( doc.createEvent ) {

			// Check beans / bonzo
			evt = doc.createEvent('HTMLEvents');
			evt.initEvent(eventName, true, true, window, 1);
			this[i].dispatchEvent(evt);
		}
	}
}

// Export
PB.overwrite(PB.$.fn, {

	on: on,
	off: off,
	emit: emit,
	fire: emit
});

PB.$(window).on('unload', destroyCache);
