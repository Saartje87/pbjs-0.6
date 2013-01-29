~~~
// Get single element
PB.$('#id')

// Get collection with CSS selector short for PB.$(document).find('.classname')
PB.$$('.classname')

// Get multiple elements
PB.$('#id').find('a');

// Get color
PB.$('#id').getStyle('color');

// Returns first color in set
PB.$('#id').find('a').getStyle('color');
~~~


// Todo
- Design api's
- How should PB.$.fn work? PB.$.fn.extend('method', function () {}) and PB.$.fn.method = function () {}
- Hooking system
- More usefull methods for OOP? (zoejs)
- Easy seperation of modules (request,dom,class,core)
- JSONP

// $ -> aka dom
Always use setters and getters
.setAttr
.getAttr
.removeAttr

?? 
PB.Array  -> PB.A
PB.String -> PB.S
PB.Object -> PB.O
PB.Class