import * as THREE from 'three';

export function setupAmbientLight(scene) {
    // Dim ambient light for a dark, enclosed space
    const ambientLight = new THREE.AmbientLight(0x404040, 3); // Soft, dim light
    scene.add(ambientLight);
}

export function setupTorchLight(scene) {
    // Flickering torch light effect
    const torchLight = new THREE.PointLight(0xffa500, 1, 50); // Warm, orange light
    torchLight.position.set(0, 5, 0); // Position near the bottom of the well
    scene.add(torchLight);

    // Simulate flickering by varying intensity
    function flicker() {
        torchLight.intensity = 0.8 + Math.random() * 0.4; // Random intensity between 0.8 and 1.2
        setTimeout(flicker, 100 + Math.random() * 200); // Random interval between flickers
    }
    flicker();
}

export function setupMoonlight(scene) {
    // Moonlight effect from above
    const moonLight = new THREE.DirectionalLight(0x9999ff, 0.3); // Cool, soft light
    moonLight.position.set(0, 100, 0); // Position high above the well
    scene.add(moonLight);
}
