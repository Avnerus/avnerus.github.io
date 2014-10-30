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
