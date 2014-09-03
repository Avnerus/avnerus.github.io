(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict"

var events = require('events');
var eventEmitter = new events.EventEmitter();
console.log('Events init');

module.exports.getEmitter = function() {
    return eventEmitter;
}


},{"events":5}],2:[function(require,module,exports){
// VIDEO PART
//
var VideoController = require('./video_controller');
var Popper = require('./popper');
var videoContoller = new VideoController();
var eventEmitter = require('./event_manager').getEmitter();

window.onload = function() {
    window.scroll(0, 0);
    videoContoller.loadVideos($('#video-container'),$('#main-container').height());
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


var loader = new PIXI.AssetLoader(["assets/pops/amit.json"]);
loader.onComplete = function() {
    assetsLoaded = true;
    console.log("Assets loaded!");
    if (videosLoaded) {
        start();
    }
};
loader.load();


function start() {
   $('#loading-container').hide();
   popper.init();
   videoContoller.playWaiting();
}

/*
function loop() {
    videoContoller.loop();
    requestAnimationFrame(loop);
}

loop();*/


// GAME PART

var gameOpts = {
    stageWidth: 1280,
    stageHeight: 720,
}
var stage = new PIXI.Stage(0xFFFFFF);
var popper = new Popper(stage, gameOpts);
var renderer = new PIXI.autoDetectRenderer(gameOpts.stageWidth, gameOpts.stageHeight, null, true);
document.body.appendChild(renderer.view);


function animate() {
    popper.update();
    renderer.render(stage);
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

},{"./event_manager":1,"./popper":3,"./video_controller":4}],3:[function(require,module,exports){
"use strict"

module.exports = function(stage, opts) {
    return new Popper(stage,opts)
}

module.exports.Popper = Popper;


function Popper(stage, opts) {
    if (!(this instanceof Popper)) return new Popper(stage, opts)

    this.eventEmitter = require('./event_manager').getEmitter();
    this.stage = stage;
    this.opts = opts;

    this.pops = [];

    console.log("Popper started", this.opts);

    var self = this;

    this.eventEmitter.on('video_ended', function() {
        self.pop();
    });
}


Popper.prototype.init = function() {    
    this.amit_seq = [];

    for (var i = 1; i <= 12; i++) {
        var texture = new PIXI.Texture.fromFrame("amit" + i + ".png");
        this.amit_seq.push(texture);
    }
}

Popper.prototype.pop = function() {
    console.log("Popper popping!");

    var popper = new PIXI.MovieClip(this.amit_seq); 
    popper.loop = true;
    popper.anchor.x = popper.anchor.y = 0.5;
    popper.position.x = MathUtil.rndRange(0, this.opts.stageWidth);
    popper.position.y = MathUtil.rndRange(0, this.opts.stageHeight);
    popper.gotoAndPlay(MathUtil.rndRange(0, 11));
    popper.animationSpeed = 0.02;
    this.stage.addChild(popper);

    this.pops.push(popper);
}

Popper.prototype.update = function() {
    /*for (var i = 0; i < this.pops.length; i++) {
        var pop = this.pops[i];
        pop.rotation += 0.1;
    }*/
}

},{"./event_manager":1}],4:[function(require,module,exports){
"use strict"

module.exports = function(opts) {
    return new VideoController(opts)
}

module.exports.VideoController = VideoController;


function VideoController(opts) {
    if (!(this instanceof VideoController)) return new VideoController(opts)

    console.log("Video Controller started");
}

VideoController.prototype.loadVideos = function (container, scrollHeight) {

    this.VIDEOS = {
        waiting: { 
    //        'd': { path :'stubs/d.webm' },
      //      'blink': {path: 'stubs/blink.webm'},
        //    'e': {path: 'stubs/e.webm'} 
            'facebook' : {paths: ['fun/facebook.mp4', 'fun/facebook.webm']}
        },
        //enter: {path: 'stubs/hat.webm', duration: 6.76 }
    }

    this.eventEmitter = require('./event_manager').getEmitter();

    this.scrollHeight = scrollHeight;

    console.log("Preloading all videos into ", container , " scroll height: " + scrollHeight);
    var keys = Object.keys(this.VIDEOS.waiting);

    for (var i = 0; i < keys.length; i++) {
        var id = keys[i];
        this.loadVideo(id, this.VIDEOS.waiting[id], container);
    }
    //this.loadVideo('enter', this.VIDEOS.enter, container);

    this.nowPlaying = null;
}

VideoController.prototype.loadVideo = function (id, video, container) {
    video.loaded = false;
    video.id = id;
    console.log("Loading " + video.id);

    var videoElement = document.createElement("VIDEO"); 
    videoElement.id = id;
    videoElement.style.display = "none";
    video.element = videoElement;

    for (var i = 0; i < video.paths.length; i++) {
        var sourceElement = document.createElement("SOURCE"); 
        sourceElement.src = 'videos/' + video.paths[i];
        videoElement.appendChild(sourceElement);
    }

    var self = this;

    /*videoElement.oncanplaythrough = function(event) {
        self.videoCanPlayThrough(event.target);
    }*/

    videoElement.addEventListener("canplaythrough",function(event) {self.videoCanPlayThrough(event.target)}, false);
    videoElement.addEventListener("ended",function(event) {self.videoEnded(event.target)}, false);

    container.append(videoElement);
    videoElement.preload = "auto";
    videoElement.play();

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
    //if (allLoaded && this.VIDEOS.enter.loaded) {
    if (allLoaded) {
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

VideoController.prototype.pageScroll = function(offset) {
    if (!this.VIDEOS) {
        return;
    }
    if (offset > 0) {
       console.log(offset, "-->",(offset / this.scrollHeight) * this.VIDEOS.enter.duration)
       this.showEnterAt((offset / this.scrollHeight) * this.VIDEOS.enter.duration); 
    } 
    else {
        this.playRandomWaiting();
    }
}

VideoController.prototype.loop = function() {
    if (!this.VIDEOS) {
        return;
    }
    var offset = window.pageYOffset;
    if (offset > 0) {
       this.showEnterAt((offset / this.scrollHeight) * this.VIDEOS.enter.duration); 
    } 
    else {
        if (this.nowPlaying && this.nowPlaying.id == this.VIDEOS.enter.id) {
            this.playRandomWaiting();
        }
    }
}

VideoController.prototype.showEnterAt = function(time) {
    if (this.nowPlaying && this.nowPlaying.id != 'enter') {
        this.hideVideo(this.nowPlaying);
        this.showVideo(this.VIDEOS.enter);
        this.nowPlaying = this.VIDEOS.enter;
    }
    this.VIDEOS.enter.element.currentTime = time;
}


VideoController.prototype.hideVideo = function (video) {
  video.element.style.display = "none";
}
VideoController.prototype.showVideo = function (video) {
  video.element.style.display = "block";  
}

},{"./event_manager":1}],5:[function(require,module,exports){
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