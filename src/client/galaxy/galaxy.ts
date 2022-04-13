import * as THREE from 'three'
import { Asset, Position } from '../model';
import { InstancedUniformsMesh } from 'three-instanced-uniforms-mesh'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { GameAnimation } from '../animation';

export class Galaxy implements Asset {
    radius: number;
    turns: number;
    pointsPerTurn: number;

    position: Position;
    effects: any[];
    group: THREE.Group;
    sampler: MeshSurfaceSampler;
    particles?: InstancedUniformsMesh;

    curve: THREE.Mesh;
    animation: GameAnimation;

    constructor(radius: number, turns: number, pointsPerTurn: number, position: Position, animation: GameAnimation) {
        this.radius = radius;
        this.turns = turns;
        this.pointsPerTurn = pointsPerTurn;
        this.position = position;
        this.group = new THREE.Group();
        this.effects = [];
        this.animation = animation;
    }

    init(scene: THREE.Scene, camera: THREE.Camera) {
        const angleStep = (Math.PI * 2) / this.pointsPerTurn * 5;
        const points: THREE.Vector3[] = [];
        for (let i = 0; i < this.turns * this.pointsPerTurn; i += 1) {
            points.push(new THREE.Vector3(
                i * Math.sin(angleStep * i) * this.radius,
                i,
                i * Math.cos(angleStep * i) * this.radius,
            ));
        }
        const spline = new THREE.CatmullRomCurve3(points);
        const divisions = Math.round(3 * points.length);
        const point = new THREE.Vector3();
        const positions: number[] = []
        for (let i = 0, l = divisions; i < l; i++) {
            const t = i / l;
            spline.getPoint(t, point);
            positions.push(point.x, point.y, point.z);
        }

        const lineGeometry = new LineGeometry();
        lineGeometry.setPositions(positions);
        const resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
        const material = new LineMaterial({
            linewidth: 3,
            resolution: resolution,
        });
        material.uniforms.color1 = {
            value: new THREE.Color("white")
        };
        material.uniforms.color2 = {
            value: new THREE.Color("white")
        };
        material.fragmentShader = `uniform vec3 color1;
uniform vec3 color2;

varying vec2 vUv;

void main() {
    gl_FragColor = vec4(mix(color1, color2, vUv.x), 1.0);
}`

        const curveObject = new Line2(lineGeometry, material);
        curveObject.rotateZ(Math.PI / 2);

        curveObject.position.set(this.position.x + 15, this.position.y, this.position.z)
        curveObject.scale.set(0.1, 0.1, 0.1);
        this.curve = curveObject;
        scene.add(curveObject)
    }

    animate() {
        this.curve.rotateY(0.05)
        // @ts-ignore
        this.curve.material.uniforms.color1.value = this.animation.colors[0]
        // @ts-ignore
        this.curve.material.uniforms.color2.value = this.animation.colors[1]
    }
}
