// ============================================================
//  Miles' Tune-Up Table!  Change these numbers, save, and reload.
// ============================================================

// How many squares across and down the board has.
export const BOARD_COLS = 6;
export const BOARD_ROWS = 6;

// How many tiers (levels) an orb can grow to. Tier 14 is the biggest!
// Each orb shows a 2048-style number: tier 1 = 2, tier 2 = 4, tier 3 = 8 ... tier 14 = 16,384.
export const MAX_TIER = 14;

// Make an orb of this tier and YOU WIN! (14 = the 16,384 orb). Confetti time!
export const WIN_TIER = 14;

// The number shown on an orb of this tier (2, 4, 8, 16 ...).
export const tierValue = (tier: number) => 2 ** tier;

// Coins you get when you MAKE a gem of this tier by merging.
// Example: merge two 2 orbs -> you make a 4 orb (tier 2) -> you get 2 coins.
export const TIER_COIN_VALUES: Record<number, number> = {
  1: 0, 2: 2, 3: 5, 4: 12, 5: 30, 6: 75, 7: 180, 8: 500,
  9: 1200, 10: 3000, 11: 7500, 12: 18000, 13: 45000, 14: 100000,
};

// Colors for each tier (hex numbers like 0xRRGGBB). Warm 2048-style rainbow!
export const TIER_COLORS: Record<number, number> = {
  1: 0x8fa3b8, 2: 0x4fc3f7, 3: 0x26c6da, 4: 0x66bb6a, 5: 0x9ccc65, 6: 0xffca28, 7: 0xffa726,
  8: 0xff7043, 9: 0xef5350, 10: 0xec407a, 11: 0xab47bc, 12: 0x7e57c2, 13: 0x5c6bc0, 14: 0xffd700,
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
  luckySpawn: { name: 'Lucky Spawn', price: 15, description: 'Drops a 4 orb' },
  coinBoost: { name: 'Coin Boost', price: 25, description: '2x coins for the next 5 merges', merges: 5, multiplier: 2 },
  magicUpgrade: { name: 'Magic Upgrade', price: 40, description: 'Your smallest orb doubles (2 → 4, 4 → 8...)' },
  luckyChance: { name: 'Lucky Chance', price: 50, description: 'A surprise orb! Could be a 2... or a 256!' },
};

// ----- Lucky Chance odds (Miles designed these!) -----
// Each tier gets a "weight". BIGGER number = MORE likely to come out.
// They don't have to add up to 100, and decimals are OK! 0.1 means super-duper rare.
// A tier with 50 is 500 times more likely than a tier with 0.1.
// Set a tier to 0 and it will never come out.
//   tier 1 = 2,  tier 2 = 4,  tier 3 = 8,  tier 4 = 16,
//   tier 5 = 32, tier 6 = 64, tier 7 = 128, tier 8 = 256
export const LUCKY_CHANCE_WEIGHTS: Record<number, number> = {
  1: 50, 2: 40, 3: 30, 4: 25, 5: 20, 6: 10, 7: 1, 8: 0.1,
};
