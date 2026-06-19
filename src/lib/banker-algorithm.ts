import { Anime, BankerOffer, BankerTrigger, GameState, ROUND_CONFIGS } from '@/types';
import { getAnimeByRating } from './anime-data';
import { getDailyOfferPool } from './daily-seed';

function getOfferPool(state: GameState): Anime[] {
  return getDailyOfferPool(state.dailySeed);
}

const OFFER_FACTORS: Record<number, number> = {
  25: 0.08,
  24: 0.10,
  20: 0.18,
  19: 0.22,
  15: 0.35,
  14: 0.40,
  11: 0.50,
  10: 0.58,
  8:  0.65,
  7:  0.72,
  5:  0.78,
  4:  0.84,
  3:  0.90,
  2:  0.94,
  1:  0.98,
};

function getOfferFactor(remainingCount: number): number {
  const keys = Object.keys(OFFER_FACTORS)
    .map(Number)
    .sort((a, b) => b - a);
  for (const key of keys) {
    if (remainingCount >= key) return OFFER_FACTORS[key];
  }
  return 0.98;
}

function getRemainingAnime(state: GameState): Anime[] {
  return state.boxes
    .filter(b => !b.isOpen && !b.isPlayerBox)
    .map(b => b.anime);
}

function expectedValue(anime: Anime[]): number {
  if (anime.length === 0) return 0;
  return anime.reduce((sum, a) => sum + a.rating, 0) / anime.length;
}

function lastNOpened(state: GameState, n: number): Anime[] {
  return state.openedHistory.slice(-n).map(h => h.anime);
}

function buildOffer(
  targetRating: number,
  trigger: BankerTrigger,
  message: string,
  ev: number,
  pool: Anime[]
): BankerOffer {
  const anime = getAnimeByRating(targetRating, pool, 2.0) ?? pool[0];
  return {
    anime,
    message,
    trigger,
    expectedValue: parseFloat(ev.toFixed(2)),
    offerRating: anime.rating,
    offerPercentage: parseFloat(((anime.rating / ev) * 100).toFixed(1)),
  };
}

// --- Gimmick: 50/50 ---
// When exactly 2 board boxes remain and the spread is >= 3 stars,
// offer a famous but mid-tier anime to tempt the player away from gambling.
function fiftyFiftyOffer(remaining: Anime[], ev: number, pool: Anime[]): BankerOffer {
  const target = pool.find(a => a.rating >= 7.0 && a.rating <= 7.8);
  const anime = target ?? pool[0];
  const messages = [
    `Two boxes remain. One legendary... one forgettable. I'm offering you certainty: ${anime.title}. Think carefully.`,
    `It's a coin flip. Walk away with ${anime.title} right now or leave it to fate.`,
    `50/50. I could give you ${anime.title} and you'd never need to know what could have been.`,
  ];
  return {
    anime,
    message: messages[Math.floor(Math.random() * messages.length)],
    trigger: 'fifty_fifty',
    expectedValue: parseFloat(ev.toFixed(2)),
    offerRating: anime.rating,
    offerPercentage: parseFloat(((anime.rating / ev) * 100).toFixed(1)),
  };
}

