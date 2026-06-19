import { BOX_ANIME } from './anime-data';
import { Anime } from '@/types';

// Simple seeded PRNG (mulberry32)
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

function shuffleWithSeed<T>(array: T[], rand: () => number): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailySeedString(dateStr?: string): string {
  return dateStr ?? getTodayString();
}

export function shuffleBoxesForDay(dateStr?: string): Anime[] {
  const seed = dateStr ?? getTodayString();
  const rand = mulberry32(dateToSeed(seed));
  return shuffleWithSeed([...BOX_ANIME], rand);
}

// Returns the box IDs mapped to their hidden anime for a given day
export function getDailyBoxAssignment(dateStr?: string): Record<number, Anime> {
  const shuffled = shuffleBoxesForDay(dateStr);
  const result: Record<number, Anime> = {};
  shuffled.forEach((anime, index) => {
    result[index + 1] = anime;
  });
  return result;
}
