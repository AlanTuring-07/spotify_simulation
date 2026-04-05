import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { targetingStore } from '../store/targetingStore';

export const TargetingSensor: React.FC = () => {
    // Instantiate geometry once for memory security
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const origin = useMemo(() => new THREE.Vector3(), []);
    const dir = useMemo(() => new THREE.Vector3(), []);

    useFrame((state) => {
        // Find exactly where the center-screen look-at vector is mapped
        state.camera.getWorldPosition(origin);
        state.camera.getWorldDirection(dir);
        raycaster.set(origin, dir);
        
        // Push ray forwards and find ALL intercepts ignoring children for speed
        const intersects = raycaster.intersectObjects(state.scene.children, true);
        
        // Find exclusively objects tagged "Star"
        const starHit = intersects.find(i => i.object.name === 'Star');

        // Extended scanner range so it tags massive stars all the way across the galaxy
        if (starHit && starHit.distance < 2000) { 
            targetingStore.setTarget(starHit.object.userData as any);
        } else {
            targetingStore.setTarget(null);
        }
    });

    return null; // Invisible mechanical node logic element
};
