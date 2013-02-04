# Class

*PB.Class([parentClass], classDefenition);*

~~~js
var Foo = PB.Class({
	
	construct: function () {
		
		
	}
});

new Foo();
~~~

## Inheretence

~~~js
var Parent = PB.Class({
	
	contruct: function () {
		
		console.log('Parent constructed');
	},
	
	say: funtion ( txt ) {
		
		console.log( 'Parent says: '+txt );
	}
});

var Child = PB.Class(Parent, {
	
	construct: function () {
		
		console.log('Child constructed');
	}
});

var child = new Child();
child.say('Hello World!');
~~~