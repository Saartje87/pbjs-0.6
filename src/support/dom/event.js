/**
 * Event normalisation for browsers with older event model
 */
if( legacyEventModel ) {

	PB.overwrite(PB.$.Event.hooks, {

		fixes: {

			matches: /(!?)/,
			hook: function ( event, originalEvent ) {

				event.target = originalEvent.srcElement || originalEvent.toElement;
			}
		},

		mouseIe: {

			matches: /(!?mouse|click|focus|drag)/,
			hook: function ( event, originalEvent ) {

				event.pageX = originalEvent.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0);
				event.pageY = originalEvent.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0);

				if( originalEvent.fromElement ) {

					event.relatedTarget = originalEvent.fromElement;
				}

				// Set which
				event.which = (originalEvent.keyCode === undefined) ? originalEvent.charCode : originalEvent.keyCode;

				// Normalize mousebutton codes to W3C standards
				// Left: 0, Middle: 1, Right: 2
				event.which = (event.which === 0 ? 1 : (event.which === 4 ? 2: (event.which === 2 ? 3 : event.which)));
			}
		}
	});

	/**
	 * Prevents further propagation of the current event.
	 */
	PB.$.Event.prototype.stopPropagation = function () {
		
		this.defaultPrevented = true;
		this.cancelBubble = true;
	};

	/**
	 * Cancels the event if it is cancelable, without stopping further propagation of the event.
	 */
	PB.$.Event.prototype.preventDefault = function () {
		
		this.returnValue = false;
	};

	/**
	 * Destroy element cache
	 *
	 * We added element to cache entry so make sure there are no 
	 * references that could stick
	 */
	function destroyCache () {

		PB.$.cache = null;

		context.detachEvent('onunload', destroyCache);
	}

	// Destroy cache in case of older IE browsers
	context.attachEvent('onunload', destroyCache);
}
