PB.Queue = PB.Class({

	construct: function () {

		this.stack = [];
		this.length = 0;
		this.state = PB.Queue.STATE_IDLE;

		this._next = this.next.bind(this);
	},

	add: function ( fn, context ) {

		this.length++;

		this.stack.unshift(fn.bind(context || fn, this._next));

		return this;
	},

	run: function () {

		var i = 0,
			queue = this.stack,
			fn;

		if( this.state === PB.Queue.STATE_INPROGRESS || !queue.length ) {

			return this;
		}

		this.state = PB.Queue.STATE_INPROGRESS;

		fn = this.stack.pop();

		fn();

		return this;
	},

	next: function () {

		this.state = PB.Queue.STATE_IDLE;

		this.run();
	},

	empty: function () {

		this.stack.length = 0;
		this.state = PB.Queue.STATE_IDLE;
	}
});

PB.Queue.STATE_IDLE = 0;
PB.Queue.STATE_INPROGRESS = 1;
