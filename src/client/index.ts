import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GameAudio } from './audio';
import { GameAnimation } from './animation';
import { Orchestrator } from './orchestrator';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass'
import { Vector2, Vector3 } from 'three';
import { GUI } from 'dat.gui'
import _ from 'lodash';

class Game {
    audio: GameAudio;
    animation: GameAnimation;
    dimensions: {
        width: number,
        height: number,
    };
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    effectComposer: EffectComposer;
    renderer: THREE.WebGLRenderer;
    clock: THREE.Clock;
    time: number;
    orchestrator: Orchestrator;

    _increaseAnimationStep: { (): void };
    constructor() {
        const dimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
        };
        const scene = new THREE.Scene();
        scene.background = new THREE.Color().set("black");

        const renderer = new THREE.WebGLRenderer({
            // powerPreference: "high-performance",
            // antialias: true,
            // stencil: false,
            // depth: false
        });

        document.body.appendChild(renderer.domElement);

        renderer.setSize(dimensions.width, dimensions.height);

        const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.01, 30)
        var controls = new OrbitControls(camera, renderer.domElement)
        camera.position.x = -1.0;
        camera.position.y = 0;
        camera.position.z = 0;
        controls.enabled = true;
        controls.update();
        this.controls = controls;
        camera.aspect = dimensions.width / dimensions.height;
        camera.updateProjectionMatrix();;

        this.animation = new GameAnimation();
        const orchestrator = new Orchestrator(scene, this.animation);

        for (let asset of orchestrator.assets) {
            asset.init(scene, camera)
            for (let effect of asset.effects) {
                // const effectPass = new EffectPass(camera, effect);
                // composer.addPass(effectPass);
            }
        }

        this.audio = new GameAudio();
        this.dimensions = dimensions;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.orchestrator = orchestrator;
        this.clock = new THREE.Clock();
        this.time = 0;
        this._addPostprocess();
        this._initGUI();
        this._increaseAnimationStep = _.throttle(() => {
            this.animation.step += 1
            this.animation.addColors();
        }, this.animation.stepMinimumDuration);
    }

    animate(): void {
        if (this.audio.playing) {
            const delta = this.clock.getDelta();
            this.animation.delta = delta;
            this.time += delta;
            this.animation.time = this.time
            const data = this.audio.analyser.getFrequencyData()
            const o = data.reduce((prev, curr) => prev + curr, 0)

            this.animation.influence = o / data.length
            const self = this
            if (this.animation.influence > this.animation.influenceThreshold) {
                this._increaseAnimationStep();
            }
            this._movingAnimation();

            for (let asset of this.orchestrator.assets) {
                asset.animate(this.renderer)
            }
        }

    }

    _movingAnimation() {
        const speed = this.animation.baseSpeed * this.animation.influence / 50;
        if (this.animation.forward) {
            this.camera.position.x += speed
        } else {
            this.camera.position.x -= speed
        }
        if (this.camera.position.x > this.animation.xLimit || this.camera.position.x < -this.animation.xLimit) {
            this.animation.forward = !this.animation.forward;

            var startQuartenion = new THREE.Quaternion();
            var targetQuartenion = new THREE.Quaternion();
            startQuartenion.copy(this.camera.quaternion);
            this.camera.lookAt(0, 0, 0);
            this.camera.updateMatrixWorld();
            targetQuartenion = this.camera.quaternion.clone();
            this.camera.quaternion.copy(startQuartenion);

            new TWEEN.Tween(this.camera.quaternion)
                .to(targetQuartenion, 250)
                .easing(TWEEN.Easing.Linear.None)
                .start();

            new TWEEN.Tween(this.camera.quaternion)
                .to(targetQuartenion, 250)
                .easing(TWEEN.Easing.Linear.None)
                .start();
        }
    }

    _addPostprocess() {
        const resolution = new Vector2(this.dimensions.width, this.dimensions.height)
        const bloomPass = new UnrealBloomPass(resolution, 0, 0, 0)
        bloomPass.threshold = 0.34
        bloomPass.strength = 1.5
        bloomPass.radius = 0.5
        const afterimagePass = new AfterimagePass()

        // @ts-ignore
        afterimagePass.uniforms.damp.value = 0.7

        const rgbShiftPass = new ShaderPass(RGBShiftShader);
        rgbShiftPass.uniforms['amount'].value = 0.0015;

        this.effectComposer = new EffectComposer(this.renderer)
        this.effectComposer.addPass(new RenderPass(this.scene, this.camera))
        this.effectComposer.addPass(afterimagePass)
        this.effectComposer.addPass(bloomPass);
    }

    _initGUI() {
        const gui = new GUI()
        const musicFolder = gui.addFolder('music')
        const addMusic = {
            add: function () {
                // @ts-ignore
                document.getElementById('file').click();
            }
        }
        musicFolder.add(addMusic, 'add')
        const audio = this.audio
        musicFolder.add(this.audio, 'playing').onChange(() => {
            if (this.audio.available) {
                audio.play();
            }
        })
        musicFolder.open();
        const animationFolder = gui.addFolder('animation');
        animationFolder.add(this.animation, 'influence', 0, 255).listen();
        animationFolder.add(this.animation, 'step').listen();
        animationFolder.add(this.animation, 'influenceThreshold', 0, 255).listen();
        animationFolder.add(this.animation, 'xLimit', 1, 20);
        animationFolder.add(this.animation, 'baseSpeed', 0.01, 0.1);
        animationFolder.open();
    }
}

var game = new Game()

function animate() {
    TWEEN.update();
    game.animate();
    game.effectComposer.render();
    requestAnimationFrame(animate)
};

// resize
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    game.camera.aspect = window.innerWidth / window.innerHeight;
    game.camera.updateProjectionMatrix();
    game.renderer.setSize(window.innerWidth, window.innerHeight)

    // update dimensions
    game.dimensions.width = window.innerWidth;
    game.dimensions.height = window.innerHeight;

    // update camera
    game.camera.aspect = game.dimensions.width / game.dimensions.height;
    game.camera.updateProjectionMatrix();

    // update renderer
    game.renderer.setSize(game.dimensions.width, game.dimensions.height);
    game.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // update effect composer
    game.effectComposer.setSize(game.dimensions.width, game.dimensions.height);
    game.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

var fileInput = document.getElementById('file');
// @ts-ignore
fileInput.addEventListener('change', (event) => {
    var reader = new FileReader();
    reader.addEventListener('load', function (event) {
        // @ts-ignore
        var buffer = event.target.result;

        var context = THREE.AudioContext.getContext();

        // @ts-ignore
        context.decodeAudioData(buffer, function (audioBuffer) {
            game.audio.setBuffer(audioBuffer);
        });

    });

    // @ts-ignore
    if (event.target.files.length == 0) {
        return
    }
    // @ts-ignore
    var file = event.target.files[0];
    reader.readAsArrayBuffer(file);
});

animate();
