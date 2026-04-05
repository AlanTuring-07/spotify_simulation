import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Track, Artist } from '../hooks/useSpotifyData';
import { getValenceColor, mapRange } from '../utils/math';
import { hudStore } from '../store/hudStore';
import { globalShipState } from '../store/shipStore';
import { PositionalAudio } from '@react-three/drei';

const playingAudios = new Map<string, { dist: number; ref: THREE.PositionalAudio }>();

interface PlanetProps {
  track: Track;
  artist: Artist;
  index: number;
  starRadius: number;
}

export const Planet: React.FC<PlanetProps> = ({ track, artist, index, starRadius }) => {
  const planetRef = useRef<THREE.Group>(null);
  const audioRef = useRef<THREE.PositionalAudio>(null);
  
  // Reusable Vector3 to prevent Memory Leaks allocating variables every frame
  const globalPos = useMemo(() => new THREE.Vector3(), []);

  // Map Taylor Swift local files directly to specific planets!
  const isTaylor = artist.name.toLowerCase().includes("taylor swift");
  const taylorClips: Record<string, string> = {
    "Cruel Summer": "/songs/taylorswift/Cruel_Summer_hook.mp3",
    "Anti-Hero": "/songs/taylorswift/Anti-Hero_hook.mp3",
    "Blank Space": "/songs/taylorswift/Blank_Space_hook.mp3",
    "Style": "/songs/taylorswift/Style_hook.mp3",
    "Lover": "/songs/taylorswift/Lover_hook.mp3",
    "Lavender Haze": "/songs/taylorswift/Lavender_Haze_hook.mp3",
    "Karma": "/songs/taylorswift/Karma_hook.mp3",
    "August": "/songs/taylorswift/August_hook.mp3",
    "Love Story": "/songs/taylorswift/Love_Story_hook.mp3"
  };
  
  // If we have an exact match for the planet's track name, assign it!
  const audioUrl = isTaylor ? (taylorClips[track.name] || null) : null;

  // Orbit distance: evenly spaced from the star to avoid collisions
  const orbitRadius = starRadius + 4 + (index * 6);
  
  // Calculate dynamic aura color based on valence mapping
  const color = useMemo(() => getValenceColor(track.valence), [track.valence]);
  
  // Orbit Speed: map tempo (typically around 60 to 200 BPM) to [0.2 - 2.0 radians/sec]
  const orbitSpeed = useMemo(() => mapRange(track.tempo, 60, 200, 0.2, 2.0), [track.tempo]);

  // Phase offset so planets don't align in a perfect straight line constantly
  const initialAngle = useMemo(() => Math.random() * Math.PI * 2, []);

  useEffect(() => {
    return () => {
       playingAudios.delete(track.id);
    };
  }, [track.id]);

  // Update orbit dynamically at frame rate avoiding costly React renders!
  useFrame((state) => {
     if (planetRef.current) {
        // 1. Plot Position
        const time = state.clock.getElapsedTime();
        const x = Math.cos((time * orbitSpeed) + initialAngle) * orbitRadius;
        const z = Math.sin((time * orbitSpeed) + initialAngle) * orbitRadius;
        planetRef.current.position.set(x, 0, z);

        // 2. Spatial Audio Proximity Check
        planetRef.current.getWorldPosition(globalPos);
        const dist = globalShipState.position.distanceTo(globalPos);

        const THRESHOLD = 8.0; // Distance before HUD and Audio activates
        if (dist < THRESHOLD) {
           hudStore.setTarget({ track, artist });
        } else {
           // We only clear the UI if this EXACT planet is currently targeted
           if (hudStore.get()?.track.id === track.id) {
               hudStore.setTarget(null);
           }
        }

        // Distance Culling (Performance vs. Crossfade)
        if (audioUrl && audioRef.current) {
           const cullingThreshold = 16.8;
           if (dist < cullingThreshold) {
              if (!audioRef.current.isPlaying) {
                 audioRef.current.play();
                 playingAudios.set(track.id, { dist, ref: audioRef.current });
              } else {
                 const data = playingAudios.get(track.id);
                 if (data) data.dist = dist;
              }
              
              let closestId = track.id;
              let minDist = dist;
              for (const [id, data] of playingAudios.entries()) {
                 if (!data.ref || !data.ref.isPlaying) {
                     playingAudios.delete(id);
                     continue;
                 }
                 if (data.dist < minDist) {
                    minDist = data.dist;
                    closestId = id;
                 }
              }
              
              const isClosest = closestId === track.id;
              const hasCollision = playingAudios.size > 1;
              const targetVolume = (hasCollision && !isClosest) ? 0.1 : 0.5;
              
              audioRef.current.setVolume(THREE.MathUtils.lerp(audioRef.current.getVolume(), targetVolume, 0.05));

           } else if (dist >= cullingThreshold && audioRef.current.isPlaying) {
              audioRef.current.pause();
              playingAudios.delete(track.id);
           }
        }
     }
  });

  return (
    <group ref={planetRef}>
      <mesh>
         <sphereGeometry args={[0.8, 16, 16]} />
         <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={2} 
            toneMapped={false} 
         />
      </mesh>
      {audioUrl && (
        <PositionalAudio
          ref={audioRef}
          url={audioUrl}
          loop={true}
          volume={0.5}
          refDistance={2.8}
          maxDistance={14}
          rolloffFactor={0.8}
          {...({ distanceModel: "linear" } as any)}
        />
      )}
    </group>
  );
};
