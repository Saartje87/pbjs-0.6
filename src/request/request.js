var requestXMLHttpRequest = 'XMLHttpRequest' in context,
	requestActiveXObject = 'ActiveXObject' in context;

/**
 * Request class
 *
 * 
 */
PB.Request = PB.Class(PB.Observer, {

	// Transport, instance of XMLHttpRequest
	transport: null,
	
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
			request = this.getTransport(),
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

			request.onreadystatechange = this.onreadystatechange.bind(this);
		}

		// Open connection
		request.open( method, url, async );

		// Set post / put header
		if( method === 'POST' || method === 'PUT' ) {

			request.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded; charset='+this.charset );
		}

		// Set headers
		PB.each(options.headers, function( name, val ){

			request.setRequestHeader( name, val );
		});

		// Emit send event
		this.emit( 'send', this.transport, 0 );

		// Send the request
		request.send( query || null );

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
		this.transport.onreadystatechange = null;
		
		this.transport.abort();

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
		
		if( key.substr(0, 6) === 'header' ) {

			PB.overwrite(this.options.headers, value);
		} else {

			this.options[key] = value;
		}

		return this;
	},

	/**
	 * Get new transport object
	 */
	getTransport: function () {

		// IE < 8 has troubles with a reusable xmlHttpRequest object
		// In this case we always return a new xmlHttpRequest instance
		if( this.transport && requestXMLHttpRequest ) {

			return this.transport;
		}

		// Abort previous request if any
		if( this.transport ) {

			this.transport.abort();
		}

		return this.transport = requestXMLHttpRequest
			? new XMLHttpRequest()
			: new ActiveXObject('Microsoft.XMLHTTP');
	},

	/**
	 * Handle onreadystatechange event
	 */
	onreadystatechange: function () {

		var transport = this.transport,
			options = this.options,
			type;

		// Request has finished
		if( transport.readyState === 4 ) {

			clearTimeout(this.abortTimer);

			transport.responseJSON = null;

			switch ( transport.status ) {

				case 200:
				case 201:
				case 204:
				case 304:
					type = 'success';

					// If request is a json call then decode json response
					if( options.json || transport.getResponseHeader('Content-type').indexOf( 'application/json' ) >= 0 ) {

						try {
							
							transport.responseJSON = JSON.parse( transport.responseText );
						} catch ( e ) {}
					}
					break;
				default:
					type = 'error';
			}

			// Cleanup memory
			this.transport.onreadystatechange = null;

			// Emit error or success and end
			this.emit(type, transport, transport.status);
			this.emit('end', transport, transport.status);
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
