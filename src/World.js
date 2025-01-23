import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'; // Import GLTFLoader
import { loadTexture } from './Textures.js';  // Import texture loading function
import { setupLighting } from './Lights.js';  // Import lighting setup function

export async function setupWorld(element) {
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Setup lighting
    setupLighting(scene);

    // Load cylinder texture
    const texture = loadTexture("resources/textur_ziegel.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    // Create a cylinder geometry (open-ended)
    const geometry = new THREE.CylinderGeometry(5, 5, 20, 64, 8, true, 0, 2 * Math.PI);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff
    });
    material.side = THREE.DoubleSide;
    const cylinder = new THREE.Mesh(geometry, material);

    // Add the cylinder to the scene
    scene.add(cylinder);

    // Load plane texture
    const grassTexture = loadTexture("resources/lawn.jpg");
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(4, 4);

    // Geometry and material for the plane
    const shape = new THREE.Shape();
    shape.moveTo(-25, -25);
    shape.lineTo(25, -25);
    shape.lineTo(25, 25);
    shape.lineTo(-25, 25);
    shape.lineTo(-25, -25);

    // Inner circle for the hole
    const holePath = new THREE.Path();
    holePath.absellipse(0, 0, 5, 5, 0, Math.PI * 2, false);
    shape.holes.push(holePath);

    const planeGeometry = new THREE.ShapeGeometry(shape);
    const planeMaterial = new THREE.MeshStandardMaterial({
        map: grassTexture,
        side: THREE.DoubleSide
    });

    // Create the plane mesh
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2; // Rotate to lie flat
    plane.position.y = 10; // Position below the cylinder
    scene.add(plane);

    // Load the 3D model (tree.glb)
    const loader = new GLTFLoader();

    function loadModel(url) {
        return new Promise((resolve, reject) => {
            loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
        });
    }

    // Function to add the random models (tree)
    async function addRandomModels() {
        const tree = await loadModel("resources/tree.glb"); // Path to your tree model

        for (let i = 0; i < 300; i++) { // Add 300 trees (increase number as needed)
            const model = tree.clone();

            // Random position within the plane bounds, avoiding the hole
            let x, z;
            do {
                x = (Math.random() - 0.5) * 50; // Random X position between -25 and 25
                z = (Math.random() - 0.5) * 50; // Random Z position between -25 and 25
            } while (Math.sqrt(x * x + z * z) < 7); // Avoid positions within the hole

            // Calculate the height of the terrain at the position (if you need a more advanced approach)
            // Here, we assume the terrain is flat and the y-position of all objects is `10`.

            // Set the tree position at y=10 (ground level) on the plane
            model.position.set(x, plane.position.y, z); // Set the tree position on the plane

            // Random rotation for the trees
            model.rotation.y = Math.random() * Math.PI * 2;

            // Random scale for variation
            let scale = 1 + Math.random() * 2; // Scale between 1 and 3
            scale = scale * 0.005;
            model.scale.set(scale, scale, scale);

            scene.add(model); // Add the tree to the scene
        }
    }

    addRandomModels(); // Add trees when the scene is set up

    // Set up controls for the camera
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
