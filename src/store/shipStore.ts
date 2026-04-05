import * as THREE from 'three';

// Ultra-fast mutable singleton perfectly decoupling 60FPS Three.js logic from React renders
export const globalShipState = {
  // Initiated near the Cosmos starting point
  position: new THREE.Vector3(0, 10, 50),
};
