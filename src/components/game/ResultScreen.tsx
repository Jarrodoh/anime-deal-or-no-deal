'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Anime, TIER_COLORS, TIER_LABELS } from '@/types';
import { Star, RefreshCw, Trophy } from 'lucide-react';
import { getPlayerBox } from '@/lib/game-logic';
import { ANILIST_IDS } from '@/lib/anilist-ids';
import AnimeImage from './AnimeImage';
import { clsx } from 'clsx';

interface ResultScreenProps {
  state: GameState;
  playerName: string;
  onPlayAgain: () => void;
  onSaveScore: (name: string, anime: Anime) => void;
}

const RESULT_COMMENTS: Record<string, string[]> = {
  S: [
    "Absolute peak. You walked away with a legend.",
    "Flawless. This is the best anime in the whole board.",
    "The banker didn't want you to have this. You earned it.",
  ],
  A: [
    "Excellent taste. Elite-tier result.",
    "Strong result. You played this well.",
    "A-tier. Most people would be thrilled.",
  ],
  B: [
    "Solid pick. A genuinely good watch.",
    "Decent result — nothing to be ashamed of.",
    "B-tier. Watchable, enjoyable, forgettable.",
  ],
  C: [
    "Well... it's something.",
    "C-tier. There are worse fates.",
    "Mid. The board had better and you may have passed them.",
  ],
  D: [
    "Rough day at the office.",
    "You either took a bad deal or got unlucky. Either way.",
    "D-tier. Maybe watch the first episode and see.",
  ],
  F: [
    "This was not your day.",
    "The banker is laughing. Somewhere.",
    "F-tier. A true collector's item for the wrong reasons.",
  ],
};

