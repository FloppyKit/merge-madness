// ============================================================
//  Miles' Tune-Up Table!  Change these numbers, save, and reload.
// ============================================================

// How many squares across and down the board has.
export const BOARD_COLS = 6;
export const BOARD_ROWS = 6;

// How many tiers (levels) a gem can grow to. Tier 8 is the biggest!
export const MAX_TIER = 8;

// Coins you get when you MAKE a gem of this tier by merging.
// Example: merge two tier-1 gems -> you make a tier 2 -> you get 2 coins.
export const TIER_COIN_VALUES: Record<number, number> = {
  1: 0, 2: 2, 3: 5, 4: 12, 5: 30, 6: 75, 7: 180, 8: 500,
};

// Colors for each tier (hex numbers like 0xRRGGBB).
export const TIER_COLORS: Record<number, number> = {
  1: 0x9e9e9e, 2: 0x4caf50, 3: 0x2196f3, 4: 0x9c27b0,
  5: 0xff9800, 6: 0xf44336, 7: 0x00bcd4, 8: 0xffd700,
};

// Coins you start the game with.
export const STARTING_COINS = 20;

// What the Spawn button costs. 0 means free!
export const SPAWN_COST = 0;

// Spawn odds: chance (0 to 1) that the Spawn button makes a tier 2 instead of tier 1.
// 0 = always tier 1. 0.1 = one time in ten you get a tier 2.
export const SPAWN_TIER2_CHANCE = 0;

// ----- Shop prices and effects -----
export const SHOP = {
  luckySpawn: { name: 'Lucky Spawn', price: 15, description: 'Drops a tier 2 gem' },
  coinBoost: { name: 'Coin Boost', price: 25, description: '2x coins for the next 5 merges', merges: 5, multiplier: 2 },
  magicUpgrade: { name: 'Magic Upgrade', price: 40, description: 'Your smallest gem grows one tier' },
  luckyChance: { name: 'Lucky Chance', price: 50, description: 'A surprise gem! Could be tiny... or HUGE' },
};

// ----- Lucky Chance odds (Miles designed these!) -----
// Each tier gets a "weight". BIGGER number = MORE likely to come out.
// They don't have to add up to 100. A tier with 80 is 80 times more likely than a tier with 1.
// Set a tier to 0 and it will never come out.
export const LUCKY_CHANCE_WEIGHTS: Record<number, number> = {
  1: 80, 2: 50, 3: 40, 4: 30, 5: 20, 6: 10, 7: 5, 8: 1,
};
