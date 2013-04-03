# PB.$

Pbjs dom handling!

---

### PB.$.Ready

Add callback for when the dom is ready for manipulation.

###### Signature
```js
PB.$.ready(function ( $ ) {
	
	// Document ready to be touched
});
```

###### Arguments
{Function} - callback

###### Returns
{Void}

---

### Constructor

PB.$ will return a wrapper arround arround the the given element. The constructor handles a few types of arguments.

* String starting with #, will try to find element by id.
* String starting with < and ending with >, will try to create an element.
* DOM node, retuns a wrapper arround the given node.
* Idea: Array of DOM nodes, maybe even strings? or handle multiple arguments..

> PB.$ only supports / returns elements which nodeType = 1 (ELEMENT_NODE) or 11 (DOCUMENT_FRAGMENT_NODE). So textnodes won't be returned.  
> If the contructor failed to handle the argument correctly it will return null instead of a collection.  

###### Signature
```js
// Get element by id
PB.$('#element_id');

// PB.$ model arround the document
PB.$(document);

// Create new element(s)
PB.$('<div class="new">Hello World!</div>');
```

###### Arguments
{Mixed} - string, DOM node, null

###### Returns
{Object} - this

---

### setAttr

Set the given attribute(s) for every element in de set.

###### Signature
```js
PB.$('#element').setAttr('key', 'value');

PB.$('#element').setAttr({
	
	key: 'value'
});
```

###### Arguments
{String/Object} - key  
{String} - value

###### Returns
{Object} - this

---

### getAttr

Get the attribute value from the first element in the set.

###### Signature
```js
PB.$('#element').getAttr('key'); //=> return value
```

###### Arguments
{String} - key

###### Returns
{String} - value or undefined

---

### removeAttr

Remove the given attribute(s) for every element in de set.

###### Signature
```javascript
PB.$('#element').removeAttr('key');
```

###### Arguments
{String} - key

###### Returns
{Object} - this

---

### setValue

Set the given value for every element in the set.

###### Signature
```js
PB.$('#element').setValue('value');
```

###### Arguments
{String} - value

###### Returns
{Object} - this

---

### getValue

Get the value from the first element in the set.

###### Signature
```js
PB.$('#element').getValue(); //=> 'value'
```

###### Returns
{String} - 

---

### setStyle

Set *inline* css style(s) for every element in the set.

> Both camelcase (fontSize) and css case(font-size) are supported
> Pixel values may be set as integers (not numeric strings!)
> Css properties that have prefixes in the browsers are automatically handled in pbjs `PB.$('#id').setStyle('transform', '...')` will
> automaticly be translated to -moz-/-webkit/etc transform

###### Signature
```js
// 2 argument style is not implemented (for now)
// PB.$('#element').setStyle('color', 'green');

PB.$('#element').setStyle({
	
	color: 'green',
	fontSize: 12,
	'border-width': '1pt',
	height: 100
});
```
###### Arguments
{Object/String} - css keys/values  
{mixed}* - Optional, css value

###### Returns
{Object} - this

---

### getStyle

Get css style from the first element in the set.

> Both camelcase (fontSize) and css case(font-size) are supported.

> Pixel values will always be returned as a number.

> First the inline styles are evaluated, then the computed values. If seconds argument if specified as true it will only use the calculated value and skip inline style.

###### Signature
```js
PB.$('#element').getStyle('height'); //=> 100, not as string 100px

PB.$('#element').getStyle('opacity'); //=> 1.0 float
```
###### Arguments
{String} - css key
{Boolean} - false by default. true if value should be calculated

###### Returns
{Mixed} - string/numeric

---

### morph

Morph current css styles to given css styles for every element in the set.

> First argument of this method requires a object, the other arguments don't require a specific order.

> At this moment the morph method only uses css transition, and therefor using morph in an 'older' browser will have instant styles applied.

> Relative values like jQuery does are not supported. `{ width: '-=400px' }`

###### Signature
```js
// Default animation, duration of .4 seconds
PB.$('#element').morph({
	
	left: 400,
	color: 'RGB(0, 225, 0)'
});

// Custom
PB.$('#element').morph({
	
	left: 400,
	color: 'RGB(0, 225, 0)'
}, 1.2, 'easeIn', function () {
	
	// Animation ended
});
```
###### Arguments
{Object} - styles  
{Numeric} - duration in seconds  
{String} - transition function (Bezier curve is supported for modern browsers)  
{Function} - called when animation has finished

###### Returns
{Object} - this

---

### Stop

