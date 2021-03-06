(function ( name, context, definition ) {
	
	this[name] = definition( context );

})('PB', this, function ( context ) {

'use strict';

var PB = {},

	// Previous PB
	OLD_PB = context.PB,
	
	// Unique id, fetch from previous PB or start from 0
	uid = OLD_PB ? OLD_PB.id() : 0,
	
	// References
	slice = Array.prototype.slice,
	toString = Object.prototype.toString;

// Define version
PB.VERSION = '0.6.0';
