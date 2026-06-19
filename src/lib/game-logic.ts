import { Box, GameState, GamePhase, Anime, ROUND_CONFIGS } from '@/types';
import { getDailyBoxAssignment, getTodayString } from './daily-seed';
import { calculateBankerOffer, getBoxesForRound } from './banker-algorithm';

function randomSeed(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function initGameState(dateStr?: string): GameState {
  const seed = dateStr ?? randomSeed();
  const assignment = getDailyBoxAssignment(seed);

  const boxes: Box[] = Object.entries(assignment).map(([id, anime]) => ({
    id: parseInt(id),
    anime: anime as Anime,
    isOpen: false,
    isPlayerBox: false,
  }));

  return {
    boxes,
    playerBoxId: null,
    phase: 'pick_box',
    currentRound: 1,
    boxesOpenedThisRound: 0,
    totalBoxesOpened: 0,
    openedHistory: [],
    currentOffer: null,
    acceptedOffer: null,
    finalAnime: null,
    streak: { type: null, count: 0 },
    jackpotSafe: false,
    dailySeed: seed,
    startedAt: Date.now(),
  };
}

export function selectPlayerBox(state: GameState, boxId: number): GameState {
  const boxes = state.boxes.map(b =>
    b.id === boxId ? { ...b, isPlayerBox: true } : b
  );
  const playerBox = boxes.find(b => b.id === boxId)!;
  const jackpotSafe = playerBox.anime.rating >= 9.0;

  return {
    ...state,
    boxes,
    playerBoxId: boxId,
    jackpotSafe,
    phase: 'opening',
  };
}

function updateStreak(
  state: GameState,
  openedAnime: Anime
): GameState['streak'] {
  const isGood = openedAnime.rating >= 8.5;
  const isBad = openedAnime.rating <= 6.0;

  if (isGood) {
    if (state.streak.type === 'cold') {
      return { type: 'cold', count: state.streak.count + 1 };
    }
    return { type: 'cold', count: 1 };
  }
  if (isBad) {
    if (state.streak.type === 'hot') {
      return { type: 'hot', count: state.streak.count + 1 };
    }
    return { type: 'hot', count: 1 };
  }
  return { type: null, count: 0 };
}

export function openBox(state: GameState, boxId: number): GameState {
  if (state.phase !== 'opening') return state;
  const box = state.boxes.find(b => b.id === boxId);
  if (!box || box.isOpen || box.isPlayerBox) return state;

  const roundTarget = getBoxesForRound(state.currentRound);
  if (state.boxesOpenedThisRound >= roundTarget) return state;

  const boxes = state.boxes.map(b =>
    b.id === boxId ? { ...b, isOpen: true } : b
  );

  const newOpenedThisRound = state.boxesOpenedThisRound + 1;
  const totalOpened = state.totalBoxesOpened + 1;
  const streak = updateStreak(state, box.anime);

  const openedHistory = [
    ...state.openedHistory,
    { anime: box.anime, round: state.currentRound, boxId },
  ];

  const roundDone = newOpenedThisRound >= roundTarget;

  // Check if we've opened all board boxes (only player's box + 1 remain after final rounds)
  const remainingBoardBoxes = boxes.filter(b => !b.isOpen && !b.isPlayerBox);

  if (roundDone && remainingBoardBoxes.length === 0) {
    // Only player's box left — final reveal
    const playerAnime = boxes.find(b => b.isPlayerBox)!.anime;
    return {
      ...state,
      boxes,
      openedHistory,
      totalBoxesOpened: totalOpened,
      streak,
      phase: 'result',
      finalAnime: playerAnime,
    };
  }

  if (roundDone && remainingBoardBoxes.length === 1) {
    // Final swap offer
    const updatedState: GameState = {
      ...state,
      boxes,
      openedHistory,
      totalBoxesOpened: totalOpened,
      streak,
      boxesOpenedThisRound: newOpenedThisRound,
    };
    const offer = calculateBankerOffer(updatedState);
    return {
      ...updatedState,
      currentOffer: offer,
      phase: 'final_swap',
    };
  }

  if (roundDone) {
    const updatedState: GameState = {
      ...state,
      boxes,
      openedHistory,
      totalBoxesOpened: totalOpened,
      streak,
      boxesOpenedThisRound: newOpenedThisRound,
    };
    const offer = calculateBankerOffer(updatedState);
    return {
      ...updatedState,
      currentOffer: offer,
      phase: 'banker_call',
    };
  }

  return {
    ...state,
    boxes,
    openedHistory,
    totalBoxesOpened: totalOpened,
    boxesOpenedThisRound: newOpenedThisRound,
    streak,
    phase: 'opening',
  };
}

export function presentOffer(state: GameState): GameState {
  return { ...state, phase: 'offer' };
}

export function acceptDeal(state: GameState): GameState {
  if (!state.currentOffer) return state;
  return {
    ...state,
    acceptedOffer: state.currentOffer.anime,
    finalAnime: state.currentOffer.anime,
    phase: 'result',
  };
}

export function rejectDeal(state: GameState): GameState {
  const nextRound = state.currentRound + 1;
  return {
    ...state,
    currentOffer: null,
    currentRound: nextRound,
    boxesOpenedThisRound: 0,
    phase: 'opening',
  };
}

// Final swap: player swaps their box for the last board box
export function acceptSwap(state: GameState): GameState {
  const lastBoardBox = state.boxes.find(b => !b.isOpen && !b.isPlayerBox);
  if (!lastBoardBox) return state;
  return {
    ...state,
    finalAnime: lastBoardBox.anime,
    phase: 'result',
  };
}

// Player keeps their box (rejects final swap)
export function keepOwnBox(state: GameState): GameState {
  const playerBox = state.boxes.find(b => b.isPlayerBox);
  if (!playerBox) return state;
  return {
    ...state,
    finalAnime: playerBox.anime,
    phase: 'result',
  };
}

export function getBoxesToOpenThisRound(state: GameState): number {
  return getBoxesForRound(state.currentRound) - state.boxesOpenedThisRound;
}

export function getRemainingBoardBoxes(state: GameState): Box[] {
  return state.boxes.filter(b => !b.isOpen && !b.isPlayerBox);
}

export function getOpenedBoxes(state: GameState): Box[] {
  return state.boxes.filter(b => b.isOpen);
}

export function getPlayerBox(state: GameState): Box | null {
  return state.boxes.find(b => b.isPlayerBox) ?? null;
}

export function getDurationSeconds(state: GameState): number {
  return Math.floor((Date.now() - state.startedAt) / 1000);
}

export function getRoundProgress(state: GameState): string {
  const target = getBoxesForRound(state.currentRound);
  return `${state.boxesOpenedThisRound} / ${target}`;
}
