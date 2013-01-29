# PB.$
Element selection can be done by specifying an element id or to give a dom node.
The PB.$ constructor also handles the creation of dom elements

```javascript
PB.$('#element_id')

PB.$(document)

// Create new element(s)
PB.$('<div class="new">Hello World!</div>')
```

## PB.$.Ready


### setAttr

Add or overwrite attribute in element.

###### Signature
```javascript
PB.$('#element').setAttr('key', 'value');
```

###### Arguments
{String} - key
{String} - value

###### Returns
{Object} - The parent element

---

### getAttr

Add or overwrite attribute in element.

###### Signature
```javascript
PB.$('#element').getAttr('key');
```

###### Arguments
{String} - key
{String} - value

###### Returns
{Object} - The parent element

---

### removeAttr

Remove attribute in element.

###### Signature
```javascript
PB.$('#element').removeAttr('key');
```

###### Arguments
{String} - key
{String} - value

###### Returns
{Object} - The parent element

---

### getVal
### setVal
### removeVal

### serializeForm

### setStyle
### getStyle

### morph -> animate ?

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
