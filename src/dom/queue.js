PB.Queue = PB.Class({

	construct: function () {

		this.stack = [];
		this.length = 0;
		this.state = PB.Queue.STATE_IDLE;

		this._next = this.next.bind(this);
	},

	add: function ( fn, context ) {

		if( this.length === 0 && this.state !== PB.Queue.STATE_INPROGRESS ) {

			this.state = PB.Queue.STATE_INPROGRESS;

			fn.call(context || fn, this._next);
		} else {

			this.length++;

			this.stack.unshift(fn.bind(context || fn, this._next));
		}

		return this;
	},

	run: function () {

		var i = 0,
			queue = this.stack,
			fn;

		if( this.state === PB.Queue.STATE_INPROGRESS || !queue ) {

			return this;
		}

		this.state = PB.Queue.STATE_INPROGRESS;

		fn = this.stack.pop();

		if( fn ) {

			fn();
		}

		return this;
	},

	next: function () {

		console.log('next');

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
