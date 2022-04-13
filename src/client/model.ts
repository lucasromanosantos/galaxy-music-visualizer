import * as THREE from 'three'

export interface Asset {
    effects: any[]
    init(scene: THREE.Scene, camera: THREE.Camera)
    animate(renderer: THREE.Renderer)
}

export type Position = {
    x: number,
    y: number,
    z: number,
}
