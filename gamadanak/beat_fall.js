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
