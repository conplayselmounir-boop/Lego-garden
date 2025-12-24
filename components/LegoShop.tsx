import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { LegoColors } from '../types';
import { LEGO_DIMENSIONS } from '../constants';
import { SantaCharacter } from './SantaCharacter';

interface LegoShopProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  type: 'seed' | 'sell';
}

export const LegoShop: React.FC<LegoShopProps> = ({ position, rotation = [0, 0, 0], type }) => {
  const { width, height, depth } = LEGO_DIMENSIONS;

  const title = type === 'seed' ? "SEEDS" : "SELL";
  const mainColor = type === 'seed' ? LegoColors.CHRISTMAS_RED : LegoColors.DARK_GREEN;

  // Procedural generation of a simple stall
  const bricks = useMemo(() => {
    const b = [];
    
    // 1. Base / Counter (Wood)
    // 6 studs wide, 3 deep (0, 1, 2)
    for (let x = -2.5; x <= 2.5; x++) {
      for (let z = 0; z < 2; z++) {
        for (let y = 0; y < 3; y++) {
             b.push({
                pos: [x * width, y * height, z * depth],
                size: [width * 0.98, height, depth * 0.98],
                color: LegoColors.WOOD_BROWN
             });
        }
        // Countertop (White snow layer)
        b.push({
            pos: [x * width, 3 * height, z * depth],
            size: [width, height / 3, depth],
            color: LegoColors.SNOW_WHITE
        });
      }
    }

    // 2. Candy Cane Poles (Front corners)
    const poleX = [-2.5, 2.5];
    for (const px of poleX) {
        for(let y = 0; y < 10; y++) { 
            const isWhite = y % 2 === 0;
            b.push({
                pos: [px * width, (y * height) + (height * 3), 1 * depth], // Start from counter top
                size: [width * 0.5, height, depth * 0.5],
                color: isWhite ? LegoColors.SNOW_WHITE : LegoColors.CHRISTMAS_RED
            });
        }
    }

    // 3. Roof (A-Frame / Awning)
    const roofStartHeight = 13 * height;
    
    for (let x = -3.5; x <= 3.5; x++) {
        for (let zStep = 0; zStep < 5; zStep++) {
             const yOffset = (zStep * height * 0.6); 
             const zPos = (2 * depth) - (zStep * depth * 0.9);
             
             // Striped Roof
             const isStripe = (Math.round(x + 10) % 2) === 0;
             const roofColor = isStripe ? mainColor : LegoColors.SNOW_WHITE;

             b.push({
                pos: [x * width, roofStartHeight + yOffset, zPos],
                size: [width, height, depth],
                color: roofColor,
                rot: [-Math.PI / 6, 0, 0] // Tilt
             });
             
             // Snow dusting on top of some roof bricks
             if (Math.random() > 0.7) {
                 b.push({
                    pos: [x * width, roofStartHeight + yOffset + (height*0.6), zPos],
                    size: [width * 0.8, height/4, depth * 0.8],
                    color: LegoColors.SNOW_WHITE,
                    rot: [-Math.PI / 6, 0, 0]
                 });
             }
        }
    }
    
    // 4. Ground Decoration (Snow Piles / Presents)
    // Random blocks around the base
    for (let i = 0; i < 5; i++) {
        const rx = (Math.random() - 0.5) * 8;
        const rz = (Math.random() - 0.5) * 6 + 2; // In front
        
        // Don't spawn inside the counter
        if (Math.abs(rx) < 3.5 && Math.abs(rz) < 2) continue;

        b.push({
            pos: [rx * width, 0, rz * depth],
            size: [width * 0.8, height * 0.8, depth * 0.8],
            color: Math.random() > 0.5 ? LegoColors.SNOW_WHITE : (Math.random() > 0.5 ? LegoColors.GOLD : mainColor),
            rot: [0, Math.random() * Math.PI, 0]
        });
    }

    return b;
  }, [width, height, depth, mainColor]);

  return (
    <group position={position} rotation={rotation}>
      {/* Structural Bricks */}
      {bricks.map((brick, i) => (
        <mesh 
            key={i} 
            position={brick.pos as [number, number, number]} 
            rotation={brick.rot as [number, number, number] || [0, 0, 0]}
            castShadow 
            receiveShadow
        >
          <boxGeometry args={brick.size as [number, number, number]} />
          <meshStandardMaterial color={brick.color} roughness={0.3} />
        </mesh>
      ))}

      {/* The Shopkeeper (Santa) - Positioned behind the counter */}
      <group position={[0, 0, -1.5 * depth]}>
          <SantaCharacter />
      </group>

      {/* Sign Board */}
      <group position={[0, 10 * height, 2 * depth]}>
        <mesh position={[0, 0, 0]}>
             <boxGeometry args={[4 * width, 3 * height, 0.2]} />
             <meshStandardMaterial color={LegoColors.WOOD_BROWN} />
        </mesh>
        <Text
            position={[0, 0, 0.15]}
            fontSize={0.8}
            color={LegoColors.GOLD}
            anchorX="center"
            anchorY="middle"
        >
            {title}
        </Text>
      </group>
    </group>
  );
};