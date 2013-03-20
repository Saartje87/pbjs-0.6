PB.overwrite($.prototype, {

	width: function () {

		return this.getStyle('width', true);
	},

	innerWidth: function () {

		return this.getStyle('width', true) + this.getStyle('paddingLeft', true) + this.getStyle('paddingRight', true);
	},

	outerWidth: function ( includeMargin ) {

		if( includeMargin )
			return this.innerWidth() + this.getStyle('borderLeftWidth', true) + this.getStyle('borderRightWidth', true) + this.getStyle('marginLeft', true) + this.getStyle('marginRight', true);

		return this.innerWidth() + this.getStyle('borderLeftWidth', true) + this.getStyle('borderRightWidth', true);
	},

	scrollWidth: function () {

		return this[0].scrollWidth;
	},

	height: function () {

		return this.getStyle('height', true);
	},

	innerHeight: function () {

		return this.getStyle('height', true) + this.getStyle('paddingTop', true) + this.getStyle('paddingBottom', true);
	},

	outerHeight: function ( includeMargin ) {

		if( includeMargin )
			return this.innerHeight() + this.getStyle('borderTopWidth', true) + this.getStyle('borderBottomWidth', true) + this.getStyle('marginTop', true) + this.getStyle('marginBottom', true);

		return this.innerHeight() + this.getStyle('borderTopWidth', true) + this.getStyle('borderBottomWidth', true);
	},

	scrollHeight: function () {

		return this[0].scrollHeight;
	},

	setScroll: function ( position ) {

		var i = 0;

		for( ; i < this.length; i++ ) {

			if( position.top !== undefined ) {

				this[i].scrollTop = position.top;
			}

			if( position.left !== undefined ) {

				this[i].scrollLeft = position.left;
			}
		}

		return this;
	},

	getScroll: function () {

		return {

			top: this[0].scrollTop,
			left: this[0].scrollLeft
		};
	},

	// position
	position: function () {

		var box = this[0].getBoundingClientRect();

		return {

			top: box.top + (window.scrollY || window.pageYOffset),
			left: box.left + (window.scrollX || window.pageXOffset)
		}
	},

	offset: function () {

		var element = this[0],
			box = {

				top: 0,
				left: 0
			};

		while( element ) {

			box.top += element.offsetTop;
			box.left += element.offsetLeft;

			element = element.offsetParent;

			if( !element || PB.$(element).getStyle('position') !== 'static' ) {

				break;
			}
		}

		return box;
	}
});