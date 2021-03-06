# Observer



###### Signature
~~~js
var observer = new PB.Observer;

// Listen to foo
observer.on('foo', function ( baz ) {
	
	console.log('Foo called: '+baz);
});

// Trigger foo listeners
observer.emit('foo', 'BAZ!'); //=>'Foo called: BAZ!'

// Remove all 'foo' listeners
observer.off('foo');
~~~

###### Inheritance
~~~js
var Listener = PB.Class(PB.Observer, {
	
	on: function ( type, fn, context ) {
		
		console.log('Listening to '+type);
		
		this.parent(type, fn, context);
	}
});
~~~

###### Arguments
{Object} - Request options

###### Returns
{Object} - PB.Request

---

### on

###### Signature
~~~js
var observer = new PB.Observer;

// Basic event assignment
observer.on('foo', function ( e ) {
	
	// Stuff
});

// Context handling
observer.on('foo', function ( e ) {
	
	// Stuff
}, this);

// Listen to all events - idea
observer.on('*', function ( e ) {
	
	// Stuff
});
~~~

###### Arguments
{String} - observer type  
{Function} - callback  
{Object}* - Optional, context

###### Returns
{Object} - this

---

### off

###### Signature
~~~js
// Basic event removal
PB.$('#element').off('click', functionName);

// Removing all event from given event type
PB.$('#element').off('click');

// Remove all events from element
PB.$('#element').off();
~~~

###### Arguments
{String} - event type(s)  
{Function} - callback

###### Returns
{Object} - this

---

### emit