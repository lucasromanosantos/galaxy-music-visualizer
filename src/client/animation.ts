import * as THREE from 'three'

export class GameAnimation {
    time: number;
    delta: number;
    influence: number;
    step: number;
    colors: THREE.Color[];
    forward: boolean;
    influenceThreshold: number;
    stepMinimumDuration: number;
    baseSpeed: number;
    xLimit: number;

    constructor() {
        this.time = 0;
        this.delta = 0;
        this.influence = 0;
        this.step = 0;
        this.colors = Colors[0];
        this.forward = true;
        this.influenceThreshold = 90;
        this.stepMinimumDuration = 1000;
        this.baseSpeed = 0.01;
        this.xLimit = 5;
    }

    addColors() {
        this.colors = Colors[this.step % Colors.length];
    }
}

export const Colors: THREE.Color[][] = [
    [
        new THREE.Color(0xF90716),
        new THREE.Color(0xFF5403),
        new THREE.Color(0xFFCA03),
        new THREE.Color(0xFFF323),
    ],
    [
        new THREE.Color(0xFF5F00),
        new THREE.Color(0xB20600),
        new THREE.Color(0x00092C),
        new THREE.Color(0xEEEEEE),
    ],
    [
        new THREE.Color(0xF10086),
        new THREE.Color(0xF582A7),
        new THREE.Color(0x180A0A),
        new THREE.Color(0x711A75),
    ],
    [
        new THREE.Color(0x03045E),
        new THREE.Color(0x90E0EF),
        new THREE.Color(0x00B4D8),
        new THREE.Color(0xCAF0F8),
    ],
    [
        new THREE.Color(0xFF00E4),
        new THREE.Color(0xED50F1),
        new THREE.Color(0xFDB9FC),
        new THREE.Color(0xFFEDED),
    ],
    [
        new THREE.Color(0x28FFBF),
        new THREE.Color(0xBCFFB9),
        new THREE.Color(0xF5FDB0),
        new THREE.Color(0xF7E6AD),
    ],
]
