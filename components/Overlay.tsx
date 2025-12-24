import React from 'react';
import { Sprout, X, ShoppingBag, LogOut, Gift, Snowflake, Coins, TreePine, Shovel, DollarSign } from 'lucide-react';
import { InteractionState, Inventory } from '../types';

interface OverlayProps {
  interactionState: InteractionState;
  setInteractionState: (state: InteractionState) => void;
  money: number;
  setMoney: (val: number) => void;
  inventory: Inventory;
  addToInventory: (itemId: string, amount: number) => void;
  selectedSeed: string | null;
  setSelectedSeed: (id: string | null) => void;
  onSellPlants: () => void;
  readyCount: number; // How many plants are ready to sell
}

// Custom CSS component to look like the 3D Lego Santa Head
const SantaIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} relative rounded-md overflow-hidden shadow-sm border border-gray-900/10 bg-[#ffccaa] shrink-0`}>
    <div className="absolute top-0 w-full h-[40%] bg-[#d32f2f]" />
    <div className="absolute top-[35%] w-full h-[10%] bg-[#f5f5f5]" />
    <div className="absolute top-[55%] left-[25%] w-[12%] h-[12%] bg-[#111] rounded-full" />
    <div className="absolute top-[55%] right-[25%] w-[12%] h-[12%] bg-[#111] rounded-full" />
    <div className="absolute bottom-0 w-full h-[30%] bg-[#f5f5f5]" />
  </div>
);

// --- SEED DATA ---
interface SeedItem {
  id: string;
  name: string;
  price: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic';
}

const SEEDS: SeedItem[] = [
  { id: 'frosty_fern', name: 'Frosty Fern', price: 50, description: 'A chilly plant that loves snow.', rarity: 'common' },
  { id: 'crystal_rose', name: 'Crystal Rose', price: 120, description: 'Shimmers like ice in the moonlight.', rarity: 'rare' },
  { id: 'golden_berry', name: 'Golden Berry', price: 300, description: 'Produces pure gold nuggets.', rarity: 'epic' },
  { id: 'snow_pine', name: 'Tiny Snow Pine', price: 80, description: 'Smells like Christmas morning.', rarity: 'common' },
];

const STATIC_SEED_IMAGES: Record<string, string> = {
  'frosty_fern': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f9ff" rx="20"/><circle cx="100" cy="100" r="70" fill="%23e0f2fe"/><g transform="translate(100, 140) scale(1, 0.6) rotate(-45)"><path d="M-30,-30 L30,-30 L30,30 L-30,30 Z" fill="%235d4037"/><rect x="-25" y="-35" width="50" height="5" fill="%233e2723"/><g transform="translate(0, -40)"><path d="M-10,0 L10,0 L10,-40 L-10,-40 Z" fill="%234fc3f7"/><path d="M-10,-40 L10,-40 L0,-60 Z" fill="%2381d4fa"/><path d="M10,0 L20,-10 L20,-50 L10,-40 Z" fill="%2329b6f6"/><circle cx="0" cy="-60" r="6" fill="white"/></g></g></svg>',
  'crystal_rose': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23fdf2f8" rx="20"/><circle cx="100" cy="100" r="70" fill="%23fce7f3"/><g transform="translate(100, 130)"><rect x="-4" y="-20" width="8" height="60" fill="%23065f46"/><g transform="translate(0, -30)"><path d="M-30,0 L0,20 L30,0 L0,-10 Z" fill="%23be185d"/><path d="M-15,-20 L15,-20 L0,-45 Z" fill="%23f472b6"/></g></g></svg>',
  'golden_berry': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23fffbeb" rx="20"/><circle cx="100" cy="100" r="70" fill="%23fef3c7"/><g transform="translate(100, 110)"><path d="M-40,20 Q0,50 40,20 L30,-20 L-30,-20 Z" fill="%233f6212"/><circle cx="-20" cy="0" r="15" fill="%23fbbf24"/><circle cx="20" cy="10" r="18" fill="%23f59e0b"/><circle cx="0" cy="-25" r="20" fill="%23d97706"/></g></svg>',
  'snow_pine': 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23ecfdf5" rx="20"/><circle cx="100" cy="100" r="70" fill="%23d1fae5"/><g transform="translate(100, 140)"><rect x="-10" y="0" width="20" height="20" fill="%233e2723"/><path d="M-50,0 L50,0 L0,-40 Z" fill="%2315803d"/><path d="M-40,-20 L40,-20 L0,-60 Z" fill="%2316a34a"/><path d="M-30,-40 L30,-40 L0,-80 Z" fill="%2322c55e"/><circle cx="-20" cy="-10" r="4" fill="%23ef4444"/><circle cx="20" cy="-30" r="4" fill="%23fbbf24"/></g></svg>',
};

