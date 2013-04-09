PB.Queue = PB.Class(PB.Observer, {
	
	construct: function () {

		var self = this; 

		// Constuct Observer
		this.parent();

		// 
		this._queue = [];

		// Wrap run for next callback
		this.next = function () {

			self.run();
		};

		return this;
	},

	queue: function ( fn, context ) {

		this._queue.push({

			fn: fn,
			context: context
		});

		return this;
	},

	run: function () {

		var item = this._queue.shift();

		if( !item ) {

			return;
		}

		item.fn.call(item.fn.context, this.next);

		return this;
	},

	stop: function () {

		this._queue.unshift(undefined);

		return this;
	},

	clear: function () {

		this._queue.length = 0;

		return this;
	}
});
