"use strict"

module.exports = function(emitter) {
  return new PlayerController(emitter)
}

module.exports.PlayerController = PlayerController


function PlayerController(emitter) {
   // protect against people who forget 'new' 
  if (!(this instanceof PlayerController)) return new PlayerController(emitter)
    // we need to store the passed in variables on 'this'
    // so that they are available to the .prototype methods
    this.emitter = emitter;
    console.log(this.emitter);
    this.currentSongIndex = -1;
    this.currentSong;

    // The MIXTAPE
    this.mixtape = [
        // DEMO
        { 
            file: "9_burning.ogg",
            text: "The Whitest Boy Alive - Burning",
            bpm: 150.81
        },
        { 
            file: "15_amanaemonesia.ogg",
            text: "Chairlift - Amanaemonesia",
            bpm: 166.957
        },
        { 
            file: "16_buy_nothing_day.ogg",
            text: "The Go! Team - Buy Nothing Day",
            bpm: 141.254
        }
     /*  { 
            file: "1_sink_the_seine.ogg",
            text: "Of Montreal - Sink the Seine",
            bpm: 99.969
        },
        { 
            file: "2_you_for_me.ogg",
            text: "Frankie Rose - You for Me",
            bpm: 151.08
        },
        { 
            file: "3_suzanne.ogg",
            text: "Anna Calvi - Suzanne & I",
            bpm: 105.593
        },
        { 
            file: "4_22_days.ogg",
            text: "22-20s - 22 Days",
            bpm: 104.209
        },
        { 
            file: "5_believe.ogg",
            text: "Deerhoof - Believe E.S.P",
            bpm: 89.806
        },
        { 
            file: "6_not_getting_there.ogg",
            text: "Blonde Redhead - Not Getting There",
            bpm: 110.045
        },
        { 
            file: "7_birth_in_reverse.ogg",
            text: "St. Vincent - Birth in Reverse",
            bpm: 162
        },
        { 
            file: "8_coin_operated_boy.ogg",
            text: "The Dresden Dolls - Coin Operated Boy",
            bpm: 134.784
        },
        { 
            file: "9_burning.ogg",
            text: "The Whitest Boy Alive - Burning",
            bpm: 150.81
        },
        { 
            file: "10_go_away.ogg",
            text: "TOPS - Go Away",
            bpm: 120.914
        },
        { 
            file: "11_bad_ritual.ogg",
            text: "Timber Timbre - Bad Ritual",
            bpm: 75.715
        },
        { 
            file: "12_eros.ogg",
            text: "Of Montreal - Eros' Enthropic Tundra",
            bpm: 120.011
        },
        { 
            file: "13_IOU.ogg",
            text: "Metric - IOU",
            bpm: 157.076
        },
        { 
            file: "14_arabic.ogg",
            text: "Dafna VehaOogiot - Haver Aravi",
            bpm: 84.10
        },
        { 
            file: "15_amanaemonesia.ogg",
            text: "Chairlift - Amanaemonesia",
            bpm: 166.957
        },
        { 
            file: "16_buy_nothing_day.ogg",
            text: "The Go! Team - Buy Nothing Day",
            bpm: 141.254
        },
        { 
            file: "17_fear_of_my_identity.ogg",
            text: "Best Coast - Fear of My Identity",
            bpm: 126.956
        },
        { 
            file: "18_forever.ogg",
            text: "HAIM - Forever",
            bpm: 117.948
        },
        { 
            file: "19_oasis.ogg",
            text: "Amanda Palmer - Oasis",
            bpm: 140.096
        },
        { 
            file: "20_suns_eyes.ogg",
            text: "Rubik - Sun's Eyes",
            bpm: 97.032
        },
        { 
            file: "21_lose_it.ogg",
            text: "Austra - Lose It",
            bpm: 138.035
        },
        { 
            file: "22_no_angel.ogg",
            text: "Beyonce - No Angel",
            bpm: 121.472
        },
        { 
            file: "23_oblivion.ogg",
            text: "Grimes - Oblivion",
            bpm: 77.997
        },
        { 
            file: "24_white_collar_boy.ogg",
            text: "Belle and Sebastian - White Collar Boy",
            bpm: 133.72
        },
        { 
            file: "25_o_my_heart.ogg",
            text: "Mother Mother - O My Heart",
            bpm: 146.012
        },
        { 
            file: "26_strawberries.ogg",
            text: "Asobi Seksu - Strawberries",
            bpm: 130.457
        },
        { 
            file: "27_polite_dance_song.ogg",
            text: "The Bird and the Bee - Polite Dance Song",
            bpm: 150.082
        },
        { 
            file: "28_wild.ogg",
            text: "Beach House - Wild",
            bpm: 94.634
        },
        { 
            file: "29_heaven_can_wait.ogg",
            text: "Charlotte Gainsbourg - Heaven Can Wait",
            bpm: 104.985
        },
        { 
            file: "30_deep_is_the_breath.ogg",
            text: "Kasper Bjorke - Deep is the Breath",
            bpm: 111.96
        },
        { 
            file: "31_inspector_norse.ogg",
            text: "Todd Terje - Inspector Norse",
            bpm: 120.012
        },
        { 
            file: "32_i_heard_ramona.ogg",
            text: "Frank Black - I Heard Ramona Sing",
            bpm: 106.055
        },
        { 
            file: "33_revival.ogg",
            text: "Deerhunter - Revival",
            bpm: 119.043
        },
        { 
            file: "34_please.ogg",
            text: "Fiona Apple - Please Please Please",
            bpm: 102.414
        },
        { 
            file: "35_swim_and_sleep.ogg",
            text: "Unkown Mortal Orchestra - Swim And Sleep ( Like A Shark)",
            bpm: 123.511
        },
        { 
            file: "36_kah_ota.ogg",
            text: "Dafna VehaOogiot - Kah Ota",
            bpm: 129.91
        },
        { 
            file: "37_kaze_wo_atsumete.ogg",
            text: "Happy End - Kaze wo Atsumete",
            bpm: 92.479
        },
        { 
            file: "38_silent_song.ogg",
            text: "Daniel Rossen - Silent Song",
            bpm: 79.991
        },
        { 
            file: "39_black.ogg",
            text: "Danger Mouse - Black",
            bpm: 86.704
        },
        { 
            file: "40_i_wish_my_daddy.ogg",
            text: "Codeine Velvet Club - I Wish my Daddy",
            bpm: 159.96
        },
        { 
            file: "41_son_of_three.ogg",
            text: "The Breeders - Son of Three",
            bpm: 133.36
        },
        { 
            file: "42_eclipse_blue.ogg",
            text: "Nosaj Thing - Eclipse/Blue",
            bpm: 158.019
        },
        { 
            file: "43_bad_kingdom.ogg",
            text: "Moderat - Bad Kingdom",
            bpm: 117.943
        },
        { 
            file: "44_lies.ogg",
            text: "CHVRCHES - Lies",
            bpm: 103.027
        },
        { 
            file: "45_let_it_bleed.ogg",
            text: "Goat - Let It Bleed",
            bpm: 97.173
        },
        { 
            file: "46_es_so.ogg",
            text: "Tune Yards - Es-So",
            bpm: 91.502
        },
        { 
            file: "47_blue_summer.ogg",
            text: "The Phoenix Foundation - Blue Summer",
            bpm: 144.166
        },
        { 
            file: "48_pass_this_on.ogg",
            text: "The Knife - Pass This On",
            bpm: 125.975
        },
        { 
            file: "49_rock_n_roll.ogg",
            text: "Seu Jorge - Rock N' Roll Suicide",
            bpm: 96.32
        },
        { 
            file: "50_ukulele_anthem.ogg",
            text: "Amanda Palmer - Ukulele Anthem",
            bpm: 89.556
        }*/
    ];

    var ctrl = this;

    console.log("Loading player controller"); 
    /*$(document).ready(function() {
        $("#player").bind('play', function() {
            ctrl.onPlay();
        });
    });*/
    emitter.on('playPressed', function(message){
        ctrl.onPlayPressed();
    });
    emitter.on('stopPressed', function(message){
        ctrl.onStopPressed();
    });
    emitter.on('pausePressed', function(message){
        ctrl.onPausePressed();
    });
    emitter.on('ffwdPressed', function(message){
        ctrl.onFfwdPressed();
    });
    emitter.on('rewindPressed', function(message){
        ctrl.onRewindPressed();
    }); 
    emitter.on('soundInit', function(message){
        ctrl.onSoundInit();
    }); 
}