export const Overlay: React.FC<OverlayProps> = ({ 
    interactionState, 
    setInteractionState, 
    money, 
    setMoney, 
    inventory, 
    addToInventory,
    selectedSeed,
    setSelectedSeed,
    onSellPlants,
    readyCount
}) => {
  
  const handleBuy = (seed: SeedItem) => {
    if (money >= seed.price) {
        setMoney(money - seed.price);
        addToInventory(seed.id, 1);
    } else {
        alert("Nicht genug Geld!");
    }
  };

  const mySeeds = SEEDS.filter(s => (inventory[s.id] || 0) > 0);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-40">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-start pointer-events-auto w-full">
        {/* Title Card */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-green-600 max-w-xs relative overflow-hidden hidden sm:block">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-50"></div>
          <div className="flex items-center gap-3 mb-1 pt-2">
            <div className="bg-red-600 p-2 rounded-lg shadow-sm">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Lego Garden <span className="text-red-600">3D</span></h1>
          </div>
        </div>

        {/* MONEY DISPLAY */}
        <div className="relative group cursor-default transform hover:scale-105 transition-transform duration-300">
            <div className="absolute -top-6 left-1/2 w-[2px] h-8 bg-gradient-to-b from-yellow-700 to-yellow-500 z-0"></div>
            <div className="relative z-10 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-1 shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-2 border-yellow-400">
                <div className="absolute -top-[2px] left-2 right-2 h-3 bg-white rounded-full opacity-100 z-20 shadow-sm"></div>
                <div className="absolute top-3 left-2 w-8 h-8 bg-white/10 rounded-full blur-xl z-10"></div>
                <div className="bg-red-900/40 rounded-xl px-5 py-2 flex items-center gap-4 mt-2 min-w-[150px] border border-white/10 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-2 rounded-full shadow-lg border border-yellow-200 flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                        <Coins className="w-6 h-6 text-yellow-900 drop-shadow-sm" />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] font-bold text-yellow-100 uppercase tracking-widest leading-none mb-1 opacity-90 font-mono">Konto</span>
                        <span className="text-3xl font-black text-white leading-none drop-shadow-lg tracking-wide font-sans">
                            {money}
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* --- INVENTORY BAR (Bottom Center) --- */}
      {interactionState === 'NONE' && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto flex items-end gap-2">
            <div className="bg-gray-800/80 backdrop-blur-md p-2 rounded-2xl border-2 border-gray-600 flex gap-2 shadow-2xl">
                {mySeeds.length === 0 && (
                    <div className="px-4 py-2 text-gray-400 text-sm italic font-mono flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4"/> Shop besuchen für Samen
                    </div>
                )}
                {mySeeds.map(seed => {
                    const isSelected = selectedSeed === seed.id;
                    return (
                        <button
                            key={seed.id}
                            onClick={() => setSelectedSeed(isSelected ? null : seed.id)}
                            className={`relative w-16 h-16 rounded-xl border-b-4 transition-all duration-100 group
                                ${isSelected 
                                    ? 'bg-blue-100 border-blue-500 translate-y-1 shadow-inner' 
                                    : 'bg-white border-gray-300 hover:bg-gray-50 hover:translate-y-[-2px]'}
                            `}
                        >
                            <img src={STATIC_SEED_IMAGES[seed.id]} alt={seed.name} className="w-full h-full p-1 object-contain" />
                            <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {inventory[seed.id]}
                            </div>
                            {isSelected && (
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                                    Ausgerüstet
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
            
            {/* Clear selection */}
            {selectedSeed && (
                 <button 
                    onClick={() => setSelectedSeed(null)}
                    className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-full border-2 border-red-700 shadow-lg flex items-center justify-center animate-in zoom-in duration-200"
                 >
                     <X className="w-6 h-6" />
                 </button>
            )}
        </div>
      )}

      {/* --- INTERACTION UI --- */}

      {/* 1. NEAR SHOP BUTTON (BUY) */}
      {interactionState === 'NEAR_SHOP' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <button 
            onClick={() => setInteractionState('SHOP_MENU')}
            className="group relative animate-bounce bg-red-600 text-white px-8 py-4 rounded-full font-bold shadow-[0_8px_0_rgb(153,27,27)] border-4 border-yellow-400 flex items-center gap-3 hover:bg-red-500 hover:scale-105 transition-all ring-4 ring-white/80 active:translate-y-2 active:shadow-none"
          >
            <Gift className="w-6 h-6 text-yellow-300 group-hover:rotate-12 transition-transform" />
            <span className="text-lg tracking-wider drop-shadow-md">ÖFFNEN</span>
            <div className="absolute -top-1 -right-1">
                <Snowflake className="w-5 h-5 text-white animate-spin-slow" />
            </div>
          </button>
        </div>
      )}

      {/* 5. NEAR SELL BUTTON */}
      {interactionState === 'NEAR_SELL' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <button 
            onClick={onSellPlants}
            className={`group relative animate-bounce px-8 py-4 rounded-full font-bold shadow-[0_8px_0_rgba(0,0,0,0.3)] border-4 flex items-center gap-3 transition-all ring-4 ring-white/80 active:translate-y-2 active:shadow-none
                ${readyCount > 0 
                    ? 'bg-green-600 border-green-400 text-white hover:bg-green-500 hover:scale-105' 
                    : 'bg-gray-500 border-gray-400 text-gray-200 hover:bg-gray-400'}
            `}
          >
            <DollarSign className={`w-8 h-8 ${readyCount > 0 ? 'text-yellow-300' : 'text-gray-300'} group-hover:rotate-12 transition-transform`} />
            <div className="flex flex-col items-start">
                <span className="text-xl tracking-wider drop-shadow-md">VERKAUFEN</span>
                <span className="text-xs font-normal opacity-90">{readyCount} Pflanzen bereit</span>
            </div>
          </button>
        </div>
      )}

      {/* 2. SHOP MENU */}
      {interactionState === 'SHOP_MENU' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50">
           {/* Card Container */}
           <div className="relative bg-[#fffdf5] rounded-3xl p-1 w-80 shadow-2xl transform transition-all scale-100 ring-8 ring-red-700/50">
              
              <div className="border-4 border-dashed border-red-300 rounded-[20px] p-5 h-full relative overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-2">
                        <Gift className="w-6 h-6 text-red-600" />
                        <h2 className="text-2xl font-black text-gray-800 tracking-wide">Santa's Shop</h2>
                    </div>
                    <button 
                        onClick={() => setInteractionState('NONE')} 
                        className="bg-gray-100 hover:bg-red-100 p-2 rounded-full transition-colors group"
                    >
                        <X className="w-5 h-5 text-gray-500 group-hover:text-red-600" />
                    </button>
                </div>

                <div className="space-y-4 relative z-10">
                    {/* Option 1: Green (Santa Face) */}
                    <button 
                    onClick={() => setInteractionState('TUTORIAL')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl font-bold flex items-center gap-4 hover:to-green-400 shadow-md border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                    >
                    <SantaIcon className="w-10 h-10 border-2 border-white/30" />
                    <div className="flex flex-col items-start">
                        <span className="leading-none">Wer bin ich?</span>
                        <span className="text-[10px] opacity-80 font-normal">Der Shopkeeper stellt sich vor</span>
                    </div>
                    </button>

                    {/* Option 2: Gold (Star) */}
                    <button 
                    onClick={() => setInteractionState('SHOP_BROWSE')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-400 text-white p-4 rounded-xl font-bold flex items-center gap-4 hover:to-amber-300 shadow-md border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
                    >
                    <div className="bg-white/20 p-2 rounded-lg"><ShoppingBag className="w-5 h-5" /></div>
                     <div className="flex flex-col items-start">
                        <span className="leading-none">Shop durchsuchen</span>
                        <span className="text-[10px] opacity-80 font-normal">Samen & Items kaufen</span>
                    </div>
                    </button>

                    {/* Option 3: Exit */}
                    <button 
                    onClick={() => setInteractionState('NONE')}
                    className="w-full bg-gray-100 text-gray-600 p-4 rounded-xl font-bold flex items-center gap-4 hover:bg-gray-200 transition-colors border-2 border-transparent hover:border-gray-300"
                    >
                    <div className="bg-white p-2 rounded-lg border border-gray-200"><LogOut className="w-5 h-5" /></div>
                    <span>Verlassen</span>
                    </button>
                </div>
                <div className="absolute -bottom-6 -right-6 text-red-50 transform rotate-12 pointer-events-none">
                    <Snowflake className="w-32 h-32" />
                </div>
              </div>
           </div>
        </div>
      )}

      {/* 4. SHOP BROWSER */}
      {interactionState === 'SHOP_BROWSE' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4">
            <div className="bg-[#fffdf5] w-full max-w-4xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border-8 border-yellow-500 relative">
                <div className="bg-red-600 p-6 flex justify-between items-center shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <ShoppingBag className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Samen Katalog</h2>
                            <p className="text-red-100 text-sm">Wähle weise!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="bg-black/20 px-4 py-2 rounded-lg text-white font-mono font-bold flex items-center gap-2">
                            <Coins className="w-4 h-4 text-yellow-300" />
                            {money}
                         </div>
                         <button 
                            onClick={() => setInteractionState('SHOP_MENU')}
                            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
                         >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-red-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {SEEDS.map((seed) => (
                            <div key={seed.id} className="bg-white rounded-2xl p-4 shadow-lg border-b-4 border-gray-200 hover:translate-y-[-4px] transition-transform duration-200 flex flex-col group">
                                <div className="aspect-square bg-blue-50 rounded-xl mb-4 overflow-hidden relative border-2 border-gray-100 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                    <img 
                                        src={STATIC_SEED_IMAGES[seed.id]} 
                                        alt={seed.name} 
                                        className="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-300" 
                                    />
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white shadow-sm
                                        ${seed.rarity === 'common' ? 'bg-green-500' : seed.rarity === 'rare' ? 'bg-blue-500' : 'bg-purple-500'}
                                    `}>
                                        {seed.rarity}
                                    </div>
                                    {(inventory[seed.id] || 0) > 0 && (
                                         <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded text-[10px] font-mono">
                                             Besitz: {inventory[seed.id]}
                                         </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-800 text-lg">{seed.name}</h3>
                                    </div>
                                    <p className="text-gray-500 text-xs mb-4 flex-1">{seed.description}</p>
                                    <button 
                                        onClick={() => handleBuy(seed)}
                                        disabled={money < seed.price}
                                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors
                                            ${money >= seed.price 
                                                ? 'bg-yellow-400 hover:bg-yellow-300 text-yellow-900 shadow-[0_4px_0_#d97706] active:shadow-none active:translate-y-[4px]' 
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <Coins className="w-4 h-4" />
                                        {seed.price}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 3. TUTORIAL */}
      {interactionState === 'TUTORIAL' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50">
           <div className="bg-white rounded-2xl p-6 w-80 shadow-2xl border-4 border-blue-400 relative">
              <div className="absolute -top-6 -left-4">
                  <SantaIcon className="w-16 h-16 border-4 border-white shadow-lg rotate-[-10deg]" />
              </div>
              <h2 className="text-xl font-bold text-blue-800 mb-4 mt-6 ml-8">Wer bin ich?</h2>
              <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                <p className="text-gray-700 leading-relaxed text-sm">
                    <span className="font-bold text-blue-600 block mb-1">Ho ho ho! 🎅</span>
                    Ich bin der Santa-Shopkeeper. Bei mir kannst du magische Lego-Samen kaufen.
                </p>
              </div>
              <button 
                onClick={() => setInteractionState('SHOP_MENU')}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg"
              >
                Alles klar!
              </button>
           </div>
        </div>
      )}
    </div>
  );
};