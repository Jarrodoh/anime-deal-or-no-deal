import { ANIME_DATABASE, getByTier, pickN } from './anime-data';
import { Anime, AnimeTier } from '@/types';

// Seeded PRNG (mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

// Guaranteed tier distribution for the 26 daily boxes:
// 2 S, 6 A-high (8.5+), 5 A-mid (8.0–8.4), 5 B-high (7.5–7.9), 4 B-mid (7.0–7.4), 2 C, 1 D, 1 F
// This mirrors the spread of a real DoND board (few jackpots, many mid, some low).
const TIER_DISTRIBUTION: { tiers: AnimeTier[]; ratingMin?: number; ratingMax?: number; count: number }[] = [
  { tiers: ['S'], count: 2 },
  { tiers: ['A'], ratingMin: 8.5, count: 6 },
  { tiers: ['A'], ratingMax: 8.49, count: 5 },
  { tiers: ['B'], ratingMin: 7.5, count: 5 },
  { tiers: ['B'], ratingMax: 7.49, count: 4 },
  { tiers: ['C'], count: 2 },
  { tiers: ['D'], count: 1 },
  { tiers: ['F'], count: 1 },
];

function filterByRating(anime: Anime[], min?: number, max?: number): Anime[] {
  return anime.filter(a => {
    if (min !== undefined && a.rating < min) return false;
    if (max !== undefined && a.rating > max) return false;
    return true;
  });
}

export function getDailyBoxes(dateStr?: string): Anime[] {
  const seed = dateStr ?? getTodayString();
  const rand = mulberry32(dateToSeed(seed));

  const selected: Anime[] = [];
  const usedIds = new Set<string>();

  for (const slot of TIER_DISTRIBUTION) {
    let pool = ANIME_DATABASE.filter(
      a => slot.tiers.includes(a.tier) && !usedIds.has(a.id)
    );
    if (slot.ratingMin !== undefined || slot.ratingMax !== undefined) {
      pool = filterByRating(pool, slot.ratingMin, slot.ratingMax);
    }

    // If pool is too small, fall back to the tier without the rating filter
    if (pool.length < slot.count) {
      pool = ANIME_DATABASE.filter(
        a => slot.tiers.includes(a.tier) && !usedIds.has(a.id)
      );
    }

    const picks = pickN(pool, slot.count, rand);
    picks.forEach(a => {
      selected.push(a);
      usedIds.add(a.id);
    });
  }

  // Shuffle the final 26 so tier order isn't predictable from box position
  return pickN(selected, selected.length, rand);
}

// Offer pool: 16 anime from the database NOT in today's boxes
export function getDailyOfferPool(dateStr?: string): Anime[] {
  const seed = dateStr ?? getTodayString();
  const rand = mulberry32(dateToSeed(seed + '_offers'));
  const boxIds = new Set(getDailyBoxes(dateStr).map(a => a.id));

  const available = ANIME_DATABASE.filter(a => !boxIds.has(a.id));
  return pickN(available, 20, rand);
}

export function getDailyBoxAssignment(dateStr?: string): Record<number, Anime> {
  const boxes = getDailyBoxes(dateStr);
  const result: Record<number, Anime> = {};
  boxes.forEach((anime, index) => {
    result[index + 1] = anime;
  });
  return result;
}
