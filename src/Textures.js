import * as THREE from 'three';

export function loadTexture(url) {
    return new THREE.TextureLoader().load(
        url,
        (loadedTexture) => {
            console.log('Texture loaded successfully');
        },
        undefined,
        (error) => {
            console.error('Error loading texture:', error);
        }
    );
}
