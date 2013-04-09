// Animation handler
PB.Animation = function Animation ( options ) {

	this.running = false;
	// this.startAt;
	// this.endAt;
	// this.timer;

	this.duration = options.duration * 1000;
	this.onTick = options.onTick || function () {};
	this.timerFunction = PB.Animation.effects[options.effect] || PB.Animation.effects.ease;
	this.data = options.data;
};

PB.overwrite(PB.Animation.prototype, {

	start: function () {

		this.startAt = +new Date();
		this.endAt = this.startAt + this.duration;
		this.running = true;

		this.tick();
	},

	stop: function () {

		clearTimeout(this.timer);

		this.running = false;
	},

	tick: function () {

		var time = +new Date(),
			self = this,
			// Position in animation from 0.0 - 1.0
			position = this.timerFunction(1 - ((this.endAt - time) / this.duration ));
	
		if( time >= this.endAt ) {
		
			this.onTick(1, this.data, this);
			this.stop();
		
			return;
		}

		this.onTick(position, this.data, this);

		this.timer = setTimeout(function () {

			self.tick();
		}, 1000 / 60);
	}
});

//Should be reconsidered
PB.Animation.effects = {

	linear: function ( t ) {
	
		return t;
	},

	ease: function ( t ) {
	
		return t;
	},

	'ease-in': function ( t ) {
	
		return t*t;
	},

	'ease-out': function ( t ) {
	
		return -1*t*(t-2);
	},

	'ease-in-out': function ( t ) {
	
		return t;
	},

	bounce: function ( t ) {

		if (t < (1/2.75)) {

			return (7.5625*t*t);
		} else if (t < (2/2.75)) {

			return (7.5625*(t-=(1.5/2.75))*t + 0.75);
		} else if (t < (2.5/2.75)) {

			return (7.5625*(t-=(2.25/2.75))*t + 0.9375);
		} else {
			return (7.5625*(t-=(2.625/2.75))*t + 0.984375);
		}
	}
};