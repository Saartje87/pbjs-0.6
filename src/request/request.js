/**
 * pbjs request class
 *
 * OOP way to requesting file from server
 */
PB.Request = PB.Class(PB.Observer, {

	// Supported states, note that not all states would be triggerd
	// by the XMLHttpRequest object
	stateTypes: 'unsent opened headers loading end'.split(' '),

	// Transport, instance of XMLHttpRequest
	transport: null,
	
	/**
	 *
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
	 */
	send: function () {
		
		var options = this.options,
			async = options.async,
			request = this.getTransport(),
			url = options.url,
			method = options.method.toUpperCase(),
			params = options.data ? PB.Net.buildQueryString( options.data ) : null;

		// Set query string
		if( params !== null && method !== 'POST' && method !== 'PUT' ) {

			url += (url.indexOf('?') === -1 ? '?' : '&')+params;
			params = null;
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
		request.send( params );

		// Handle synchrone callback
		if( !async ) {

			this.onreadystatechange();
		}

		return this;
	},
	
	/**
	 * Abort the request
	 */
	abort: function () {
		
		this.transport.abort();

		this.emit('abort');

		return this;
	},
	
	/**
	 * Set option
	 */
	set: function ( key, value ) {
		
		if( key.substr(0, 6) === 'header' ) {

			PB.overwrite(this.options.headers, value);
		}

		this.options[key] = value;

		return this;
	},

	/**
	 *
	 */
	getTransport: function () {

		// As far as I know, only IE7 can't reuse an XMLHttpRequest object.. So in case of IE7 we return a new instance
		// We check this by determine if the browser supports modern XMLHttpRequest object
		if( this.transport && window.XMLHttpRequest ) {

			return this.transport;
		}

		if( window.XMLHttpRequest ) {

			return this.transport = new XMLHttpRequest();
		}
		// Older IE < 8
		else {

			// Abort previous request
			if( this.transport ) {

				this.transport.abort();
			}

			try {

	            return this.transport = new ActiveXObject('MSXML2.XMLHTTP.3.0');
	        } catch(e) {}
		}

		throw new Error('Browser doesn`t support XMLHttpRequest');
	},

	/**
	 *
	 */
	onreadystatechange: function () {

		var transport = this.transport,
			options = this.options,
			type = 'error';

		// Request has finished
		if( transport.readyState === 4 ) {

			transport.responseJSON = null;

			// Request successfull
			if( transport.status >= 200 && transport.status < 300 ) {

				// Handle JSON response
				if( options.json || transport.getResponseHeader('Content-type').indexOf( 'application/json' ) >= 0 ) {

					try {
						
						transport.responseJSON = JSON.parse( transport.responseText );
					} catch ( e ) {}
				}

				type = 'success';
			}

			// Trigger error or success listeners
			this.emit( type, transport, transport.status, type );
		}

		type = this.stateTypes[transport.readyState];

		// Emit every status
		this.emit( type, transport, transport.readyState === 4 ? transport.status : 0, type );
	}
});

/**
 * Request defaults
 */
PB.Request.defaults = {

	url: '',
	// Default request method
	method: 'GET',
	// Force datatypes, only one could be true..
	json: false,
	// IE10 has somehing different in this.. find out and normalize! New framework so we can handle the latest stuff
	// as default.
	xml: false,
	// {}
	data: null,
	// Todo: implement auth
	// {user: 'xxx', pass: 'xxx'}
	auth: null,
	headers: {

		'X-Requested-With': 'PBJS-'+PB.VERSION,
		'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
	},
	encoding: 'UTF-8',
	// Todo: timeout
	timeout: 0
};
