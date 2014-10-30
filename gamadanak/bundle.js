(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"
// var PIXI = require('pixi');
var TWEEN = require('tween.js');

module.exports = function(stage, emitter, opts) {
  return new BeatFall(stage, emitter, opts)
}

module.exports.BeatFall = BeatFall


function BeatFall(stage, emitter, opts) {
   // protect against people who forget 'new'
   if (!(this instanceof BeatFall)) return new BeatFall(stage, emitter, opts)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.stage = stage
    this.opts = opts || {}
    this.emitter = emitter;
    // this.emitter = emitter;
    
    this.speed = 400 / 1000; // Pixels per millsecond
    this.matchRange = 30;

    console.log("Loading beat fall"); 
    this.haman_shape = new PIXI.Sprite.fromImage('assets/haman_shape.png');
    var slider = this;
    this.running = false;
    this.lastHaman = null;
    this.hamanQueue = [];
    this.tweenQueue = [];

	this.pixelateFilter = new PIXI.PixelateFilter();
	this.pixelateFilter.size = {x: 6, y: 6};
    //this.colorFilter = new PIXI.ColorMatrixFilter();
    //this.colorFilter.matrix = [1,0,0,1,1,1,1,0,0,0,1,0,0,0,0,1];

    // Handle spacebar
    window.onkeydown = function(e) { 
        if (e.keyCode == 32) {
            slider.spacePressed();
            return false;
        } 
    };

    emitter.on('gameStart', function(message){
        slider.start(message.bpm);
    });
    emitter.on('gameStop', function(message){
        slider.stop();
    });
}

BeatFall.prototype.start = function(bpm) {
    this.bpm = bpm;
   // this.haman.position.x = - (this.sliderBg.width / 2) + (this.haman.width / 2);
    this.msPerBeat = 60000 / this.bpm;
    this.startDistance = 8 * this.speed * this.msPerBeat; // Start 6 beats away 
    this.hamanDistance = this.speed * this.msPerBeat;
    this.startPosition = {x: 1200, y: this.haman_shape.position.y - this.startDistance};

    console.log("The starting position is " + this.startDistance + " away from the shape");
    this.running = true;
}
BeatFall.prototype.stop = function() {
    console.log("Fall stopping");
    this.running = false;
    //this.haman.position.x = - (this.sliderBg.width / 2) + (this.haman.width / 2);
    //this.forthTween = null;
}

BeatFall.prototype.spacePressed = function() {
    if (!this.running) {
        return;
    }
    var goalHaman = this.hamanQueue[0];
    //console.log("Goal Haman at " + goalHaman.position.y + " And haman shape at " + this.haman_shape.position.y)
    if (
        goalHaman.position.y <= this.haman_shape.position.y + this.matchRange &&
        goalHaman.position.y >= this.haman_shape.position.y - this.matchRange
       ) {
        this.emitter.emit('anakGood',{} );
        this.reachedHaman = this.hamanQueue.shift();
        var reachedTween = this.tweenQueue.shift();
        reachedTween.stop();
//        this.reachedHaman.filtes = [this.pixelateFilter, this.colorFilter];

        var target = {alpha : 0.0}; 
        var self = this;
        this.reachedHaman.tint = 0x00FF00;
        var fadeTween = new TWEEN.Tween(this.reachedHaman) 
            .to(target , 150) 
            .easing(TWEEN.Easing.Linear.None);
        fadeTween.onComplete(function() {
            self.hamanFaded();
        });
        fadeTween.start();
    } else {
        this.emitter.emit('anakBad',{} );
    }
}

BeatFall.prototype.hamanFaded = function() {
    this.stage.removeChild(this.reachedHaman);
}
BeatFall.prototype.hamanReached = function() {
    //console.log("Haman reached!");
    this.emitter.emit('anakBad',{} );
    var reachedHaman = this.hamanQueue.shift();
    var reachedTween = this.tweenQueue.shift();
    this.stage.removeChild(reachedHaman);
}

BeatFall.prototype.spawn = function() {
   // console.log("Spawning an haman");

    var haman = new PIXI.Sprite.fromFrame('assets/haman.png');
    haman.anchor.x = 0.5;
    haman.anchor.y = 0.5;
    haman.position = {x: this.startPosition.x, y: this.startPosition.y};
//    haman.filters = [this.pixelateFilter];

    this.stage.addChild(haman);
    this.lastHaman = haman;
    this.hamanQueue.push(haman);

    var time = (this.startDistance + 100) / this.speed;

    var target = {x:this.haman_shape.position.x ,y:this.haman_shape.position.y + 100};
    var self = this;

    var fallTween = new TWEEN.Tween(haman.position) 
        .to(target , time) 
        .easing(TWEEN.Easing.Linear.None);
    fallTween.onComplete(function() {
//        console.log("Haman reached!");
        self.hamanReached();
    });
    this.tweenQueue.push(fallTween);

    fallTween.start();
}

BeatFall.prototype.update = function() {
    if (!this.running) { 
        return;
    }
    if (this.lastHaman == null) {
        this.spawn();
    } else {
        var travelDistance = this.lastHaman.position.y - this.startPosition.y;
        if (travelDistance >= this.hamanDistance) {
//            console.log("Spawning because travel distance is " + travelDistance + " and haman distance should be " + this.hamanDistance);
            this.spawn();
        } 
    }
}

BeatFall.prototype.place = function(position) {
    this.haman_shape.anchor.x = 0.5;
    this.haman_shape.anchor.y = 0.5;
    this.haman_shape.position = {x: 1200, y: 650};

    this.stage.addChild(this.haman_shape);
}

},{"tween.js":4}],2:[function(require,module,exports){
// account for tile thickness
/* globals PIXI, kd, requestAnimFrame */
"use strict";
//var PIXI = require('pixi');
var TWEEN = require('tween.js');
var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter;
window.emitter = emitter;

var gameOpts = {
    stageWidth: 1450,
    stageHeight: 768,
}

var stage = new PIXI.Stage(0x000000);
var renderer = new PIXI.autoDetectRenderer(gameOpts.stageWidth, gameOpts.stageHeight);
document.body.appendChild(renderer.view);

var world = new Box2D.Dynamics.b2World(new Box2D.Common.Math.b2Vec2(0, 10),  true);

var loader = new PIXI.AssetLoader(["assets/sweatpants.png", "assets/haman.png", "assets/dance_seq.json","assets/dance_seq2.json", "assets/angry_seq.json"]);
loader.onComplete = start;
loader.load();
var paused = false;
emitter.on('gameStop', function(message){
    paused = true;
});
emitter.on('gameStart', function(message){
    paused = false;
});

function start() {
    console.log("Starting Gamad Anak!");

    var playerContoller = require('./player_controller')(emitter);

    var scoreBoard = require('./scoreboard')(stage, emitter, gameOpts);
    scoreBoard.place();

    //var beatSlider = require('./beat_slider')(stage, emitter, gameOpts);
    //beatSlider.place();
    var beatFall = require('./beat_fall')(stage, emitter, gameOpts);
    beatFall.place();

    var gnome = require('./gnome')(stage, emitter, scoreBoard, gameOpts);
    gnome.place();

    var sweatpants = require('./sweatpants')(stage, emitter, scoreBoard, world, gameOpts);

    function animate() {
        // keyboard handler
        // kd.tick();
        requestAnimationFrame(animate);
        if (!paused) {
            TWEEN.update();
        }
        beatFall.update();
        world.Step(1 / 60,  3,  3);
        world.ClearForces();
        sweatpants.update();
        
        renderer.render(stage);
    }
    requestAnimationFrame(animate);
}

},{"./beat_fall":1,"./gnome":3,"./player_controller":5,"./scoreboard":6,"./sweatpants":7,"events":8,"tween.js":4}],3:[function(require,module,exports){
"use strict"
//var PIXI = require('pixi');

module.exports = function(stage, emitter, scoreBoard, opts) {
  return new Gnome(stage, emitter,scoreBoard, opts)
}

module.exports.Gnome = Gnome


function Gnome(stage, emitter, scoreBoard, opts) {
   // protect against people who forget 'new'
   if (!(this instanceof Gnome)) return new Gnome(stage, emitter, scoreBoard, opts)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.stage = stage
    this.opts = opts || {}
    this.emitter = emitter;
    this.scoreBoard = scoreBoard;

    console.log("Loading gnome"); 
    this.sprite = new PIXI.Sprite.fromImage('assets/pixelgnome.png');
    this.sprite.scale = {x: 0.5, y: 0.5};
    
    var gnome = this;

    // Loading dance clips
    this.dances  = [];
    
    this.loadAnim("gnome_dance", 23);
    this.loadAnim("gnome_dance2", 34);
    this.loadAnim("gnome_angry", 18);


    this.currentDance = null;

    emitter.on('anakGood', function(message){
        gnome.anakGood();
    });
    emitter.on('anakLostCombo', function(message){
        gnome.anakLostCombo();
    });
}


Gnome.prototype.loadAnim = function(name, frames) {
    var dance_seq = [];
    var gnome = this;
    for (var i = 1; i <= frames; i++) {
       var num = pad(i,4); 
       var texture = new PIXI.Texture.fromFrame(name + num + ".png");
       dance_seq.push(texture);
    }
    var dance = new PIXI.MovieClip(dance_seq);
    dance.anchor.x = 0.5;
    dance.anchor.y = 0.5;
    dance.position.x = this.opts.stageWidth / 2;
    dance.position.y = 330;
    dance.scale = {x: 0.5, y: 0.5};
    dance.loop = false;
    dance.onComplete = function() {
       gnome.danceComplete();
    };
    dance.visible = false;
    this.stage.addChild(dance);
    
    this.dances.push(dance);
    
}

Gnome.prototype.place = function(position) {
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.sprite.position.x = this.opts.stageWidth / 2;
    this.sprite.position.y = 330;
    this.stage.addChild(this.sprite);

}
Gnome.prototype.anakGood = function(position) {
    if (this.currentDance != null) {
        this.danceComplete();
    }
    if (this.scoreBoard.combo > 0 && (this.scoreBoard.combo % 3) == 0) {
        this.currentDance = this.dances[1];
    } else {
        this.currentDance = this.dances[0];
    }
    this.currentDance.gotoAndPlay(0);
    this.currentDance.visible = true;
    this.sprite.visible = false;
}

Gnome.prototype.anakLostCombo = function(position) {
    if (this.currentDance != null) {
        this.danceComplete();
    }
    this.currentDance = this.dances[2];
    this.currentDance.gotoAndPlay(0);
    this.currentDance.visible = true;
    this.sprite.visible = false;
}

Gnome.prototype.danceComplete = function() {
    if (this.currentDance != null) {
        this.currentDance.visible = false;
        this.sprite.visible = true;
    }
    this.currentDance = null;
}
function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

},{}],4:[function(require,module,exports){
// tween.js - http://github.com/sole/tween.js
/**
 * @author sole / http://soledadpenades.com
 * @author mrdoob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 * @author endel / http://endel.me
 * @author Ben Delarre / http://delarre.net
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '12',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;
		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

                // Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
                if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
						_reversed = !_reversed;
					}
					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

module.exports=TWEEN;
},{}],5:[function(require,module,exports){
"use strict"

module.exports = function(emitter) {
  return new PlayerController(emitter)
}

module.exports.PlayerController = PlayerController


function PlayerController(emitter) {
   // protect against people who forget 'new' 
  if (!(this instanceof PlayerController)) return new PlayerController(emitter)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.emitter = emitter;
    console.log(this.emitter);
    this.currentSongIndex = -1;
    this.currentSong;

    // The MIXTAPE
    this.mixtape = [
        { 
            file: "lies.ogg",
            text: "CHVRCHES - Lies",
            bpm: 103.027
        },
        {
            file: "zebra.ogg",
            text: "Beachc House - Zebra",
            bpm: 118.379
        }
     /*  { 
            file: "1_sink_the_seine.ogg",
            text: "Of Montreal - Sink the Seine",
            bpm: 99.969
        },
        { 
            file: "2_you_for_me.ogg",
            text: "Frankie Rose - You for Me",
            bpm: 151.08
        },
        { 
            file: "3_suzanne.ogg",
            text: "Anna Calvi - Suzanne & I",
            bpm: 105.593
        },
        { 
            file: "4_22_days.ogg",
            text: "22-20s - 22 Days",
            bpm: 104.209
        },
        { 
            file: "5_believe.ogg",
            text: "Deerhoof - Believe E.S.P",
            bpm: 89.806
        },
        { 
            file: "6_not_getting_there.ogg",
            text: "Blonde Redhead - Not Getting There",
            bpm: 110.045
        },
        { 
            file: "7_birth_in_reverse.ogg",
            text: "St. Vincent - Birth in Reverse",
            bpm: 162
        },
        { 
            file: "8_coin_operated_boy.ogg",
            text: "The Dresden Dolls - Coin Operated Boy",
            bpm: 134.784
        },
        { 
            file: "9_burning.ogg",
            text: "The Whitest Boy Alive - Burning",
            bpm: 150.81
        },
        { 
            file: "10_go_away.ogg",
            text: "TOPS - Go Away",
            bpm: 120.914
        },
        { 
            file: "11_bad_ritual.ogg",
            text: "Timber Timbre - Bad Ritual",
            bpm: 75.715
        },
        { 
            file: "12_eros.ogg",
            text: "Of Montreal - Eros' Enthropic Tundra",
            bpm: 120.011
        },
        { 
            file: "13_IOU.ogg",
            text: "Metric - IOU",
            bpm: 157.076
        },
        { 
            file: "14_arabic.ogg",
            text: "Dafna VehaOogiot - Haver Aravi",
            bpm: 84.10
        },
        { 
            file: "15_amanaemonesia.ogg",
            text: "Chairlift - Amanaemonesia",
            bpm: 166.957
        },
        { 
            file: "16_buy_nothing_day.ogg",
            text: "The Go! Team - Buy Nothing Day",
            bpm: 141.254
        },
        { 
            file: "17_fear_of_my_identity.ogg",
            text: "Best Coast - Fear of My Identity",
            bpm: 126.956
        },
        { 
            file: "18_forever.ogg",
            text: "HAIM - Forever",
            bpm: 117.948
        },
        { 
            file: "19_oasis.ogg",
            text: "Amanda Palmer - Oasis",
            bpm: 140.096
        },
        { 
            file: "20_suns_eyes.ogg",
            text: "Rubik - Sun's Eyes",
            bpm: 97.032
        },
        { 
            file: "21_lose_it.ogg",
            text: "Austra - Lose It",
            bpm: 138.035
        },
        { 
            file: "22_no_angel.ogg",
            text: "Beyonce - No Angel",
            bpm: 121.472
        },
        { 
            file: "23_oblivion.ogg",
            text: "Grimes - Oblivion",
            bpm: 77.997
        },
        { 
            file: "24_white_collar_boy.ogg",
            text: "Belle and Sebastian - White Collar Boy",
            bpm: 133.72
        },
        { 
            file: "25_o_my_heart.ogg",
            text: "Mother Mother - O My Heart",
            bpm: 146.012
        },
        { 
            file: "26_strawberries.ogg",
            text: "Asobi Seksu - Strawberries",
            bpm: 130.457
        },
        { 
            file: "27_polite_dance_song.ogg",
            text: "The Bird and the Bee - Polite Dance Song",
            bpm: 150.082
        },
        { 
            file: "28_wild.ogg",
            text: "Beach House - Wild",
            bpm: 94.634
        },
        { 
            file: "29_heaven_can_wait.ogg",
            text: "Charlotte Gainsbourg - Heaven Can Wait",
            bpm: 104.985
        },
        { 
            file: "30_deep_is_the_breath.ogg",
            text: "Kasper Bjorke - Deep is the Breath",
            bpm: 111.96
        },
        { 
            file: "31_inspector_norse.ogg",
            text: "Todd Terje - Inspector Norse",
            bpm: 120.012
        },
        { 
            file: "32_i_heard_ramona.ogg",
            text: "Frank Black - I Heard Ramona Sing",
            bpm: 106.055
        },
        { 
            file: "33_revival.ogg",
            text: "Deerhunter - Revival",
            bpm: 119.043
        },
        { 
            file: "34_please.ogg",
            text: "Fiona Apple - Please Please Please",
            bpm: 102.414
        },
        { 
            file: "35_swim_and_sleep.ogg",
            text: "Unkown Mortal Orchestra - Swim And Sleep ( Like A Shark)",
            bpm: 123.511
        },
        { 
            file: "36_kah_ota.ogg",
            text: "Dafna VehaOogiot - Kah Ota",
            bpm: 129.91
        },
        { 
            file: "37_kaze_wo_atsumete.ogg",
            text: "Happy End - Kaze wo Atsumete",
            bpm: 92.479
        },
        { 
            file: "38_silent_song.ogg",
            text: "Daniel Rossen - Silent Song",
            bpm: 79.991
        },
        { 
            file: "39_black.ogg",
            text: "Danger Mouse - Black",
            bpm: 86.704
        },
        { 
            file: "40_i_wish_my_daddy.ogg",
            text: "Codeine Velvet Club - I Wish my Daddy",
            bpm: 159.96
        },
        { 
            file: "41_son_of_three.ogg",
            text: "The Breeders - Son of Three",
            bpm: 133.36
        },
        { 
            file: "42_eclipse_blue.ogg",
            text: "Nosaj Thing - Eclipse/Blue",
            bpm: 158.019
        },
        { 
            file: "43_bad_kingdom.ogg",
            text: "Moderat - Bad Kingdom",
            bpm: 117.943
        },
        { 
            file: "44_lies.ogg",
            text: "CHVRCHES - Lies",
            bpm: 103.027
        },
        { 
            file: "45_let_it_bleed.ogg",
            text: "Goat - Let It Bleed",
            bpm: 97.173
        },
        { 
            file: "46_es_so.ogg",
            text: "Tune Yards - Es-So",
            bpm: 91.502
        },
        { 
            file: "47_blue_summer.ogg",
            text: "The Phoenix Foundation - Blue Summer",
            bpm: 144.166
        },
        { 
            file: "48_pass_this_on.ogg",
            text: "The Knife - Pass This On",
            bpm: 125.975
        },
        { 
            file: "49_rock_n_roll.ogg",
            text: "Seu Jorge - Rock N' Roll Suicide",
            bpm: 96.32
        },
        { 
            file: "50_ukulele_anthem.ogg",
            text: "Amanda Palmer - Ukulele Anthem",
            bpm: 89.556
        }*/
    ];

    var ctrl = this;

    console.log("Loading player controller"); 
    /*$(document).ready(function() {
        $("#player").bind('play', function() {
            ctrl.onPlay();
        });
    });*/
    emitter.on('playPressed', function(message){
        ctrl.onPlayPressed();
    });
    emitter.on('stopPressed', function(message){
        ctrl.onStopPressed();
    });
    emitter.on('pausePressed', function(message){
        ctrl.onPausePressed();
    });
    emitter.on('ffwdPressed', function(message){
        ctrl.onFfwdPressed();
    });
    emitter.on('rewindPressed', function(message){
        ctrl.onRewindPressed();
    }); 
    emitter.on('soundInit', function(message){
        ctrl.onSoundInit();
    }); 
}

