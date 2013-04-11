	// Does browser support mouseenter and mouseleave
var mouseenterleave = 'onmouseenter' in docElement && 'onmouseleave' in docElement,
	// Contains all event that should be triggered `manual` node.focus()
	rmanualevent = /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/;

function Event ( originalEvent, element ) {

	var type = originalEvent.type,
		key;

	this.originalEvent = originalEvent;

	//
	this.type = type;
	this.target = originalEvent.target;
	this.currentTarget = originalEvent.currentTarget;
	this.defaultPrevented = false;
	this.currentTarget = element;

	for( key in Event.hooks ) {

		if( Event.hooks.hasOwnProperty(key) && Event.hooks[key].matches.test(type) ) {

			Event.hooks[key].hook(this, originalEvent);
		}
	}
}

Event.prototype = {

	preventDefault: function () {

		this.defaultPrevented = true;

		this.originalEvent.preventDefault();
	},

	stopPropagation: function () {

		this.originalEvent.stopPropagation();
	},

	/**
	 * Short for preventDefault() and stopPropagation()
	 */
	stop: function () {

		this.preventDefault();
		this.stopPropagation();
	}
};

Event.hooks = {

	mouse: {

		matches: /(!?mouse|click|focus|drag)/,
		hook: function ( event, originalEvent ) {

			if( originalEvent.relatedTarget ) {

				event.relatedTarget = originalEvent.relatedTarget;
			}

			event.pageX = originalEvent.pageX;
			event.pageY = originalEvent.pageY;
		}
	},

	mousewheel: {

		matches: /^(?:DOMMouseScroll|mousewheel|wheel)$/,
		hook: function ( event, originalEvent ) {

			event.wheelDelta = originalEvent.wheelDelta
				? originalEvent.wheelDelta / 120
				: -(originalEvent.detail || 0) / 3;
		}
	}
};

// Expose
PB.$.Event = Event;



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

	return function ( originalEvent ) {

		var element = PB.$.cache[pbid].element,
			event = new Event(originalEvent, element),
			target;
		
		// Extend event
		//event = extendEvent( event, element );

		//event.selectorTarget = null;

		// If css expression is given and the expression does not matches the target or a parent
		// stop the event.
		if( expression ) {

			target = event.target;

			do {

				if( PB.$.selector.matches(target, expression) ) {

					event.currentTarget = target;
					target = true;
					break;
				}

			} while ( target !== element && (target = target.parentNode) );

			// When no element matched, stop event
			if( target !== true ) {

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

// Export
PB.overwrite(PB.$.fn, {

	/**
	 * Add event listener to every element in the set
	 *
	 * @param {String} event name
	 * @param {String} *optional css expression
	 * @param {Function} handler
	 * @param {Object} handler context
	 * @return 
	 */
	on: function ( eventName, expression, handler, context ) {
		
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
	},

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
	off: function ( eventName, handler ) {

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
						new Dom(this[i]).off(j);
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
	},
	
	/**
	 * Trigger hmtl event
	 *
	 * @param {String} event name
	 * @return {Object} this
	 */
	emit: function ( eventName ) {

		var i = 0,
			manual = rmanualevent.test(eventName),
			evt;

		// translate mouseenter/mouseleave if needed

		for( ; i < this.length; i++ ) {

			// Some events need manual trigger, like element.focus()
			if( manual || (this[i].nodeName === 'input' && eventName === 'click') ) {

				this[i][eventName]();
			}
			// W3C
			else if( doc.createEvent ) {

				evt = doc.createEvent('HTMLEvents');
				evt.initEvent(eventName, true, true, window, 1);
				this[i].dispatchEvent(evt);
			}
			// IE
			else {

				this[i].fireEvent('on'+eventName, doc.createEventObject());
			}
		}

		return this;
	}
});
