import React from 'react';
import { mapRange } from '../utils/math';

interface StarProps {
  name: string;
  popularity: number;
  color: string;
}

export const Star: React.FC<StarProps> = ({ name, popularity, color }) => {
  // Map popularity (0-100) to radius (1-5 units)
  const radius = mapRange(popularity, 0, 100, 1, 5);

  return (
    <mesh name="Star" userData={{ name, popularity, color }}>
      <sphereGeometry args={[radius, 64, 64]} />
      {/* Emissive material injects the custom star color aggressively into the bloom processor */}
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={4} 
        toneMapped={false} 
      />
    </mesh>
  );
};
