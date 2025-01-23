import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {loadTexture} from './Textures.js'; // Import texture loading function
import {setupLighting} from './Lights.js'; // Import lighting setup function

export async function setupWorld(element) {
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera (adjust position and field of view as needed)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4.5;
    camera.position.x = 0
    camera.position.y = 1.8

    // Setup lighting
    setupLighting(scene);

    // Load texture
    const wellTexture = loadTexture("resources/textur_ziegel.png");
    wellTexture.wrapS = THREE.RepeatWrapping;
    wellTexture.wrapT = THREE.RepeatWrapping;
    wellTexture.repeat.set(4, 4);

    const segmentHeight = 20
    const radialSegments = 320

    // Create a cylinder geometry and material
    const wellRadius = 5
    const wellGeometry = new THREE.CylinderGeometry(wellRadius, wellRadius, segmentHeight, radialSegments / wellRadius, 8, 1, 0, 2 * Math.PI);
    const wellMaterial = new THREE.MeshStandardMaterial({
        map: wellTexture,
        color: 0xffffff  // bright red as a fallback
    });
    wellMaterial.side = THREE.DoubleSide;
    const wellMesh = new THREE.Mesh(wellGeometry, wellMaterial);
    wellMesh.name = "well"

    const ropeRadius = 0.2
    const ropeGeometry = new THREE.CylinderGeometry(ropeRadius, ropeRadius, segmentHeight, radialSegments / ropeRadius, 8, 1, 0, 2 * Math.PI)
    const ropeMaterial = new THREE.MeshStandardMaterial({
        color: 0x7a5d4f
    })
    ropeMaterial.side = THREE.FrontSide
    const ropeMesh = new THREE.Mesh(ropeGeometry, ropeMaterial)
    ropeMesh.name = "rope"
    // ropeMesh.position.x = 7

    const segmentPivot = new THREE.Object3D();
    segmentPivot.position.set(0, segmentHeight / 2, 0)
    segmentPivot.add(wellMesh)
    segmentPivot.add(ropeMesh)

    // wellMesh.position.set(0,20,0)

    // Add the well and rope to the scene
    scene.add(segmentPivot)
    // scene.add(wellMesh);
    // scene.add(ropeMesh)

    // Set up controls (optional: adjust sensitivity)
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.25;

    let pointer = new THREE.Vector2();
    let lastPointer = new THREE.Vector2();
    let pointerDown = false;
    let distanceMoved = 0;
    let lerpFactor = 0;

    const raycaster = new THREE.Raycaster();
    const pointerPostion = new THREE.Vector2();

    const targetPostion = new THREE.Vector3();
    let move = false;

    let currentObject;

    // Event listeners
    document.addEventListener('pointerdown', (event) => {
        if(lerpFactor !== 0) return;
        pointerDown = true;
        // targetPostion.set(camera.position.x, camera.position.y, camera.position.z)
        // pointer.set(
        //     (event.clientX / window.innerWidth) * 2 - 1,
        //     -((event.clientY / window.innerHeight) * 2 - 1));  // Set the initial mouse position
        // lastPointer.set(event.clientX, event.clientY)
    });

    document.addEventListener('pointerup', () => {
        if(lerpFactor !== 0) return;
        console.log('Distance moved:', distanceMoved * 5);  // Log the distance (or use it for something)
        targetPostion.set(camera.position.x, camera.position.y + distanceMoved * 5, camera.position.z)
        if (distanceMoved > 0) move = true;
        pointerDown = false;
        distanceMoved = 0;  // Reset distance after mouse release
    });

    document.addEventListener('pointermove', (event) => {
        if(lerpFactor !== 0) return;
        pointer.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -((event.clientY / window.innerHeight) * 2 - 1));  // Set the initial mouse position

        const intersects = castRay()
        if (intersects.length !== 0) {
            currentObject = intersects[0].object
        }

        if (pointerDown) {
            // Calculate the distance between the last and current mouse positions
            // const dx = pointer.x - lastPointer.x;
            const dx = 0
            const dy = pointer.y - lastPointer.y;
            if (currentObject.name === "rope" && dy <= 0) {
                // distanceMoved += Math.sqrt(dx * dx + dy * dy);
                distanceMoved -= dy;
            }

            // controls.enabled = currentObject.name !== "rope";

            // Update the last mouse position
            lastPointer.set(pointer.x, pointer.y);
        }
    });

    function castRay() {
        raycaster.setFromCamera(pointer, camera);

        return raycaster.intersectObjects(scene.children)
    }

    // Render loop
    function animate() {
        requestAnimationFrame(animate); // Set the initial mouse position

        console.log(": " + currentObject.name)

        if (move) {
            camera.position.lerp(targetPostion, 0.02)
            if(camera.position === targetPostion) move = false
        }

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
}

