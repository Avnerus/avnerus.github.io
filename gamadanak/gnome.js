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
