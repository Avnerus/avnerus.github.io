import SimpleWebRTC from 'simplewebrtc'

export default class Guru {
    constructor() {
        console.log("Guru constructed!")
    }
    init() {
        this.webrtc = new SimpleWebRTC({
            // the id/element dom element that will hold "our" video
            localVideoEl: 'guru-local-video',
            // the id/element dom element that will hold remote videos
            remoteVideosEl: 'guru-remote-videos',
            // immediately ask for camera access
            autoRequestMedia: true
        })
        this.webrtc.on('readyToCall', function () {
            // you can name it anything
            this.joinRoom('naoguru');

        });


        $("#guru-form").submit((e) => {
            e.preventDefault();
            this.sayText($("#sayInput").val());
            return false;
        })
    }

    sayText(text) {
        console.log("Say text: " + text);
        this.webrtc.sendToAll("speech", text);
    }
}
