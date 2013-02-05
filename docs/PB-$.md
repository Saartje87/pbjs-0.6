# PB.$

Pbjs dom handling!

## PB.$.Ready

Add callback for when the dom is ready for manipulation.

###### Signature
```js
PB.$.ready(function ( $ ) {
	
	// Document ready to be touched
});
```

### Constructor

PB.$ will return a wrapper arround arround the the given element. The constructor handles a few types of arguments.

* String starting with #, will try to find element by id.
* String starting with < and ending with >, will try to create an element.
* DOM node, retuns a wrapper arround the given node.
* Idea: Array of DOM nodes, maybe even strings? or handle multiple arguments..

> PB.$ only supports / returns elements which nodeType = 1 (ELEMENT_NODE) or 11 (DOCUMENT_FRAGMENT_NODE). So textnodes won't be returned.  

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
{Mixed} - string, DOM node

###### Returns
{Object} - this

---

### setAttr

Add or overwrite attribute in element.

###### Signature
```js
PB.$('#element').setAttr('key', 'value');

PB.$('#element').setAttr({
	
	key: 'value'
});
```

###### Arguments
{String} - key  
{String} - value

###### Returns
{Object} - this

---

### getAttr

Get attribute in element.

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

Remove attribute in element.

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

Set or overwrite value of form element (input, button,..).

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

Get value

###### Signature
```js
PB.$('#element').getValue(); //=> 'value'
```

###### Returns
{String} - 

---

### removeValue

Remove value

###### Signature
```js
PB.$('#element').removeValue();
```

###### Returns
{Object} - this

---

### serializeForm

### setStyle

Set *inline* css style(s) to elements.

> Both camelcase (fontSize) and css case(font-size) are supported

> Pixel values may be set as integers (not numeric strings!)

###### Signature
```js
PB.$('#element').setStyle('color', 'green');

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

Get css style from elements.

> Both camelcase (fontSize) and css case(font-size) are supported.

> If retuned value is a pixel value, it will be returned as an integer.

> First the inline styles are evaluated, then the computed values.

###### Signature
```js
PB.$('#element').getStyle('height'); //=> 100, not as string 100px

PB.$('#element').getStyle('opacity'); //=> 1.0 float
```
###### Arguments
{String} - css key

###### Returns
{Mixed} - string/numeric

---

### morph

Morph/animate element to given styles.

> First argument of this method requires a object, the last arguments don't require a specific order.
> At this moment the morph method only uses css transition, and there for using morph in an 'older' browser will have instant styles applied.

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
{String} - transition function  
{Function} - called when animation has finished

###### Returns
{Object} - this

---

### hasClass

Returns true if the element has the given class name.

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

Add class to element

###### Signature
```js
PB.$('#element').addClass('foo');
```
###### Arguments
{String} - classname

###### Returns
{Object} - this

---

### removeClass

Removes the class name from element

###### Signature
```js
PB.$('#element').removeClass('foo');
```
###### Arguments
{String} - classname

###### Returns
{Object} - this

---

### show

Shows the element(s)

> Using css display property

###### Signature
```js
PB.$('#element').show();
```

###### Returns
{Object} - this

---

### hide

Hides the element(s)

> Using css display property

###### Signature
```js
PB.$('#element').hide()
```

###### Returns
{Object} - this

---

### isVisible

Checks whether the element is visible or not

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

Get width measured in pixels.

> Todo: Descripe width

###### Signature
```js
PB.$('#element').width();
```

###### Returns
{Number} - in pixels

---

### innerWidth

Get inner width measured in pixels.

> Todo: Descripe width

###### Signature
```js
PB.$('#element').innerWidth();
```

###### Returns
{Number} - in pixels

---

### outerWidth

Get outer width measured in pixels.

> Todo: Descripe width

###### Signature
```js
PB.$('#element').outerWidth();
```

###### Returns
{Number} - in pixels

---

### scrollWidth
### height
### innerHeight
### outerHeight
### scrollHeight

### getXY -> returns position

Get position from offset element, if getXY(true) is given it will return position from body.

> Development reminder, use [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/DOM/element.getBoundingClientRect)
> Ideo to create two methods `PB.$('#element').xy()` and `PB.$('#element').xy()`. One for position to first offsetParent, second for the position in document. `offset` -> from offsetParent `position` -> from body.

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

Returns the parent node of the first element in the collection.

###### Signature
```javascript
PB.$('#element').parent();
```

###### Returns
{Object} - Collection containing the parent element

---

### childeren

Returns all childeren of all elements in the collection.

###### Signature
```javascript
PB.$('#element').childeren();
```

###### Returns
{Object} - Collection containing all childeren

---

### firstChild

Returns the first child element

###### Signature
```javascript
PB.$('#element').firstChild();
```

###### Returns
{Object} - Collection containing the first child

---

### lastChild

Returns the last child element

###### Signature
```javascript
PB.$('#element').lastChild();
```

###### Returns
{Object} - Collection containing the last child

---

### next

Returns the next sibling of the first element in our collection

###### Signature
```javascript
PB.$('#element').next();
```

###### Returns
{Object} - Collection containing the next sibling

---

### prev

Returns the previous sibling of the first element in our collection

###### Signature
```javascript
PB.$('#element').prev();
```

###### Returns
{Object} - Collection containing the previous sibling

---

### closest

Bubbles up the dom three for a max iterations or when it matches the given selector.
Returns element if found null otherwise.

###### Signature
```javascript
PB.$('#element').closest('div.match-me');

