/**
 * PB.ready
 */
(function ( PB ) {

	var doc = window.document,
		ready = doc.readyState === 'complete',
		fn,
		queue = [];

	// When browser supports addEventListener, DOMContentLoaded is existing
	if( doc.addEventListener ) {

		doc.addEventListener('DOMContentLoaded', fn = function () {

			doc.removeEventListener('DOMContentLoaded', fn);
			runQueue();
		});
	}
	// For IE7/8 check readystatechange event
	else {

		doc.attachEvent('onreadystatechange', fn = function () {

			if( doc.readyState === 'complete' ) {

				doc.detachEvent('onreadystatechange', fn);
				runQueue();
			}
		});
	}

	/**
	 * Call every function in queue
	 *
	 * @return {Void}
	 */
	function runQueue () {

		var callback;

		ready = true;

		while( callback = queue.shift() ) {

			callback(PB);
		}
	}

	/**
	 * Handle callback, call callback imidiatily when document is ready else queue. And call
	 * when document is ready.
	 *
	 * @return {Void}
	 */
	function onDomReady ( callback ) {

		if( ready ) {

			callback(PB);
		} else {

			queue.push(callback);
		}
	}

	// Expose
	PB.ready = onDomReady;
})( PB );