Stop the current morph for every element in the set. Animation could be stopped at the current point.

> 

###### Signature
```js
// Skip to end of morph
PB.$('#element').stop();

// Skip animation at current point
PB.$('#element').stop(true);
```
###### Arguments
{Boolean} - Stop morph at current point, does not trigger animation end callback

###### Returns
{Object} - this

---
### hasClass

Returns true if the first element in the set has the given class name.

###### Signature
```js
PB.$('#element').hasClass('foo');
```
###### Arguments
{String} - classname

###### Returns
{Boolean} - 

---

### addClass

Add class(es) to every element in the set.

> Multiple classes can be added by specifiying a whitespace.

###### Signature
```js
PB.$('#element').addClass('foo');

// Add multiple classes
PB.$('#element').addClass('foo bar');
```
###### Arguments
{String} - classname(s)

###### Returns
{Object} - this

---

### removeClass

Removes class(es) from every element in the set.

###### Signature
```js
PB.$('#element').removeClass('foo');

PB.$('#element').removeClass('foo bar');
```
###### Arguments
{String} - classname

###### Returns
{Object} - this

---

### show

Shows every element in the set.

> Show will only alter the css display property.

###### Signature
```js
PB.$('#element').show();
```

###### Returns
{Object} - this

---

### hide

Hides every element in the set.

> Hide uses `display: none`.

###### Signature
```js
PB.$('#element').hide()
```

###### Returns
{Object} - this

---

### isVisible

Returns boolean whether the first element in the set is visible or not.

###### Signature
```js
PB.$('#element').isVisible();
```

###### Returns
{Boolean} - 

---

*** Should width be width or getWidth ??? ***
> methods that do not start with get or set and look like thay can handle set/get are only used as getters!
> For exampe, get the width of an element `PB.$('#element').width() //=> Return pixel value`
> And for setting the width `PB.$('#element').setStyle('width', 100)`
> also setting the innerwidth of element doesn't make that much sence to me..

### width

Retrieve width from the first element in the set.

> Width is the element width without margins and borders. (padding?)

###### Signature
```js
PB.$('#element').width();
```

###### Returns
{Number} - in pixels

---

### innerWidth

Retrieve inner width from the first element in the set.

> Inner width is the width + padding.

###### Signature
```js
PB.$('#element').innerWidth();
```

###### Returns
{Number} - in pixels

---

### outerWidth

Retrieve outer width from the first element in the set.

> Outer width is the width + border. Or optionally width + border + margin. 

###### Signature
```js
// Get width + border
PB.$('#element').outerWidth();

// Get width + border + margin
PB.$('#element').outerWidth(true);
```

###### Arguments
{Boolean} - includeMargin

###### Returns
{Number} - in pixels

---

### scrollWidth
### height
### innerHeight

### outerHeight

Retrieve outer height from the first element in the set.

> Outer height is the height + border. Or optionally height + border + margin. 

###### Signature
```js
// Get height + border
PB.$('#element').outerHeight();

// Get height + border + margin
PB.$('#element').outerHeight(true);
```

###### Arguments
{Boolean} - includeMargin

###### Returns
{Number} - in pixels

---

### scrollHeight

### getXY -> returns position

Get position from offset element, if getXY(true) is given it will return position from body.

> Development reminder, use [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/DOM/element.getBoundingClientRect)
> Idea to create two methods `PB.$('#element').xy()` and `PB.$('#element').xy()`. One for position to first offsetParent, second for the position in document. `offset` -> from offsetParent `position` -> from body.
> Should consider scrollTop/Left..

###### Signature
```js
// Position from offset parent
PB.$('#element').getXY();

// Posisition on body
PB.$('#element').getXY(true);
```

###### Arguments
{Boolean} - calculate from body

###### Returns
{Object} - {top: x, left: x}

---

### setScroll

Set scroll for every element in the set.

###### Signature
```js
// Position from offset parent
PB.$('#element').setScroll({
	
	top: 200,
	left: 10
});

// Posisition on body
PB.$('#element').setScroll({
	
	left: 0
});
```

###### Arguments
{Object} - {top: x, left: y}

###### Returns
{Object} - this

---

### getScroll

Get scroll from te first element in the set.

###### Signature
```js
// Position from offset parent
PB.$('#element').getScroll();
```

###### Returns
{Object} - {top: x, left: x}

---

# Traversal

### parent

Returns the parent node of the first element in the set.

###### Signature
```javascript
PB.$('#element').parent();
```

###### Returns
{Object} - Collection containing the parent element

---

