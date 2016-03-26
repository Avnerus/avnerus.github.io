(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _fbo = require('./lib/fbo');

var _fbo2 = _interopRequireDefault(_fbo);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Beam = function () {
    function Beam(scene, renderer) {
        _classCallCheck(this, Beam);

        // Shaders
        this.render_fs = "#define GLSLIFY 1\nhighp float random_1_0(vec2 co)\n{\n    highp float a = 12.9898;\n    highp float b = 78.233;\n    highp float c = 43758.5453;\n    highp float dt= dot(co.xy ,vec2(a,b));\n    highp float sn= mod(dt,3.14);\n    return fract(sin(sn) * c);\n}\n\n\nvarying vec3 vColor;\nvoid main() {\n  //gl_FragColor = vec4( vec3( 1., .5, .5 ), .85 );\n  gl_FragColor = vec4( vColor, .85 );\n}\n";
        this.render_vs = "#define GLSLIFY 1\n//float texture containing the positions of each particle\nuniform sampler2D positions;\nattribute vec2 reference;\nvarying vec3 vColor;\n\n//size\nuniform float pointSize;\n\nvoid main() {\n\n    vec3 newPosition = position; \n    newPosition = mat3( modelMatrix ) * newPosition;\n\n    //the mesh is a nomrliazed square so the uvs = the xy positions of the vertices\n    vec3 pos = texture2D( positions, reference).xyz;\n\n    newPosition += pos;\n\n    //pos now contains the position of a point in space taht can be transformed\n    //gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );\n    vColor = newPosition;\n    gl_Position = projectionMatrix *  viewMatrix * vec4( newPosition, 1.0 );\n\n    gl_PointSize = pointSize;\n\n}\n";
        this.simulation_fs = "#define GLSLIFY 1\nhighp float random_2_0(vec2 co)\n{\n    highp float a = 12.9898;\n    highp float b = 78.233;\n    highp float c = 43758.5453;\n    highp float dt= dot(co.xy ,vec2(a,b));\n    highp float sn= mod(dt,3.14);\n    return fract(sin(sn) * c);\n}\n\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_4_1(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_4_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_4_2(vec4 x) {\n     return mod289_4_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_4_3(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_4_4(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D_4_5 = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_4_6 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_4_6;\n  vec3 i1 = min( g_4_6.xyz, l.zxy );\n  vec3 i2 = max( g_4_6.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D_4_5.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_4_1(i);\n  vec4 p = permute_4_2( permute_4_2( permute_4_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D_4_5.wyz - D_4_5.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1_4_7 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_4_8 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1_4_7.xy,h.z);\n  vec3 p3 = vec3(a1_4_7.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_4_3(vec4(dot(p0_4_8,p0_4_8), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_4_8 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_4_8,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n\n\n\nvec3 snoiseVec3_3_9( vec3 x ){\n\n  float s  = snoise_4_4(vec3( x ));\n  float s1 = snoise_4_4(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));\n  float s2 = snoise_4_4(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));\n  vec3 c = vec3( s , s1 , s2 );\n  return c;\n\n}\n\n\nvec3 curlNoise_3_10( vec3 p ){\n  \n  const float e = .1;\n  vec3 dx = vec3( e   , 0.0 , 0.0 );\n  vec3 dy = vec3( 0.0 , e   , 0.0 );\n  vec3 dz = vec3( 0.0 , 0.0 , e   );\n\n  vec3 p_x0 = snoiseVec3_3_9( p - dx );\n  vec3 p_x1 = snoiseVec3_3_9( p + dx );\n  vec3 p_y0 = snoiseVec3_3_9( p - dy );\n  vec3 p_y1 = snoiseVec3_3_9( p + dy );\n  vec3 p_z0 = snoiseVec3_3_9( p - dz );\n  vec3 p_z1 = snoiseVec3_3_9( p + dz );\n\n  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;\n  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;\n  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;\n\n  const float divisor = 1.0 / ( 2.0 * e );\n  return normalize( vec3( x , y , z ) * divisor );\n\n}\n\n\n\nmat4 rotationMatrix_1_11(vec3 axis, float angle)\n{\n    axis = normalize(axis);\n    float s = sin(angle);\n    float c = cos(angle);\n    float oc = 1.0 - c;\n    \n    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,\n                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,\n                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,\n                0.0,                                0.0,                                0.0,                                1.0);\n}\n\n\n\nuniform sampler2D positions;\nuniform float timer;\nuniform float maxDepth;\nvarying vec2 vUv;\n\nvoid main() {\n    vec3 pos = texture2D( positions, vUv ).rgb;\n    mat4 rotateY = rotationMatrix_1_11(vec3(0.0, 1.0, 0.0), random_2_0(vUv) * 0.01);\n    vec3 velocity = curlNoise_3_10(pos * 0.02) * 0.5;\n    pos = pos + velocity; \n    if (pos.y > 10.0) {\n        pos = velocity;\n    }\n    /*\n    pos.z -= (random(vUv) * 10.0);\n    if (pos.z < -1000.0) {\n        pos.z = velocity.z;\n    }*/\n    \n    gl_FragColor = vec4( pos, 1.0 ) * rotateY;\n}\n";
        this.simulation_vs = "#define GLSLIFY 1\nvarying vec2 vUv;\nvoid main() {\n    vUv = vec2(uv.x, uv.y);\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n";

        this.width = 128;
        this.height = 128;

        this.scene = scene;
        this.renderer = renderer;

        this.maxDepth = 50.0;

        console.log("Beam Constructed!");
    }

    _createClass(Beam, [{
        key: 'initCubeParticles',
        value: function initCubeParticles() {
            var geometry = new THREE.CubeGeometry(100, 20, 100);
            var data = new Float32Array(this.width * this.height * 3);
            //let data = Util.getSphere(this.width * this.height, 128);
            var points = THREE.GeometryUtils.randomPointsInGeometry(geometry, this.width * this.height);
            for (var i = 0, j = 0, l = data.length; i < l; i += 3, j += 1) {
                data[i] = points[j].x;
                data[i + 1] = points[j].y;
                data[i + 2] = points[j].z;
            }
            var positions = new THREE.DataTexture(data, this.width, this.height, THREE.RGBFormat, THREE.FloatType);
            positions.needsUpdate = true;
            return positions;
        }
    }, {
        key: 'init',
        value: function init() {
            var positions = this.initCubeParticles();
            this.rttIn = positions;

            this.simulationShader = new THREE.ShaderMaterial({
                uniforms: {
                    positions: { type: "t", value: positions },
                    timer: { type: "f", value: 0 },
                    maxDepth: { type: "f", value: this.maxDepth }
                },
                vertexShader: this.simulation_vs,
                fragmentShader: this.simulation_fs
            });

            this.renderShader = new THREE.ShaderMaterial({
                uniforms: {
                    positions: { type: "t", value: null },
                    pointSize: { type: "f", value: 16 }
                },
                vertexShader: this.render_vs,
                fragmentShader: this.render_fs,
                transparent: true,
                blending: THREE.AdditiveBlending
            });

            // Particle geometry? Just once particle
            var particleGeometry = new THREE.Geometry();
            particleGeometry.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, -1, -1));

            this.fbo = new _fbo2.default();
            this.fbo.init(this.width, this.height, this.renderer, this.simulationShader, this.renderShader, particleGeometry);
            this.fbo.particles.position.y = -10;
            this.fbo.particles.position.x = 30;
            this.fbo.particles.position.z = 270;
            this.scene.add(this.fbo.particles);
        }
    }, {
        key: 'update',
        value: function update(dt) {
            //update the simulation
            this.fbo.update();

            //update mesh
            //this.fbo.particles.rotation.x += Math.PI / 180 * .5;
            //this.fbo.particles.rotation.y -= Math.PI / 180 * .5;
        }
    }, {
        key: 'getRandomBeamParticles',
        value: function getRandomBeamParticles() {}
    }]);

    return Beam;
}();

