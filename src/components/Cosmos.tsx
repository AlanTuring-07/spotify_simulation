import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { SolarSystemGroup } from './SolarSystemGroup';
import { Spaceship } from './Spaceship';
import { TargetingSensor } from './TargetingSensor';
import { SolarSystem } from '../hooks/useSpotifyData';
import { mapRange } from '../utils/math';

interface Props {
  data: SolarSystem[];
}

const getSystemInfluenceRadius = (sys: SolarSystem) => {
  const starRadius = mapRange(sys.artist.popularity, 0, 100, 1, 5);
  if (sys.tracks.length === 0) return starRadius + 10;
  // Maximum orbit formula from Planet.tsx: starRadius + 4 + (index * 6)
  const maxOrbit = starRadius + 4 + ((sys.tracks.length - 1) * 6);
  return maxOrbit + 15; // include extra padding buffer
};

export const Cosmos: React.FC<Props> = ({ data }) => {

  // Generate collision-free stable coordinates at initialization
  const positions = useMemo(() => {
     const placed: { x: number, y: number, z: number, radius: number }[] = [];
     const GALAXY_BOUNDS = 500; // Coordinate spread boundaries (-250 to 250)
     
     return data.map((sys) => {
        const radius = getSystemInfluenceRadius(sys);
        let x = 0, y = 0, z = 0;
        let collision = true;
        let attempts = 0;
        
        // Loop randomly until we find a clear structural opening for the solar system
        while (collision && attempts < 2000) {
           x = (Math.random() - 0.5) * GALAXY_BOUNDS;
           y = (Math.random() - 0.5) * (GALAXY_BOUNDS / 4); // Keep the galaxy relatively flat vertically
           z = (Math.random() - 0.5) * GALAXY_BOUNDS;
           
           collision = false;
           for (const p of placed) {
              const dist = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2) + Math.pow(z - p.z, 2));
              // Distance must be strictly greater than combined radii + 20 margin
              if (dist < (radius + p.radius + 20)) {
                 collision = true;
                 break;
              }
           }
           attempts++;
        }
        
        // Finalize this vector
        placed.push({ x, y, z, radius });
        return [x, y, z] as [number, number, number];
     });
  }, [data]);

  return (
    <div className="absolute inset-0 bg-black">
      <Canvas camera={{ position: [0, 10, 50], fov: 75 }}>
        <color attach="background" args={['#020205']} />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 0, 0]} intensity={1} />
        
        <Stars radius={150} depth={50} count={8000} factor={4} saturation={0} fade speed={1.5} />
        
        {/* Render fully scattered Universe */}
        {data.map((sys, idx) => (
             <SolarSystemGroup 
                key={sys.artist.id} 
                system={sys} 
                position={positions[idx]} 
             />
        ))}

        {/* The New Spaceship Controller */}
        <Spaceship />
        
        {/* Line of sight Sensor (Invisible nodes hooking into Raycast updates) */}
        <TargetingSensor />

        {/* Bloom Post Processing Pipeline for Cinematic Aesthetics */}
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={2} />
        </EffectComposer>
      </Canvas>
      
      {/* Instructions overlay strictly for pointer controls */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
         <div className="absolute bottom-10 bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
            <p className="text-white/60 font-mono text-sm tracking-widest"><span className="text-white font-bold">CLICK</span> TO LOCK CURSOR • <span className="text-white font-bold">WASD/MOUSE</span> TO FLY • <span className="text-white font-bold">ESC</span> TO UNLOCK</p>
         </div>
      </div>
    </div>
  );
};
