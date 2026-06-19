'use client';

import { useState, useCallback } from 'react';
import { GameState } from '@/types';
import {
  initGameState,
  selectPlayerBox,
  openBox,
  acceptDeal,
  rejectDeal,
  acceptSwap,
  keepOwnBox,
  presentOffer,
} from '@/lib/game-logic';

export function useGame(dateStr?: string) {
  const [state, setState] = useState<GameState>(() => initGameState(dateStr));

  const pickBox = useCallback((boxId: number) => {
    setState(s => selectPlayerBox(s, boxId));
  }, []);

  const openABox = useCallback((boxId: number) => {
    setState(s => {
      const next = openBox(s, boxId);
      // If moved to banker_call phase, auto-transition to offer after animation
      return next;
    });
  }, []);

  const showOffer = useCallback(() => {
    setState(s => presentOffer(s));
  }, []);

  const takeDeal = useCallback(() => {
    setState(s => acceptDeal(s));
  }, []);

  const declineDeal = useCallback(() => {
    setState(s => rejectDeal(s));
  }, []);

  const swap = useCallback(() => {
    setState(s => acceptSwap(s));
  }, []);

  const keepBox = useCallback(() => {
    setState(s => keepOwnBox(s));
  }, []);

  const reset = useCallback((newDateStr?: string) => {
    setState(initGameState(newDateStr ?? dateStr));
  }, [dateStr]);

  return {
    state,
    pickBox,
    openABox,
    showOffer,
    takeDeal,
    declineDeal,
    swap,
    keepBox,
    reset,
  };
}