PlayerController.prototype.onPlayPressed = function() {
    console.log("Play Pressed");
    if (this.currentSongIndex == -1) {
        this.currentSongIndex = 0;
        this.currentSong = this.mixtape[0];
        this.currentSong.sound.play();
        $("#song-label").text(this.currentSong.text);
    } else {
        this.currentSong.sound.play();
    }
}
PlayerController.prototype.onStopPressed = function() {
    console.log("Stop Pressed");
    if (this.currentSong) {
        this.currentSong.sound.pause();
    }
}
PlayerController.prototype.onPausePressed = function() {
    console.log("Stop Pressed");
    if (this.currentSong) {
        this.currentSong.sound.togglePause();
    }
}
PlayerController.prototype.onFfwdPressed = function() {
    console.log("FFwd Pressed");
    if (this.currentSongIndex == -1 || this.currentSongIndex >= this.mixtape.length -1 || !this.currentSong) {
        return;
    }
    this.nextSong();
}
PlayerController.prototype.nextSong = function() {
    this.currentSong.sound.stop();
    this.currentSongIndex++;
    this.currentSong = this.mixtape[this.currentSongIndex];
    this.currentSong.sound.play({position: 0});
    $("#song-label").text(this.currentSong.text);
    this.emitter.emit("songChanged", {});
}
PlayerController.prototype.onRewindPressed = function() {
    console.log("Rewind Pressed");
    if (this.currentSongIndex <= 0 || !this.currentSong) {
        return;
    }
    this.currentSong.sound.stop();
    this.currentSongIndex--;
    this.currentSong = this.mixtape[this.currentSongIndex];
    this.currentSong.sound.play({position: 0});
    $("#song-label").text(this.currentSong.text);
    this.emitter.emit("songChanged", {});
}
PlayerController.prototype.onPlay = function() {
    console.log("Playing!");
    this.emitter.emit("tapeStart", {});
    this.emitter.emit("gameStart", {bpm: this.currentSong.bpm});
}
PlayerController.prototype.onFinish = function() {
    console.log("Song Finished!");
    if (this.currentSongIndex >= this.mixtape.length -1 || !this.currentSong) {
        this.emitter.emit("tapeStop", {});
        this.emitter.emit("gameStop", {});
    } else {
        this.nextSong();
    }
}
PlayerController.prototype.onPause = function() {
    console.log("Pause!");
    this.emitter.emit("tapeStop", {});
    this.emitter.emit("gameStop", {});
}
PlayerController.prototype.onResume = function() {
    console.log("Resume!")
    this.emitter.emit("tapeStart", {});
    this.emitter.emit("gameStart", {bpm: this.currentSong.bpm});
}
PlayerController.prototype.onSoundInit = function() {
    var ctrl = this;
    var s;
    console.log("Init mixtape sound");
    for (var i = 0; i < this.mixtape.length; i++) {
        var song = this.mixtape[i];
        s = soundManager.createSound({
          id: song.file,
          url: 'mixtape/' + song.file,
          multiShot: false,
          onplay: function () {ctrl.onPlay()},
          onfinish: function() {ctrl.onFinish() },
          onpause: function () {ctrl.onPause()},
          onresume: function () {ctrl.onResume()},
          onid3: function() {
            console.log(this.sID + 'got ID3 data', this.id3);
          }
        });
        this.mixtape[i].sound = s;
    }

}
