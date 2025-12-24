import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Sky, Stars } from '@react-three/drei';
import { LegoBaseplate } from './LegoBaseplate';
import { LegoShop } from './LegoShop';
import { Player } from './Player';
import { LegoPlant } from './LegoPlants';
import { Lightning } from './Lightning';
import { SantaSleigh } from './SantaSleigh';
import { Candy } from './Candy';
import { Snow } from './Snow';
import * as THREE from 'three';
import { GRID_SIZE, LEGO_DIMENSIONS, PLANT_STATS } from '../constants';
import { JoystickData, InteractionState, PlantInstance, LegoColors } from '../types';

interface SceneProps {
  joystickRef: React.MutableRefObject<JoystickData>;
  onInteractionChange: (state: InteractionState) => void;
  currentInteraction: InteractionState;
  plants: PlantInstance[];
  onPlotClick: (x: number, z: number) => void;
  isStormActive: boolean;
  lightningStrikes: { id: string; position: [number, number, number] }[];
  isSantaEventActive: boolean;
  onCandyHit: (pos: THREE.Vector3) => void;
}

export const Scene: React.FC<SceneProps> = ({ 
    joystickRef, 
    onInteractionChange, 
    currentInteraction, 
    plants, 
    onPlotClick,
    isStormActive,
    lightningStrikes,
    isSantaEventActive,
    onCandyHit
}) => {
  // Approximate Y level of the baseplate surface
  const SURFACE_Y = -1 + LEGO_DIMENSIONS.height + LEGO_DIMENSIONS.studHeight;
  
  // Candy State
  const [candies, setCandies] = useState<{ id: string; position: [number, number, number] }[]>([]);

  // Calculate Plant Position Helper
  const getPlantPos = (gridX: number, gridZ: number): [number, number, number] => {
    const offsetX = (GRID_SIZE * LEGO_DIMENSIONS.width) / 2 - (LEGO_DIMENSIONS.width / 2);
    const offsetZ = (GRID_SIZE * LEGO_DIMENSIONS.depth) / 2 - (LEGO_DIMENSIONS.depth / 2);
    
    return [
      gridX * LEGO_DIMENSIONS.width - offsetX,
      SURFACE_Y,
      gridZ * LEGO_DIMENSIONS.depth - offsetZ
    ];
  };

  const handleDropCandy = (pos: THREE.Vector3) => {
    const id = Math.random().toString();
    setCandies(prev => [...prev, { id, position: [pos.x, pos.y, pos.z] }]);
  };

  const handleCandyHit = (id: string, pos: [number, number, number]) => {
      // Remove candy
      setCandies(prev => prev.filter(c => c.id !== id));
      // Trigger mutation logic in App
      onCandyHit(new THREE.Vector3(pos[0], pos[1], pos[2]));
  };

  // Clear candies if event ends
  useEffect(() => {
    if (!isSantaEventActive) {
        setCandies([]);
    }
  }, [isSantaEventActive]);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 20, 35], fov: 40 }} 
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      className="w-full h-full bg-blue-100"
    >
      <Suspense fallback={null}>
        {/* Dynamic Lighting Setup based on Storm */}
        <ambientLight intensity={isStormActive ? 0.2 : 0.6} color={isStormActive ? "#ff0000" : "#ffffff"} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={isStormActive ? 0.5 : 1.5}
          color={isStormActive ? "#ff5500" : "#ffffff"}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        >
          <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30]} />
        </directionalLight>
        
        {/* Thunderstorm Atmosphere */}
        {isStormActive && (
            <>
                <color attach="background" args={[LegoColors.STORM_SKY]} />
                <fog attach="fog" args={[LegoColors.STORM_SKY, 10, 60]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            </>
        )}

        {/* Normal Atmosphere / Santa Atmosphere */}
        {!isStormActive && (
            <>
                <Sky sunPosition={isSantaEventActive ? [0, 10, -100] : [100, 20, 100]} turbidity={0.3} rayleigh={0.8} />
                <Environment preset="park" />
                {isSantaEventActive && (
                    <>
                         <Stars radius={100} depth={50} count={1000} factor={4} saturation={1} fade speed={2} />
                         <Snow />
                    </>
                )}
            </>
        )}
        
        {/* Render Lightning Bolts */}
        {lightningStrikes.map(strike => (
            <Lightning key={strike.id} position={strike.position} />
        ))}

        {/* Render Santa Sleigh */}
        {isSantaEventActive && (
            <SantaSleigh onDropCandy={handleDropCandy} />
        )}

        {/* Render Falling Candies */}
        {candies.map(candy => (
            <Candy 
                key={candy.id} 
                position={candy.position} 
                onHitGround={() => handleCandyHit(candy.id, candy.position)}
            />
        ))}

        {/* The Lego Ground */}
        <LegoBaseplate rows={GRID_SIZE} cols={GRID_SIZE} onPlotClick={onPlotClick} />

        {/* Render Plants */}
        {plants.map(plant => (
            <LegoPlant 
                key={plant.id} 
                type={plant.type} 
                growth={plant.growth}
                scaleVariation={plant.scaleVariation}
                rotationOffset={plant.rotationOffset}
                isMutated={plant.isMutated}
                mutationSource={plant.mutationSource}
                position={getPlantPos(plant.x, plant.z)} 
            />
        ))}

        {/* Shops */}
        <LegoShop 
          type="seed" 
          position={[-18, SURFACE_Y, 0]} 
          rotation={[0, Math.PI / 8, 0]} 
        />
        <LegoShop 
          type="sell" 
          position={[18, SURFACE_Y, 0]} 
          rotation={[0, -Math.PI / 8, 0]} 
        />

        {/* Player Character & Controls */}
        <Player 
          joystickRef={joystickRef} 
          onInteractionChange={onInteractionChange}
          currentInteraction={currentInteraction}
        />

      </Suspense>
    </Canvas>
  );
};