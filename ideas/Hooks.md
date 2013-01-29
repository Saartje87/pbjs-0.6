# Hooks
In general hooks are usefull when programming browser word-arounds. For example css opacity in IE7/8 when we should use filter but dont want to developer to declare his/her styles twice.

> Hooks should only be declared when the browser does not support a future

## Setter example
~~~
// Example for adding hooks
if( 'opacity' in document.createElement('div').style ) {
	
	PB.$.hook('setStyle.opacity', function ( element, value ) {
		
		// Solves buggie behavior of IE`s opacity
		if( !element.currentStyle || !element.currentStyle.hasLayout ) {

			element.style.zoom = 1;
		}
	
		element.style.filter = 'alpha(opacity='+(value*100)+')';
	});

	PB.$.hook('getStyle.opacity', function ( element, value ) {
		
		var match = node.style.filter.match(/alpha\(opacity=(.*)\)/i);
		
		if( match[1] ) {

			return parseFloat(match[1]) / 100;
		}

		return 1.0;
	});
}

if( innerHTML table bug ) {
	
	PB.$.hook('setHtml', function ( element, value ) {
		
		// if in table, append etc :)
	});
}
~~~

## Getter example
For internal usage
~~~
if( PB.$.hooks['setStyle.opacity'] ) {
	
	PB.$.hooks['setStyle.opacity']();
}