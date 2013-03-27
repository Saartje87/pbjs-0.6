# Request

## Tools

### PB.Request.builQueryString
### PB.Request.parseQueryString


## PB.Request

PB.Request our OOP style of doing a request.

The constructor will only initialize our `Request` object, the sending of the request will happen when the `send` method is called.

###### Signature
~~~js
var request = new PB.Request({
	
	url: '/file.json',
	method: 'GET',
	ayns: true,
	// Force datatypes, only one could be true..
	json: true,
	xml: true,
	data: {
		
		foo: 'bar'
	},
	auth: {
		
		user: 'foo',
		pass: 'bar'
	},
	headers: {},
	encoding: 'UTF-8',
	timeout: 0
});
~~~

###### Arguments
{Object} - Request options

###### Returns
{Object} - PB.Request

---

### send

Send out request.

> When sending the same request object multiple times, the previous requests will be aborted.

###### Signature
~~~js
request.send();
~~~

###### Returns
{Object} - PB.Request

---

### abort

Cancel the request, the abort event will be triggered.

> Note, the request has being send and most (maybe all) servers will still process the request! So throttle user input.

###### Signature
~~~js
request.abort();
~~~

###### Arguments
{Object} - Request options

###### Returns
{Object} - PB.Request

---

### on

Attach event listener to our `request` object.

###### Signature
~~~js
// We could listen to all events
request.on('send error success end abort', function ( request, code, type ) {
	
	// Request object
	request;
	
	// Retrieve data from request
	request.responseText;
	request.responseXML;
	request.responseJSON;
	
	// HTTP status code
	code;

	console.log(type); //=>'error/success/end/abort'
});
~~~

###### Arguments
{Object} - Request options

###### Returns
{Object} - PB.Request

---

### off

Remove event listener from request object. See *Link to observer* for more details.

---

### emit

Only usefull for internal usage..?

---

### set

Set options for request object.

###### Signature
~~~js
// Set single option
request.set('url', 'new/url.json');

// Set multiple options
request.set({
	
	url: 'new/url.json',
	data: {
		
		bar: 'foo'
	}
});
~~~

###### Arguments
{String/Object} - key / Request options
{Mixed} - Optional, value

###### Returns
{Object} - this

---

### Options

* url
	* {String} - url / uri
* method
	* {String} - Default GET
	* GET / POST / PUT / DELETE
	* Possible to specify own method, will always be send in uppercase
* async
	* {Boolean} - Default true
* json
	* {Boolean} - Default false, true if server response is in JSON and you want responseJSON set.
	* Not needed when server serves the right headers :) *application/json*
* xml - Do we need XML boolean??
* data
	* {Object/String} - 
	* Data to be sent to server
	* We encourige objects so we can build a valid query string for you!
* auth
	* {Object} - { user: 'name', pass: 'secret' }
* headers
	* {Object} - 
	* Headers will be merged with pbjs default request headers. These headers can be overwriten.
* encoding
	* {String} - Default UTF-8
* timeout
	- {Number} - Timeout in seconds, 0 for no timeout

---

## PB.get

###### Signature
~~~js
PB.get({
	
	url: 'file.json',
	data: {},
	json: true,
	xml: false,
	auth: {},
	headers: {},
	encoding: 'UTF-8',
	timeout: {},
	onSuccess: function ( request, code ) {
		
		transport.responseJSON;
	},
	onError: function ( request, code ) {
		
		
	}
});
~~~

## PB.JSONP