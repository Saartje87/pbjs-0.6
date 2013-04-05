var requestXMLHttpRequest = 'XMLHttpRequest' in context,
	requestActiveXObject = 'ActiveXObject' in context;

/*
PB.Request.defaultSend
PB.Request.defaultSuccess
PB.Request.defaultError
PB.Request.defaultEnd
PB.Request.defaultAbort

PB.Request.default('success', function () {
	
})

// Add callback for all PB.Request instances
PB.Request.add('success', function () {});
PB.Request.global('success', function () {});
PB.Request.forAll('success', function () {});
PB.Request.all('success', function () {});
*/

/**
 * Request class
 *
 * 
 */
PB.Request = PB.Class(PB.Observer, {

	// Xhr, instance of XMLHttpRequest
	xhr: null,
	
	/**
	 * Construct new class instance
	 *
	 * Set request defaults
	 *
	 * @param {Object} options
	 * @return this
	 */
	construct: function ( options ) {

		// Set default options
		this.options = PB.clone(PB.Request.defaults);
		
		// Init observer
		this.parent();

		// Overwrite default options
		PB.overwrite(this.options, options);
	},
	
	/**
	 * Send request
	 *
	 * @return this
	 */
	send: function () {

		var options = this.options,
			async = options.async,
			xhr = this.getTransport(),
			url = options.url,
			method = options.method.toUpperCase(),
			// Assign query string or null/false/undefined/empty string
			query = PB.type(options.data) === 'object' ? PB.Request.buildQueryString( options.data ) : options.data;

		// Clear previous abort timer
		clearTimeout(this.abortTimer);

		// Add query string to url for GET / DELETE request types
		if( query && (method === 'GET' || method === 'PUT') ) {

			url += (url.indexOf('?') === -1 ? '?' : '&')+query;
			query = null;
		}

		// Attach onreadystatechange listener
		if( async ) {

			xhr.onreadystatechange = this.onreadystatechange.bind(this);
		}

		// Open connection
		xhr.open( method, url, async );

		// Set post / put header
		if( method === 'POST' || method === 'PUT' ) {

			xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded; charset='+this.charset );
		}

		// Set headers
		PB.each(options.headers, function( name, val ){

			xhr.setRequestHeader( name, val );
		});

		// Emit send event
		this.emit( 'send', xhr, 0 );

		// Send the request
		xhr.send( query || null );

		if( options.timeout > 0 ) {

			this.abortTimer = setTimeout(this.abort.bind(this), options.timeout*1000);
		}

		// Handle synchrone callback
		if( !async ) {

			this.onreadystatechange();
		}

		return this;
	},
	
	/**
	 * Abort the request
	 *
	 * @return this
	 */
	abort: function () {

		// Cleanup memory
		this.xhr.onreadystatechange = null;
		
		this.xhr.abort();

		this.emit('abort');

		return this;
	},
	
	/**
	 * Set option, key value
	 *
	 * @param {String}
	 * @param {String/Object/Array/Function/Number}
	 */
	set: function ( key, value ) {
		
		// Match header and headers
		if( key.substr(0, 6) === 'header' ) {

			PB.overwrite(this.options.headers, value);
		} else {

			this.options[key] = value;
		}

		return this;
	},

	/**
	 * Get new transport object
	 *
	 * @return {XmlHttpRequest}
	 */
	getTransport: function () {

		// IE < 8 has troubles with a reusable xmlHttpRequest object
		// In this case we always return a new xmlHttpRequest instance
		if( this.xhr && requestXMLHttpRequest ) {

			return this.xhr;
		}

		// Abort previous request if any
		if( this.xhr ) {

			this.xhr.abort();
		}

		return this.xhr = requestXMLHttpRequest
			? new XMLHttpRequest()
			: new ActiveXObject('Microsoft.XMLHTTP');
	},

	/**
	 * Handle onreadystatechange event
	 */
	onreadystatechange: function () {

		var xhr = this.xhr,
			options = this.options,
			type;

		// Request has finished
		if( xhr.readyState === 4 ) {

			clearTimeout(this.abortTimer);

			xhr.responseJSON = null;

			switch ( xhr.status ) {

				case 200:
				case 201:
				case 204:
				case 304:
					type = 'success';

					// If request is a json call then decode json response
					if( options.json || xhr.getResponseHeader('Content-type').indexOf( 'application/json' ) >= 0 ) {

						try {
							
							xhr.responseJSON = JSON.parse( xhr.responseText );
						} catch ( e ) {}
					}
					break;
				default:
					type = 'error';
			}

			// Cleanup memory
			this.xhr.onreadystatechange = null;

			// Emit error or success and end
			this.emit(type, xhr, xhr.status);
			this.emit('end', xhr, xhr.status);
		}
	}
});

/**
 * Request defaults
 */
PB.Request.defaults = {

	url: '',
	// Default request method
	method: 'GET',
	// Default async requests
	async: true,
	// Force datatypes, only one could be true..
	json: false,
	// IE10 has somehing different in this.. find out and normalize
	xml: false,
	// {}
	data: null,
	// Todo: implement auth
	// {user: 'xxx', pass: 'xxx'}
	auth: null,
	// Default request headers
	headers: {

		'X-Requested-With': 'PBJS-'+PB.VERSION,
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
	},
	encoding: 'UTF-8',
	// Todo: timeout
	timeout: 0
};
