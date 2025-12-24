import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LegoColors } from '../types';

interface LightningProps {
  position: [number, number, number]; // Target position (plant)
  startHeight?: number;
}

export const Lightning: React.FC<LightningProps> = ({ position, startHeight = 40 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a jagged geometry
  const geometry = useMemo(() => {
    const points = [];
    const segments = 8;
    const [targetX, targetY, targetZ] = position;
    
    // Start high up in the sky
    let currentX = targetX + (Math.random() - 0.5) * 10;
    let currentY = startHeight;
    let currentZ = targetZ + (Math.random() - 0.5) * 10;

    points.push(new THREE.Vector3(currentX, currentY, currentZ));

    for (let i = 0; i < segments; i++) {
        const t = (i + 1) / segments;
        // Interpolate towards target
        const nextX = THREE.MathUtils.lerp(currentX, targetX, t);
        const nextY = THREE.MathUtils.lerp(currentY, targetY, t);
        const nextZ = THREE.MathUtils.lerp(currentZ, targetZ, t);

        // Add jag
        const jagAmount = 2.0;
        currentX = nextX + (Math.random() - 0.5) * jagAmount;
        currentY = nextY; // Don't jag Y too much or it looks weird
        currentZ = nextZ + (Math.random() - 0.5) * jagAmount;
        
        // Snap last point exactly to target
        if (i === segments - 1) {
            currentX = targetX;
            currentY = targetY;
            currentZ = targetZ;
        }

        points.push(new THREE.Vector3(currentX, currentY, currentZ));
    }
    
    return new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points),
        segments,
        0.3, // Radius
        4, // Radial segments (square-ish look for Lego)
        false
    );
  }, [position, startHeight]);

  // Flash animation
  useFrame((state) => {
    if (meshRef.current) {
        // Flicker opacity
        const flicker = Math.random() > 0.5 ? 1 : 0.2;
        (meshRef.current.material as THREE.MeshBasicMaterial).opacity = flicker;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial color={LegoColors.ELECTRIC_BLUE} transparent opacity={1} toneMapped={false} />
    </mesh>
  );
};