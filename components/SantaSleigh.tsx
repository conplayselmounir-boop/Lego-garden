import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LegoColors } from '../types';
import { LEGO_DIMENSIONS } from '../constants';
import { SantaCharacter } from './SantaCharacter';

interface SantaSleighProps {
  onDropCandy: (pos: THREE.Vector3) => void;
}

// --- SUB-COMPONENT: DETAILED REINDEER ---
const LegoReindeer: React.FC<{ position: [number, number, number], isRudolph?: boolean, delay?: number }> = ({ position, isRudolph, delay = 0 }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { width: w, height: h, depth: d } = LEGO_DIMENSIONS;
    
    // Gallop Animation
    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.elapsedTime * 10 + delay;
            // Bobbing up and down
            groupRef.current.position.y = position[1] + Math.sin(t) * 0.2;
            // Slight pitching (rocking forward/back)
            groupRef.current.rotation.x = Math.sin(t) * 0.1;
        }
    });

    const parts = useMemo(() => {
        const p = [];
        
        // --- LEGS (4) ---
        // Front Left
        p.push({ pos: [-0.3*w, 0.5*h, 0.4*d], size: [0.2*w, 1.0*h, 0.2*d], color: LegoColors.WOOD_BROWN });
        p.push({ pos: [-0.3*w, 0, 0.4*d], size: [0.22*w, 0.2*h, 0.22*d], color: LegoColors.BLACK }); // Hoof
        
        // Front Right
        p.push({ pos: [0.3*w, 0.5*h, 0.4*d], size: [0.2*w, 1.0*h, 0.2*d], color: LegoColors.WOOD_BROWN });
        p.push({ pos: [0.3*w, 0, 0.4*d], size: [0.22*w, 0.2*h, 0.22*d], color: LegoColors.BLACK });

        // Back Left
        p.push({ pos: [-0.3*w, 0.5*h, -0.4*d], size: [0.2*w, 1.0*h, 0.2*d], color: LegoColors.WOOD_BROWN });
        p.push({ pos: [-0.3*w, 0, -0.4*d], size: [0.22*w, 0.2*h, 0.22*d], color: LegoColors.BLACK });

        // Back Right
        p.push({ pos: [0.3*w, 0.5*h, -0.4*d], size: [0.2*w, 1.0*h, 0.2*d], color: LegoColors.WOOD_BROWN });
        p.push({ pos: [0.3*w, 0, -0.4*d], size: [0.22*w, 0.2*h, 0.22*d], color: LegoColors.BLACK });

        // --- BODY ---
        p.push({ pos: [0, 1.4*h, 0], size: [0.9*w, 0.9*h, 1.4*d], color: LegoColors.WOOD_BROWN });
        // Tail
        p.push({ pos: [0, 1.6*h, -0.8*d], size: [0.2*w, 0.4*h, 0.2*d], color: LegoColors.SNOW_WHITE, rot: [0.5, 0, 0] });

        // --- NECK & HEAD ---
        // Neck
        p.push({ pos: [0, 2.2*h, 0.6*d], size: [0.5*w, 1.0*h, 0.5*d], color: LegoColors.WOOD_BROWN, rot: [-0.2, 0, 0] });
        // Head
        p.push({ pos: [0, 3.0*h, 0.9*d], size: [0.6*w, 0.6*h, 0.8*d], color: LegoColors.WOOD_BROWN });
        
        // Eyes
        p.push({ pos: [-0.31*w, 3.1*h, 1.0*d], size: [0.05*w, 0.1*h, 0.1*d], color: LegoColors.BLACK });
        p.push({ pos: [0.31*w, 3.1*h, 1.0*d], size: [0.05*w, 0.1*h, 0.1*d], color: LegoColors.BLACK });

        // Nose
        p.push({ pos: [0, 3.0*h, 1.35*d], size: [0.2*w, 0.2*h, 0.2*d], color: isRudolph ? LegoColors.CHRISTMAS_RED : LegoColors.BLACK });

        // --- ANTLERS (Gold) ---
        // Base
        p.push({ pos: [0, 3.4*h, 0.8*d], size: [0.8*w, 0.1*h, 0.1*d], color: LegoColors.GOLD });
        // Left Antler
        p.push({ pos: [-0.4*w, 3.8*h, 0.8*d], size: [0.1*w, 0.8*h, 0.1*d], color: LegoColors.GOLD });
        p.push({ pos: [-0.5*w, 3.9*h, 0.8*d], size: [0.1*w, 0.3*h, 0.1*d], color: LegoColors.GOLD, rot: [0, 0, -0.5] });
        // Right Antler
        p.push({ pos: [0.4*w, 3.8*h, 0.8*d], size: [0.1*w, 0.8*h, 0.1*d], color: LegoColors.GOLD });
        p.push({ pos: [0.5*w, 3.9*h, 0.8*d], size: [0.1*w, 0.3*h, 0.1*d], color: LegoColors.GOLD, rot: [0, 0, 0.5] });

        return p;
    }, [w, h, d, isRudolph]);

    return (
        <group ref={groupRef} position={position}>
            {parts.map((part, i) => (
                <mesh 
                    key={i} 
                    position={part.pos as [number, number, number]} 
                    rotation={part.rot as [number, number, number] || [0,0,0]} 
                    castShadow
                >
                    <boxGeometry args={part.size as [number, number, number]} />
                    <meshStandardMaterial 
                        color={part.color} 
                        emissive={part.color === LegoColors.CHRISTMAS_RED && isRudolph ? LegoColors.CHRISTMAS_RED : undefined}
                        emissiveIntensity={part.color === LegoColors.CHRISTMAS_RED && isRudolph ? 1.0 : 0}
                    />
                </mesh>
            ))}
             {/* Harness connection point (visual only) */}
             <mesh position={[0, 1.5*h, -0.7*d]}>
                <boxGeometry args={[0.92*w, 0.1*h, 0.1*d]} />
                <meshStandardMaterial color={LegoColors.GOLD} />
             </mesh>
        </group>
    );
};

