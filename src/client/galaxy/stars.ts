import * as THREE from 'three'
import { Asset, Position } from '../model';
import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { Vector3 } from 'three';
import { GameAnimation } from '../animation';
import fragmentShader from './shaders/stars.fragment.glsl'
import vertexShader from './shaders/stars.vertex.glsl'

export class Stars implements Asset {
    amount: number;
    position: Position;
    effects: any[];
    group: THREE.Group;
    sampler: MeshSurfaceSampler;
    particles?: InstancedUniformsMesh;

    animation: GameAnimation;

    animations: { (): void }[];

    constructor(amount: number, position: Position, animation: GameAnimation) {
        this.amount = amount;
        this.position = position;
        this.group = new THREE.Group();
        this.effects = [];
        this.animation = animation;
        this._initAnimations();
        this._initSampler();
    }

    init(scene: THREE.Scene, camera: THREE.Camera) {
        const geometry = new THREE.SphereGeometry(0.03, 16, 16)
        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 1 },
                uDirection: { value: new THREE.Vector3() },
                uRandom: { value: 0 },
                uInfluence: { value: 0 },
                uColorA: { value: new THREE.Vector3() },
                uColorB: { value: new THREE.Vector3() },
                uColorC: { value: new THREE.Vector3() },
                uColorD: { value: new THREE.Vector3() },
            }
        })

        this.particles = new InstancedUniformsMesh(geometry, material, this.amount)

        const tempPosition = new THREE.Vector3()
        const tempObject = new THREE.Object3D()
        const center = new THREE.Vector3()
        for (let i = 0; i < this.amount; i++) {
            this.sampler.sample(tempPosition)
            tempObject.position.copy(tempPosition)
            tempObject.scale.setScalar(0.5 + Math.random() * 0.5)
            tempObject.updateMatrix()
            this.particles.setMatrixAt(i, tempObject.matrix)

            const dir = new THREE.Vector3()
            dir.subVectors(tempPosition, center).normalize()
            this.particles.setUniformAt('uDirection', i, dir)
            this.particles.setUniformAt('uRandom', i, Math.random())
        }

        this.group.add(this.particles)
        this.group.position.set(this.position.x, this.position.y, this.position.z)
        scene.add(this.group)
    }

    animate() {
        this.animation.colors[this.animation.step % this.animations.length];
        this.animations[this.animation.step % this.animations.length]();
        this.particles.material.uniforms.uColorA.value = new Vector3(this.animation.colors[0].r, this.animation.colors[0].g, this.animation.colors[0].b);
        this.particles.material.uniforms.uColorB.value = new Vector3(this.animation.colors[1].r, this.animation.colors[1].g, this.animation.colors[1].b);
        this.particles.material.uniforms.uColorC.value = new Vector3(this.animation.colors[2].r, this.animation.colors[2].g, this.animation.colors[2].b);
        this.particles.material.uniforms.uColorD.value = new Vector3(this.animation.colors[3].r, this.animation.colors[3].g, this.animation.colors[3].b);
    }

    _initAnimations() {
        const animations = [
            () => {
                this.particles.material.uniforms.uInfluence.value = this.animation.influence * 0.03
            },
            () => {
                this.group.rotation.x += 0.02;
            },
            () => {
                this.group.rotation.x -= 0.02;
            },
        ];
        this.animations = animations;
    }

    _initSampler() {
        const geom = new THREE.SphereGeometry(5, 10, 10)

        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            opacity: 0.1,
            transparent: true
        })

        geom.rotateY(Math.PI / 2)

        const sphere = new THREE.Mesh(geom, mat)
        this.sampler = new MeshSurfaceSampler(sphere).build()
    }
}
