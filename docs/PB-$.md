# PB.$
Element selection can be done by specifying an element id or to give a dom node.
The PB.$ constructor also handles the creation of dom elements

```js
// Get element by id
PB.$('#element_id')

// PB.$ model arround the document
PB.$(document)

// Create new element(s)
PB.$('<div class="new">Hello World!</div>')
```

## PB.$.Ready
```js
PB.$.ready(function () {
	
	// Document ready to be touched
});
```

### setAttr

Add or overwrite attribute in element.

###### Signature
```js
PB.$('#element').setAttr('key', 'value');
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

### morph -> animate ?

Morph current style to given styles.

> Order of optional arguments doesn't matter


> For now, browsers that not support css transitions will have an styles applied immediately, using setStyle.

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
{MixeObjectd} - this

---

### hasClass
### addClass
### removeClass

### show
### hide
### isVisible
### width
### innerWidth
### outerWidth
### scrollWidth
### height
### innerHeight
### outerHeight
### scrollHeight

### getXY -> returns position
### left
### top

### scrollLeft
### scrollTop

# Traversal

### parent

Returns the parent node of the first element in the collection.

###### Signature
```javascript
PB.$('#element').parent();
```

###### Returns
{Object} - The parent element

---

### childeren

Returns all childeren of all elements in the collection.

###### Signature
```javascript
PB.$('#element').childeren()
```

###### Returns
{Object} - Childeren

---

### firstChild
### lastChild
### next
### prev
### closest
### remove
### find

# Insertion

### append
### appendTo
### insertBefore
### insertAfter
### prepend
### prependTo
### replace

# Events

### on
### off
### once
### emit

### empty
### clone

### getHtml
### setHtml
### getText
### setText

### contains

### getData
### setData
### removeData
