PB.overwrite($.prototype, {
	
	append: function ( target ) {

		target = PB.$(target);

		this[0].appendChild(target[0]);

		return this;
	},

	appendTo: function ( target ) {

		target = PB.$(target);

		target[0].appendChild(this[0]);

		return this;
	},

	prepend: function () {


	},

	prependTo: function () {


	},

	insertBefore: function () {


	},

	insertAfter: function () {


	},

	replace: function () {


	}
});