(function ( name, context, definition ) {
	
	this[name] = definition( context );

})('PB', this, function ( context ) {

"use strict";

var PB = {},

	// Previous PB
	_PB = context.PB,
	
	// Unique id, fetch from previous PB or start from 0
	uid = _PB ? _PB.id() : 0,
	
	// References
	slice = Array.prototype.slice,
	toString = Object.prototype.toString,
	undefined;

// Define version
PB.VERSION = '0.6.0';
