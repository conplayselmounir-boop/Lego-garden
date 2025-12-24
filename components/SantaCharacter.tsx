import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LegoColors } from '../types';
import { LEGO_DIMENSIONS } from '../constants';
import * as THREE from 'three';

export const SantaCharacter: React.FC = () => {
  const { width, height, depth } = LEGO_DIMENSIONS;
  const rightArmRef = useRef<THREE.Group>(null);

  // Animate Waving
  useFrame((state) => {
    if (rightArmRef.current) {
        // Wave back and forth
        rightArmRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.5;
    }
  });

  const staticParts = useMemo(() => {
    const p = [];

    // --- LEGS & FEET ---
    // Left Boot
    p.push({ pos: [-0.6 * width, 0, 0], size: [0.5 * width, height, depth], color: LegoColors.BLACK });
    // Right Boot
    p.push({ pos: [0.6 * width, 0, 0], size: [0.5 * width, height, depth], color: LegoColors.BLACK });
    
    // Pants (Red)
    p.push({ pos: [-0.6 * width, height, 0], size: [0.5 * width, height * 1.5, depth], color: LegoColors.CHRISTMAS_RED });
    p.push({ pos: [0.6 * width, height, 0], size: [0.5 * width, height * 1.5, depth], color: LegoColors.CHRISTMAS_RED });

    // --- TORSO ---
    // Main Body (Fat Santa)
    const torsoY = height * 2.5;
    p.push({ pos: [0, torsoY + height, 0], size: [2 * width, 2.5 * height, 1.2 * depth], color: LegoColors.CHRISTMAS_RED });

    // Belt
    p.push({ pos: [0, torsoY + 0.5 * height, 0], size: [2.1 * width, 0.6 * height, 1.3 * depth], color: LegoColors.BLACK });
    // Gold Buckle
    p.push({ pos: [0, torsoY + 0.5 * height, 0.7 * depth], size: [0.6 * width, 0.8 * height, 0.2 * depth], color: LegoColors.GOLD });

    // White vertical strip (Jacket fur)
    p.push({ pos: [0, torsoY + 1.5 * height, 0.65 * depth], size: [0.5 * width, 2 * height, 0.1 * depth], color: LegoColors.SNOW_WHITE });

    // --- HEAD ---
    const headY = torsoY + 2.5 * height;
    // Face
    p.push({ pos: [0, headY + 0.5 * height, 0], size: [width, height * 1.5, depth], color: LegoColors.SKIN_TONE });
    
    // Beard (White blocks covering lower face)
    p.push({ pos: [0, headY + 0.2 * height, 0.6 * depth], size: [1.2 * width, height, 0.4 * depth], color: LegoColors.SNOW_WHITE });
    
    // Eyes
    p.push({ pos: [-0.25 * width, headY + 0.8 * height, 0.55 * depth], size: [0.15 * width, 0.15 * height, 0.1 * depth], color: LegoColors.BLACK });
    p.push({ pos: [0.25 * width, headY + 0.8 * height, 0.55 * depth], size: [0.15 * width, 0.15 * height, 0.1 * depth], color: LegoColors.BLACK });

    // --- HAT ---
    const hatY = headY + 1.3 * height;
    // White Rim
    p.push({ pos: [0, hatY, 0], size: [1.4 * width, 0.6 * height, 1.4 * depth], color: LegoColors.SNOW_WHITE });
    // Red Top
    p.push({ pos: [0, hatY + 0.8 * height, 0], size: [width, 0.8 * height, depth], color: LegoColors.CHRISTMAS_RED });
    p.push({ pos: [0.3 * width, hatY + 1.4 * height, 0], size: [0.6 * width, 0.6 * height, 0.6 * depth], color: LegoColors.CHRISTMAS_RED });
    // Pom Pom
    p.push({ pos: [0.6 * width, hatY + 1.2 * height, 0.4 * depth], size: [0.4 * width, 0.4 * height, 0.4 * depth], color: LegoColors.SNOW_WHITE });

    // --- LEFT ARM (Static Down) ---
    p.push({ pos: [-1.3 * width, torsoY + 1.5 * height, 0], size: [0.6 * width, 1.5 * height, 0.8 * depth], color: LegoColors.CHRISTMAS_RED });
    p.push({ pos: [-1.3 * width, torsoY + 0.5 * height, 0], size: [0.5 * width, 0.5 * height, 0.5 * depth], color: LegoColors.SKIN_TONE }); // Hand

    return p;
  }, [width, height, depth]);

  const torsoY = height * 2.5;
  const shoulderY = torsoY + 1.8 * height;

  return (
    <group>
      {/* Static Parts */}
      {staticParts.map((part, i) => (
        <mesh 
            key={i} 
            position={part.pos as [number, number, number]} 
            castShadow 
            receiveShadow
        >
          <boxGeometry args={part.size as [number, number, number]} />
          <meshStandardMaterial color={part.color} roughness={0.3} />
        </mesh>
      ))}

      {/* Animated Right Arm (Waving) */}
      <group ref={rightArmRef} position={[1.3 * width, shoulderY, 0]}>
          {/* Shift geometry so pivot is at shoulder */}
          {/* Shoulder/Upper Arm */}
          <mesh position={[0, 0, 0]}>
             <boxGeometry args={[0.6 * width, 0.6 * height, 0.8 * depth]} />
             <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} />
          </mesh>
          {/* Forearm (Raised Up) */}
          <mesh position={[0.3 * width, 0.7 * height, 0]}>
             <boxGeometry args={[0.5 * width, 1.2 * height, 0.6 * depth]} />
             <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} />
          </mesh>
          {/* Hand */}
          <mesh position={[0.3 * width, 1.4 * height, 0]}>
             <boxGeometry args={[0.6 * width, 0.6 * height, 0.2 * depth]} />
             <meshStandardMaterial color={LegoColors.SKIN_TONE} />
          </mesh>
      </group>
    </group>
  );
};