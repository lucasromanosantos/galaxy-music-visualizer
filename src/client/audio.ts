import * as _ from 'underscore';
import * as THREE from 'three'

const FFT_SIZE = 2048;

export class GameAudio {
    available: boolean;
    playing: boolean;
    analyser: THREE.AudioAnalyser
    audio: THREE.Audio;

    influence: number;

    constructor() {
        const listener = new THREE.AudioListener()
        this.audio = new THREE.Audio(listener)
        this.playing = false;
        this.influence = 0;
    }

    setBuffer(buffer: AudioBuffer) {
        this.audio.setBuffer(buffer);
        this.analyser = new THREE.AudioAnalyser(this.audio, FFT_SIZE);
        this.available = true;
    }

    play() {
        if (this.playing) {
            this.audio.play()
        } else {
            this.audio.pause()
        }
    }
}
