import SimpleWebRTC from 'simplewebrtc'

export default class Client {
    constructor() {
        console.log("Client constructed!")
    }
    init() {
        meSpeak.loadConfig("/mespeak_config.json");
        meSpeak.loadVoice("/voices/en/en.json");
        var self = this;

        this.options = {};

        this.options.pitch = 100;
        this.options.speed = 100;
        this.options.amplitude = 300;
        this.options.variant = "m6";

        let webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            localVideoEl: 'client-local-video',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'client-remote-videos',
            // immediately ask for camera access
            autoRequestMedia: true
        })
        webrtc.on('readyToCall', function () {
            // you can name it anything
            webrtc.joinRoom('naoguru');
        });
        webrtc.connection.on('message', (message) => {
            if (message.type == "speech") {
                console.log("Message!! ", message);
                meSpeak.speak(message.payload, self.options);
            }
        })
    }
}
