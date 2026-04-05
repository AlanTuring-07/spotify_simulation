import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

const ACCELERATION = 80.0;
const MAX_SPEED = 50.0;
const FRICTION = 3.0;

export const CameraController: React.FC = () => {
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    // 1. Damping/Friction
    velocity.current.x -= velocity.current.x * FRICTION * delta;
    velocity.current.z -= velocity.current.z * FRICTION * delta;
    
    // 2. Fetch Keyboard Directives Safely avoiding NaN from undefined
    const w = keys.current['KeyW'] || keys.current['ArrowUp'] ? 1 : 0;
    const s = keys.current['KeyS'] || keys.current['ArrowDown'] ? 1 : 0;
    const d = keys.current['KeyD'] || keys.current['ArrowRight'] ? 1 : 0;
    const a = keys.current['KeyA'] || keys.current['ArrowLeft'] ? 1 : 0;

    direction.current.z = w - s;
    direction.current.x = d - a;
    direction.current.normalize();

    // 3. Acceleration
    if (w || s) {
        velocity.current.z += direction.current.z * ACCELERATION * delta;
    }
    if (a || d) {
        velocity.current.x += direction.current.x * ACCELERATION * delta;
    }

    // 4. Clamping Speed
    if (velocity.current.lengthSq() > MAX_SPEED * MAX_SPEED) {
        velocity.current.clampLength(0, MAX_SPEED);
    }

    // 5. Cinematic Movement Application
    if (velocity.current.lengthSq() > 0.001) {
        camera.translateX(velocity.current.x * delta);
        camera.translateZ(-velocity.current.z * delta);
    } else {
        velocity.current.set(0, 0, 0);
    }
  });

  return <PointerLockControls />;
};