exports.default = Beam;

},{"./lib/fbo":4,"./util":5}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

var _beam = require('./beam');

var _beam2 = _interopRequireDefault(_beam);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Game = function () {
    function Game() {
        _classCallCheck(this, Game);

        console.log("Game constructed!");
    }

    _createClass(Game, [{
        key: 'init',
        value: function init() {
            this.renderer = new THREE.WebGLRenderer();
            this.renderer.setClearColor(0x0C0C30, 1);
            //this.renderer.setClearColor( 0x000000, 1 );
            var element = this.renderer.domElement;
            var container = document.getElementById('game');
            container.appendChild(element);

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
            this.camera.position.z = 100;

            this.control = new THREE.OrbitControls(this.camera, element);
            this.scene.add(this.camera);
            this.clock = new THREE.Clock();

            //this.camera.rotation.x = 0.22;

            // A Beam
            this.beam = new _beam2.default(this.scene, this.renderer);
            this.beam.init();

            this.resize();
        }
    }, {
        key: 'animate',
        value: function animate(t) {
            this.update(this.clock.getDelta());
            this.render(this.clock.getDelta());
        }
    }, {
        key: 'update',
        value: function update(dt) {
            this.beam.update(dt);
            //console.log(this.camera.rotation);
        }
    }, {
        key: 'render',
        value: function render(dt) {
            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: 'resize',
        value: function resize() {
            var width = window.innerWidth;
            var height = window.innerHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }]);

    return Game;
}();

exports.default = Game;

},{"./beam":1}],3:[function(require,module,exports){
"use strict";

console.log("COOPERATIVE TELEPRESENCE EXPERIMENT");
var Game = require('./game').default;
var game = new Game();

window.onload = function () {
    console.log("Loading...");
    game.init();
    window.addEventListener('resize', resize, false);
    game.resize();
    animate();
};

function animate(t) {
    game.animate(t);
    requestAnimationFrame(animate);
}

function resize() {
    game.resize();
}

},{"./game":2}],4:[function(require,module,exports){
(function (global){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}(); // https://github.com/nicoptere/FBO

var _three = typeof window !== "undefined" ? window['THREE'] : typeof global !== "undefined" ? global['THREE'] : null;

var _three2 = _interopRequireDefault(_three);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var FBO = function () {
    function FBO() {
        _classCallCheck(this, FBO);

        console.log("FBO Constructed");
    }

    _createClass(FBO, [{
        key: "init",
        value: function init(width, height, renderer, simulationMaterial, renderMaterial, particleGeometry) {

            var gl = renderer.getContext();

            //1 we need FLOAT Textures to store positions
            //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
            if (!gl.getExtension("OES_texture_float")) {
                throw new Error("float textures not supported");
            }

            //2 we need to access textures from within the vertex shader
            //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
            if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
                throw new Error("vertex shader cannot read textures");
            }

            //3 rtt setup
            this.scene = new _three2.default.Scene();
            this.simulationMaterial = simulationMaterial;
            this.orthoCamera = new _three2.default.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

            //4 create a target texture
            var options = {
                minFilter: _three2.default.NearestFilter, //important as we want to sample square pixels
                magFilter: _three2.default.NearestFilter, //
                format: _three2.default.RGBFormat, //could be RGBAFormat
                type: _three2.default.FloatType //important as we need precise coordinates (not ints)
            };
            this.rttOut = new _three2.default.WebGLRenderTarget(width, height, options);
            this.rttIn = this.rttOut.clone();

            //5 the simulation:
            //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
            var geom = new _three2.default.BufferGeometry();
            geom.addAttribute('position', new _three2.default.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
            geom.addAttribute('uv', new _three2.default.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2));
            this.scene.add(new _three2.default.Mesh(geom, simulationMaterial));

            var particleVertices = particleGeometry.vertices;
            console.log(particleVertices.length + " Particle vertices in each 'particle' ");

            // l is the number of 'elements'
            var l = width * height;
            console.log("Surface of the FBO: " + l);

            // Each element is either one particle or a collection of particle vertices
            var points = l * particleVertices.length;
            console.log("Number of points: " + points);

            // Now let's fill up the vertices array
            var vertices = new Float32Array(points * 3);

            var v = 0;
            for (var i = 0; i < l; i++) {
                for (var j = 0; j < particleVertices.length; j++) {
                    vertices[v++] = particleVertices[j].x;
                    vertices[v++] = particleVertices[j].y;
                    vertices[v++] = particleVertices[j].z;
                }
            }

            console.log("Vertices array: ", vertices);

            var references = new Float32Array(points * 2);
            for (var vert = 0; vert < points; vert++) {

                var i = ~ ~(vert / 3);
                var x = i % width / width;
                var y = ~ ~(i / width) / height;

                references[vert * 2] = x;
                references[vert * 2 + 1] = y;
            }

            //create the particles geometry
            var geometry = new _three2.default.BufferGeometry();
            geometry.addAttribute('position', new _three2.default.BufferAttribute(vertices, 3));
            geometry.addAttribute('reference', new _three2.default.BufferAttribute(references, 2));

            //the rendermaterial is used to render the particles
            if (particleVertices.length > 1) {
                this.particles = new _three2.default.Mesh(geometry, renderMaterial);
                this.particles.matrixAutoUpdate = false;
                this.particles.rotation.z = Math.PI / 2;
                this.particles.rotation.x = Math.PI / 2;
                this.particles.updateMatrix();
            } else {
                this.particles = new _three2.default.Points(geometry, renderMaterial);
                this.particles.frustumCulled = false;
            }
            this.renderer = renderer;

            // First render
            this.renderer.render(this.scene, this.orthoCamera, this.rttOut, false);

            this.update();
        }

        //7 update loop

    }, {
        key: "update",
        value: function update() {

            var tmp = this.rttIn;
            this.rttIn = this.rttOut;
            this.rttOut = tmp;

            this.simulationMaterial.uniforms.positions.value = this.rttIn;
            this.renderer.render(this.scene, this.orthoCamera, this.rttOut, true);

            //2 use the result of the swap as the new position for the particles' renderer
            this.particles.material.uniforms.positions.value = this.rttOut;
        }
    }]);

    return FBO;
}();

exports.default = FBO;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    //returns an array of random 3D coordinates

    _createClass(Util, [{
        key: "getRandomData",
        value: function getRandomData(width, height, size) {
            var len = width * height * 3;
            var data = new Float32Array(len);
            while (len--) {
                data[len] = (Math.random() - .5) * size;
            }return data;
        }
    }, {
        key: "getRandomSpherePoint",
        value: function getRandomSpherePoint(v, size) {
            v.x = Math.random() * 2 - 1;
            v.y = Math.random() * 2 - 1;
            v.z = Math.random() * 2 - 1;
            if (v.length() > 1) return this.getRandomSpherePoint(v, size);
            return v.normalize().multiplyScalar(size);
        }
    }, {
        key: "getSphere",
        value: function getSphere(count, size) {
            var len = count * 3;
            var data = new Float32Array(len);
            var p = new THREE.Vector3();
            for (var i = 0; i < len; i += 3) {
                this.getRandomSpherePoint(p, size);
                data[i] = p.x;
                data[i + 1] = p.y;
                data[i + 2] = p.z;
            }
            return data;
        }
    }]);

    return Util;
}();
// Singleton

var instance = new Util();
exports.default = instance;

},{}]},{},[3]);
