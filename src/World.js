import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { loadTexture } from './Textures.js';  // Import texture loading function
import { setupAmbientLight, setupTorchLight, setupMoonlight } from './Lights.js';  // Import lighting setup functions
import * as CANNON from 'cannon-es';

export async function setupWorld(element) {
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera (adjust position and field of view as needed)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;  // Adjust camera position to view the well

    // Setup lighting
    setupAmbientLight(scene);  // Add ambient light
    setupTorchLight(scene);    // Add torch light
    setupMoonlight(scene);     // Add moonlight

    // Load texture for the cylinder
    const texture = loadTexture("resources/textur_ziegel.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);

    // Create a cylinder geometry and material
    const wellHeight = 20;  // Adjust height to represent the real depth of a well
    const cylinderRadius = 5;  // Radius of the cylinder
    const geometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, wellHeight, 64, 8, true, 0, 2 * Math.PI);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff  // bright red as a fallback
    });
    material.side = THREE.DoubleSide;
    const cylinder = new THREE.Mesh(geometry, material);

    // Position the cylinder so that its base is at z=0
    cylinder.position.set(0, wellHeight/2, 0);

    // Add the cylinder to the scene
    scene.add(cylinder);

    // Load texture for the bottom plane
    const bottomTexture = loadTexture("resources/textur_ziegel.png");
    bottomTexture.wrapS = THREE.RepeatWrapping;
    bottomTexture.wrapT = THREE.RepeatWrapping;
    bottomTexture.repeat.set(1, 2);

    // Create a circular plane to represent the bottom level at z=0
    const circleGeometry = new THREE.CircleGeometry(cylinderRadius, 64);
    const circleMaterial = new THREE.MeshStandardMaterial({ map: bottomTexture });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.x = -Math.PI / 2;  // Rotate the circle to be horizontal
    circle.position.y = 0;  // Position the circle at z=0
    scene.add(circle);

    // Add water at the bottom
    const waterHeight = 0.5;  // Initial height of water
    const waterGeometry = new THREE.CylinderGeometry(cylinderRadius-0.1, cylinderRadius-0.1, waterHeight, 64);
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x1e90ff,  // Water-like color
        transparent: true,
        opacity: 0.6,  // Semi-transparent
        side: THREE.DoubleSide  // Render both sides
    });
    const water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.position.set(0, waterHeight / 2, 0);  // Initial position at the bottom
    scene.add(water);

    // Set up controls (optional: adjust sensitivity)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Initialize the physics world
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Set gravity

    // Create a physics body for the well
    const wellShape = new CANNON.Cylinder(cylinderRadius, cylinderRadius, wellHeight, 64);
    const wellBody = new CANNON.Body({
        mass: 0, // Static object
        shape: wellShape,
        position: new CANNON.Vec3(0, wellHeight / 2, 0)
    });
    world.addBody(wellBody);

    // Create a physics body for the water
    const waterShape = new CANNON.Cylinder(cylinderRadius-0.1, cylinderRadius-0.1, waterHeight, 64);
    const waterBody = new CANNON.Body({
        mass: 0, // Static object
        shape: waterShape,
        position: new CANNON.Vec3(0, waterHeight / 2, 0)
    });
    world.addBody(waterBody);

    // Create a physics body for the bottom plane
    const bottomShape = new CANNON.Cylinder(cylinderRadius, cylinderRadius, 0.1, 64);
    const bottomBody = new CANNON.Body({
        mass: 0, // Static object
        shape: bottomShape,
        position: new CANNON.Vec3(0, 0, 0)
    });
    world.addBody(bottomBody);

    // Render loop
    function animate() {
        requestAnimationFrame(animate);

        // Step the physics world
        world.step(1 / 60);

        // Update Three.js mesh position and rotation
        cylinder.position.copy(wellBody.position);
        cylinder.quaternion.copy(wellBody.quaternion);

        // Animate water level rise
        if (water.position.y < wellHeight) {  // Target height for water
            water.position.y += 0.01;  // Increment water height
            waterBody.position.y = water.position.y;  // Sync physics body
        }

        // Apply viscosity effect
        world.bodies.forEach(body => {
            if (body !== wellBody && body !== waterBody && body !== bottomBody) {
                if (body.position.y < water.position.y) {
                    // Apply damping to simulate viscosity
                    body.velocity.scale(0.9, body.velocity);
                    body.angularVelocity.scale(0.9, body.angularVelocity);
                }
            }
        });

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
