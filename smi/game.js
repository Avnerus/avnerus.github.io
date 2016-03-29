import QwertyHancock from 'qwerty-hancock'
import Tone from 'tone'

// Blash
export default class Game {
    constructor() {
        console.log("Game constructed!")
    }
    init() {

        var self = this;
        this.offset = 0;
        $("#slider").val(0);

        Tone.Sampler.prototype.triggerAttackWithOffset = function(name, time, velocity, offset){
            time = this.toSeconds(time);
            if (name){
                this.sample = name;
            }
            this.player.start(time, offset);
            this.envelope.triggerAttack(time, velocity);
            this.filterEnvelope.triggerAttack(time);
            return this;
        };

        this.sampler = new Tone.Sampler({
            A : {
                1 : "./horse.mp3"
            }
        }).toMaster();

        this.keyboard = new QwertyHancock({
                 id: 'keyboard',
                 width: 600,
                 height: 150,
                 octaves: 2,
                 startNote: 'A3',
                 whiteNotesColour: 'white',
                 blackNotesColour: 'black',
                 hoverColour: '#f3e939'
        });

        this.keyboard.keyDown = function (note, frequency) {
            console.log(frequency);
            self.sampler.player.playbackRate = frequency / 440;
            self.sampler.triggerAttackWithOffset("A.1", 0, 1, self.offset);
            //self.synth.triggerAttack(frequency);
        };
        this.keyboard.keyUp = function () {
            self.sampler.triggerRelease();
            //self.synth.triggerRelease();
        };

        $("#slider").on("input", function(){
            self.offset = self.sampler._buffers["A.1"].duration * (this.value/127);
        });

    }
    
    animate(t) {
    }

    update(dt) {
    }

    render(dt) {
    }

    resize() {
    }
}
