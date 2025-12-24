import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LegoColors } from '../types';
import { LEGO_DIMENSIONS } from '../constants';
import * as THREE from 'three';

interface LegoPlantProps {
  type: string;
  position: [number, number, number];
  growth: number; // 0 to 1
  scaleVariation: number; // Multiplier for size
  rotationOffset: number; // Initial rotation
  isMutated: boolean;
  mutationSource?: 'storm' | 'candy';
}

export const LegoPlant: React.FC<LegoPlantProps> = ({ type, position, growth, scaleVariation, rotationOffset, isMutated, mutationSource }) => {
  const { width: w, height: h, depth: d } = LEGO_DIMENSIONS;
  const readyIndicatorRef = useRef<THREE.Group>(null);

  // Calculate Scale based on growth AND variation
  const baseScale = 0.3 + (0.7 * growth);
  const finalScale = baseScale * scaleVariation;

  // Animate the "Ready" indicator
  useFrame((state) => {
    if (growth >= 1 && readyIndicatorRef.current) {
        readyIndicatorRef.current.position.y = (2.5 * h * scaleVariation) + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        readyIndicatorRef.current.rotation.y += 0.02;
    }
  });

  const bricks = useMemo(() => {
    const b = [];
    
    // Logic for Colors based on Mutation Source
    const isCandy = mutationSource === 'candy';
    
    // Stem Color: Storm = Black, Candy = White
    const stemColor = isMutated 
        ? (isCandy ? LegoColors.SNOW_WHITE : LegoColors.BLACK)
        : LegoColors.DARK_GREEN;
    
    // Primary Color (Leaves/Main): Storm = Neon Purple, Candy = Christmas Red
    const mutPrimary = isCandy ? LegoColors.CHRISTMAS_RED : LegoColors.NEON_PURPLE;
    
    // Secondary Color (Highlights/Thorns): Storm = Electric Blue, Candy = White or Gold
    const mutSecondary = isCandy ? LegoColors.SNOW_WHITE : LegoColors.ELECTRIC_BLUE;

    switch (type) {
      case 'frosty_fern':
        // Stem
        b.push({ pos: [0, 0.4 * h, 0], size: [0.2 * w, 0.6 * h, 0.2 * d], color: stemColor });
        
        // Leaves
        // If mutated, override specific colors
        const fernColor = isMutated ? mutPrimary : LegoColors.FERN_TEAL;
        
        b.push({ pos: [-0.3 * w, 0.8 * h, 0], size: [0.4 * w, 0.2 * h, 0.8 * d], color: fernColor, rot: [0, 0, 0.5] });
        b.push({ pos: [0.3 * w, 0.8 * h, 0], size: [0.4 * w, 0.2 * h, 0.8 * d], color: fernColor, rot: [0, 0, -0.5] });
        // Top tip
        b.push({ pos: [0, 1.2 * h, 0], size: [0.2 * w, 0.4 * h, 0.2 * d], color: isMutated ? mutSecondary : LegoColors.SNOW_WHITE });
        break;

      case 'crystal_rose':
        // Stem
        b.push({ pos: [0, 0.5 * h, 0], size: [0.15 * w, 1.0 * h, 0.15 * d], color: stemColor });
        // Thorns
        b.push({ pos: [0.1 * w, 0.6 * h, 0], size: [0.1 * w, 0.1 * h, 0.1 * d], color: isMutated ? mutSecondary : LegoColors.CHRISTMAS_RED });
        // Flower Head
        const roseColor = isMutated ? mutPrimary : LegoColors.ROSE_PINK;
        const roseCenter = isMutated ? mutSecondary : "#f8bbd0";
        
        b.push({ pos: [0, 1.5 * h, 0], size: [0.5 * w, 0.5 * h, 0.5 * d], color: roseColor });
        b.push({ pos: [0, 1.8 * h, 0], size: [0.3 * w, 0.3 * h, 0.3 * d], color: roseCenter }); 
        break;

      case 'golden_berry':
        // Bush body
        const bushColor = isMutated ? (isCandy ? LegoColors.SNOW_WHITE : "#222") : LegoColors.GRASS_GREEN;
        const berryColor = isMutated ? (isCandy ? LegoColors.CHRISTMAS_RED : LegoColors.ELECTRIC_BLUE) : LegoColors.GOLD;
        
        b.push({ pos: [0, 0.4 * h, 0], size: [0.8 * w, 0.6 * h, 0.8 * d], color: bushColor });
        b.push({ pos: [0, 0.8 * h, 0], size: [0.6 * w, 0.6 * h, 0.6 * d], color: bushColor });
        // Berries
        b.push({ pos: [0.3 * w, 0.5 * h, 0.3 * d], size: [0.2 * w, 0.2 * h, 0.2 * d], color: berryColor });
        b.push({ pos: [-0.2 * w, 0.7 * h, 0.2 * d], size: [0.2 * w, 0.2 * h, 0.2 * d], color: berryColor });
        b.push({ pos: [0, 1.1 * h, 0], size: [0.2 * w, 0.2 * h, 0.2 * d], color: berryColor });
        break;

      case 'snow_pine':
        // Trunk
        b.push({ pos: [0, 0.4 * h, 0], size: [0.3 * w, 0.4 * h, 0.3 * d], color: stemColor === LegoColors.DARK_GREEN ? LegoColors.WOOD_BROWN : stemColor });
        
        // Tree Layers
        const pineColor = isMutated ? mutPrimary : LegoColors.DARK_GREEN;
        const pineTipColor = isMutated ? mutSecondary : LegoColors.SNOW_WHITE;
        
        b.push({ pos: [0, 0.8 * h, 0], size: [0.8 * w, 0.2 * h, 0.8 * d], color: pineColor });
        b.push({ pos: [0, 1.0 * h, 0], size: [0.6 * w, 0.4 * h, 0.6 * d], color: pineColor });
        b.push({ pos: [0, 1.4 * h, 0], size: [0.4 * w, 0.4 * h, 0.4 * d], color: pineTipColor });
        break;
        
      default:
        b.push({ pos: [0, 0.4 * h, 0], size: [0.1 * w, 0.5 * h, 0.1 * d], color: LegoColors.GRASS_GREEN });
    }
    return b;
  }, [type, w, h, d, isMutated, mutationSource]);

  return (
    <group position={position}>
        {/* Fixed Soil Base */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6 * w, 0.4 * h, 0.6 * d]} />
            <meshStandardMaterial color={isMutated ? (mutationSource === 'candy' ? LegoColors.SNOW_WHITE : LegoColors.BLACK) : LegoColors.SOIL_BROWN} roughness={0.5} />
        </mesh>

        {/* Scaled & Rotated Plant */}
        <group 
            scale={[finalScale, finalScale, finalScale]} 
            position={[0, 0, 0]}
            rotation={[0, rotationOffset, 0]} 
        >
            {bricks.map((brick, i) => (
                <mesh 
                    key={i} 
                    position={brick.pos as [number, number, number]} 
                    rotation={brick.rot as [number, number, number] || [0, 0, 0]}
                    castShadow 
                    receiveShadow
                >
                <boxGeometry args={brick.size as [number, number, number]} />
                <meshStandardMaterial 
                    color={brick.color} 
                    roughness={isMutated ? 0.1 : 0.3} 
                    emissive={isMutated ? brick.color : undefined}
                    emissiveIntensity={isMutated ? 0.5 : 0}
                />
                </mesh>
            ))}
        </group>

        {/* Ready Indicator */}
        {growth >= 1 && (
            <group ref={readyIndicatorRef} position={[0, 2 * h, 0]}>
                <mesh castShadow>
                    <cylinderGeometry args={[0.3, 0.3, 0.1, 16]} rotation={[Math.PI/2, 0, 0]} />
                    <meshStandardMaterial color={isMutated ? (mutationSource === 'candy' ? LegoColors.CANDY_RED : LegoColors.NEON_PURPLE) : LegoColors.GOLD} metalness={0.8} roughness={0.2} />
                </mesh>
            </group>
        )}
    </group>
  );
};