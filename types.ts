
export interface LegoDimensions {
  width: number;
  height: number;
  depth: number;
  studRadius: number;
  studHeight: number;
}

export enum LegoColors {
  GRASS_GREEN = "#4caf50",
  DARK_GREEN = "#2e7d32",
  PLASTIC_SHINE = "#ffffff",
  SOIL_BROWN = "#8B4513",
  // Festive Colors
  CHRISTMAS_RED = "#d32f2f",
  SNOW_WHITE = "#f5f5f5",
  WOOD_BROWN = "#5d4037",
  GOLD = "#ffb300",
  // Character Colors
  SKIN_TONE = "#ffccaa",
  BLACK = "#111111",
  DENIM_BLUE = "#1565c0",
  SHIRT_GREEN = "#81c784",
  CAP_YELLOW = "#fbc02d",
  // Plant Colors
  FERN_TEAL = "#26c6da",
  ROSE_PINK = "#ec407a",
  BERRY_ORANGE = "#ffa726",
  // Storm/Mutation Colors
  NEON_PURPLE = "#d500f9",
  ELECTRIC_BLUE = "#00e5ff",
  STORM_SKY = "#370000",
  // Candy Colors
  CANDY_RED = "#ff1744",
  CANDY_STRIPE = "#ff8a80"
}

export interface BaseplateProps {
  size: number; // Number of studs in X and Z
}

export interface JoystickData {
  x: number;
  y: number;
  active: boolean;
}

export type InteractionState = 'NONE' | 'NEAR_SHOP' | 'SHOP_MENU' | 'TUTORIAL' | 'SHOP_BROWSE' | 'NEAR_SELL';

export interface PlantInstance {
  id: string;
  type: string; // 'frosty_fern' | 'crystal_rose' etc
  x: number; // Grid X
  z: number; // Grid Z
  growth: number; // 0 to 1
  scaleVariation: number; // 0.8 to 1.3 usually, but can be up to 4.0 for giants
  rotationOffset: number; // 0 to 2*PI
  isMutated: boolean; // Result of lightning strike or candy
  mutationSource?: 'storm' | 'candy'; // To visualize different colors
}

export type Inventory = Record<string, number>; // itemId -> quantity
