import React, { useRef, useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { Overlay } from './components/Overlay';
import { Joystick } from './components/Joystick';
import { JoystickData, InteractionState, Inventory, PlantInstance } from './types';
import { PLANT_STATS, GRID_SIZE, LEGO_DIMENSIONS } from './constants';
import * as THREE from 'three';

const App: React.FC = () => {
  // We use a ref to pass data from the UI layer to the 3D layer
  const joystickRef = useRef<JoystickData>({ x: 0, y: 0, active: false });
  const [interactionState, setInteractionState] = useState<InteractionState>('NONE');
  const [money, setMoney] = useState<number>(500); // Start money
  
  // Inventory System
  const [inventory, setInventory] = useState<Inventory>({});
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);

  // Garden State
  const [plants, setPlants] = useState<PlantInstance[]>([]);
  
  // Storm System
  const [isStormActive, setIsStormActive] = useState(false);
  const [lightningStrikes, setLightningStrikes] = useState<{ id: string; position: [number, number, number] }[]>([]);

  // Santa Event System
  const [isSantaEventActive, setIsSantaEventActive] = useState(false);

  // --- UNIFIED EVENT MANAGER ---
  // To prevent overlapping events, we use a single loop and a lock.
  const eventLockedRef = useRef(false);
  
  // Timers for next events
  const nextStormTime = useRef(Date.now() + 120000); // First storm in 2 mins
  const nextSantaTime = useRef(Date.now() + 180000); // First Santa in 3 mins

  useEffect(() => {
    const checkInterval = setInterval(() => {
        const now = Date.now();

        // If an event is currently running, do nothing
        if (eventLockedRef.current) return;

        // 1. Check Storm
        if (now >= nextStormTime.current) {
            triggerStorm();
            return; 
        }

        // 2. Check Santa
        if (now >= nextSantaTime.current) {
            triggerSanta();
            return;
        }

    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  const triggerStorm = () => {
    eventLockedRef.current = true;
    setIsStormActive(true);
    
    // Storm lasts 15 seconds
    setTimeout(() => {
        setIsStormActive(false);
        setLightningStrikes([]);
        eventLockedRef.current = false;
        // Schedule next storm 2 minutes AFTER this one finishes
        nextStormTime.current = Date.now() + 120000;
    }, 15000);
  };

  const triggerSanta = () => {
    eventLockedRef.current = true;
    setIsSantaEventActive(true);

    // Santa lasts 25 seconds
    setTimeout(() => {
        setIsSantaEventActive(false);
        eventLockedRef.current = false;
        // Schedule next Santa 3 minutes AFTER this one finishes
        nextSantaTime.current = Date.now() + 180000;
    }, 25000);
  };

  // Candy Mutation Logic
  const handleCandyHit = (pos: THREE.Vector3) => {
    // Check if candy hit near a plant
    setPlants(prev => prev.map(p => {
        // Calculate World Pos of plant
        const offsetX = (GRID_SIZE * LEGO_DIMENSIONS.width) / 2 - (LEGO_DIMENSIONS.width / 2);
        const offsetZ = (GRID_SIZE * LEGO_DIMENSIONS.depth) / 2 - (LEGO_DIMENSIONS.depth / 2);
        
        const plantWorldX = p.x * LEGO_DIMENSIONS.width - offsetX;
        const plantWorldZ = p.z * LEGO_DIMENSIONS.depth - offsetZ;

        const dx = plantWorldX - pos.x;
        const dz = plantWorldZ - pos.z;
        const dist = Math.sqrt(dx*dx + dz*dz);

        // If candy lands within 4 units of a plant, mutate it!
        // Apply Candy Mutation Type
        if (dist < 4) {
             return { ...p, isMutated: true, mutationSource: 'candy', growth: 1 };
        }
        return p;
    }));
  };

  // --- LIGHTNING STRIKE LOGIC ---
  useEffect(() => {
    if (!isStormActive) return;

    // While storm is active, try to strike plants randomly
    const strikeInterval = setInterval(() => {
        if (plants.length === 0) return;

        // 30% chance to strike a plant per second
        if (Math.random() > 0.3) {
            const randomIndex = Math.floor(Math.random() * plants.length);
            const targetPlant = plants[randomIndex];
            
            // Do not strike already mutated plants
            if (targetPlant.isMutated) return;

            // Calculate position 
            const offsetX = (GRID_SIZE * LEGO_DIMENSIONS.width) / 2 - (LEGO_DIMENSIONS.width / 2);
            const offsetZ = (GRID_SIZE * LEGO_DIMENSIONS.depth) / 2 - (LEGO_DIMENSIONS.depth / 2);
            const SURFACE_Y = -1 + LEGO_DIMENSIONS.height + LEGO_DIMENSIONS.studHeight;
            
            const pos: [number, number, number] = [
                targetPlant.x * LEGO_DIMENSIONS.width - offsetX,
                SURFACE_Y,
                targetPlant.z * LEGO_DIMENSIONS.depth - offsetZ
            ];

            // Add visual bolt
            const boltId = Math.random().toString();
            setLightningStrikes(prev => [...prev, { id: boltId, position: pos }]);
            
            // Remove bolt visual after short time
            setTimeout(() => {
                setLightningStrikes(prev => prev.filter(b => b.id !== boltId));
            }, 500);

            // MUTATE THE PLANT (STORM TYPE)
            setPlants(prev => prev.map((p, i) => {
                if (i === randomIndex) {
                    return { ...p, isMutated: true, mutationSource: 'storm', growth: 1 };
                }
                return p;
            }));
        }
    }, 1000);

    return () => clearInterval(strikeInterval);
  }, [isStormActive, plants]);

  // --- GROWTH LOOP ---
  useEffect(() => {
    const TICK_RATE = 200; // Update every 200ms
    const interval = setInterval(() => {
        setPlants(currentPlants => {
            let changed = false;
            const nextPlants = currentPlants.map(plant => {
                if (plant.growth >= 1) return plant; // Already mature

                const stats = PLANT_STATS[plant.type];
                if (!stats) return plant;

                // Duration affects growth speed
                const increment = (TICK_RATE / 1000) / stats.growthDuration;
                const newGrowth = Math.min(1, plant.growth + increment);
                
                if (newGrowth !== plant.growth) changed = true;

                return { ...plant, growth: newGrowth };
            });

            return changed ? nextPlants : currentPlants;
        });
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, []);

  const handleJoystickMove = (data: JoystickData) => {
    joystickRef.current = data;
  };

  const addToInventory = (itemId: string, amount: number) => {
    setInventory(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + amount
    }));
  };

  const removeFromInventory = (itemId: string, amount: number) => {
    setInventory(prev => {
        const current = prev[itemId] || 0;
        if (current <= amount) {
            const newState = { ...prev };
            delete newState[itemId];
            return newState;
        }
        return { ...prev, [itemId]: current - amount };
    });
  };

  const handlePlotClick = (x: number, z: number) => {
    // 1. Check if we have a seed selected
    if (!selectedSeed) return;

    // 2. Check if inventory has this seed
    if ((inventory[selectedSeed] || 0) <= 0) return;

    // 3. Check if plot is already occupied
    const isOccupied = plants.some(p => p.x === x && p.z === z);
    if (isOccupied) return;

    // 4. Plant it!
    
    // GIANT LOGIC: 5% chance to be HUGE
    const isGiant = Math.random() < 0.05;
    // Normal: 0.8 - 1.3. Giant: 3.0 - 5.0
    const scale = isGiant 
        ? 3.0 + Math.random() * 2.0 
        : 0.8 + Math.random() * 0.5;

    const newPlant: PlantInstance = {
        id: Math.random().toString(36).substr(2, 9),
        type: selectedSeed,
        x,
        z,
        growth: 0, 
        scaleVariation: scale,
        rotationOffset: Math.random() * Math.PI * 2,
        isMutated: false
    };

    setPlants(prev => [...prev, newPlant]);
    removeFromInventory(selectedSeed, 1);
    
    // Auto-deselect if run out
    if ((inventory[selectedSeed] || 0) <= 1) {
        setSelectedSeed(null);
    }
  };

  // SELL LOGIC
  const handleSellPlants = () => {
    let earned = 0;
    let plantsSold = 0;

    const remainingPlants = plants.filter(plant => {
        if (plant.growth >= 1) {
            // It is mature, sell it
            const stats = PLANT_STATS[plant.type];
            if (stats) {
                let price = stats.sellPrice;
                
                // Mutation Multiplier
                if (plant.isMutated) price *= 5;

                // Giant Multiplier (Small bonus)
                if (plant.scaleVariation > 2.0) price *= 1.5;

                earned += Math.floor(price);
                plantsSold++;
            }
            return false; // Remove from array
        }
        return true; // Keep growing
    });

    if (plantsSold > 0) {
        setPlants(remainingPlants);
        setMoney(prev => prev + earned);
        alert(`Du hast ${plantsSold} Pflanzen verkauft für ${earned} Münzen!`);
    } else {
        alert("Keine Pflanzen sind bereit zur Ernte! Warte bis sie ausgewachsen sind.");
    }
  };

  const readyCount = plants.filter(p => p.growth >= 1).length;

  return (
    <div className="w-full h-screen relative bg-gray-900 overflow-hidden">
      <Scene 
        joystickRef={joystickRef} 
        onInteractionChange={setInteractionState} 
        currentInteraction={interactionState}
        plants={plants}
        onPlotClick={handlePlotClick}
        isStormActive={isStormActive}
        lightningStrikes={lightningStrikes}
        isSantaEventActive={isSantaEventActive}
        onCandyHit={handleCandyHit}
      />
      
      {/* Visual Storm Indicator */}
      {isStormActive && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 bg-red-900/10 mix-blend-overlay animate-pulse"></div>
      )}
      
      {/* Visual Santa Indicator */}
      {isSantaEventActive && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-30 flex flex-col items-center justify-center">
            <h1 className="text-6xl font-black text-white drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] animate-bounce tracking-widest opacity-90">
                HO HO HO!
            </h1>
            <p className="text-white text-xl font-bold drop-shadow-md mt-2 animate-pulse">
                Süßigkeiten Regen!
            </p>
        </div>
      )}

      <Overlay 
        interactionState={interactionState} 
        setInteractionState={setInteractionState}
        money={money}
        setMoney={setMoney}
        inventory={inventory}
        addToInventory={addToInventory}
        selectedSeed={selectedSeed}
        setSelectedSeed={setSelectedSeed}
        onSellPlants={handleSellPlants}
        readyCount={readyCount}
      />
      <Joystick onMove={handleJoystickMove} />
    </div>
  );
};

export default App;