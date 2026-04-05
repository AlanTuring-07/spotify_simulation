import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { globalShipState } from '../store/shipStore';

const MAX_SPEED = 60;
const BOOST_MULT = 2.5; 
const ACCELERATION = 80;
const FRICTION = 0.95; 

export const Spaceship: React.FC = () => {
  const shipRef = useRef<THREE.Group>(null);
  const chassisRef = useRef<THREE.Group>(null);
  const engineLightRef = useRef<THREE.PointLight>(null);
  const engineMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const { camera } = useThree();

  const keys = useRef<{ [key: string]: boolean }>({});
  const velocity = useRef(0);
  
  // Camera chasing
  const currentCameraPos = useRef(new THREE.Vector3(0, 10, 50));
  const currentLookAt = useRef(new THREE.Vector3());

  // Mouse turning (yaw and pitch)
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    const onMouseMove = (e: MouseEvent) => {
        // Enforce mouse turning ONLY when locked
        if (document.pointerLockElement && shipRef.current) {
            // Apply standard flight inverted pitch layout natively with euler rotation
            euler.current.y -= e.movementX * 0.002;
            euler.current.x -= e.movementY * 0.002;
            
            // Explicitly clamp the pitch so the ship cannot physically tumble/loop over backwards 
            // Ensures game stays true to an arcade third-person control scheme
            euler.current.x = THREE.MathUtils.clamp(euler.current.x, -Math.PI/2 + 0.1, Math.PI/2 - 0.1);
            shipRef.current.quaternion.setFromEuler(euler.current);
        }
    };

    // Require an initial user click to launch pointer-lock control mechanics cleanly
    const onClick = () => {
        if (!document.pointerLockElement) {
            document.body.requestPointerLock();
        }
    };

    document.body.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    return () => {
      document.body.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useFrame((state, delta) => {
    if (!shipRef.current || !chassisRef.current) return;
    
    // 1. Controls
    const w = keys.current['KeyW'] || keys.current['ArrowUp'] ? 1 : 0;
    const s = keys.current['KeyS'] || keys.current['ArrowDown'] ? 1 : 0;
    const a = keys.current['KeyA'] || keys.current['ArrowLeft'] ? 1 : 0;
    const d = keys.current['KeyD'] || keys.current['ArrowRight'] ? 1 : 0;
    const boost = keys.current['ShiftLeft'] || keys.current['ShiftRight'] ? BOOST_MULT : 1;

    // Acceleration
    if (w) velocity.current += ACCELERATION * delta;
    if (s) velocity.current -= ACCELERATION * delta;
    
    // Smooth coasting friction mapping standard vacuum drag
    velocity.current *= FRICTION;
    
    // Thrust Governor
    const speedLimit = MAX_SPEED * boost;
    if (velocity.current > speedLimit) velocity.current = speedLimit;
    if (velocity.current < -MAX_SPEED/2) velocity.current = -MAX_SPEED/2; 

    // Directly alter Matrix positions pushing Forward relative to the -Z Ship Nose LookAt coordinate 
    shipRef.current.translateZ(-velocity.current * delta);

    // Dynamic Banking logic: Roll the localized mesh into turns
    // The max physically allowed banking roll limit is 45 degrees
    const targetRoll = (a - d) * (Math.PI / 4); 
    chassisRef.current.rotation.z = THREE.MathUtils.lerp(chassisRef.current.rotation.z, targetRoll, 5 * delta);

    // Transmit Position to the decoupled spatial routing Audio engine
    shipRef.current.getWorldPosition(globalShipState.position);

    // Dynamically wire the physical velocity to visual light Emission
    const speedRatio = Math.max(0, velocity.current / MAX_SPEED);
    if (engineLightRef.current) engineLightRef.current.intensity = speedRatio * 5;
    if (engineMaterialRef.current) engineMaterialRef.current.emissiveIntensity = 2 + (speedRatio * 8);

    // 2. Cinematic Chase Camera
    // Rather than clamping strictly, calculate the perfect target 'bungee' length
    const idealCameraOffset = new THREE.Vector3(0, 3, 15); 
    // Extend Bungee length during Boost
    if (boost > 1 && w) idealCameraOffset.z += 8;
    
    const idealCameraPos = idealCameraOffset.applyMatrix4(shipRef.current.matrixWorld);
    const idealLookAtOffset = new THREE.Vector3(0, 0, -30).applyMatrix4(shipRef.current.matrixWorld);

    // Spring mechanics smoothly dragging Vector towards mathematical target
    currentCameraPos.current.lerp(idealCameraPos, 5 * delta);
    currentLookAt.current.lerp(idealLookAtOffset, 10 * delta);

    // Affix the camera permanently to these computed offsets
    camera.position.copy(currentCameraPos.current);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <group ref={shipRef} position={[0, 10, 80]}>
      {/* Visual rendering logic stripped of master rotation logic (just handles aesthetic Roll) */}
      <group ref={chassisRef}>
         
         {/* Local Ship Lighting to ensure visibility in absolute dark space */}
         <pointLight position={[0, 4, -4]} intensity={2.5} distance={20} color="#b4c8ff" />
         <pointLight position={[0, -3, 2]} intensity={1.5} distance={15} color="#4455aa" />
         
         {/* --- MAIN FUSELAGE --- */}
         {/* Nose Cone - Hexagonal Stealth Front */}
         <mesh position={[0, 0, -2.5]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.01, 0.45, 4, 6]} />
            {/* Swapped to bright Apollo White / Silver */}
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} flatShading />
         </mesh>

         {/* Mid Body Hull */}
         <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, Math.PI / 6]} castShadow receiveShadow>
             <cylinderGeometry args={[0.5, 0.7, 3, 6]} />
             <meshStandardMaterial color="#e5e5eb" roughness={0.3} metalness={0.6} flatShading />
         </mesh>

         {/* --- WINGS --- */}
         {/* Left Swept Wing */}
         <mesh position={[-1.6, -0.15, 0.8]} rotation={[0, -0.4, 0]} castShadow receiveShadow>
             <boxGeometry args={[3.2, 0.1, 2.0]} />
             <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} />
         </mesh>
         
         {/* Right Swept Wing */}
         <mesh position={[1.6, -0.15, 0.8]} rotation={[0, 0.4, 0]} castShadow receiveShadow>
             <boxGeometry args={[3.2, 0.1, 2.0]} />
             <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.5} />
         </mesh>

         {/* Vertical Stabilizers (Tail Fins) */}
         <mesh position={[-0.8, 0.4, 1.2]} rotation={[0.2, 0, -0.3]}>
            <boxGeometry args={[0.05, 0.8, 1.2]} />
            <meshStandardMaterial color="#d0d0d5" metalness={0.7} roughness={0.3} />
         </mesh>
         <mesh position={[0.8, 0.4, 1.2]} rotation={[0.2, 0, 0.3]}>
            <boxGeometry args={[0.05, 0.8, 1.2]} />
            <meshStandardMaterial color="#d0d0d5" metalness={0.7} roughness={0.3} />
         </mesh>

         {/* --- COCKPIT --- */}
         <mesh position={[0, 0.4, -0.5]} rotation={[-Math.PI/2 - 0.1, 0, 0]}>
            <capsuleGeometry args={[0.25, 1.4, 4, 12]} />
            <meshStandardMaterial color="#000000" metalness={1} roughness={0.05} />
         </mesh>

         {/* --- GLOWING EMISSIVE PIPING --- */}
         {/* Top Energy Spine */}
         <mesh position={[0, 0.55, 0.5]}>
             <boxGeometry args={[0.08, 0.05, 1.8]} />
             <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={3} />
         </mesh>
         {/* Wingtip Energy Rails */}
         <mesh position={[-3.1, -0.15, 1.5]} rotation={[0, -0.4, 0]}>
             <boxGeometry args={[0.05, 0.15, 1.2]} />
             <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2} />
         </mesh>
         <mesh position={[3.1, -0.15, 1.5]} rotation={[0, 0.4, 0]}>
             <boxGeometry args={[0.05, 0.15, 1.2]} />
             <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2} />
         </mesh>

         {/* --- ENGINES --- */}
         {/* Heavy Dual Engine Blocks */}
         <group position={[0, 0, 2.2]}>
            <mesh position={[-0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
               <cylinderGeometry args={[0.3, 0.4, 0.6, 8]} />
               <meshStandardMaterial color="#111" metalness={0.9} roughness={0.6} />
               {/* Inner Thruster Core */}
               <mesh position={[0, -0.25, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
                  <meshStandardMaterial ref={engineMaterialRef} color="#00eeff" emissive="#00eeff" emissiveIntensity={2} />
               </mesh>
            </mesh>
            
            <mesh position={[0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
               <cylinderGeometry args={[0.3, 0.4, 0.6, 8]} />
               <meshStandardMaterial color="#111" metalness={0.9} roughness={0.6} />
               {/* Inner Thruster Core */}
               <mesh position={[0, -0.25, 0]}>
                  <cylinderGeometry args={[0.2, 0.2, 0.1, 8]} />
                  <meshStandardMaterial color="#00eeff" emissive="#00eeff" emissiveIntensity={2} />
               </mesh>
            </mesh>
         </group>
         
         {/* Global Engine Bloom Cast */}
         <pointLight ref={engineLightRef} position={[0, 0, 2.8]} color="#00eeff" distance={25} intensity={0} />
         
         {/* --- RE-PARENTED VFX PROPULSION TRAILS --- */}
         {/* Engine Core Plasma Trails */}
         <Trail width={0.6} length={12} color={new THREE.Color(0, 5, 10)} attenuation={(t) => t * t}>
             {/* Note: visible={false} prevents the origin meshes from rendering as blue dots! */}
             <mesh position={[-0.45, 0, 2.4]} visible={false}><sphereGeometry args={[0.1]}/><meshBasicMaterial /></mesh>
         </Trail>
         <Trail width={0.6} length={12} color={new THREE.Color(0, 5, 10)} attenuation={(t) => t * t}>
             <mesh position={[0.45, 0, 2.4]} visible={false}><sphereGeometry args={[0.1]}/><meshBasicMaterial /></mesh>
         </Trail>
         
         {/* Wingtip Vapor Stabilizers */}
         <Trail width={0.15} length={25} color={new THREE.Color(0, 2, 8)} attenuation={(t) => t * t}>
             <mesh position={[-3.2, -0.15, 2.2]} visible={false}><sphereGeometry args={[0.1]}/><meshBasicMaterial /></mesh>
         </Trail>
         <Trail width={0.15} length={25} color={new THREE.Color(0, 2, 8)} attenuation={(t) => t * t}>
             <mesh position={[3.2, -0.15, 2.2]} visible={false}><sphereGeometry args={[0.1]}/><meshBasicMaterial /></mesh>
         </Trail>

      </group>
    </group>
  );
};