### children

Returns the children for the first element in the set.

> Should this be for the first or all? Performance wise only first one would be nice..

###### Signature
```javascript
PB.$('#element').childeren();
```

###### Returns
{Object} - Collection containing childeren

---

### first

Returns the first element in the set.

###### Signature
```javascript
PB.$('#element').childeren().first();
```

###### Returns
{Object} - 

---

### last

Returns the last element in the set.

###### Signature
```javascript
PB.$('#element').childeren().last();
```

###### Returns
{Object} - 

---


### firstChild

Returns the first child from the first element in the set.

###### Signature
```javascript
PB.$('#element').firstChild();
```

###### Returns
{Object} - Collection containing the first child

---

### lastChild

Returns the last child from the first element in the set.

###### Signature
```javascript
PB.$('#element').lastChild();
```

###### Returns
{Object} - Collection containing the last child

---

### next

Returns the next sibling of the first element in this set.

###### Signature
```javascript
PB.$('#element').next();
```

###### Returns
{Object} - Collection containing the next sibling

---

### prev

Returns the previous sibling of the first element in this set.

###### Signature
```javascript
PB.$('#element').prev();
```

###### Returns
{Object} - Collection containing the previous sibling

---

### closest

Matches self and then the parent nodes for the given CSS expression until the expression matches the parent, body or the max iterations (second argument) is reached.

> When a match is found the matched element will be returned.

###### Signature
```javascript
PB.$('#element').closest('div.match-me');

// Travels to max 5 parent nodes.
PB.$('#element').closest('div.match-me', 5);
```
###### Arguments
{String} - CSS expression
{Number} - Max iterations (Default 50)

###### Returns
{Object/Null} - matched node or null when none matched

---

### find

Returns all matched elements by selector for every element in the set.

