import * as THREE from 'three';

// Map an input value from one range to another
export const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// Interpolate color based on valence (0.0 -> Deep Blue, 0.5 -> Rich Purple, 1.0 -> Vibrant Orange)
export const getValenceColor = (valence: number): THREE.Color => {
  const blue = new THREE.Color('#3b82f6');
  const purple = new THREE.Color('#a855f7');
  const orange = new THREE.Color('#f97316');

  if (valence < 0.5) {
    const factor = mapRange(valence, 0, 0.5, 0, 1);
    return blue.lerp(purple, factor);
  } else {
    const factor = mapRange(valence, 0.5, 1, 0, 1);
    return purple.lerp(orange, factor);
  }
};
