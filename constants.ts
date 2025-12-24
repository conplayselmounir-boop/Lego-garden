import { LegoDimensions } from './types';

// Standardized approximate Lego dimensions relative to a 1x1 unit block
export const LEGO_DIMENSIONS: LegoDimensions = {
  width: 1,
  height: 0.33, // A plate is roughly 1/3 height of a brick
  depth: 1,
  studRadius: 0.35,
  studHeight: 0.18,
};

export const GRID_SIZE = 48; // 48x48 studs (typical large baseplate size)

export interface PlantStats {
  name: string;
  growthDuration: number; // in seconds
  sellPrice: number;
}

export const PLANT_STATS: Record<string, PlantStats> = {
  'frosty_fern': {
    name: 'Frosty Fern',
    growthDuration: 5, // Fast
    sellPrice: 80 // Buy 50 -> Profit 30
  },
  'crystal_rose': {
    name: 'Crystal Rose',
    growthDuration: 15, // Medium
    sellPrice: 200 // Buy 120 -> Profit 80
  },
  'golden_berry': {
    name: 'Golden Berry',
    growthDuration: 30, // Slow
    sellPrice: 550 // Buy 300 -> Profit 250
  },
  'snow_pine': {
    name: 'Tiny Snow Pine',
    growthDuration: 10, // Medium-Fast
    sellPrice: 130 // Buy 80 -> Profit 50
  }
};