> For CSS selectors we use [Qwery](https://www.google.com) - The Tiny Selector Engine

###### Signature
```javascript
PB.$('#element').find('div.find-me');
```
###### Arguments
{String} - selector

###### Returns
{Object} - New collection containing the matched elements.

---

### matches

Returns true if every element in the set matches the given selector

> [Qwery](https://www.google.com) - The Tiny Selector Engine

###### Signature
```javascript
PB.$('#element').matches('div.class');
```
###### Arguments
{String} - selector

###### Returns
{Boolean} - 

---

### indexOf

Finds the index of an element in the set.

###### Signature

```html
<div id="parent">
	<div id="one"></div>
	<div id="two"></div>
	<div id="three"></div>
</div>
```

```js
PB.$('#parent').children().indexOf('#one'); // returns 0
PB.$('#parent').children().indexOf(PB.$('#two')); // returns 1
PB.$('#parent').children().indexOf(document.getElementById('three')); // returns 2
PB.$('#parent').children().indexOf('#four'); // element not found, returns -1
```

###### Arguments
{Mixed} - string, DOM node, PBJS Node

###### Returns
{Number} - index of element or -1 if no element was found

---

### remove

Remove every element in the set.

> Will clear internal cache etc..

###### Signature
```javascript
PB.$('#element').remove();
```

###### Returns
{Void} - null

---

# Insertion

### append

Append every element in set to the given target.

###### Signature
```javascript
PB.$('#element').append( '<div>Append me</div>' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### appendTo

Append every element in the set to the target element.

###### Signature
```javascript
PB.$('<div>Append me</div>').appendTo( '#element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### insertBefore

Insert every element in the set before target element.

###### Signature
```javascript
PB.$('#element').insertBefore( '#target-element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### insertAfter

Insert every element in the set after the target element.

###### Signature
```javascript
PB.$('#element').insertBefore( '#target-element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### prepend

Insert target element as first child element to the first element in the set.

###### Signature
```javascript
PB.$('#element').prepend('<div>Prepend me</div>');
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### prependTo

Insert first element in the set as first child element to the target element.

###### Signature
```javascript
PB.$('<div>Prepend me</div>').prependTo('#element');
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### replace

Replace the target element with our element.

###### Signature
```javascript
PB.$('#element').replace( '#target-element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

# Events

### on

Add event(s) to every element in the set. Multiple event types can be given seperated by a whitespace.

> mouseenter / mouseleave support  
> normalized event for older browsers (tested on ie 7/8)  
> normalized event properties/methods; currentTarget, preventDefault(), stopPropagation()

###### Signature
```javascript
// Basic event assignment
PB.$('#element').on('click', function ( e ) {
	
	// Stuff
});

// Context handling
PB.$('#element').on('click', function ( e ) {
	
	// Stuff
}, this);

// Handle multiple event types
PB.$('#element').on('mouseenter mouseleave', function ( e ) {
	
	switch ( e.type ) {
		
		case 'mouseenter':
			break;
		
		case 'mouseleave':
			break;
	}
});

// Callbacks will always be unique trough event type and element.
function myClickHandler ( e ) {
	
	console.log("myCliclHandler");
}

PB.$('#elemement').on('click', myClickHandler);
PB.$('#elemement').on('click', myClickHandler);

// In the console only one time 'myClickHandler' will be printed.
PB.$('#elemement').emit('click');
```
###### Arguments
{String} - event type(s)  
{Function} - callback  
{Object}* - Optional, context

###### Returns
{Object} - this

---

### off

Remove event from every element in the set.

> context is not considered in removing event

###### Signature
```javascript
// Basic event removal
PB.$('#element').off('click', functionName);

// Removing all event from given event type
PB.$('#element').off('click');

// Remove all events from element
PB.$('#element').off();
```
###### Arguments
{String} - event type(s)  
{Function} - callback

###### Returns
{Object} - this

---

### once

Add event to every element in the set, when the event is triggered the callback is removed.

> Method works the same as PB.$.on <-- link

###### Signature
```javascript
// Basic event assignment
PB.$('#element').once('click', function () {
	
	// Stuff
});
```
###### Arguments
{String} - event type(s)  
{Function} - callback  
{Object}* - Optional, context

###### Returns
{Object} - this

---

### emit

Trigger the given event to every element in the set.

###### Signature
```javascript
// Basic event assignment
PB.$('#element').emit('click');
```
###### Arguments
{String} - event type

###### Returns
{Object} - this

---

### empty

Empty `innerHTML` for every element in the set.

> Short for PB.$('#element').setHtml('').

###### Signature
```javascript
PB.$('#element').empty();
```

###### Returns
{Object} - this

---

### clone

Clone every element in the set. It's possible to clone all child element by added true as method argument.

> Method should also clone events and data?

###### Signature
```javascript
// Clones every element in the collection
PB.$('#element').clone();

// Clones elements and children
PB.$('#element').clone(true);
```
###### Arguments
{Boolean} - true if children should be cloned

###### Returns
{Object} - PB.$ collection with the newly cloned element

---

### setHtml

Set the `HTML` for every element in the set.

> Note, inserting html in table element is buggy on IE/NokiaN9, this should be fixed.
> *Idea* `PB.$.hook('setHtml.table', htmlFixFunction), PB.$.hook('setHtml.tbody', htmlFixFunction), PB.$.hook('setHtml.tr', htmlFixFunction)`

###### Signature
```javascript
PB.$('#element').setHtml('<h1>Hello World!</h1>');
```
###### Arguments
{String} - valid html string

###### Returns
{Object} - this

---

### getHtml

Get the `HTML` of first element in the set.

###### Signature
```javascript
PB.$('#element').getHtml(); //=> <h1>Hello World!</h1>
```

###### Returns
{String} - html

---

### setText

Set `text` for every element in the set.

###### Signature
```javascript
PB.$('#element').setText('Hello world!');
```
###### Arguments
{String} - text

###### Returns
{Object} - this

---

### getText

Get `text` of first element in the set.

###### Signature
```javascript
PB.$('#element').getText(); //=> 'Hello world!'
```

###### Returns
{String} - text

---

### contains

Check if given element is descendant of first element in the set.

###### Signature
```javascript
// True
PB.$(document.body).contains('#element');

// False
PB.$('#element').contains(document.body);
```
###### Arguments
{Object} - PB.$

###### Returns
{Boolean} - this

---

### setData

Set data for every element in the set.

###### Signature
```javascript
PB.$('#element').setData('key', 'value');

PB.$('#element').setData({
	
	key1: 'value1',
	key2: 'value2'
});
```
###### Arguments
{String} - key
{Mixed} - value

###### Returns
{Boolean} - this

---

### getData

Get data from first element in the set.

> First checks in memory for data if not there checks the data- attibute.

###### Signature
```javascript
PB.$('#element').getData('key'); //=> 'value'
```
###### Arguments
{String} - key

###### Returns
{Mixed} - value

---

### removeData

Remove data for every element in the set.

###### Signature
```javascript
PB.$('#element').removeData('key');
```
###### Arguments
{String} - key

###### Returns
{Object} - this

---

### serializeForm

*Ideas*
### get
### filter
### forEach
### wrap
### unwrap
