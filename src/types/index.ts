export type AnimeTier = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface Anime {
  id: string;
  title: string;
  rating: number;
  tier: AnimeTier;
  genre: string;
  year: number;
  studio: string;
  description: string;
}

export interface Box {
  id: number;
  anime: Anime;
  isOpen: boolean;
  isPlayerBox: boolean;
}

export type BankerTrigger =
  | 'standard'
  | 'fifty_fifty'
  | 'near_miss'
  | 'hot_streak'
  | 'cold_streak'
  | 'cluster'
  | 'last_stand'
  | 'jackpot_safe'
  | 'pity';

export interface BankerOffer {
  anime: Anime;
  message: string;
  trigger: BankerTrigger;
  expectedValue: number;
  offerRating: number;
  offerPercentage: number;
}

export type GamePhase =
  | 'intro'
  | 'pick_box'
  | 'opening'
  | 'banker_call'
  | 'offer'
  | 'final_swap'
  | 'result';

export interface RoundConfig {
  round: number;
  boxesToOpen: number;
}

export interface OpenedAnime {
  anime: Anime;
  round: number;
  boxId: number;
}

export interface GameState {
  boxes: Box[];
  playerBoxId: number | null;
  phase: GamePhase;
  currentRound: number;
  boxesOpenedThisRound: number;
  totalBoxesOpened: number;
  openedHistory: OpenedAnime[];
  currentOffer: BankerOffer | null;
  acceptedOffer: Anime | null;
  finalAnime: Anime | null;
  streak: { type: 'hot' | 'cold' | null; count: number };
  jackpotSafe: boolean;
  dailySeed: string;
  startedAt: number;
}

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  anime_title: string;
  anime_rating: number;
  anime_tier: AnimeTier;
  accepted_deal: boolean;
  round_ended: number;
  date: string;
  duration_seconds: number;
  created_at: string;
}

export type PartyRole = 'host' | 'audience';

export interface PartyVote {
  player_id: string;
  player_name: string;
  vote: 'deal' | 'no_deal';
}

export interface PartyRoom {
  id: string;
  code: string;
  host_id: string;
  host_name: string;
  game_state: GameState | null;
  votes: PartyVote[];
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  participants: PartyParticipant[];
}

export interface PartyParticipant {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  role: PartyRole;
  joined_at: string;
}

// 9 boxes total: player picks 1, 8 on board.
// Open 3+2+1+1 = 7 board boxes across 4 rounds → 1 board box left for final swap.
export const ROUND_CONFIGS: RoundConfig[] = [
  { round: 1, boxesToOpen: 3 },
  { round: 2, boxesToOpen: 2 },
  { round: 3, boxesToOpen: 1 },
  { round: 4, boxesToOpen: 1 },
];

export const TIER_COLORS: Record<AnimeTier, string> = {
  S: '#FFD700',
  A: '#C084FC',
  B: '#60A5FA',
  C: '#4ADE80',
  D: '#94A3B8',
  F: '#F87171',
};

export const TIER_LABELS: Record<AnimeTier, string> = {
  S: 'Legendary',
  A: 'Elite',
  B: 'Great',
  C: 'Decent',
  D: 'Average',
  F: 'Rough Watch',
};
