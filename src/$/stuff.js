PB.overwrite($.prototype, {

	each: function ( fn ) {

		for( var i = 0; i < this.length; i++ ) {

			this.context = this[i];

			fn.apply(this, arguments);
		}

		this.context = this[0];

		return this;
	},

	hasClass: function ( className ) {

		return (' '+this.context.className+' ').indexOf(' '+className+' ') >= 0;
	},
	
	addClass: function ( classNames ) {

		classNames = classNames.split(' ');

		return this.each(function () {

			for( var i = 0; i < classNames.length; i++ ) {
				
				// Already exists
				if( (' '+this.context.className+' ').indexOf(' '+classNames[i]+' ') >= 0 ) {
				
					continue;
				}
			
				this.context.className += (this.context.className ? ' ' : '')+classNames[i];
			}
		});
	},

	addClass2: function ( classNames ) {

		var i = 0,
			className,
			j;

		classNames = classNames.split(' ');

		for( ; i < this.length; i++ ) {

			for( j = 0; j < classNames.length; j++ ) {

				className = ' '+this[i].className+' ';
				
				// Already exists
				if( className.indexOf(' '+classNames[j]+' ') >= 0 ) {
				
					continue;
				}
			
				this[i].className += (this[i].className ? ' ' : '')+classNames[j];
			}
		}

		return this;
	}
});