# Net

## Tools

### PB.net.builQueryString
### PB.net.parseQueryString


## PB.Request

PB.Reuest our OOP style of doing a request

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

request.on('error success end', function ( event, request, code ) {
	
	event.type;
	
	code;
	
	request.responseJSON;
});

request.on('error success end', function ( event ) {
	
	// Data is our request object
	event.data.responseJSON;
	
	// HTTP status code
	event.code;
	
	// Event type
	event.type;
});

request.send();
~~~

### send
### abort
### set

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
	onSuccess: function ( transport ) {
		
		transport.responseJSON;
	},
	onFailure: function () {
		
		
	}
});
~~~

## PB.JSONP