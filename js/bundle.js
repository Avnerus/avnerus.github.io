(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"

module.exports = function(opts) {
    return new BrainController(opts)
}

module.exports.BrainController = BrainController;

var WORKS = require('./works');


function BrainController(opts) {
    if (!(this instanceof BrainController)) return new BrainController(opts)

    this.opts = opts;

    console.log("Brain Controller started");
}

BrainController.prototype.init = function (stage) {

    console.log("Brain Controller initializing");

    this.stage = stage;

	var bgContainer = new PIXI.DisplayObjectContainer();
	stage.addChild(bgContainer);


	var bg = PIXI.Sprite.fromFrame("assets/brain/bg.jpg");
	bgContainer.addChild(bg);

	this.overlay = new PIXI.TilingSprite(PIXI.Texture.fromFrame("assets/brain/tile_neurons.png"), this.opts.stageWidth, this.opts.stageHeight);
	this.overlay.alpha = 0.15;
	bgContainer.addChild(this.overlay);

	var displacementTexture = PIXI.Texture.fromFrame("assets/brain/displacement_map.png");
	this.displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
    this.displacementFilter.scale.x = 50;
    this.displacementFilter.scale.y = 50;


	this.twistFilter = new PIXI.TwistFilter();
    this.twistFilter.angle = 5;
    this.twistFilter.radius = 0.5;
    this.twistFilter.offset.x = 0.5;
    this.twistFilter.offset.y = 0.5;

    bgContainer.filters = [this.twistFilter, this.displacementFilter];

    this.counter = 0;


    this.spawnWork();
}

BrainController.prototype.update = function () {
    this.counter += 0.1;
    this.overlay.tilePosition.x = this.counter * -5;
    this.overlay.tilePosition.y = this.counter * -5;
	this.displacementFilter.offset.x = this.counter * 10;
	this.displacementFilter.offset.y = this.counter * 10;
    this.pulse.rotation += 0.1;
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
    this.pulse = sprite;
    this.stage.addChild(sprite);

}

},{"./works":5}],2:[function(require,module,exports){
"use strict"

var events = require('events');
var eventEmitter = new events.EventEmitter();
console.log('Events init');

module.exports.getEmitter = function() {
    return eventEmitter;
}


},{"events":6}],3:[function(require,module,exports){
var gameOpts = {
    stageWidth: 1280,
    stageHeight: 720,
    zoomHeight: 1500
}

gameOpts.scrollHeight = console.log(gameOpts);


// GAME PART


var BrainController = require('./brain_controller');
var brainController = new BrainController(gameOpts);

var gameOpts = {
    stageWidth: 1280,
    stageHeight: 720,
}
var stage = new PIXI.Stage(0xFFFFFF);
var renderer = new PIXI.autoDetectRenderer(gameOpts.stageWidth, gameOpts.stageHeight, null, true);
renderer.view.style.position = "absolute"
renderer.view.style.width = window.innerWidth + "px";
renderer.view.style.height = window.innerHeight + "px";
renderer.view.style.display = "block";


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

    brainController.init(stage);

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
    videoContoller.loop();
    renderer.render(stage);
    requestAnimationFrame(animate);
}

},{"./brain_controller":1,"./event_manager":2,"./video_controller":4}],4:[function(require,module,exports){
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

    console.log("Video Controller started");
}

VideoController.prototype.loadVideos = function (container, scrollHeight) {

    this.VIDEOS = {
        waiting: { 
            'd': { paths : ['stubs/d.webm'] },
            'blink': {paths: ['stubs/blink.webm']},
            'e': {paths: [ 'stubs/e.webm' ]} 
        },
        enter: {
           // paths: ['stubs/hat.webm'], 
            frames: {
                path: 'stubs/hat',
                count: 138
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
        for (var i = 1; i <= video.frames.count; i++) {
            var image = new Image();
            image.src = "videos/" + video.frames.path + "/frame_" + MathUtil.pad(i,4) + ".jpg";
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
    }
}

VideoController.prototype.zoomVideo = function(zoomMultiplyer) {
    var video = this.nowPlaying;
    video.element.style.height = this.stageHeight * zoomMultiplyer + "px";
    video.element.style.width  = this.stageWidth * zoomMultiplyer + "px";
    video.element.style.bottom = (-this.stageHeight / 2 + this.stageHeight * zoomMultiplyer / 2) + "px";
    video.element.style.right = (-this.stageWidth / 2 + this.stageWidth * zoomMultiplyer / 2) + "px";
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
