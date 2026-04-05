import React from 'react';
import * as THREE from 'three';
import { Star } from './Star';
import { Planet } from './Planet';
import { SolarSystem as SolarSystemType } from '../hooks/useSpotifyData';
import { mapRange } from '../utils/math';

interface Props {
  system: SolarSystemType;
  position: [number, number, number];
}

export const SolarSystemGroup: React.FC<Props> = ({ system, position }) => {
  const starRadius = mapRange(system.artist.popularity, 0, 100, 1, 5);

  return (
    <group position={position}>
      {/* Center Star */}
      <Star name={system.artist.name} popularity={system.artist.popularity} color={system.artist.color} />
      
      {/* Planets and Orbit Rings */}
      {system.tracks.map((track, i) => {
         const orbitRadius = starRadius + 4 + (i * 6);
         return (
             <group key={track.id}>
                 {/* Orbit Ring */}
                 <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
                 </mesh>
                 
                 {/* The Planet itself */}
                 <Planet track={track} artist={system.artist} index={i} starRadius={starRadius} />
             </group>
         );
      })}
    </group>
  );
};