function getRandomComment(tier: string): string {
  const pool = RESULT_COMMENTS[tier] ?? RESULT_COMMENTS.C;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function ResultScreen({ state, playerName, onPlayAgain, onSaveScore }: ResultScreenProps) {
  const [saved, setSaved] = useState(false);
  const [comment] = useState(() => getRandomComment(state.finalAnime?.tier ?? 'C'));
  const [showConfetti, setShowConfetti] = useState(false);

  const finalAnime = state.finalAnime!;
  const tierColor = TIER_COLORS[finalAnime.tier];
  const playerBox = getPlayerBox(state);
  const tookDeal = state.acceptedOffer !== null;
  const originalAnime = playerBox?.anime;
  const didBetter = tookDeal && originalAnime && finalAnime.rating > originalAnime.rating;
  const didWorse = tookDeal && originalAnime && finalAnime.rating < originalAnime.rating;

  const duration = Math.floor((Date.now() - state.startedAt) / 1000);
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  useEffect(() => {
    if (finalAnime.tier === 'S') {
      setShowConfetti(true);
    }
  }, [finalAnime.tier]);

  function handleSave() {
    onSaveScore(playerName, finalAnime);
    setSaved(true);
  }

  function buildShareText(): string {
    const dealLine = tookDeal ? 'Took the deal!' : 'No deal — opened my box!';
    const lines = [
      `Anime Deal or No Deal`,
      `${getTodayString()}`,
      ``,
      `I got: ${finalAnime.title}`,
      `Rating: ${finalAnime.rating.toFixed(1)}/10 (${finalAnime.tier}-tier)`,
      `${dealLine}`,
      tookDeal && originalAnime
        ? `My box had: ${originalAnime.title} (${originalAnime.rating.toFixed(1)})`
        : '',
      `Rounds played: ${state.currentRound}`,
    ].filter(Boolean);
    return lines.join('\n');
  }

  function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  async function handleShare() {
    const text = buildShareText();
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(8, 13, 26, 0.97)' }}
    >
      <div className="w-full max-w-lg py-8">
        {/* Trophy + result header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background: tierColor + '15',
              border: `2px solid ${tierColor}40`,
              boxShadow: `0 0 30px ${tierColor}30`,
            }}
          >
            <Trophy className="w-8 h-8" style={{ color: tierColor }} />
          </div>
          <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">
            {tookDeal ? 'Deal accepted' : 'Final box opened'}
          </p>
          <h2 className="text-2xl font-black text-white mb-1">
            {playerName}&apos;s Result
          </h2>
        </motion.div>

        {/* Main anime card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-2xl border overflow-hidden mb-4"
          style={{
            borderColor: tierColor + '40',
            background: `linear-gradient(135deg, ${tierColor}05 0%, rgba(15,22,40,1) 100%)`,
            boxShadow: `0 0 40px ${tierColor}15`,
          }}
        >
          <div className="flex gap-4 p-5">
            {/* Cover art */}
            <AnimeImage
              anilistId={ANILIST_IDS[finalAnime.id]}
              title={finalAnime.title}
              className="flex-shrink-0 w-28 h-40 rounded-xl"
            />

            {/* Info */}
            <div className="flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                  <span className={clsx('text-sm font-black border rounded-lg px-3 py-1 tier-' + finalAnime.tier)}>
                    {finalAnime.tier} — {TIER_LABELS[finalAnime.tier]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4" style={{ color: tierColor }} />
                    <span className="text-2xl font-black" style={{ color: tierColor }}>
                      {finalAnime.rating.toFixed(1)}
                    </span>
                    <span className="text-white/40 text-sm">/10</span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-white mb-2 leading-tight">
                  {finalAnime.title}
                </h3>
                <p className="text-white/60 text-xs leading-relaxed mb-2 line-clamp-4">
                  {finalAnime.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span>{finalAnime.year}</span>
                <span>•</span>
                <span>{finalAnime.studio}</span>
              </div>
            </div>
          </div>

          {/* Result comment */}
          <p className="px-5 pb-4 text-sm italic text-white/50 border-t border-white/5 pt-3">
            {comment}
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-2 mb-4"
        >
          <div className="rounded-xl p-3 bg-white/4 border border-white/8 text-center">
            <p className="text-xs text-white/40 mb-1">Rounds</p>
            <p className="text-lg font-bold text-white">{state.currentRound}</p>
          </div>
          <div className="rounded-xl p-3 bg-white/4 border border-white/8 text-center">
            <p className="text-xs text-white/40 mb-1">Boxes opened</p>
            <p className="text-lg font-bold text-white">{state.totalBoxesOpened}</p>
          </div>
          <div className="rounded-xl p-3 bg-white/4 border border-white/8 text-center">
            <p className="text-xs text-white/40 mb-1">Time</p>
            <p className="text-lg font-bold text-white">{mins}m {String(secs).padStart(2, '0')}s</p>
          </div>
        </motion.div>

        {/* Box reveal (if took deal, show what was in their original box) */}
        {tookDeal && originalAnime && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className={clsx(
              'rounded-xl p-4 border mb-4 text-sm',
              didBetter ? 'border-green-400/20 bg-green-400/5' : didWorse ? 'border-red-400/20 bg-red-400/5' : 'border-white/10 bg-white/3'
            )}
          >
            <p className="text-xs text-white/40 uppercase tracking-wide mb-1 font-semibold">
              Your original box contained...
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white">{originalAnime.title}</p>
                <p className="text-xs text-white/40">{originalAnime.rating.toFixed(1)}/10 — {originalAnime.tier}-tier</p>
              </div>
              {didBetter && <span className="text-green-400 font-bold text-xs bg-green-400/10 px-2 py-1 rounded">Good deal!</span>}
              {didWorse && <span className="text-red-400 font-bold text-xs bg-red-400/10 px-2 py-1 rounded">Should have waited...</span>}
              {!didBetter && !didWorse && <span className="text-white/40 text-xs">Same tier</span>}
            </div>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-2"
        >
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-xl border border-yellow-400/30 text-yellow-400 font-bold text-sm hover:bg-yellow-400/10 transition-colors"
          >
            Share Result
          </button>
          {!saved ? (
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl border border-white/15 text-white/70 font-bold text-sm hover:border-white/30 hover:text-white transition-colors"
            >
              Save to Leaderboard
            </button>
          ) : (
            <p className="text-center text-green-400 text-sm font-semibold py-3">
              Score saved!
            </p>
          )}
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl bg-white/6 border border-white/10 text-white/60 font-semibold text-sm hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Play Again
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
