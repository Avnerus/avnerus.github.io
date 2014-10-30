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