// Travels to max 5 parent nodes.
PB.$('#element').closest('div.match-me', 5);
```
###### Arguments
{String} - CSS selector
{Number} - Max iterations (Default 50)

###### Returns
{Object} - Collection containing the previous sibling

---

### find

Find elements trough CSS selector. Searching from context. Will return a new collection.

> For CSS selectors we use [Qwery](https://www.google.com) - The Tiny Selector Engine

###### Signature
```javascript
PB.$('#element').find('div.find-me');
```
###### Arguments
{String} - CSS selector

###### Returns
{Object} - New collection containing the matched elements.

---

### remove

Remove element from document and removes cached entries.

###### Signature
```javascript
PB.$('#element').remove();
```

###### Returns
{Void} - null

---

# Insertion

### append

Append target element to element.

###### Signature
```javascript
PB.$('#element').append( '#target-element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### appendTo

Append element to target element.

###### Signature
```javascript
PB.$('#element').appendTo( '#target-element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### insertBefore

Insert element before target element.

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

Insert element after target element.

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

Insert target element as first child element to the element.

###### Signature
```javascript
PB.$('#element').prepend( '#target-element' );
```
###### Arguments
{Mixed} - Target element, can handle everything the PB.$ constructor can

###### Returns
{Object} - this

---

### prependTo

Insert element as first child element to the target element.

###### Signature
```javascript
PB.$('#element').prependTo( '#target-element' );
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

Add event(s) to element. Can assign callback to multiple event types.

> mouseenter / mouseleave support  
> normalized event for older browsers (tested on ie 7/8)  
> normalized event properties/methods; currentTarget, preventDefault(), stopPropagation()

###### Signature
```javascript
// Basic event assignment
PB.$('#element').on('click', function () {
	
	// Stuff
});

// Context handling
PB.$('#element').on('click', function () {
	
	// Stuff
}, this);

// Handle multiple event types
PB.$('#element').on('mouseenter mouseleave', function () {
	
	switch ( e.type ) {
		
		case 'mouseenter':
			break;
		
		case 'mouseleave':
			break;
	}
});
```
###### Arguments
{String} - event type(s)  
{Function} - callback  
{Object}* - Optional, context

###### Returns
{Object} - this

---

### off

Remove event from element.

> context is not considered in removing event  
> Should we support the removal of multiple event types?

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

Add event to element, when triggered the event is removed.

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

Trigger the given event

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

Empty the element. 

> Short for PB.$('#element').setHtml('').

###### Signature
```javascript
PB.$('#element').empty();
```

###### Returns
{Object} - this

---

### clone

Clone element, add true  to argument when childs should be cloned to. 

> Method should also clone events and data?

###### Signature
```javascript
// Only clone element
PB.$('#element').clone();

// Clone element and childs
PB.$('#element').clone(true);
```
###### Arguments
{Boolean} - true if childs should be cloned

###### Returns
{Object} - the cloned element

---

### setHtml

Set the `innerHTML` of element

> Note, inserting html in table element is buggy on IE, this should be fixed.

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

Get the `innerHTML` of element

###### Signature
```javascript
PB.$('#element').getHtml(); //=> <h1>Hello World!</h1>
```

###### Returns
{String} - html

---

### setText

Set the `text` of element

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

Get the `text` of element

###### Signature
```javascript
PB.$('#element').getText(); //=> 'Hello world!'
```

###### Returns
{String} - text

---

### contains

Check if given element is descendant of this.

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

Set data.

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

Get data from attibute, will first look in memory then will chech data- attribute.

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

Remove data.

###### Signature
```javascript
PB.$('#element').removeData('key');
```
###### Arguments
{String} - key

###### Returns
{Object} - this

---

*Ideas*
### first
### last
### get
### push
### filter
### forEach
