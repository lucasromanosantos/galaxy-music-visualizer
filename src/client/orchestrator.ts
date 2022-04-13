import * as THREE from 'three'
import { Asset } from "./model";
import { GameAnimation } from './animation';
import { Galaxy } from './galaxy/galaxy';
import { Stars } from './galaxy/stars';

export class Orchestrator {
    assets: Asset[]
    scene: THREE.Scene

    constructor(scene: THREE.Scene, animation: GameAnimation) {
        const assets: Asset[] = [
            new Galaxy(
                0.05,
                5,
                50,
                {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                animation,
            ),
            new Stars(
                1000,
                {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                animation,
            ),
        ];

        this.assets = assets;
        this.scene = scene;
    }

}