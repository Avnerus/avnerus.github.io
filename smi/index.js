console.log("Sound and Music Interaction Playground");
var Game = require('./game').default;
var game = new Game();

window.onload = function() {
    game.init();
    window.addEventListener('resize', resize, false);
    game.resize();
    animate();
}


function animate(t) {
    game.animate(t);
    requestAnimationFrame(animate);
}

function resize() {
    game.resize();
}

