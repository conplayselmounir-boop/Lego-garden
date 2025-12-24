import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LegoColors } from '../types';

interface CandyProps {
  position: [number, number, number];
  onHitGround: () => void;
}

export const Candy: React.FC<CandyProps> = ({ position, onHitGround }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Fall down slower (was 10, now 5)
    meshRef.current.position.y -= delta * 5; 
    
    // Spin
    meshRef.current.rotation.x += delta * 5;
    meshRef.current.rotation.z += delta * 3;

    if (meshRef.current.position.y < 0) {
        onHitGround();
    }
  });

  return (
    <group ref={meshRef} position={position}>
        {/* Wrapper styling */}
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.4, 0.2, 0.2]} />
            <meshStandardMaterial color={LegoColors.CANDY_RED} />
        </mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI/4]}>
            <coneGeometry args={[0.15, 0.3, 8]} />
            <meshStandardMaterial color={LegoColors.SNOW_WHITE} />
        </mesh>
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, -Math.PI/4]}>
            <coneGeometry args={[0.15, 0.3, 8]} />
            <meshStandardMaterial color={LegoColors.SNOW_WHITE} />
        </mesh>
    </group>
  );
};