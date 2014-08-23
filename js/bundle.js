(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){"use strict";var events=require("events");var eventEmitter=new events.EventEmitter;console.log("Events init");module.exports.getEmitter=function(){return eventEmitter}},{events:4}],2:[function(require,module,exports){var VideoController=require("./video_controller");var videoContoller=new VideoController;var eventEmitter=require("./event_manager").getEmitter();window.onload=function(){videoContoller.loadVideos($("#video-container"))};eventEmitter.on("videos_loaded",function(){$("#loading-container").hide();videoContoller.playWaiting()})},{"./event_manager":1,"./video_controller":3}],3:[function(require,module,exports){"use strict";module.exports=function(opts){return new VideoController(opts)};module.exports.VideoController=VideoController;function VideoController(opts){if(!(this instanceof VideoController))return new VideoController(opts);console.log("Video Controller started")}VideoController.prototype.loadVideos=function(container){this.VIDEOS={waiting:{d:{path:"stubs/d.webm"},blink:{path:"stubs/blink.webm"},e:{path:"stubs/e.webm"}}};this.eventEmitter=require("./event_manager").getEmitter();console.log("Preloading all videos into ",container);var keys=Object.keys(this.VIDEOS.waiting);for(var i=0;i<keys.length;i++){var id=keys[i];this.loadVideo(id,this.VIDEOS.waiting[id],container)}};VideoController.prototype.loadVideo=function(id,video,container){video.loaded=false;console.log("Loading "+video.path);var videoElement=document.createElement("VIDEO");videoElement.src="videos/"+video.path;videoElement.id=id;videoElement.style.display="none";video.element=videoElement;var self=this;videoElement.oncanplaythrough=function(event){self.videoCanPlayThrough(event.target)};videoElement.onended=function(event){self.videoEnded(event.target)};container.append(videoElement);videoElement.preload="auto"};VideoController.prototype.videoCanPlayThrough=function(video){if(!this.VIDEOS.waiting[video.id].loaded){console.log("Video can play through!",video);this.VIDEOS.waiting[video.id].loaded=true;this.checkLoaded()}};VideoController.prototype.checkLoaded=function(){var allLoaded=true;var keys=Object.keys(this.VIDEOS.waiting);for(var i=0;i<keys.length&&allLoaded;i++){var id=keys[i];allLoaded=this.VIDEOS.waiting[id].loaded}if(allLoaded){console.log("All videos are loaded!");this.eventEmitter.emit("videos_loaded")}};VideoController.prototype.playWaiting=function(){this.playRandomWaiting()};VideoController.prototype.playRandomWaiting=function(){var keys=Object.keys(this.VIDEOS.waiting);var index=Math.floor(Math.random()*keys.length);var video=this.VIDEOS.waiting[keys[index]];console.log("Playing ",video);video.element.style.display="block";video.element.play()};VideoController.prototype.videoEnded=function(video){video.style.display="none";this.playRandomWaiting()}},{"./event_manager":1}],4:[function(require,module,exports){function EventEmitter(){this._events=this._events||{};this._maxListeners=this._maxListeners||undefined}module.exports=EventEmitter;EventEmitter.EventEmitter=EventEmitter;EventEmitter.prototype._events=undefined;EventEmitter.prototype._maxListeners=undefined;EventEmitter.defaultMaxListeners=10;EventEmitter.prototype.setMaxListeners=function(n){if(!isNumber(n)||n<0||isNaN(n))throw TypeError("n must be a positive number");this._maxListeners=n;return this};EventEmitter.prototype.emit=function(type){var er,handler,len,args,i,listeners;if(!this._events)this._events={};if(type==="error"){if(!this._events.error||isObject(this._events.error)&&!this._events.error.length){er=arguments[1];if(er instanceof Error){throw er}else{throw TypeError('Uncaught, unspecified "error" event.')}return false}}handler=this._events[type];if(isUndefined(handler))return false;if(isFunction(handler)){switch(arguments.length){case 1:handler.call(this);break;case 2:handler.call(this,arguments[1]);break;case 3:handler.call(this,arguments[1],arguments[2]);break;default:len=arguments.length;args=new Array(len-1);for(i=1;i<len;i++)args[i-1]=arguments[i];handler.apply(this,args)}}else if(isObject(handler)){len=arguments.length;args=new Array(len-1);for(i=1;i<len;i++)args[i-1]=arguments[i];listeners=handler.slice();len=listeners.length;for(i=0;i<len;i++)listeners[i].apply(this,args)}return true};EventEmitter.prototype.addListener=function(type,listener){var m;if(!isFunction(listener))throw TypeError("listener must be a function");if(!this._events)this._events={};if(this._events.newListener)this.emit("newListener",type,isFunction(listener.listener)?listener.listener:listener);if(!this._events[type])this._events[type]=listener;else if(isObject(this._events[type]))this._events[type].push(listener);else this._events[type]=[this._events[type],listener];if(isObject(this._events[type])&&!this._events[type].warned){var m;if(!isUndefined(this._maxListeners)){m=this._maxListeners}else{m=EventEmitter.defaultMaxListeners}if(m&&m>0&&this._events[type].length>m){this._events[type].warned=true;console.error("(node) warning: possible EventEmitter memory "+"leak detected. %d listeners added. "+"Use emitter.setMaxListeners() to increase limit.",this._events[type].length);if(typeof console.trace==="function"){console.trace()}}}return this};EventEmitter.prototype.on=EventEmitter.prototype.addListener;EventEmitter.prototype.once=function(type,listener){if(!isFunction(listener))throw TypeError("listener must be a function");var fired=false;function g(){this.removeListener(type,g);if(!fired){fired=true;listener.apply(this,arguments)}}g.listener=listener;this.on(type,g);return this};EventEmitter.prototype.removeListener=function(type,listener){var list,position,length,i;if(!isFunction(listener))throw TypeError("listener must be a function");if(!this._events||!this._events[type])return this;list=this._events[type];length=list.length;position=-1;if(list===listener||isFunction(list.listener)&&list.listener===listener){delete this._events[type];if(this._events.removeListener)this.emit("removeListener",type,listener)}else if(isObject(list)){for(i=length;i-->0;){if(list[i]===listener||list[i].listener&&list[i].listener===listener){position=i;break}}if(position<0)return this;if(list.length===1){list.length=0;delete this._events[type]}else{list.splice(position,1)}if(this._events.removeListener)this.emit("removeListener",type,listener)}return this};EventEmitter.prototype.removeAllListeners=function(type){var key,listeners;if(!this._events)return this;if(!this._events.removeListener){if(arguments.length===0)this._events={};else if(this._events[type])delete this._events[type];return this}if(arguments.length===0){for(key in this._events){if(key==="removeListener")continue;this.removeAllListeners(key)}this.removeAllListeners("removeListener");this._events={};return this}listeners=this._events[type];if(isFunction(listeners)){this.removeListener(type,listeners)}else{while(listeners.length)this.removeListener(type,listeners[listeners.length-1])}delete this._events[type];return this};EventEmitter.prototype.listeners=function(type){var ret;if(!this._events||!this._events[type])ret=[];else if(isFunction(this._events[type]))ret=[this._events[type]];else ret=this._events[type].slice();return ret};EventEmitter.listenerCount=function(emitter,type){var ret;if(!emitter._events||!emitter._events[type])ret=0;else if(isFunction(emitter._events[type]))ret=1;else ret=emitter._events[type].length;return ret};function isFunction(arg){return typeof arg==="function"}function isNumber(arg){return typeof arg==="number"}function isObject(arg){return typeof arg==="object"&&arg!==null}function isUndefined(arg){return arg===void 0}},{}]},{},[2]);