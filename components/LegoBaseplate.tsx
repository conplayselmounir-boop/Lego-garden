import React, { useRef, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { LegoColors } from '../types';
import { LEGO_DIMENSIONS } from '../constants';

interface LegoBaseplateProps {
  rows: number;
  cols: number;
  onPlotClick: (x: number, z: number) => void;
}

export const LegoBaseplate: React.FC<LegoBaseplateProps> = ({ rows, cols, onPlotClick }) => {
  // References for InstancedMesh
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const studRef = useRef<THREE.InstancedMesh>(null);

  const { width, height, depth, studRadius, studHeight } = LEGO_DIMENSIONS;
  const count = rows * cols;

  // Reusable objects
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const greenColor = useMemo(() => new THREE.Color(LegoColors.GRASS_GREEN), []);
  const soilColor = useMemo(() => new THREE.Color(LegoColors.SOIL_BROWN), []);

  // Garden Bed Area Definitions
  const gardenMinX = Math.floor(rows * 0.25);
  const gardenMaxX = Math.floor(rows * 0.75);
  const gardenMinZ = Math.floor(cols * 0.35);
  const gardenMaxZ = Math.floor(cols * 0.65);

  useLayoutEffect(() => {
    if (!meshRef.current || !studRef.current) return;

    let i = 0;
    // Center the board
    const offsetX = (rows * width) / 2 - (width / 2);
    const offsetZ = (cols * depth) / 2 - (depth / 2);

    for (let x = 0; x < rows; x++) {
      for (let z = 0; z < cols; z++) {
        const posX = x * width - offsetX;
        const posZ = z * depth - offsetZ;

        // Position for the Base Brick
        tempObject.position.set(posX, 0, posZ);
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);

        // Position for the Stud (on top of the base)
        tempObject.position.set(posX, (height / 2) + (studHeight / 2), posZ);
        tempObject.updateMatrix();
        studRef.current.setMatrixAt(i, tempObject.matrix);

        // Determine Color
        const isSoil = x >= gardenMinX && x < gardenMaxX && z >= gardenMinZ && z < gardenMaxZ;
        const color = isSoil ? soilColor : greenColor;

        meshRef.current.setColorAt(i, color);
        studRef.current.setColorAt(i, color);

        i++;
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    studRef.current.instanceMatrix.needsUpdate = true;
    
    // Ensure colors update
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    if (studRef.current.instanceColor) studRef.current.instanceColor.needsUpdate = true;

  }, [rows, cols, width, height, depth, studRadius, studHeight, tempObject, greenColor, soilColor, gardenMinX, gardenMaxX, gardenMinZ, gardenMaxZ]);

  // Lego Plastic Material - White so instance colors show through
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.2,
    metalness: 0.05,
  }), []);

  const handleClick = (e: any) => {
    e.stopPropagation();
    const instanceId = e.instanceId;
    if (instanceId === undefined) return;

    // Calculate Grid X and Z from index
    // Loop order was: x then z (inner)
    // i = x * cols + z
    const x = Math.floor(instanceId / cols);
    const z = instanceId % cols;

    // Check if it is soil
    const isSoil = x >= gardenMinX && x < gardenMaxX && z >= gardenMinZ && z < gardenMaxZ;

    if (isSoil) {
      onPlotClick(x, z);
    }
  };

  return (
    <group position={[0, -1, 0]}>
      {/* Base Plates */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
        onClick={handleClick}
      >
        <boxGeometry args={[width * 0.98, height, depth * 0.98]} />
        <primitive object={material} attach="material" />
      </instancedMesh>

      {/* Studs */}
      <instancedMesh
        ref={studRef}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
        onClick={handleClick} // Clicking stud also triggers it
      >
        <cylinderGeometry args={[studRadius, studRadius, studHeight, 16]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </group>
  );
};