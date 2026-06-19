'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import BoxGrid from '@/components/game/BoxGrid';
import AnimeValueBoard from '@/components/game/AnimeValueBoard';
import EliminatedPanel from '@/components/game/EliminatedPanel';
import BankerCall from '@/components/game/BankerCall';
import OfferModal from '@/components/game/OfferModal';
import ResultScreen from '@/components/game/ResultScreen';
import PlayerBoxDisplay from '@/components/game/PlayerBoxDisplay';
import RoundTracker from '@/components/game/RoundTracker';
import { getBoxesToOpenThisRound, getPlayerBox, getRemainingBoardBoxes } from '@/lib/game-logic';
import { getTodayString } from '@/lib/daily-seed';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function GamePage() {
  const [playerName, setPlayerName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [showingBankerCall, setShowingBankerCall] = useState(false);
  const [lastOpenedTitle, setLastOpenedTitle] = useState<string | null>(null);

  const { state, pickBox, openABox, showOffer, takeDeal, declineDeal, swap, keepBox, reset } = useGame();

  const playerBox = getPlayerBox(state);
  const remainingBoard = getRemainingBoardBoxes(state);
  const boxesLeft = getBoxesToOpenThisRound(state);
  const today = getTodayString();

  // When phase transitions to banker_call, trigger the banker animation
  useEffect(() => {
    if (state.phase === 'banker_call' || state.phase === 'final_swap') {
      setShowingBankerCall(true);
    }
  }, [state.phase]);

  function handleBankerCallComplete() {
    setShowingBankerCall(false);
    showOffer();
  }

  function handleBoxOpen(boxId: number) {
    const box = state.boxes.find(b => b.id === boxId);
    if (box) setLastOpenedTitle(box.anime.title);
    openABox(boxId);
  }

  async function handleSaveScore(name: string, anime: typeof state.finalAnime) {
    if (!anime) return;
    try {
      await fetch('/api/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: name || playerName || 'Anonymous',
          anime_title: anime.title,
          anime_rating: anime.rating,
          anime_tier: anime.tier,
          accepted_deal: state.acceptedOffer !== null,
          round_ended: state.currentRound,
          date: today,
          duration_seconds: Math.floor((Date.now() - state.startedAt) / 1000),
        }),
      });
    } catch {
      // Silently fail — leaderboard is optional
    }
  }

  if (!nameSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              <span className="shimmer-gold">Anime</span> Deal or No Deal
            </h1>
            <p className="text-white/50 text-sm">
              9 boxes. 9 anime. One you walk away with.
            </p>
            <p className="text-white/30 text-xs mt-1">
              Daily board: {today}
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Your name (optional)"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setNameSubmitted(true)}
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors text-sm"
            />
            <motion.button
              onClick={() => setNameSubmitted(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-wide border border-yellow-400/50 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 transition-all glow-gold"
            >
              Start Game
            </motion.button>
            <Link
              href="/party"
              className="block w-full py-3 rounded-xl text-center text-sm text-white/50 border border-white/10 hover:border-white/20 hover:text-white/80 transition-colors"
            >
              Play with friends (Party Mode)
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 px-4 py-3 border-b border-white/6" style={{ background: 'rgba(14,27,46,0.96)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-white/40 hover:text-white/80 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <RoundTracker
              currentRound={state.currentRound}
              boxesOpenedThisRound={state.boxesOpenedThisRound}
              phase={state.phase}
            />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex gap-5 items-start">

          {/* Main: grid + controls */}
          <div className="flex-1 space-y-4">
            <AnimatePresence mode="wait">
              {state.phase === 'pick_box' && (
                <motion.div key="pick" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-2">
                  <h2 className="text-xl font-black text-white mb-1">Choose your box</h2>
                  <p className="text-white/50 text-sm">Pick one — you will keep it until the end or trade it away</p>
                </motion.div>
              )}
              {state.phase === 'opening' && (
                <motion.div key="open" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-2">
                  <h2 className="text-xl font-black text-white mb-1">Open {boxesLeft} box{boxesLeft !== 1 ? 'es' : ''}</h2>
                  <p className="text-white/50 text-sm">
                    {lastOpenedTitle ? `Last opened: ${lastOpenedTitle}` : 'Select boxes from the board to eliminate them'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BoxGrid — Skip/Next render as centred buttons below the grid */}
            <BoxGrid
              boxes={state.boxes}
              playerBoxId={state.playerBoxId}
              phase={state.phase}
              onSelectBox={state.phase === 'pick_box' ? pickBox : handleBoxOpen}
            />

            {/* Mobile: player box */}
            {playerBox && (
              <div className="flex justify-center lg:hidden">
                <PlayerBoxDisplay box={playerBox} phase={state.phase} />
              </div>
            )}

            {/* Final swap */}
            {state.phase === 'final_swap' && state.currentOffer && !showingBankerCall && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-center">
                <p className="text-xs text-yellow-400/70 uppercase tracking-widest mb-2">Final Decision</p>
                <h3 className="text-lg font-black text-white mb-1">One box remains on the board</h3>
                <p className="text-white/50 text-sm mb-4">Swap your box for the last board box, or keep what you have.</p>
                <div className="flex gap-3">
                  <button onClick={swap} className="flex-1 py-3 rounded-xl font-bold border border-blue-400/40 text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-all">Swap Box</button>
                  <button onClick={keepBox} className="flex-1 py-3 rounded-xl font-bold border border-white/20 text-white/80 hover:bg-white/10 transition-all">Keep Mine</button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar: Eliminated (top) → Board (bottom) */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 xl:w-80">
            {/* Player box */}
            {playerBox && (
              <div className="flex justify-center">
                <PlayerBoxDisplay box={playerBox} phase={state.phase} />
              </div>
            )}

            {/* Eliminated panel */}
            <EliminatedPanel openedBoxes={state.boxes.filter(b => b.isOpen)} />

            {/* Today's board */}
            <div className="rounded-xl border border-white/12 bg-white/5 p-4">
              <AnimeValueBoard openedAnime={state.openedHistory.map(h => h.anime)} seed={state.dailySeed} />
            </div>
          </aside>

          {/* Mobile: eliminated + board stacked below the grid (outside the flex row, rendered via order) */}
        </div>

        {/* Mobile-only: eliminated + board below the grid */}
        <div className="flex flex-col gap-4 mt-4 lg:hidden">
          <EliminatedPanel openedBoxes={state.boxes.filter(b => b.isOpen)} />
          <div className="rounded-xl border border-white/12 bg-white/5 p-4">
            <AnimeValueBoard openedAnime={state.openedHistory.map(h => h.anime)} seed={state.dailySeed} />
          </div>
        </div>
      </div>

      {/* Banker call overlay */}
      <AnimatePresence>
        {showingBankerCall && (
          <motion.div
            key="banker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(14,27,46,0.92)', backdropFilter: 'blur(8px)' }}
          >
            <BankerCall onCallComplete={handleBankerCallComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result screen */}
      <AnimatePresence>
        {state.phase === 'result' && state.finalAnime && (
          <ResultScreen
            state={state}
            playerName={playerName || 'Player'}
            onPlayAgain={() => reset()}
            onSaveScore={handleSaveScore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
