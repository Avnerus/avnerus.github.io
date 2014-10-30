"use strict"
// var PIXI = require('pixi');
var TWEEN = require('tween.js');

module.exports = function(stage, emitter, opts) {
  return new BeatSlider(stage, emitter, opts)
}

module.exports.BeatSlider = BeatSlider


function BeatSlider(stage, emitter, opts) {
   // protect against people who forget 'new'
   if (!(this instanceof BeatSlider)) return new BeatSlider(stage, emitter, opts)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.stage = stage
    this.opts = opts || {}
    this.emitter = emitter;
    // this.emitter = emitter;

    console.log("Loading beat slider"); 
    this.sliderBg = new PIXI.Sprite.fromImage('assets/slider_background.png');
    this.haman = new PIXI.Sprite.fromImage('assets/haman.png');
    var slider = this;
    this.running = false;

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

BeatSlider.prototype.start = function(bpm) {
    console.log("Slider tuning to " + bpm + " BPM!");
    this.bpm = bpm;
    console.log(this.sliderBg.width);
    this.haman.position.x = - (this.sliderBg.width / 2) + (this.haman.width / 2);
    this.run()
}
BeatSlider.prototype.stop = function() {
    console.log("Slider stopping");
    this.haman.position.x = - (this.sliderBg.width / 2) + (this.haman.width / 2);
    this.forthTween.stop();
    //this.forthTween = null;
}

BeatSlider.prototype.spacePressed = function(bpm) {
    if (!this.running) {
        return;
    }
    var place = this.haman.position.x;
    if (
        (place <= 15 && place >= -15) ||
        (place >= 165) ||
        (place <= -165)
    ) {
        this.emitter.emit('anakGood',{} );
    } else {
        this.emitter.emit('anakBad',{} );
    }
}

BeatSlider.prototype.run = function(bpm) {
    // It should take 2 beats
    
    var time = 2000 / (this.bpm / 60);
    var forthTarget = {x: (this.sliderBg.width / 2) - (this.haman.width / 2), y: this.haman.position.y}
    var backTarget = {x: -(this.sliderBg.width / 2) + (this.haman.width / 2), y: this.haman.position.y}
    var slider = this;
    this.forthTween = new TWEEN.Tween(this.haman.position) 
        .to(forthTarget , time) 
        .easing(TWEEN.Easing.Linear.None)
        .yoyo(true)
        .repeat(Infinity);

    console.log("Beat Slider starting");
    this.forthTween.start();
    this.running = true;
}

BeatSlider.prototype.place = function(position) {
    this.sliderBg.anchor.x = 0.5;
    this.sliderBg.anchor.y = 0.5;
    this.sliderBg.position.x = this.opts.stageWidth / 2;
    this.sliderBg.position.y = 100; 

    this.haman.anchor.x = 0.5;
    this.haman.anchor.y = 0.5;

    this.sliderBg.addChild(this.haman);
    this.stage.addChild(this.sliderBg);

}
