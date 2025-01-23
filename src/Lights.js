import * as THREE from 'three';

export function setupLighting(scene) {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 3);
    scene.add(ambientLight);
}
