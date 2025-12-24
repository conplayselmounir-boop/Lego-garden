import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { JoystickData, InteractionState } from '../types';
import { GardenerCharacter } from './GardenerCharacter';
import { OrbitControls } from '@react-three/drei';
import { LEGO_DIMENSIONS, GRID_SIZE } from '../constants';

interface PlayerProps {
  joystickRef: React.MutableRefObject<JoystickData>;
  onInteractionChange: (state: InteractionState) => void;
  currentInteraction: InteractionState;
  teleportTarget: { pos: THREE.Vector3, timestamp: number } | null;
}

export const Player: React.FC<PlayerProps> = ({ joystickRef, onInteractionChange, currentInteraction, teleportTarget }) => {
  // Initial Spawn: Bottom center
  const [position, setPosition] = useState(new THREE.Vector3(0, 0, 15));
  const playerRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [rotation, setRotation] = useState(new THREE.Euler(0, 0, 0));

  // Movement Config
  const SPEED = 0.15;
  const BOUNDARY = (GRID_SIZE * LEGO_DIMENSIONS.width) / 2 - 1.5;
  
  // Shop Config
  const SEED_SHOP_POS = new THREE.Vector3(-18, 0, 0); 
  const SELL_SHOP_POS = new THREE.Vector3(18, 0, 0); 
  const INTERACTION_RADIUS = 8;

  const { camera } = useThree();
  const vec = new THREE.Vector3(); // Temp vector

  // Handle Teleport
  useEffect(() => {
      if (teleportTarget) {
          setPosition(teleportTarget.pos.clone());
          // We also need to move the camera focus immediately so it doesn't lag behind
          if (controlsRef.current) {
              controlsRef.current.target.copy(teleportTarget.pos);
              // Optional: If you want to reset the camera angle too, do it here, but keeping current angle is usually better
          }
      }
  }, [teleportTarget]);

  useFrame(() => {
    // 1. Get Input from Virtual Joystick
    let inputX = joystickRef.current.x;
    let inputY = joystickRef.current.y;
    let inputActive = joystickRef.current.active;

    // 2. Get Input from Gamepad (Xbox/Generic)
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (gamepads[0]) {
        const gp = gamepads[0];
        // Left Stick Axes
        // axis 0: -1 (left) to 1 (right)
        // axis 1: -1 (up) to 1 (down)
        const deadzone = 0.1;
        
        if (Math.abs(gp.axes[0]) > deadzone || Math.abs(gp.axes[1]) > deadzone) {
            inputX = gp.axes[0];
            inputY = -gp.axes[1]; // Invert Y because Gamepad Up is -1, but we want Up to be +1 for forward
            inputActive = true;
        }
    }

    // Interaction State Machine
    const distToSeed = Math.sqrt(
        Math.pow(position.x - SEED_SHOP_POS.x, 2) + 
        Math.pow(position.z - SEED_SHOP_POS.z, 2)
    );

    const distToSell = Math.sqrt(
        Math.pow(position.x - SELL_SHOP_POS.x, 2) + 
        Math.pow(position.z - SELL_SHOP_POS.z, 2)
    );

    if (distToSeed < INTERACTION_RADIUS) {
        if (currentInteraction === 'NONE' || currentInteraction === 'NEAR_SELL') {
            onInteractionChange('NEAR_SHOP');
        }
    } else if (distToSell < INTERACTION_RADIUS) {
        if (currentInteraction === 'NONE' || currentInteraction === 'NEAR_SHOP') {
            onInteractionChange('NEAR_SELL');
        }
    } else {
        if (currentInteraction === 'NEAR_SHOP' || currentInteraction === 'NEAR_SELL') {
            onInteractionChange('NONE');
        }
    }

    if (inputActive) {
      setIsMoving(true);

      // 1. Get Camera Direction (projected to flat ground)
      camera.getWorldDirection(vec);
      vec.y = 0;
      vec.normalize();

      // 2. Get Camera Right Direction
      const right = new THREE.Vector3();
      right.crossVectors(vec, new THREE.Vector3(0, 1, 0)).normalize();

      // 3. Calculate Movement
      const moveVector = new THREE.Vector3()
        .addScaledVector(vec, inputY)
        .addScaledVector(right, inputX)
        .normalize()
        .multiplyScalar(SPEED);

      // 4. Update Position
      const newPos = position.clone().add(moveVector);
      
      // Boundary Check
      newPos.x = Math.max(-BOUNDARY, Math.min(BOUNDARY, newPos.x));
      newPos.z = Math.max(-BOUNDARY, Math.min(BOUNDARY, newPos.z));
      
      setPosition(newPos);

      // 5. Smooth Rotation
      if (moveVector.length() > 0.001) {
        const targetAngle = Math.atan2(moveVector.x, moveVector.z);
        // Lerp rotation for smoothness
        const currentAngle = rotation.y;
        
        // Shortest path interpolation for angle
        let delta = targetAngle - currentAngle;
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;
        
        const smoothAngle = currentAngle + delta * 0.2;
        setRotation(new THREE.Euler(0, smoothAngle, 0));
      }

    } else {
      setIsMoving(false);
    }

    // Camera Follow Logic
    if (controlsRef.current) {
      // Smoothly interpolate the OrbitControls target to the player's position
      controlsRef.current.target.lerp(position, 0.1);
      controlsRef.current.update();
    }
  });

  // Calculate rendering Y position (on top of studs)
  // We offset by 0.5 * studHeight to ensure feet sit exactly on top
  const renderY = -1 + LEGO_DIMENSIONS.height + LEGO_DIMENSIONS.studHeight;

  return (
    <>
      <group position={[position.x, renderY, position.z]} rotation={rotation} ref={playerRef}>
        <GardenerCharacter isMoving={isMoving} />
      </group>
      
      <OrbitControls
        ref={controlsRef}
        makeDefault // Important: Allows this control to take precedence but share events
        enablePan={false}
        enableZoom={true}
        enableDamping={true} // Smoother camera movement
        dampingFactor={0.1}
        rotateSpeed={0.5} // Slightly slower for better control
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={8}
        maxDistance={50}
      />
    </>
  );
};