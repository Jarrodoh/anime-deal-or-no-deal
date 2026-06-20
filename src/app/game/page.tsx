'use client';

import { useState, useEffect } from 'react';
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
import { getBoxesToOpenThisRound, getPlayerBox } from '@/lib/game-logic';
import { getTodayString } from '@/lib/daily-seed';
import { ChevronLeft, Shuffle, Phone } from 'lucide-react';
import Link from 'next/link';
import { Anime } from '@/types';

const FRIEND_LINES = [
  (box: number, title: string) => [`"ok so I peeked... Box ${box} is ${title}."`, "idk man just trust me"],
  (box: number, title: string) => [`"Box ${box}. ${title}. 100% sure."`, "...or like 60%. same thing"],
  (box: number, title: string) => [`"ngl Box ${box} is giving ${title} vibes"`, "could be wrong tho ngl"],
  (box: number, title: string) => [`"I checked and Box ${box} has ${title}"`, "but also don't hold me to that"],
  (box: number, title: string) => [`"Box ${box} = ${title}, trust the process"`, "the process may be flawed"],
];

function friendRevealLines(boxId: number, title: string): string[] {
  const pick = FRIEND_LINES[Math.floor(Math.random() * FRIEND_LINES.length)];
  return pick(boxId, title);
}

export default function GamePage() {
  const [playerName, setPlayerName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [showingBankerCall, setShowingBankerCall] = useState(false);
  const [lastOpenedTitle, setLastOpenedTitle] = useState<string | null>(null);
  const [reshuffleUses, setReshuffleUses] = useState(1);
  const [friendUses, setFriendUses] = useState(1);
  const [friendReveal, setFriendReveal] = useState<{ boxId: number; anime: Anime } | null>(null);
  const [reshuffleFlash, setReshuffleFlash] = useState(false);

  const { state, pickBox, openABox, showOffer, takeDeal, declineDeal, swap, keepBox, reset, reshuffle } = useGame();

  const playerBox = getPlayerBox(state);
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

  function handleReshuffle() {
    if (reshuffleUses <= 0 || state.phase !== 'pick_box') return;
    setReshuffleUses(0);
    reshuffle();
    setReshuffleFlash(true);
    setTimeout(() => setReshuffleFlash(false), 800);
  }

  function handleCallFriend() {
    if (friendUses <= 0) return;
    const eligible = state.boxes.filter(b => !b.isOpen && !b.isPlayerBox);
    if (eligible.length === 0) return;
    setFriendUses(0);

    // Weight: lower rated anime are more likely to be pointed at
    const maxRating = Math.max(...eligible.map(b => b.anime.rating));
    const weights = eligible.map(b => maxRating - b.anime.rating + 1);
    const totalWeight = weights.reduce((s, w) => s + w, 0);

    let rand = Math.random() * totalWeight;
    let pickedBox = eligible[eligible.length - 1];
    for (let i = 0; i < eligible.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { pickedBox = eligible[i]; break; }
    }

    // 90% chance friend is lying — shows a different box's anime
    const isLying = Math.random() < 0.9;
    let shownAnime = pickedBox.anime;
    if (isLying) {
      const others = eligible.filter(b => b.id !== pickedBox.id);
      if (others.length > 0) {
        shownAnime = others[Math.floor(Math.random() * others.length)].anime;
      }
    }

    setFriendReveal({ boxId: pickedBox.id, anime: shownAnime });
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
      <header className="sticky top-0 z-20 px-4 py-3 border-b border-white/8" style={{ background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(12px)' }}>
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
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Choose your box</h2>
                  <p className="text-white/40 text-sm">Pick one — you keep it until the end or trade it away</p>
                </motion.div>
              )}
              {state.phase === 'opening' && (
                <motion.div key="open" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-2">
                  <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Open {boxesLeft} box{boxesLeft !== 1 ? 'es' : ''}</h2>
                  <p className="text-white/40 text-sm">
                    {lastOpenedTitle ? `Last opened: ${lastOpenedTitle}` : 'Select boxes from the board'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Powerup bar */}
            <AnimatePresence>
              {(state.phase === 'pick_box' || state.phase === 'opening') && (
                <motion.div
                  key="powerups"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 justify-center"
                >
                  {state.phase === 'pick_box' && (
                    <motion.button
                      onClick={handleReshuffle}
                      disabled={reshuffleUses <= 0}
                      whileHover={reshuffleUses > 0 ? { scale: 1.04 } : {}}
                      whileTap={reshuffleUses > 0 ? { scale: 0.96 } : {}}
                      animate={reshuffleFlash ? { scale: [1, 1.12, 0.96, 1] } : {}}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                      style={reshuffleUses > 0
                        ? { border: '1px solid rgba(250,204,21,0.5)', color: '#fbbf24', background: 'rgba(250,204,21,0.08)', cursor: 'pointer' }
                        : { border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', background: 'transparent', cursor: 'not-allowed' }
                      }
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      Reshuffle
                      <span className="text-[10px] opacity-60">{reshuffleUses > 0 ? '1 use' : 'used'}</span>
                    </motion.button>
                  )}
                  <motion.button
                    onClick={handleCallFriend}
                    disabled={friendUses <= 0}
                    whileHover={friendUses > 0 ? { scale: 1.04 } : {}}
                    whileTap={friendUses > 0 ? { scale: 0.96 } : {}}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
                    style={friendUses > 0
                      ? { border: '1px solid rgba(96,165,250,0.5)', color: '#60a5fa', background: 'rgba(96,165,250,0.08)', cursor: 'pointer' }
                      : { border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.2)', background: 'transparent', cursor: 'not-allowed' }
                    }
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call a Friend
                    <span className="text-[10px] opacity-60">{friendUses > 0 ? '1 use' : 'used'}</span>
                  </motion.button>
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
            <div className="rounded-xl overflow-hidden border border-white/8">
              <div className="px-3 py-2 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <AnimeValueBoard openedAnime={state.openedHistory.map(h => h.anime)} seed={state.dailySeed} />
              </div>
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

      {/* Offer modal — fixed overlay, was accidentally removed in layout refactor */}
      <AnimatePresence>
        {state.phase === 'offer' && state.currentOffer && !showingBankerCall && (
          <OfferModal
            key="offer"
            offer={state.currentOffer}
            onDeal={takeDeal}
            onNoDeal={declineDeal}
          />
        )}
      </AnimatePresence>

      {/* Banker call overlay */}
      <AnimatePresence>
        {showingBankerCall && (
          <motion.div
            key="banker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(8px)' }}
          >
            <BankerCall
              onCallComplete={handleBankerCallComplete}
              boxesLeft={state.boxes.filter(b => !b.isOpen && !b.isPlayerBox).length}
              round={state.currentRound}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call a Friend reveal */}
      <AnimatePresence>
        {friendReveal && (
          <motion.div
            key="friend"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center pb-10 px-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => setFriendReveal(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.92 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/10 p-5"
              style={{ background: '#0f172a' }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-lg flex-shrink-0">
                  🧑‍💻
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Your friend says...</p>
                  {friendRevealLines(friendReveal.boxId, friendReveal.anime.title).map((line, i) => (
                    <p key={i} className={i === 0 ? 'text-white font-semibold text-sm' : 'text-white/40 text-xs mt-1'}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-white/20 italic">90% chance they&apos;re trolling you</p>
                <button
                  onClick={() => setFriendReveal(null)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/8 text-white/60 hover:bg-white/12 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
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
