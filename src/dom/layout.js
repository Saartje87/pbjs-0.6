PB.overwrite(PB.$.fn, {

	width: function () {

		if( this[0] === window ) {

			// Return viewport width, excluding toolbars/scrollbars
			// Using docElement.clientWidth for IE7/8
			return window.innerWidth || docElement.clientWidth;
		} else if ( this[0] === doc ) {

			// Return document size
			return Math.max(docElement.clientWidth, docElement.offsetWidth, docElement.scrollWidth);
		}

		return this.getStyle('width', true);
	},

	innerWidth: function () {

		return this.width() + this.getStyle('paddingLeft', true) + this.getStyle('paddingRight', true);
	},

	outerWidth: function ( includeMargin ) {

		var outerWidth = this.innerWidth() + this.getStyle('borderLeftWidth', true) + this.getStyle('borderRightWidth', true);

		if( includeMargin ) {

			outerWidth += this.getStyle('marginLeft', true) + this.getStyle('marginRight', true);
		}

		return outerWidth;
	},

	scrollWidth: function () {

		return this[0].scrollWidth;
	},

	height: function () {

		if( this[0] === window ) {

			// Return viewport width, excluding toolbars/scrollbars
			// Using docElement.clientWidth for IE7/8
			return window.innerHeight || docElement.clientHeight;
		} else if ( this[0] === doc ) {

			// Return document size
			return Math.max(docElement.clientHeight, docElement.offsetHeight, docElement.scrollHeight);
		}

		return this.getStyle('height', true);
	},

	innerHeight: function () {

		return this.height() + this.getStyle('paddingTop', true) + this.getStyle('paddingBottom', true);
	},

	outerHeight: function ( includeMargin ) {

		var outerHeight = this.innerHeight() + this.getStyle('borderTopWidth', true) + this.getStyle('borderBottomWidth', true);

		if( includeMargin ) {

			outerHeight += this.getStyle('marginTop', true) + this.getStyle('marginBottom', true);
		}

		return outerHeight;
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

	/**
	 * Get scroll position left/top from the first element in the set.
	 *
	 * When first element is not element node, this will return position of scroll in viewport
	 *
	 * @return {Object} {top: x, left: x}
	 */
	getScroll: function () {

		return {

			top: this[0].nodeType === 1 ? this[0].scrollTop : Math.max(docElement.scrollTop, doc.body.scrollTop),
			left: this[0].nodeType === 1 ? this[0].scrollLeft : Math.max(docElement.scrollLeft, doc.body.scrollLeft)
		};
	},

	// position
	position: function () {

		var box = this[0].getBoundingClientRect();

		return {

			top: box.top + (window.scrollY || window.pageYOffset || docElement.scrollTop),
			left: box.left + (window.scrollX || window.pageXOffset || docElement.scrollLeft)
		};
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
	},

	/**
	 * Returns true if the first element in the set has the given class name.
	 */
	hasClass: function ( className ) {

		return (' '+this[0].className+' ').indexOf(' '+className+' ') >= 0;
	},

	/**
	 * Add class(es) to every element in the set.
	 */
	addClass: function ( classNames ) {

		var i = 0,
			classList = classNames.split(' '),
			className,
			j;

		for( ; i < this.length; i++ ) {
			
			className = ' '+this[i].className+' ';

			for( j = 0; j < classList.length; j++ ) {

				// Skip if element already got the class
				if( className.indexOf(' '+classList[j]+' ') >= 0 ) {
				
					continue;
				}
				
				// Add class
				this[i].className += (this[i].className ? ' ' : '')+classList[j];
			}
		}

		return this;
	},

	/**
	 * Removes class(es) from every element in the set.
	 */
	removeClass: function ( classNames ) {

		var i = 0,
			classList = classNames.split(' '),
			l = classList.length,
			className,
			j;

		for( ; i < this.length; i++ ) {

			className = ' '+this[i].className+' ';

			for( j = 0; j < l; j++ ) {
				
				// Already exists
				if( className.indexOf(' '+classList[j]+' ') >= 0 ) {
				
					className = className.replace(' '+classList[j]+' ', ' ');
				}
			}

			// Trim whitespaces
			className = className.replace(/^\s|\s$/g, '');

			// Update class list
			if( className ) {

				this[i].className = className;
			}
			// Remove class attribute
			else {

				this[i].removeAttribute('class');
			}
		}

		return this;
	},

	/**
	 * Shows every element in the set.
	 */
	show: function () {

		var i = 0;

		for( ; i < this.length; i++ ) {

			this[i].style.display = domGetStorage(this[i])['css-display'] || 'block';
		}

		return this;
	},

	/**
	 * Hides every element in the set.
	 */
	hide: function () {

		var display,
			i = 0;

		for( ; i < this.length; i++ ) {

			display = PB.$(this[i]).getStyle('display');

			// Store css display value
			if( display !== 'none' ) {

				domGetStorage(this[i])['css-display'] = display;
			}

			// Hide element
			this[i].style.display = 'none';
		}

		return this;
	},

	/**
	 * Returns boolean whether the first element in the set is visible or not.
	 *
	 * - rename to shown ?
	 */
	isVisible: function () {

		var element = PB.$(this[0]);

		return element.getStyle('display') !== 'none' && element.getStyle('opacity') > 0;
	}
});