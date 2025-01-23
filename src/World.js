import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadTexture } from './Textures.js';  // Import texture loading function
import { setupLighting } from './Lights.js';  // Import lighting setup function

export async function setupWorld(element) {
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera (adjust position and field of view as needed)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Setup lighting
    setupLighting(scene);

    // Load texture
    const texture = loadTexture("resources/textur_ziegel.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    // Create a cylinder geometry and material
    const geometry = new THREE.CylinderGeometry(5, 5, 20, 64, 8, 1, 0, 2 * Math.PI);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff  // bright red as a fallback
    });
    material.side = THREE.DoubleSide;
    const cylinder = new THREE.Mesh(geometry, material);

    // Add the cylinder to the scene
    scene.add(cylinder);

    // Set up controls (optional: adjust sensitivity)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
