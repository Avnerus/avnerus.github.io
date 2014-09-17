(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"

module.exports = function(opts, videoContoller) {
    return new BrainController(opts, videoContoller)
}

module.exports.BrainController = BrainController;

var WORKS = require('./works');
var TWEEN = require('tween.js');


// MASK VALUES
// **********


var MASK_VALUES = [];
for (var i = 0; i < 25; i++) {
    MASK_VALUES.push([905, 261, 111, 44]);
}

MASK_VALUES.push([905, 260, 113, 44]);
MASK_VALUES.push([905, 261, 113, 44]);
MASK_VALUES.push([905, 262, 113, 45]);
MASK_VALUES.push([905, 263, 113, 45]);
MASK_VALUES.push([905, 264, 113, 45]); //30
MASK_VALUES.push([905, 265, 113, 45]);
MASK_VALUES.push([905, 267, 113, 45]);
MASK_VALUES.push([905, 269, 113, 46]);
MASK_VALUES.push([905, 273, 113, 47]); // 34
MASK_VALUES.push([905, 273, 113, 49]);
MASK_VALUES.push([905, 275, 113, 51]);
MASK_VALUES.push([905, 277, 113, 53]);
MASK_VALUES.push([905, 280, 113, 55]);
MASK_VALUES.push([905, 283, 113, 57]);
MASK_VALUES.push([905, 288, 113, 59]); //40
MASK_VALUES.push([905, 295, 113, 63]);
MASK_VALUES.push([905, 302, 113, 65]);
MASK_VALUES.push([905, 312, 113, 70]);
MASK_VALUES.push([905, 312, 113, 70]);
MASK_VALUES.push([905, 320, 113, 75]);
MASK_VALUES.push([905, 325, 113, 85]);
MASK_VALUES.push([905, 328, 113, 94]); // 47
MASK_VALUES.push([905, 348, 113, 95]);
MASK_VALUES.push([905, 348, 113, 95]);
MASK_VALUES.push([905, 370, 113, 95]); // 50
MASK_VALUES.push([905, 370, 113, 95]); // 51
MASK_VALUES.push([905, 383, 113, 115]);
MASK_VALUES.push([905, 390, 113, 115]);
MASK_VALUES.push([905, 410, 113, 115]);
MASK_VALUES.push([905, 415, 113, 115]);
MASK_VALUES.push([905, 420, 113, 115]);
MASK_VALUES.push([905, 425, 113, 115]);
MASK_VALUES.push([905, 425, 113, 115]);
MASK_VALUES.push([905, 445, 113, 115]);
MASK_VALUES.push([905, 460, 113, 120]); //60
MASK_VALUES.push([905, 460, 113, 130]); 
MASK_VALUES.push([905, 468, 113, 130]);
MASK_VALUES.push([905, 480, 113, 140]);
MASK_VALUES.push([905, 480, 113, 140]);
MASK_VALUES.push([908, 490, 130, 140]); //65
MASK_VALUES.push([908, 490, 130, 140]); 
MASK_VALUES.push([908, 495, 120, 140]); 
MASK_VALUES.push([908, 500, 120, 140]); 
MASK_VALUES.push([915, 513, 122, 141]);  
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70
MASK_VALUES.push([915, 513, 122, 141]);  // 70

//


function BrainController(opts, videoContoller) {
    if (!(this instanceof BrainController)) return new BrainController(opts, videoContoller)

    this.opts = opts;
    this.videoContoller = videoContoller;

    console.log("Brain Controller started");
}

BrainController.prototype.init = function (stage, ratio) {

    console.log("Brain Controller initializing");

    this.stage = stage;
    this.ratio = ratio;

	this.bgContainer = new PIXI.DisplayObjectContainer();
    this.maskContainer = new PIXI.DisplayObjectContainer();
    this.maskContainer.addChild(this.bgContainer);

	stage.addChild(this.maskContainer);


	var bg = PIXI.Sprite.fromFrame("assets/brain/bg.jpg");
	this.bgContainer.addChild(bg);

	this.overlay = new PIXI.TilingSprite(PIXI.Texture.fromFrame("assets/brain/tile_neurons.png"), this.opts.stageWidth, this.opts.stageHeight);
	this.overlay.alpha = 0.15;
	this.bgContainer.addChild(this.overlay);

	var displacementTexture = PIXI.Texture.fromFrame("assets/brain/displacement_map.png");
	this.displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
    this.displacementFilter.scale.x = 50;
    this.displacementFilter.scale.y = 50;


	this.twistFilter = new PIXI.TwistFilter();
    this.twistFilter.angle = 5;
    this.twistFilter.radius = 0.5;
    this.twistFilter.offset.x = 0.5;
    this.twistFilter.offset.y = 0.5;


    this.mask = new PIXI.Graphics();
    this.mask.cacheAsBitmap = true;
    this.mask.beginFill();
    this.mask.drawEllipse(606, 208, 70, 30);
    this.mask.endFill();


    this.maskContainer.mask = this.mask;

    this.bgContainer.visible = false;

    this.bgContainer.filters = [
        this.twistFilter
     //   this.displacementFilter
    ];

    this.counter = 0;


    this.loaded = true;

    var self = this;
    setTimeout(function() {
///        self.spawnWork();
    },3000);
}

BrainController.prototype.update = function () {
    if (this.loaded) {


        this.setMaskByOffset();

        this.counter += 0.1;
        this.overlay.tilePosition.x = this.counter * -10;
        this.overlay.tilePosition.y = this.counter * -10;
    /*	this.displacementFilter.offset.x = this.counter * 10;
        this.displacementFilter.offset.y = this.counter * 10;*/
        if (this.spawningSprite) {
            this.spawningSprite.rotation += 0.1;
        }
    }
}

BrainController.prototype.setMaskByOffset = function() {
    var offset = window.pageYOffset;
    var currentFrame = this.videoContoller.VIDEOS.enter.frames.current;
    console.log(currentFrame)
    if (currentFrame == 0) {
        this.bgContainer.visible = false;
    } else {
        this.bgContainer.visible = true;
        var values = MASK_VALUES[currentFrame - 1];
        this.mask.clear();
        this.mask.beginFill();
        this.mask.drawEllipse(values[0] * 1/this.ratio.x, values[1] * 1 / this.ratio.y, values[2] * 1/this.ratio.x, values[3] * 1/this.ratio.y);
        this.mask.endFill();
    }
}


BrainController.prototype.spawnWork = function () {
    // Choose a work to spawn
    var work = WORKS[MathUtil.rndIntRange(0, WORKS.length -1)];
    console.log("Spawning work ", work)

    var sprite = PIXI.Sprite.fromFrame("works/" + work.image);
    sprite.position.x = this.opts.stageWidth / 2;
    sprite.position.y = this.opts.stageHeight / 2;
    sprite.anchor.x = 0.5;
    sprite.anchor.y = 0.5;
    sprite.scale.x = 0.1;
    sprite.scale.y = 0.1;


    var spawnTween = new TWEEN.Tween(sprite.scale)
        .to({x:1, y: 1} , 7000)
        .easing(TWEEN.Easing.Cubic.InOut)

    spawnTween.onComplete(function() {
    });
    spawnTween.start();

    this.spawningSprite = sprite;

    this.stage.addChild(sprite);


}

},{"./works":5,"tween.js":6}],2:[function(require,module,exports){
"use strict"

var events = require('events');
var eventEmitter = new events.EventEmitter();
console.log('Events init');

module.exports.getEmitter = function() {
    return eventEmitter;
}


},{"events":7}],3:[function(require,module,exports){
var gameOpts = {
    stageWidth: 1280,
    stageHeight: 720,
    zoomHeight: 1500
}


// 
// VIDEO PART
//
var VideoController = require('./video_controller');
var videoContoller = new VideoController(gameOpts);
var eventEmitter = require('./event_manager').getEmitter();

window.onload = function() {
    window.scroll(0, 0);
    videoContoller.loadVideos($('#video-container'), $('#main-container').height());
}

// GAME PART

var TWEEN = require('tween.js');
var BrainController = require('./brain_controller');
var brainController = new BrainController(gameOpts, videoContoller);

var stage = new PIXI.Stage(0xFFFFFF);
var renderer = new PIXI.autoDetectRenderer(gameOpts.stageWidth, gameOpts.stageHeight, null, true);
//renderer.resize(window.innerWidth, window.innerHeight)
renderer.view.style.width = window.innerWidth + "px";
renderer.view.style.height = window.innerHeight + "px";

var container = new PIXI.DisplayObjectContainer();

var ratio = { x: window.innerWidth / gameOpts.stageWidth, y : window.innerHeight / gameOpts.stageHeight};

stage.addChild(container);


/*window.onscroll = function(event) {
    videoContoller.pageScroll(window.pageYOffset);
};*/

var videosLoaded = false
var assetsLoaded = false;

eventEmitter.on('videos_loaded', function() {
    console.log("Videos loaded!");
    videosLoaded = true;
    if (assetsLoaded) {
        start();
    }

});


var loader = new PIXI.AssetLoader([
    "assets/brain/bg.jpg",
    "assets/brain/tile_neurons.png",
    "assets/brain/displacement_map.png",
    "works/pulse.png"
]);
loader.onComplete = function() {
    assetsLoaded = true;
    console.log("Assets loaded!");

    brainController.init(container, ratio);

    if (videosLoaded) {
        start();
    }
};
loader.load();


function start() {
   $('#loading-container').hide();
   $('#pixi-container').append(renderer.view);
   videoContoller.playWaiting();
   requestAnimationFrame(animate);
}


function animate() {
    brainController.update();
    TWEEN.update();
    videoContoller.loop();
    renderer.render(stage);
    requestAnimationFrame(animate);
}

},{"./brain_controller":1,"./event_manager":2,"./video_controller":4,"tween.js":6}],4:[function(require,module,exports){
"use strict"

module.exports = function(opts) {
    return new VideoController(opts)
}

module.exports.VideoController = VideoController;


function VideoController(opts) {
    if (!(this instanceof VideoController)) return new VideoController(opts)

    this.scrollHeight = opts.scrollHeight;
    this.zoomHeight = opts.zoomHeight;
    this.stageWidth = opts.stageWidth;
    this.stageHeight = opts.stageHeight;

    console.log("Video Controller started", opts);
}

VideoController.prototype.loadVideos = function (container, scrollHeight) {

    this.VIDEOS = {
        waiting: { 
            'tired_blink': { paths : ['final/tired_blink.webm'] },
            'shrink_lip': {paths: ['final/shrink_lip.webm']},
            'rollingEyes_openMouth': {paths: [ 'final/rollingEyes_openMouth.webm' ]},
            'rollingEyes_blink': {paths: [ 'final/rollingEyes_blink.webm' ]},
            'open_mouth': {paths: [ 'final/open_mouth.webm' ]},
            'neutral': {paths: [ 'final/neutral.webm' ]},
            'blink02': {paths: [ 'final/blink02.webm' ]},
            'blink01': {paths: [ 'final/blink01.webm' ]},
        },
        enter: {
            frames: {
                path: 'final/enter',
                count: 82
            },
            duration: 6.76 
        }
    }

    this.eventEmitter = require('./event_manager').getEmitter();
    this.scrollHeight = scrollHeight;

    console.log("Preloading all videos into ", container , " scroll height: " + this.scrollHeight, " zoom height: " , this.zoomHeight);
    var keys = Object.keys(this.VIDEOS.waiting);

    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        this.loadVideo(id, this.VIDEOS.waiting[id], container);
    }
    this.loadVideo('enter', this.VIDEOS.enter, container);

    this.nowPlaying = null;
}

VideoController.prototype.loadVideo = function (id, video, container) {
    video.loaded = false;
    video.id = id;

    var self = this;

    if (video.frames) {
        console.log("Loading " + video.id + "(Regular video element)");
        video.frames.images = [];
        video.frames.loaded = 0;
        for (var i = 0; i < video.frames.count; i++) {
            var image = new Image();
            image.src = "videos/" + video.frames.path + "/f_" + MathUtil.pad(i + 269,5) + ".jpg";
            console.log("Loading image: " + image.src);
            image.addEventListener("load",function(event) {self.videoFrameLoaded(event.target)}, false);
            image.name = video.id;
            video.frames.images.push(image);
        }
        // Place holder image
        var placeholderImage = new Image();
        placeholderImage.src ="images/blank.jpg";
        placeholderImage.id = video.id;
        placeholderImage.style.position = "relative";
        container.append(placeholderImage);
        video.element = placeholderImage;
        video.frames.current = 0;
    } else {
        console.log("Loading " + video.id + "(Regular video element)");
        var videoElement = document.createElement("VIDEO"); 
        videoElement.id = id;
        videoElement.style.display = "none";
        video.element = videoElement;

        for (var i = 0; i < video.paths.length; i++) {
            var sourceElement = document.createElement("SOURCE"); 
            sourceElement.src = 'videos/' + video.paths[i];
            videoElement.appendChild(sourceElement);
        }


        /*videoElement.oncanplaythrough = function(event) {
            self.videoCanPlayThrough(event.target);
        }*/

        videoElement.addEventListener("canplaythrough",function(event) {self.videoCanPlayThrough(event.target)}, false);
        videoElement.addEventListener("ended",function(event) {self.videoEnded(event.target)}, false);

        container.append(videoElement);
        videoElement.preload = "auto";
        videoElement.load();
    }
}

VideoController.prototype.videoFrameLoaded = function(image) {
    var video = this.VIDEOS[image.name];
    video.frames.loaded++;
    console.log("Video frame loaded!", image, "Now loaded " + video.frames.loaded + " images");
    if (video.frames.count == video.frames.loaded && !video.loaded) {
        video.loaded = true;
        this.checkLoaded();
    }
}

VideoController.prototype.videoCanPlayThrough = function(video) {
    var videoData;
    if (video.id == 'enter') {
        videoData = this.VIDEOS.enter;
    } else {
        videoData = this.VIDEOS.waiting[video.id];
    }
    if (!videoData.loaded) {
        console.log("Video can play through!", video);
        videoData.loaded = true;
        this.checkLoaded();
    }
}


VideoController.prototype.videoLoadedMetadata = function(video) {
    console.log("Loaded metadata");
}

VideoController.prototype.checkLoaded = function() {
    var allLoaded = true;
    var keys = Object.keys(this.VIDEOS.waiting);

    for (var i = 0; i < keys.length && allLoaded; i++) {
        var id = keys[i];
        allLoaded = this.VIDEOS.waiting[id].loaded;
    }
    if (allLoaded && this.VIDEOS.enter.loaded) {
        console.log("All videos are loaded!");
        this.eventEmitter.emit('videos_loaded');
    }
}

VideoController.prototype.playWaiting = function() {
    this.playRandomWaiting();

}

VideoController.prototype.playRandomWaiting = function() {
    var keys = Object.keys(this.VIDEOS.waiting);
    var index = Math.floor(Math.random() * (keys.length)); 
    var video = this.VIDEOS.waiting[keys[index]];

    //console.log("Playing ", video);
    
    if (this.nowPlaying && video.id != this.nowPlaying.id) {
        this.hideVideo(this.nowPlaying);
    }

    this.showVideo(video);
    video.element.play();

    this.nowPlaying = video;
}

VideoController.prototype.videoEnded = function(video) {
    if (this.nowPlaying.id != 'enter') {
        this.eventEmitter.emit('video_ended');
        this.playRandomWaiting();
    }
}

VideoController.prototype.loop = function() {
    if (!this.VIDEOS) {
        return;
    }
    var offset = window.pageYOffset;
    var zoomStart = this.scrollHeight - this.zoomHeight;

    if (offset > 0 && offset <= zoomStart) {
      
       this.zoomVideo(1);
       this.showVideoAt(this.VIDEOS.enter, (offset / zoomStart)); 
    } 
    else if (offset > zoomStart) {
        // Zoom
        var zoomMultiplyer = 1 + ((offset - zoomStart) / this.zoomHeight  * 7);
        this.zoomVideo(zoomMultiplyer);
    }
    else {
        if (this.nowPlaying && this.nowPlaying.id == this.VIDEOS.enter.id) {
            this.playRandomWaiting();
        }
        this.VIDEOS.enter.frames.current = 0;
    }
}

VideoController.prototype.zoomVideo = function(zoomMultiplyer) {
    var video = this.nowPlaying;
    video.element.style.height = this.stageHeight * zoomMultiplyer + "px";
    video.element.style.width  = this.stageWidth * zoomMultiplyer + "px";
    if (zoomMultiplyer != 1) {
        video.element.style.bottom = (-this.stageHeight / 2 + (this.stageHeight + 210) * zoomMultiplyer / 2) + "px";
        video.element.style.right = (-this.stageWidth / 2 + this.stageWidth * zoomMultiplyer / 2) + "px";
    } else {
        video.element.style.bottom = (-this.stageHeight / 2 + this.stageHeight * zoomMultiplyer / 2) + "px";
        video.element.style.right = (-this.stageWidth / 2 + this.stageWidth * zoomMultiplyer / 2) + "px";
    }
}

VideoController.prototype.showVideoAt = function(video, offsetPercentage) {
    if (this.nowPlaying && this.nowPlaying.id != video.id) {
        this.hideVideo(this.nowPlaying);
        this.showVideo(video);
        this.nowPlaying = video;
    }
    var time;
    if (video.frames) {
        // It's a frames video - show the appropiate frame
        var frameNumber =  Math.min(Math.max( Math.round( offsetPercentage * video.frames.count), 1),video.frames.count);
        if (frameNumber != video.frames.current) {
            video.element.src = video.frames.images[frameNumber - 1].src;
            video.element.style.width = this.stageWidth;
            video.element.style.height = this.stageHeight;
            video.frames.current = frameNumber;
        }
    } else {
        // It's a real video - set currentTime
        time = offsetPercentage * this.VIDEOS.enter.duration;
        this.VIDEOS.enter.element.currentTime = time;
    }
}


VideoController.prototype.hideVideo = function (video) {
  video.element.style.display = "none";
}
VideoController.prototype.showVideo = function (video) {
  video.element.style.display = "block";  
}

},{"./event_manager":2}],5:[function(require,module,exports){
"use strict"

module.exports = [
    {
        name: "Pulse",
        image: "pulse.png"
    }
];

},{}],6:[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
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

		REVISION: '14',

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
	var _onStopCallback = null;

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

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

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

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
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
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
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
},{}],7:[function(require,module,exports){
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
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
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

},{}]},{},[3]);
