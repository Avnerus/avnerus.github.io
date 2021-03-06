"use strict"

module.exports = function(videoController) {
    return new BrainController(videoController)
}

module.exports.BrainController = BrainController;

var TWEEN = require('tween.js');
var eventEmitter = require('./event_manager').getEmitter();
var Vue = require('vue');


function BrainController(videoController) {
    if (!(this instanceof BrainController)) return new BrainController(videoController)

    this.videoController = videoController;
    this.works = [];

    console.log("Brain Controller started");
}

BrainController.prototype.init = function (opts, stage, ratio, renderer, workContainer, infoContainer, navRow) {

    console.log("Brain Controller initializing with opts", opts);

    this.stage = stage;
    this.ratio = ratio; 
    this.opts = opts;
    this.workContainer = workContainer;
    this.infoContainer = infoContainer;
    this.navRow = navRow;

	this.bgContainer = new PIXI.DisplayObjectContainer();
    this.showingWork = false;
    this.showingInfo = false;

    this.renderer = renderer;

	stage.addChild(this.bgContainer);


	var bg = PIXI.Sprite.fromFrame("assets/brain/bg.jpg");
	this.bgContainer.addChild(bg);

	this.overlay = new PIXI.TilingSprite(PIXI.Texture.fromFrame("assets/brain/tile_neurons.png"), this.opts.stageWidth, this.opts.stageHeight / 2);
	this.overlay.alpha = 0.4;
    this.overlay.tilePosition.y = - 120;
	this.bgContainer.addChild(this.overlay);

	var displacementTexture = PIXI.Texture.fromFrame("assets/brain/displacement_map.png");
	this.displacementFilter = new PIXI.DisplacementFilter(displacementTexture);
    this.displacementFilter.scale.x = 50;
    this.displacementFilter.scale.y = 50;


	this.twistFilter = new PIXI.TwistFilter();
    this.twistFilter.angle = 10; 
    this.twistFilter.radius = 0.5;
    this.twistFilter.offset.x = 0.5;
    this.twistFilter.offset.y = 0.25;

    this.updateMaskbyVideoSize(1);
    this.maskUpdated = true;

    this.bgContainer.visible = true;

    this.bgContainer.filters = [
       this.twistFilter
       //this.displacementFilter
    ];

    this.counter = 0;


    this.initWorks();
    this.initMusic();

    this.loaded = true;

    var self = this;

    eventEmitter.on('work_clicked', function(work) {
        self.workClicked(work);
    });

    eventEmitter.on('info_clicked', function() {
        self.infoClicked();
    });
}


BrainController.prototype.workClicked = function(work) {
    console.log("Work clicked!", work);
    this.vm.$data = work.getData();
    this.vm.$data.currentIndex = 0;
    $('#work-media').addClass('flexslider');
    var self = this;
    Vue.nextTick(function() {
        $('.magnify-image').magnificPopup({type:'image', closeOnContentClick: true});
        
        /*console.log("Load flexslider!!");
        $('#work-media.flexslider').flexslider({
            slideshow: false,
            start: function(slider) {
               $('.slides li img').click(function(event){
                   event.preventDefault();
                   slider.flexAnimate(slider.getTarget("next"));
               });
            },
            after: function(slider) {
                console.log("Current Slide ", slider.currentSlide);
                var index = slider.currentSlide;
                if (self.vm.$data.description[index]) {
                    self.vm.$data.currentIndex = index;
                }
            }
        });*/
    })
    this.currentWorkIndex = _.indexOf(this.works, work);
    this.showWork();
}


BrainController.prototype.showWork = function() {
    this.workContainer.css("height", "100%");
    this.workContainer.css("opacity", 1);
    this.navRow.css("height", "auto");
    this.showingWork = true;
}

BrainController.prototype.hideWork = function() {
    this.workContainer.css("opacity", 0);
    this.navRow.css("height", "0px");
    this.showingWork = false;
    
}
BrainController.prototype.nextWork = function() {
    console.log("NEXT WORK! Current Index", this.currentWorkIndex);
    this.currentWorkIndex++;
    if (this.currentWorkIndex > this.works.length -1) {
        this.currentWorkIndex = 0;
    }
    this.resetSlider();
    this.workClicked(this.works[this.currentWorkIndex]);
}

BrainController.prototype.resetSlider = function() {
/*    if($('#work-media').hasClass('flexslider')){
        console.log("Remove and destroy flexslider!!");
        $('#work-media').removeClass('flexslider')
            .flexslider('destroy');
    }*/
}

BrainController.prototype.prevWork = function() {
    console.log("PREV WORK!");
    this.currentWorkIndex--;
    if (this.currentWorkIndex < 0) {
        this.currentWorkIndex = this.works.length - 1;
    }
    this.resetSlider();
    this.workClicked(this.works[this.currentWorkIndex]);
}
BrainController.prototype.infoClicked = function() {
    console.log("Info clicked!");
    this.showInfo();
}
BrainController.prototype.showInfo = function() {
    this.infoContainer.css("height", "620px");
    this.infoContainer.css("opacity", 1);
    this.showingInfo = true;
}

BrainController.prototype.hideInfo = function() {
    this.infoContainer.css("opacity", 0);
    this.showingInfo = false;
}


