import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export async function setupThree(element) {
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    element.appendChild(renderer.domElement);

    // Create a scene
    const scene = new THREE.Scene();

    // Create a camera (adjust position and field of view as needed)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 20;

    // Create lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc, 3);
    scene.add(ambientLight);
    const texture = new THREE.TextureLoader().load( 
        "resources/brick.png",
        (loadedTexture) => {
            console.log('Texture loaded successfully');
        },
        undefined,
        (error) => {
            console.error('Error loading texture:', error);
        }
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 4, 4 );
    // Create a cube geometry and material
    const geometry = new THREE.CylinderGeometry( 5, 5, 20, 64, 8, 1, 0, 2*Math.PI);
    const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        color: 0xffffff  // bright red as a fallback
    });
    // CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
    // Create a mesh using the geometry and material
    material.side = THREE.DoubleSide
    const cylinder = new THREE.Mesh(geometry, material);

    // Add the cube to the scene
    scene.add(cylinder);

    // Set up controls (optional: adjust sensitivity)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    // Render loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the cube
        //cylinder.rotation.x += 0.01;


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