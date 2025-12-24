import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { LegoColors } from '../types';
import { LEGO_DIMENSIONS } from '../constants';

interface GardenerProps {
  isMoving: boolean;
}

export const GardenerCharacter: React.FC<GardenerProps> = ({ isMoving }) => {
  const { width: w, height: h, depth: d } = LEGO_DIMENSIONS;
  
  // Refs for animated parts
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);

  // Pivot Points
  // Leg total height approx 2.5h (pants 1.5 + boot 1.0)
  const legLength = 2.5 * h;
  const hipY = legLength; 

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const speed = 15;
    const armAmp = 0.6;
    const legAmp = 0.8;

    if (isMoving) {
      // Walking Animation
      const angle = Math.sin(time * speed);
      
      if (leftLegRef.current) leftLegRef.current.rotation.x = angle * legAmp;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -angle * legAmp;
      
      if (leftArmRef.current) leftArmRef.current.rotation.x = -angle * armAmp;
      if (rightArmRef.current) rightArmRef.current.rotation.x = angle * armAmp;

      // Body Bobbing
      if (bodyRef.current) {
        bodyRef.current.position.y = hipY + Math.abs(Math.sin(time * speed * 2)) * 0.1;
        bodyRef.current.rotation.z = Math.sin(time * speed) * 0.02;
      }
    } else {
      // Reset to idle
      if (leftLegRef.current) leftLegRef.current.rotation.x = MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.2);
      if (rightLegRef.current) rightLegRef.current.rotation.x = MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.2);
      if (leftArmRef.current) leftArmRef.current.rotation.x = MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.2);
      if (rightArmRef.current) rightArmRef.current.rotation.x = MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.2);
      
      if (bodyRef.current) {
        bodyRef.current.position.y = MathUtils.lerp(bodyRef.current.position.y, hipY, 0.2);
        bodyRef.current.rotation.z = MathUtils.lerp(bodyRef.current.rotation.z, 0, 0.2);
      }
    }
  });

  return (
    <group>
      {/* --- BODY GROUP (Torso, Head, Hat) --- */}
      {/* Positioned at hipY initially, manipulated by animation */}
      <group ref={bodyRef} position={[0, hipY, 0]}>
        
        {/* WAIST / BELT SECTION (Static relative to body) */}
        {/* This acts as a buffer so rotating legs don't clip into the torso */}
        <mesh position={[0, 0.25 * h, 0]} castShadow>
             <boxGeometry args={[1.05 * w, 0.5 * h, 0.9 * d]} /> 
             <meshStandardMaterial color={LegoColors.BLACK} />
        </mesh>
         
        {/* Gold Buckle */}
        <mesh position={[0, 0.25 * h, 0.46 * d]}>
             <boxGeometry args={[0.4 * w, 0.3 * h, 0.1 * d]} />
             <meshStandardMaterial color={LegoColors.GOLD} />
        </mesh>

        {/* TORSO (Red Christmas Coat) */}
        {/* Starts above waist (0.5h) */}
        <mesh position={[0, 0.5 * h + 1.0 * h, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6 * w, 2.0 * h, 1.0 * d]} />
          <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} roughness={0.3} />
        </mesh>

        {/* White Fur Trim (Vertical center strip) */}
        <mesh position={[0, 0.5 * h + 1.0 * h, 0.51 * d]} castShadow>
          <boxGeometry args={[0.4 * w, 2.0 * h, 0.05 * d]} />
          <meshStandardMaterial color={LegoColors.SNOW_WHITE} roughness={0.5} />
        </mesh>

        {/* HEAD */}
        <group position={[0, 2.5 * h, 0]}>
           <mesh position={[0, 0.6 * h, 0]} castShadow receiveShadow>
             <boxGeometry args={[w, 1.2 * h, d]} />
             <meshStandardMaterial color={LegoColors.SKIN_TONE} roughness={0.3} />
           </mesh>
           {/* Eyes */}
           <mesh position={[-0.25 * w, 0.7 * h, 0.51 * d]}>
             <boxGeometry args={[0.15 * w, 0.15 * h, 0.05 * d]} />
             <meshStandardMaterial color={LegoColors.BLACK} />
           </mesh>
           <mesh position={[0.25 * w, 0.7 * h, 0.51 * d]}>
             <boxGeometry args={[0.15 * w, 0.15 * h, 0.05 * d]} />
             <meshStandardMaterial color={LegoColors.BLACK} />
           </mesh>

           {/* HAT (Santa Style) */}
           <group position={[0, 1.2 * h, 0]}>
              {/* White Rim */}
              <mesh position={[0, 0.2 * h, 0]}>
                <boxGeometry args={[1.2 * w, 0.4 * h, 1.2 * d]} />
                <meshStandardMaterial color={LegoColors.SNOW_WHITE} />
              </mesh>
              {/* Red Top */}
              <mesh position={[0, 0.6 * h, 0]}>
                <boxGeometry args={[1.0 * w, 0.6 * h, 1.0 * d]} />
                <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} />
              </mesh>
              {/* Tip Angled */}
              <mesh position={[0.3 * w, 1.0 * h, -0.2 * d]} rotation={[0, 0, -0.3]}>
                 <boxGeometry args={[0.6 * w, 0.6 * h, 0.6 * d]} />
                 <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} />
              </mesh>
              {/* Pom Pom */}
              <mesh position={[0.65 * w, 0.9 * h, -0.3 * d]}>
                 <boxGeometry args={[0.3 * w, 0.3 * h, 0.3 * d]} />
                 <meshStandardMaterial color={LegoColors.SNOW_WHITE} />
              </mesh>
           </group>
        </group>

        {/* ARMS (Red Sleeves) */}
        
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.9 * w, 2.0 * h, 0]}>
            {/* Shoulder/Sleeve */}
            <mesh position={[0, -0.6 * h, 0]} castShadow>
                <boxGeometry args={[0.45 * w, 1.2 * h, 0.6 * d]} />
                <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} roughness={0.3} />
            </mesh>
            {/* Hand */}
            <mesh position={[0, -1.4 * h, 0]} castShadow>
                <boxGeometry args={[0.35 * w, 0.4 * h, 0.4 * d]} />
                <meshStandardMaterial color={LegoColors.SKIN_TONE} roughness={0.3} />
            </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.9 * w, 2.0 * h, 0]}>
            <mesh position={[0, -0.6 * h, 0]} castShadow>
                <boxGeometry args={[0.45 * w, 1.2 * h, 0.6 * d]} />
                <meshStandardMaterial color={LegoColors.CHRISTMAS_RED} roughness={0.3} />
            </mesh>
             <mesh position={[0, -1.4 * h, 0]} castShadow>
                <boxGeometry args={[0.35 * w, 0.4 * h, 0.4 * d]} />
                <meshStandardMaterial color={LegoColors.SKIN_TONE} roughness={0.3} />
            </mesh>
        </group>
      </group>

      {/* --- LEGS --- */}
      {/* Pivot at HipY (0 relative to group) */}
      
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.28 * w, hipY, 0]}>
         {/* Leg Geometry shifted DOWN to avoid clipping the waist block */}
         {/* Pants (Green) */}
         <mesh position={[0, -0.75 * h - 0.1 * h, 0]} castShadow>
            <boxGeometry args={[0.45 * w, 1.5 * h, 0.85 * d]} />
            <meshStandardMaterial color={LegoColors.DARK_GREEN} roughness={0.3} />
         </mesh>
         {/* Boot (Black) */}
         <mesh position={[0, -1.5 * h - 0.5 * h - 0.1 * h, 0]} castShadow>
            <boxGeometry args={[0.5 * w, 1.0 * h, 1.0 * d]} />
            <meshStandardMaterial color={LegoColors.BLACK} roughness={0.3} />
         </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.28 * w, hipY, 0]}>
         <mesh position={[0, -0.75 * h - 0.1 * h, 0]} castShadow>
            <boxGeometry args={[0.45 * w, 1.5 * h, 0.85 * d]} />
            <meshStandardMaterial color={LegoColors.DARK_GREEN} roughness={0.3} />
         </mesh>
         <mesh position={[0, -1.5 * h - 0.5 * h - 0.1 * h, 0]} castShadow>
            <boxGeometry args={[0.5 * w, 1.0 * h, 1.0 * d]} />
            <meshStandardMaterial color={LegoColors.BLACK} roughness={0.3} />
         </mesh>
      </group>

    </group>
  );
};