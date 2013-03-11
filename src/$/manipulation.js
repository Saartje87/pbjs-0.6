PB.overwrite($.prototype, {
	
	append: function ( target ) {

		var i = 0;

		target = PB.$(target);

		for( ; i < target.length; i++ ) {

			this[0].appendChild(target[i]);
		}

		return this;
	},

	appendTo: function ( target ) {

		var i = 0;

		target = PB.$(target);

		for( ; i < this.length; i++ ) {

			target[0].appendChild(this[i]);
		}

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