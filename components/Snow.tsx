import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { LegoColors } from '../types';
import * as THREE from 'three';

export const Snow: React.FC = () => {
  const count = 1000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate random initial positions and speeds
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = {
        x: (Math.random() - 0.5) * 100,
        y: Math.random() * 50 + 10,
        z: (Math.random() - 0.5) * 100,
        speed: 0.1 + Math.random() * 0.3,
        xOff: Math.random() * 100
      };
      temp.push(t);
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    particles.forEach((particle, i) => {
      // Update position
      particle.y -= particle.speed;
      
      // Horizontal drift
      particle.x += Math.sin(state.clock.elapsedTime + particle.xOff) * 0.02;

      // Reset if too low
      if (particle.y < 0) {
        particle.y = 50;
        particle.x = (Math.random() - 0.5) * 100;
        particle.z = (Math.random() - 0.5) * 100;
      }

      dummy.position.set(particle.x, particle.y, particle.z);
      // Small random rotation
      dummy.rotation.set(particle.x, particle.y, 0);
      dummy.scale.setScalar(0.15); // Small flakes
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color={LegoColors.SNOW_WHITE} transparent opacity={0.8} />
    </instancedMesh>
  );
};