BrainController.prototype.initWorks = function() {
    
    var self = this;

    this.vm = new Vue({
        el: '#main-container',
        data: {currentIndex: 0, description: ""},
        methods: {
            containerClick: function(e) {
                console.log("BOO");
                if (e.target == e.currentTarget) {
                    self.hideWork();
                }
            },
            closeWork: function(e) {
                self.hideWork();
            },
            closeInfo: function(e) {
                self.hideInfo();
            },
            prevWork: function(e) {
                self.prevWork();
            },
            nextWork: function(e) {
                self.nextWork();
            }
        }
    });

    $("#work-container").on($.support.transition.end,
    function() {
        if (self.workContainer.css("opacity") == 0) {
            self.workContainer.css("height", "0px");
            self.resetSlider();
        }
    });

    $("#info-container").on($.support.transition.end,
    function() {
        if (self.infoContainer.css("opacity") == 0) {
            self.infoContainer.css("height", "0px");
        }
    });

    this.info = require('./works/info')();
    this.info.init(this.opts, this.bgContainer);



    this.works = [
        new (require('./works/pulse'))(),
        new (require('./works/gamad'))(),
        new (require('./works/train'))(),
        new (require('./works/koala'))(),
        new (require('./works/equala'))(),
        new (require('./works/peace'))(),
        new (require('./works/brain'))(),
        new (require('./works/security'))(),
        new (require('./works/cantenna'))(),
        new (require('./works/japan'))(),
        new (require('./works/bass'))(),
        new (require('./works/biology'))()
    ]


    for (var i = 0; i < this.works.length; i++) {
        var work = this.works[i];
        work.init(this.opts, this.bgContainer);
    }
}


BrainController.prototype.initMusic = function() {
    var speaker = new PIXI.Sprite.fromFrame("assets/brain/speaker.png");
    speaker.anchor.x = 0.5;
    speaker.anchor.y = 0.5;
    speaker.position.x = 50;
    speaker.position.y = 691;
    speaker.scale = {x: 0.2, y: 0.2};

    speaker.buttonMode = true;
    speaker.setInteractive(true);
    speaker.visible = false;

    this.bgContainer.addChild(speaker);

    var nospeaker = new PIXI.Sprite.fromFrame("assets/brain/nospeaker.png");
    nospeaker.anchor.x = 0.5;
    nospeaker.anchor.y = 0.5;
    nospeaker.position.x = 50;
    nospeaker.position.y = 691;
    nospeaker.scale = {x: 0.2, y: 0.2};

    nospeaker.buttonMode = true;
    nospeaker.setInteractive(true);
    nospeaker.visible = true;

    this.bgContainer.addChild(nospeaker);

    this.speaker = speaker;
    this.nospeaker = nospeaker;

    var kerokero = new PIXI.Sprite.fromFrame("assets/brain/kerokero.jpg");
    kerokero.anchor.x = 0.5;
    kerokero.anchor.y = 0.5;
    kerokero.position.x = 120;
    kerokero.position.y = 693;
    kerokero.scale = {x: 0.35, y: 0.35};

    kerokero.buttonMode = true;
    kerokero.setInteractive(true);
    kerokero.visible = false;


    this.kerokero = kerokero;

    this.bgContainer.addChild(kerokero);

    this.speaker = speaker;
    this.nospeaker = nospeaker;
    var widgetIframe = document.getElementById('sc-widget');
    this.widget = SC.Widget(widgetIframe);
    this.soundsLength = 15;
    var self = this;
    this.firstPlay = true;
    speaker.click  = function(mouseData){
        self.widget.pause();
        self.speaker.visible = self.kerokero.visible = false;
        self.nospeaker.visible = true;
    }
    nospeaker.click  = function(mouseData){
        //self.widget.play();
        self.nospeaker.visible = false;
        self.speaker.visible = self.kerokero.visible = true;
        var index = MathUtil.rndIntRange(0, self.soundsLength - 1);
        console.log("Skip index", index);
        if (self.firstPlay) {
            self.firstPlay = false;
            self.widget.skip(index);
        }
        setTimeout(function() {
            self.widget.play();
        },0);
    }

    kerokero.click = function(mouseData) {
        window.open("https://soundcloud.com/kerokerobonito", "kerokerosc");
    }
}

BrainController.prototype.update = function () {
    if (this.loaded) {

        this.setMaskByOffset();

        this.counter += 0.1;
        this.overlay.tilePosition.x = this.counter * -3;
    
        this.works[7].update(); // Security
    }
}


BrainController.prototype.pageScroll = function (offset) {
    if (!this.opts) {
        return;
    }
    if (offset >= this.opts.scrollHeight - window.innerHeight) {
        this.spawnWork();
    }
}

BrainController.prototype.updateMaskbyVideoSize = function(multi) {
    var width = Math.min(window.innerWidth, this.opts.stageWidth * multi * 0.7);
    this.renderer.view.style.width = width + "px";
    this.renderer.view.style.marginLeft = (width / -2) + "px";
    var height = Math.min(window.innerHeight, this.opts.stageHeight * multi * 0.7);
    this.renderer.view.style.height = height + "px";
}

BrainController.prototype.setMaskByOffset = function() {
    var offset = window.pageYOffset;
    var currentFrame = this.videoController.VIDEOS.enter.frames.current;
    var multi = this.videoController.zoomMultiplyer;
    if (multi > 1) {
        this.maskUpdated = true;
        this.updateMaskbyVideoSize(multi);      
        this.setTwist(multi);
    } else if (this.maskUpdated) {
        this.updateMaskbyVideoSize(1);
        this.setTwist(1);
        this.maskUpdated = false;
    }
    if (multi < 8 && this.showingWork) {
        this.hideWork();
    }
    if (multi < 8 && this.showingInfo) {
        this.hideInfo();
    }
}


BrainController.prototype.setTwist = function(multi) {
    this.twistFilter.angle = Math.max(0,10 - multi  * 2 );
}
    


BrainController.prototype.spawnWork = function () {
    
}