// --- Gimmick: Near Miss ---
function nearMissOffer(ev: number, pool: Anime[]): BankerOffer {
  const targetRating = Math.min(ev * 0.80, 8.4);
  const messages = [
    "Ouch. That one stung. Here — let me make the pain go away.",
    "I saw your face. Rough one. This offer is my way of being... merciful.",
    "You found the legendary one early. But there's still something good left for you.",
  ];
  return buildOffer(targetRating, 'near_miss', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

// --- Gimmick: Hot Streak ---
function hotStreakOffer(ev: number, remainingCount: number, pool: Anime[]): BankerOffer {
  const factor = getOfferFactor(remainingCount) * 1.15;
  const targetRating = Math.min(ev * factor, 9.1);
  const messages = [
    "You've been finding the worst ones. I'm feeling generous today.",
    "That's three bad boxes in a row. Maybe it's time to take what I'm offering.",
    "You're on a cold streak for the boxes. But this offer? This is warm.",
  ];
  return buildOffer(targetRating, 'hot_streak', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

// --- Gimmick: Cold Streak ---
function coldStreakOffer(ev: number, remainingCount: number, pool: Anime[]): BankerOffer {
  const factor = getOfferFactor(remainingCount) * 0.88;
  const targetRating = ev * factor;
  const messages = [
    "You've been knocking out the good ones yourself. I don't need to be generous.",
    "Three great anime gone. The remaining pool is... well. You know.",
    "You've made my job easy. This offer reflects that.",
  ];
  return buildOffer(targetRating, 'cold_streak', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

// --- Gimmick: Cluster ---
function clusterOffer(remaining: Anime[], ev: number, pool: Anime[]): BankerOffer {
  const targetRating = ev * 0.93;
  const messages = [
    `The remaining ${remaining.length} anime are all suspiciously close in quality. I'm offering you the middle ground.`,
    "Very consistent board. Not many surprises left. Here's a reliable pick.",
    `Everything left is in the ${Math.min(...remaining.map(a => a.rating)).toFixed(1)}–${Math.max(...remaining.map(a => a.rating)).toFixed(1)} range. Take certainty.`,
  ];
  return buildOffer(targetRating, 'cluster', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

// --- Gimmick: Last Stand ---
function lastStandOffer(remaining: Anime[], ev: number, pool: Anime[]): BankerOffer {
  const top = remaining.find(a => a.rating >= 9.0);
  const targetRating = (top?.rating ?? ev) * 0.88;
  const messages = [
    `${top?.title ?? 'The top anime'} is still out there. One of three boxes. Worth the gamble?`,
    "I can see you've got legendary taste. Let's see if your luck matches it.",
    "The crown jewel is still on the board. 1 in 3 chance. I'm offering you the safe path.",
  ];
  return buildOffer(targetRating, 'last_stand', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

// --- Gimmick: Jackpot Safe ---
function jackpotSafeOffer(ev: number, remainingCount: number, pool: Anime[]): BankerOffer {
  const factor = getOfferFactor(remainingCount) * 0.75;
  const targetRating = ev * factor;
  const messages = [
    "Something tells me you've already chosen wisely. Let's not make this easy for you.",
    "My offer stands. And it's... conservative. You'll understand why eventually.",
    "I have a feeling about your box. So I'm being appropriately cautious.",
  ];
  return buildOffer(targetRating, 'jackpot_safe', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

// --- Gimmick: Pity ---
function pityOffer(ev: number, pool: Anime[]): BankerOffer {
  const targetRating = Math.max(ev * 1.25, 7.0);
  const messages = [
    "I'll be honest — neither of us is having a great day. Take this.",
    "The board isn't looking kind. Here's something decent to end your suffering.",
    "Out of respect for your effort: here's something better than the math suggests.",
  ];
  return buildOffer(targetRating, 'pity', messages[Math.floor(Math.random() * messages.length)], ev, pool);
}

const STANDARD_MESSAGES = [
  (anime: string, pct: string) => `My offer: ${anime}. That's ${pct}% of expected value. Respectable, no?`,
  (anime: string, pct: string) => `${anime}. ${pct}% of what the board is worth. Deal?`,
  (anime: string, pct: string) => `I'm putting ${anime} on the table. ${pct}% of EV. What do you say?`,
  (anime: string, _pct: string) => `You could walk away with ${anime} right now. Or keep gambling.`,
  (anime: string, pct: string) => `${pct}% of expected value. ${anime}. No tricks. Just an offer.`,
];

function standardOffer(ev: number, remainingCount: number, pool: Anime[]): BankerOffer {
  const factor = getOfferFactor(remainingCount);
  const targetRating = ev * factor;
  const anime = getAnimeByRating(targetRating, pool, 2.5) ?? pool[0];
  const pct = ((anime.rating / ev) * 100).toFixed(1);
  const msgFn = STANDARD_MESSAGES[Math.floor(Math.random() * STANDARD_MESSAGES.length)];
  return {
    anime,
    message: msgFn(anime.title, pct),
    trigger: 'standard',
    expectedValue: parseFloat(ev.toFixed(2)),
    offerRating: anime.rating,
    offerPercentage: parseFloat(pct),
  };
}

// Master function — determines which gimmick applies and builds the offer
export function calculateBankerOffer(state: GameState): BankerOffer {
  const pool = getOfferPool(state);
  const remaining = getRemainingAnime(state);
  const remainingCount = remaining.length;
  const ev = expectedValue(remaining);
  const maxRemaining = Math.max(...remaining.map(a => a.rating));
  const minRemaining = Math.min(...remaining.map(a => a.rating));

  if (remainingCount === 2 && maxRemaining - minRemaining >= 3.0) {
    return fiftyFiftyOffer(remaining, ev, pool);
  }

  const lastOpened = state.openedHistory[state.openedHistory.length - 1];
  if (lastOpened && lastOpened.anime.rating >= 9.0 && remainingCount > 4) {
    return nearMissOffer(ev, pool);
  }

  if (remainingCount >= 5 && remainingCount <= 8) {
    const spread = maxRemaining - minRemaining;
    if (spread <= 1.5) return clusterOffer(remaining, ev, pool);
  }

  if (remainingCount === 3 && remaining.some(a => a.rating >= 9.0)) {
    return lastStandOffer(remaining, ev, pool);
  }

  const last3 = lastNOpened(state, 3);
  if (last3.length === 3 && last3.every(a => a.rating <= 6.0)) {
    return hotStreakOffer(ev, remainingCount, pool);
  }

  if (last3.length === 3 && last3.every(a => a.rating >= 8.5)) {
    return coldStreakOffer(ev, remainingCount, pool);
  }

  if (state.jackpotSafe && remainingCount > 3) {
    return jackpotSafeOffer(ev, remainingCount, pool);
  }

  if (ev <= 6.5 && remainingCount >= 3) {
    return pityOffer(ev, pool);
  }

  return standardOffer(ev, remainingCount, pool);
}

// Banker message when player says NO DEAL
export const NO_DEAL_RESPONSES = [
  "Bold. I respect the confidence. Open your boxes.",
  "No deal? Very well. The board awaits.",
  "Interesting choice. Let's see how this plays out.",
  "You're braver than most. Or more foolish. We'll find out.",
  "Fine. I wasn't being that generous anyway.",
  "Rejected. Good. I was hoping you'd say that.",
  "No deal it is. Don't say I didn't offer.",
];

export function getBoxesForRound(round: number): number {
  const config = ROUND_CONFIGS.find(r => r.round === round);
  return config?.boxesToOpen ?? 1;
}
