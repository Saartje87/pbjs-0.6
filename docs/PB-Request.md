# Net

## Tools

### PB.net.builQueryString
### PB.net.parseQueryString


## PB.Request

PB.Request our OOP style of doing a request.

The constructor will only initialize our `Request` object, the sending of the request will happen when the `send` method is called.

###### Signature
~~~js
var request = new PB.Request({
	
	url: '/file.json',
	method: 'GET',
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
	timeout: 0,
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

> Below are two options desciped, we must choose one :)

###### Signature
~~~js
// Option 1. 
request.on('error success end abort', function ( event, request, code ) {
	
	// Our request object
	request.responseJSON;
	
	// Event type
	event.type;
	
	// HTTP status code
	code;
});

// Option 2. Event object
request.on('error success end abort', function ( event ) {
	
	// Data is our request object
	event.request.responseJSON;
	
	// HTTP status code
	event.code;
	
	// Event type
	event.type;
});
~~~

###### Arguments
{Object} - Request options

###### Returns
{Object} - PB.Request

---

### off

### emit

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