PlayerController.prototype.onPlayPressed = function() {
    console.log("Play Pressed");
    if (this.currentSongIndex == -1) {
        this.currentSongIndex = 0;
        this.currentSong = this.mixtape[0];
        this.currentSong.sound.play();
        $("#song-label").text(this.currentSong.text);
    } else {
        this.currentSong.sound.play();
    }
}
PlayerController.prototype.onStopPressed = function() {
    console.log("Stop Pressed");
    if (this.currentSong) {
        this.currentSong.sound.pause();
    }
}
PlayerController.prototype.onPausePressed = function() {
    console.log("Stop Pressed");
    if (this.currentSong) {
        this.currentSong.sound.togglePause();
    }
}
PlayerController.prototype.onFfwdPressed = function() {
    console.log("FFwd Pressed");
    if (this.currentSongIndex == -1 || this.currentSongIndex >= this.mixtape.length -1 || !this.currentSong) {
        return;
    }
    this.nextSong();
}
PlayerController.prototype.nextSong = function() {
    this.currentSong.sound.stop();
    this.currentSongIndex++;
    this.currentSong = this.mixtape[this.currentSongIndex];
    this.currentSong.sound.play({position: 0});
    $("#song-label").text(this.currentSong.text);
    this.emitter.emit("songChanged", {});
}
PlayerController.prototype.onRewindPressed = function() {
    console.log("Rewind Pressed");
    if (this.currentSongIndex <= 0 || !this.currentSong) {
        return;
    }
    this.currentSong.sound.stop();
    this.currentSongIndex--;
    this.currentSong = this.mixtape[this.currentSongIndex];
    this.currentSong.sound.play({position: 0});
    $("#song-label").text(this.currentSong.text);
    this.emitter.emit("songChanged", {});
}
PlayerController.prototype.onPlay = function() {
    console.log("Playing!");
    this.emitter.emit("tapeStart", {});
    this.emitter.emit("gameStart", {bpm: this.currentSong.bpm});
}
PlayerController.prototype.onFinish = function() {
    console.log("Song Finished!");
    if (this.currentSongIndex >= this.mixtape.length -1 || !this.currentSong) {
        this.emitter.emit("tapeStop", {});
        this.emitter.emit("gameStop", {});
    } else {
        this.nextSong();
    }
}
PlayerController.prototype.onPause = function() {
    console.log("Pause!");
    this.emitter.emit("tapeStop", {});
    this.emitter.emit("gameStop", {});
}
PlayerController.prototype.onResume = function() {
    console.log("Resume!")
    this.emitter.emit("tapeStart", {});
    this.emitter.emit("gameStart", {bpm: this.currentSong.bpm});
}
PlayerController.prototype.onSoundInit = function() {
    var ctrl = this;
    var s;
    console.log("Init mixtape sound");
    for (var i = 0; i < this.mixtape.length; i++) {
        var song = this.mixtape[i];
        s = soundManager.createSound({
          id: song.file,
          url: 'mixtape/' + song.file,
          multiShot: false,
          onplay: function () {ctrl.onPlay()},
          onfinish: function() {ctrl.onFinish() },
          onpause: function () {ctrl.onPause()},
          onresume: function () {ctrl.onResume()},
          onid3: function() {
            console.log(this.sID + 'got ID3 data', this.id3);
          }
        });
        this.mixtape[i].sound = s;
    }

}

},{}],6:[function(require,module,exports){
"use strict"
//var PIXI = require('pixi');
var TWEEN = require('tween.js');

module.exports = function(stage, emitter, opts) {
  return new ScoreBoard(stage, emitter, opts)
}

module.exports.ScoreBoard = ScoreBoard


function ScoreBoard(stage, emitter, opts) {
   // protect against people who forget 'new'
   if (!(this instanceof ScoreBoard)) return new ScoreBoard(stage, emitter, opts)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.stage = stage
    this.opts = opts || {}
    this.points = 0;
    this.combo = 0;
    this.lastScore = 0;
    this.emitter = emitter;

    console.log("Loading score board"); 

    var board = this;
    emitter.on('anakGood', function(message){
        board.anakGood();
    });
    emitter.on('anakBad', function(message){
        board.anakBad();
    });
    emitter.on('songChanged', function(message){
        board.songChanged();
    });
}


ScoreBoard.prototype.songChanged = function(position) {
    this.lastScore = this.points;
    this.points = this.combo = 0;
    this.updateBoard();
}
ScoreBoard.prototype.anakGood = function(position) {
    var addValue = 1;
    if (this.combo >= 35) {
        addValue = 10;
    } else if (this.combo >= 20) {
        addValue = 5;
    } else if (this.combo >= 10) {
        addValue = 2;
    }
    this.combo++;
    this.points += addValue;
    this.updateBoard();
}

ScoreBoard.prototype.anakBad = function(position) {
    if (this.combo != 0) {
        this.emitter.emit('anakLostCombo',{combo: this.combo} );
        this.combo = 0;
        this.updateBoard();
    }
}

ScoreBoard.prototype.updateBoard = function(position) {
    this.pointsValue.setText(this.points);
    this.comboValue.setText(this.combo);
    this.lastScoreValue.setText(this.lastScore);
    this.forthTweenPoints.start();
    this.forthTweenCombo.start();
}

ScoreBoard.prototype.place = function(position) {
    this.pointsLabel = new PIXI.Text("Player's Points:", {font:"62px JustAnotherHandRegular", fill:"#bb2c2c"});
    this.pointsLabel.position.y = 100;
    this.pointsLabel.position.x = 90;
    this.pointsValue = new PIXI.Text(this.points, {font:"48px Arial", fill:"#bb2c2c"});
    this.pointsValue.position.y = 108;
    this.pointsValue.position.x = 300;
    this.stage.addChild(this.pointsLabel);
    this.stage.addChild(this.pointsValue);

    this.comboLabel = new PIXI.Text("Player's Combo:", {font:"62px JustAnotherHandRegular", fill:"#3399cc"});
    this.comboLabel.position.y = 200;
    this.comboLabel.position.x = 90;
    this.comboValue = new PIXI.Text(this.combo, {font:"48px Arial", fill:"#3399cc"});
    this.comboValue.position.y = 208;
    this.comboValue.position.x = 300;

    this.stage.addChild(this.comboLabel);
    this.stage.addChild(this.comboValue);

    this.lastScoreLabel = new PIXI.Text("Last song score:", {font:"48px JustAnotherHandRegular", fill:"white"});
    this.lastScoreLabel.position.y = 420;
    this.lastScoreLabel.position.x = 90;
    this.lastScoreValue = new PIXI.Text(this.combo, {font:"32px Arial", fill:"white"});
    this.lastScoreValue.position.y = 430;
    this.lastScoreValue.position.x = 300;

    this.stage.addChild(this.lastScoreLabel);
    this.stage.addChild(this.lastScoreValue);

    // Bounce tweens

    var forthTarget = {x: 1.5, y: 1.5};
    var backTarget  = {x: 1, y: 1};
    var board = this;
    this.forthTweenPoints = new TWEEN.Tween(this.pointsValue.scale) 
        .to(forthTarget , 60) 
        .easing(TWEEN.Easing.Linear.None);

    this.backTweenPoints = new TWEEN.Tween(this.pointsValue.scale) 
        .to(backTarget , 60) 
        .easing(TWEEN.Easing.Linear.None) 

    this.forthTweenPoints.chain(this.backTweenPoints);

    this.forthTweenCombo = new TWEEN.Tween(this.comboValue.scale) 
        .to(forthTarget , 60) 
        .easing(TWEEN.Easing.Linear.None);

    this.backTweenCombo = new TWEEN.Tween(this.comboValue.scale) 
        .to(backTarget , 60) 
        .easing(TWEEN.Easing.Linear.None) 

    this.forthTweenCombo.chain(this.backTweenCombo);

}

},{"tween.js":4}],7:[function(require,module,exports){
"use strict"
//var PIXI = require('pixi');

module.exports = function(stage, emitter, scoreBoard, world, opts) {
  return new SweatPants(stage, emitter,scoreBoard, world, opts)
}

module.exports.SweatPants = SweatPants

var METER = 100;

function SweatPants(stage, emitter, scoreBoard, world, opts) {
   // protect against people who forget 'new'
   if (!(this instanceof SweatPants)) return new SweatPants(stage, emitter, scoreBoard, world, opts)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.stage = stage
    this.opts = opts || {}
    this.emitter = emitter;
    this.scoreBoard = scoreBoard;
    this.world = world;
    this.inPsych = false;
    this.psychCount = 0;

    console.log("Loading sweatpants"); 
    this.sprite = new PIXI.Sprite.fromImage('assets/pixelgnome.png');
    var pants = this;

    emitter.on('anakGood', function(message){
        pants.anakGood();
    });
    emitter.on('anakLostCombo', function(message){
        pants.anakLostCombo();
    });


    // Box2D Init
    console.log(this.world);

    this.polyFixture = new Box2D.Dynamics.b2FixtureDef();

    this.polyFixture.shape = new Box2D.Collision.Shapes.b2PolygonShape();
    this.polyFixture.density = 1;


    this.circleFixture	= new Box2D.Dynamics.b2FixtureDef();
    this.circleFixture.shape	= new Box2D.Collision.Shapes.b2CircleShape();
    this.circleFixture.density = 1;
    this.circleFixture.restitution = 0.7;

    this.bodyDef = new Box2D.Dynamics.b2BodyDef();
    this.bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;

    //down
    this.polyFixture.shape.SetAsBox(10, 1);
    this.bodyDef.position.Set(9, this.opts.stageHeight / METER + 1);
    console.log("Floor 2d position at " , this.bodyDef.position);
    this.world.CreateBody(this.bodyDef).CreateFixture(this.polyFixture);
    
    //left
    this.polyFixture.shape.SetAsBox(1, 100);
    this.bodyDef.position.Set(-1, 0);
    this.world.CreateBody(this.bodyDef).CreateFixture(this.polyFixture);
    
    //right
    this.bodyDef.position.Set(this.opts.stageWidth / METER + 1, 0);
    this.world.CreateBody(this.bodyDef).CreateFixture(this.polyFixture);
    this.bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

    this.allPants = [];
    this.bodies = [];
    this.pantsToRemove = [];


    // Psych mode
    this.container = new PIXI.DisplayObjectContainer();
    this.container.position = {x:this.opts.stageWidth / 2, y: this.opts.stageHeight /2};

	this.bgFront = PIXI.Sprite.fromImage("assets/SceneRotate.jpg");
    this.bgFront.anchor.x = 0.5;
    this.bgFront.anchor.y = 0.5;
    this.bgFront.height = this.opts.stageHeight * 2;
    this.bgFront.width = this.opts.stageWidth + 300;
    
    this.container.addChild(this.bgFront);

	this.light2 = PIXI.Sprite.fromImage("assets/LightRotate2.png");
    this.light2.anchor.x = 0.5;
    this.light2.anchor.y = 0.5;
    this.container.addChild(this.light2);

    this.light1 = PIXI.Sprite.fromImage("assets/LightRotate1.png");
    this.light1.anchor.x = 0.5;
    this.light1.anchor.y = 0.5;
    this.container.addChild(this.light1);

	this.colorMatrix =
        [1,0,0,0,
         0,1,0,0,
         0,0,1,0,
         0,0,0,1];


    this.filter = new PIXI.ColorMatrixFilter();
}


SweatPants.prototype.goPsych = function() {
    console.log("Psychadelic Mode!!");
    this.stage.addChildAt(this.container,0);
    this.stage.filters = [this.filter];
    this.inPsych = true;
}

SweatPants.prototype.start = function(numOfPants) {
    for (var i = 0; i < numOfPants; i++) {
        var pants = new PIXI.Sprite(PIXI.Texture.fromFrame("assets/sweatpants.png")); 
        pants.index = i;
	pants.tint = Math.floor(Math.random()*16777215);

        this.allPants.push(pants);

        this.bodyDef.position.Set(MathUtil.rndRange(0, this.opts.stageWidth) / METER, -MathUtil.rndRange(50, 2000) / METER);
        var body = this.world.CreateBody(this.bodyDef);
        this.circleFixture.shape.SetRadius(50 / METER);
        body.CreateFixture(this.circleFixture);
        this.bodies.push(body);
        
        pants.anchor.x = pants.anchor.y = 0.5;
        this.stage.addChild(pants);
    }
    /*
    this.polyFixture.shape.SetAsBox(51 / 2 / METER, 100 / 2 / METER);
    this.body.CreateFixture(this.polyFixture);*/
}

SweatPants.prototype.update = function(position) {
    for (var i = 0; i < this.allPants.length; i++) {
        var body = this.bodies[i];
        var pants = this.allPants[i];
        var position = body.GetPosition();
        pants.position.x = position.x * 100;
        pants.position.y = position.y * 100;
        pants.rotation = body.GetAngle();
    }
    if (this.inPsych) {
        this.bgFront.rotation -= 0.01;

        this.light1.rotation += 0.02;
        this.light2.rotation += 0.01;

        this.psychCount += 0.01;

        this.colorMatrix[1] = Math.sin(this.psychCount) * 3;
        this.colorMatrix[2] = Math.cos(this.psychCount);
        this.colorMatrix[3] = Math.cos(this.psychCount) * 1.5;
        this.colorMatrix[4] = Math.sin(this.psychCount/3) * 2;
        this.colorMatrix[5] = Math.sin(this.psychCount/2);
        this.colorMatrix[6] = Math.sin(this.psychCount/4);
        this.filter.matrix = this.colorMatrix;
    }
}
SweatPants.prototype.anakGood = function(position) {
    if (this.pantsToRemove.length > 0) {
        for (var i = 0; i < this.pantsToRemove.length; i++) {
            var thePants = this.pantsToRemove[i];
            this.stage.removeChild(thePants);
        }
        this.pantsToRemove.splice(0, this.pantsToRemove.length);
    }
    if (this.scoreBoard.combo >= 0 && this.scoreBoard.combo % 10 == 0) {
        this.start(10);
    }
    if (this.scoreBoard.combo == 35) {
        this.goPsych();
    }
}

SweatPants.prototype.anakLostCombo = function(position) {
    for (var i = 0; i < this.allPants.length; i++) {
        var pants = this.allPants[i];
        var body = this.bodies[i];
        this.world.DestroyBody(body);
        //this.stage.removeChild(pants);
        pants.visible = false;
        this.pantsToRemove.push(pants);
    }
    this.allPants.splice(0, this.allPants.length);
    this.bodies.splice(0, this.bodies.length);

    if (this.inPsych) {
        this.stage.removeChild(this.container);
        this.stage.psychCount = 0;
        this.colorMatrix =
            [1,0,0,0,
             0,1,0,0,
             0,0,1,0,
             0,0,0,1];
        this.filter.matrix = this.colorMatrix;
        this.inPsych = false;
    }
}

},{}],8:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      console.trace();
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[2])