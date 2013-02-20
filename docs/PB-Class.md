# PB.Class

Class creation in pbjs.

*PB.Class([parentClass,] classDefenition);*

~~~js
var Foo = PB.Class({
	
	construct: function () {
		
		
	}
});

new Foo();
~~~

## Inheritance

~~~js
var Parent = PB.Class({
	
	contruct: function () {
		
		console.log('Parent constructed');
	},
	
	say: funtion ( msg ) {
		
		console.log( 'Parent says: '+msg );
	}
});

var Child = PB.Class(Parent, {
	
	construct: function () {
		
		console.log('Child constructed');
	}
});

var child = new Child(); //=>'Parent constructed'
child.say('Hello World!'); //=>'Parent says: Hello World!'
~~~