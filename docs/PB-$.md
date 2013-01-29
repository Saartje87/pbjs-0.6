# PB.$

## PB.$ constructor
Element selection can be done by specifiyn an element id or to give a dom node.
The PB.$ constructor also handles the creation of dom elements

~~~
PB.$('#element_id')

PB.$(document)

// Create new element(s)
PB.$('<div class="new">Hello World!</div>')
~~~

## PB.$.Ready


### setAttr
### getAttr
### removeAttr

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
~~~
PB.$('#element').parent();
~~~

###### Returns
{Object} - The parent element

### childeren

Returns all childeren of all elements in the collection.

###### Signature
~~~
PB.$('#element').childeren()
~~~

###### Returns
{Object} - Childeren

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