// --- MAIN COMPONENT ---
export const SantaSleigh: React.FC<SantaSleighProps> = ({ onDropCandy }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [startTime] = useState(Date.now());
  
  // Z-OFFSET: 12 units (Shops are at 0, this avoids collision)
  const Z_OFFSET = 12;

  useFrame((state) => {
    if (!groupRef.current) return;

    const now = Date.now();
    const elapsed = (now - startTime) / 1000; // seconds

    let targetPos = new THREE.Vector3(0, -100, 0); // Hide by default
    let targetRot = new THREE.Euler(0, Math.PI / 2, 0); // Facing Right (+X)

    if (elapsed < 5) {
        // Phase 0: Waiting
        groupRef.current.visible = false;
        return;
    } else {
        groupRef.current.visible = true;
    }

    if (elapsed < 10) {
        // Phase 1: Enter from Left
        const t = (elapsed - 5) / 5; // 0 to 1
        const ease = 1 - (1 - t) * (1 - t);
        
        targetPos.set(
            THREE.MathUtils.lerp(-80, 0, ease),
            2 + Math.sin(elapsed * 10) * 0.2, 
            Z_OFFSET + Math.sin(elapsed * 2) * 2
        );
        targetRot.z = -0.1; 
        targetRot.y = Math.PI / 2;

    } else if (elapsed < 17) {
        // Phase 2: Hover & Drop
        const t = (elapsed - 10) / 7;
        
        targetPos.set(
            THREE.MathUtils.lerp(0, 10, t),
            2.5 + Math.sin(elapsed * 2) * 0.5,
            Z_OFFSET + Math.cos(elapsed) * 5 
        );
        targetRot.z = Math.sin(elapsed * 3) * 0.05;
        targetRot.y = Math.PI / 2;

        if (Math.random() > 0.90) {
             const dropPos = groupRef.current.position.clone();
             dropPos.x += (Math.random() - 0.5) * 5;
             dropPos.z += (Math.random() - 0.5) * 5;
             onDropCandy(dropPos);
        }

    } else {
        // Phase 3: Fly Away Up
        const t = (elapsed - 17) / 5;
        
        targetPos.set(
            THREE.MathUtils.lerp(10, 100, t),
            THREE.MathUtils.lerp(2.5, 60, t * t), 
            THREE.MathUtils.lerp(Z_OFFSET, Z_OFFSET - 20, t)
        );
        targetRot.z = 0.5;
        targetRot.y = Math.PI / 2;
    }

    groupRef.current.position.copy(targetPos);
    groupRef.current.rotation.copy(targetRot);
  });

  const sleighParts = useMemo(() => {
    const p = [];
    // Runners
    p.push({ pos: [-2, -1, 0], size: [0.5, 0.5, 8], color: LegoColors.GOLD }); 
    p.push({ pos: [2, -1, 0], size: [0.5, 0.5, 8], color: LegoColors.GOLD }); 
    
    // Struts
    p.push({ pos: [-2, 0, -2], size: [0.3, 2, 0.3], color: LegoColors.WOOD_BROWN });
    p.push({ pos: [2, 0, -2], size: [0.3, 2, 0.3], color: LegoColors.WOOD_BROWN });
    p.push({ pos: [-2, 0, 2], size: [0.3, 2, 0.3], color: LegoColors.WOOD_BROWN });
    p.push({ pos: [2, 0, 2], size: [0.3, 2, 0.3], color: LegoColors.WOOD_BROWN });

    // Body
    p.push({ pos: [0, 1, 0], size: [5, 2, 6], color: LegoColors.CHRISTMAS_RED });
    // Backrest
    p.push({ pos: [0, 2.5, -2.5], size: [5, 3, 1], color: LegoColors.CHRISTMAS_RED });
    // Trim
    p.push({ pos: [0, 2, 3], size: [5.2, 0.5, 0.5], color: LegoColors.GOLD });
    
    // Bag of Toys
    p.push({ pos: [0, 2, -1.5], size: [3, 2.5, 2], color: LegoColors.WOOD_BROWN });

    return p;
  }, []);

  return (
    <group ref={groupRef}>
        {/* Sleigh Mesh */}
        {sleighParts.map((part, i) => (
            <mesh key={i} position={part.pos as [number, number, number]}>
                <boxGeometry args={part.size as [number, number, number]} />
                <meshStandardMaterial color={part.color} />
            </mesh>
        ))}

        {/* Santa inside Sleigh */}
        <group position={[0, 1.5, 0.5]} rotation={[0, 0, 0]}>
            <SantaCharacter />
        </group>

        {/* DETAILED REINDEER TEAM */}
        {/* Adjusted rotation to [0, 0, 0] because they are modeled facing +Z, which matches the sleigh's forward direction */}
        
        {/* Left Reindeer (Rudolph) */}
        <group position={[-1.5, 0, 7]} rotation={[0, 0, 0]}> 
             <LegoReindeer position={[0,0,0]} isRudolph={true} delay={0} />
        </group>

        {/* Right Reindeer */}
        <group position={[1.5, 0, 7]} rotation={[0, 0, 0]}> 
             <LegoReindeer position={[0,0,0]} isRudolph={false} delay={2} />
        </group>

        {/* Reins (Ropes) connecting Reindeer to Sleigh */}
        {/* Left Rein */}
        <mesh position={[-1.5, 1.5, 5]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 4.5]} />
            <meshStandardMaterial color={LegoColors.BLACK} />
        </mesh>
        {/* Right Rein */}
        <mesh position={[1.5, 1.5, 5]} rotation={[0.1, 0, 0]}>
            <boxGeometry args={[0.05, 0.05, 4.5]} />
            <meshStandardMaterial color={LegoColors.BLACK} />
        </mesh>
    </group>
  );
};