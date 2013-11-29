	// Does browser support mouseenter and mouseleave
var mouseenterleave = 'onmouseenter' in docElement && 'onmouseleave' in docElement,
	// Contains all event that should be triggered `manual` node.focus()
	rmanualevent = /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,

	standardEvents = 'type target defaultPrevented bubbles which'.split(' '),

	mouseEvents = 'altKey ctrlKey metaKey shiftKey which pageX pageY'.split(' ');

/**
 *
 */
function Event ( originalEvent, element ) {

	var hooks = Event.hooks,
		type = originalEvent.type,
		key;

	this.originalEvent = originalEvent;
	this.currentTarget = element;

	// Extend with standard event properties
	this.extend(standardEvents);

	// Any hooks for this event.type ?
	for( key in Event.hooks ) {

		if( hooks.hasOwnProperty(key) && hooks[key].matches.test(type) ) {

			hooks[key].hook(this, originalEvent);
		}
	}
}

Event.prototype = {

	/**
	 * Extend event with original event
	 *
	 * @param {Array} filled with property names that should be copied
	 */
	extend: function ( properties ) {

		var i = 0,
			l = properties.length;

		// Populate
		for( ; i < l; i++ ) {

			this[properties[i]] = this.originalEvent[properties[i]];
		}
	},

	/**
	 *
	 */
	preventDefault: function () {

		this.defaultPrevented = true;

		this.originalEvent.preventDefault();
	},

	/**
	 *
	 */
	stopPropagation: function () {

		this.originalEvent.stopPropagation();
	},

	/**
	 * Short for preventDefault() and stopPropagation()
	 */
	stop: function () {

		this.preventDefault();
		this.stopPropagation();
	},

	/**
	 * Checks whether the event target matches the given selector
	 *
	 * @param {String} css selector
	 * @return {Boolean}
	 */
	matchesSelector: function ( selector ) {

		var target = this.target;

		do {

			// When selector matches target set as currentTarget
			if( PB.$.selector.matches(target, selector) ) {

				this.currentTarget = target;
				return true;
			}

			// No need to look further then the target that listens to the event
			if( target === this.currentTarget ) {

				return false;
			}

		} while ( target = target.parentNode );

		// No match
		return false;
	}
};

Event.hooks = {

	/**
	 * Extend mouse 
	 */
	mouse: {

		matches: /(!?mouse|click|drag|focusin|focusout)/,
		hook: function ( event, originalEvent ) {

			// Extend with standard event properties
			event.extend(mouseEvents);

			if( originalEvent.relatedTarget ) {

				event.relatedTarget = originalEvent.relatedTarget;
			}
		}
	},

	/**
	 * Normalize wheelDelta crossbrowser
	 */
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
 * @param {String} css selector
 */
function register ( element, eventName, handler, context, selector ) {

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
		responder: eventResponder(element.__PBID__, eventName, handler, context, selector)
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
 * @param {String} css selector
 */
function eventResponder ( pbid, eventName, handler, context, selector ) {

	return function ( originalEvent ) {

		var element = PB.$.cache[pbid] && PB.$.cache[pbid].element,
			event,
			relatedTarget;

		if( !element ) {

			return;
		}

		event = new Event(originalEvent, element);

		// If selector is given, test selector
		if( selector && !event.matchesSelector(selector) ) {

			return;
		}

		// When selector is given, currentTarget is now the selected element
		element = event.currentTarget;

		// [Chrome] Workaround to support for mouseenter / mouseleave
		// Inspired by blog.stchur.com/2007/03/15/mouseenter-and-mouseleave-events-for-firefox-and-other-non-ie-browsers/
		if( !mouseenterleave && (eventName === 'mouseleave' || eventName === 'mouseenter') ) {

			relatedTarget = event.relatedTarget;

			if( element === relatedTarget || (element.contains && element.contains(relatedTarget)) ) {

				return;
			}

			event.type = eventName;
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
	 * @param {String} *optional css selector
	 * @param {Function} handler
	 * @param {Object} handler context
	 * @return 
	 */
	on: function ( eventName, selector, handler, context ) {
		
		var types = eventName.split(' '),
			l = types.length,
			i = 0,
			j;

		if( typeof selector === 'function' ) {

			context = handler;
			handler = selector;
			selector = null;
		}

		if( typeof handler !== 'function' ) {

			throw new TypeError();
		}

		// Loop trough every elements in set
		for( ; i < this.length; i++ ) {

			// For every element we get to bind the given event(s)
			for( j = 0; j < l; j++ ) {

				//this[i].addEventListener(types[i], callback, false);
				register(this[i], types[j], handler, context, selector);
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
			// Remove a single event, must match eventName and handler to be removed
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

			// Some events need manual trigger, like element.focus() make sure the method exsits on given element
			if( (manual && eventName in this[i]) || (this[i].nodeName === 'input' && eventName === 'click') ) {

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
