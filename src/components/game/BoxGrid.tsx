'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, AnimeTier, TIER_COLORS } from '@/types';
import { ANILIST_IDS } from '@/lib/anilist-ids';
import AnimeImage from './AnimeImage';
import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

interface BoxGridProps {
  boxes: Box[];
  playerBoxId: number | null;
  phase: string;
  onSelectBox: (id: number) => void;
}

const SPIN_TIERS: AnimeTier[] = ['B', 'C', 'A', 'F', 'S', 'D', 'A', 'B', 'C', 'S', 'A', 'D'];
const SPIN_INTERVALS = [60, 65, 70, 80, 95, 115, 140, 170, 210, 260, 320, 390, 470, 560, 660];

function SpinReveal({ targetTier, onDone }: { targetTier: AnimeTier; onDone: () => void }) {
  const [displayTier, setDisplayTier] = useState<AnimeTier>('B');

  const runSpin = useCallback(() => {
    const seq: AnimeTier[] = [...SPIN_TIERS, targetTier];
    let i = 0;

    function tick() {
      setDisplayTier(seq[i % seq.length]);
      i++;
      if (i < SPIN_INTERVALS.length) {
        setTimeout(tick, SPIN_INTERVALS[i]);
      } else {
        setDisplayTier(targetTier);
        setTimeout(onDone, 500);
      }
    }

    setTimeout(tick, SPIN_INTERVALS[0]);
  }, [targetTier, onDone]);

  useEffect(() => { runSpin(); }, [runSpin]);

  const color = TIER_COLORS[displayTier];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl overflow-hidden"
      style={{
        background: color + '12',
        border: `2px solid ${color}50`,
        boxShadow: `0 0 24px ${color}30, inset 0 0 30px ${color}10`,
      }}
    >
      <motion.span
        key={displayTier}
        initial={{ scale: 0.4, opacity: 0, y: -10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.08 }}
        className="text-6xl font-black"
        style={{ color, textShadow: `0 0 30px ${color}80, 0 0 60px ${color}40` }}
      >
        {displayTier}
      </motion.span>
      <span className="text-[10px] tracking-widest text-white/30 uppercase mt-1 font-semibold">TIER</span>
      <div className="absolute bottom-3 left-4 right-4 h-1 rounded-full bg-white/8">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: (SPIN_INTERVALS.reduce((s, v) => s + v, 0)) / 1000, ease: 'easeIn' }}
        />
      </div>
    </motion.div>
  );
}

function RevealedCard({ box }: { box: Box }) {
  const tierColor = TIER_COLORS[box.anime.tier];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="absolute inset-0 flex flex-col rounded-2xl overflow-hidden"
      style={{
        boxShadow: `0 0 24px ${tierColor}50, inset 0 0 20px ${tierColor}10`,
        border: `2px solid ${tierColor}60`,
      }}
    >
      <AnimeImage
        anilistId={ANILIST_IDS[box.anime.id]}
        title={box.anime.title}
        className="w-full h-full"
      />
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end px-2 pb-2 pt-8"
        style={{ background: 'linear-gradient(to top, rgba(14,27,46,0.97) 0%, transparent 100%)' }}
      >
        <span className={clsx('text-[9px] font-black border rounded px-1.5 py-0.5 mb-1 tier-' + box.anime.tier)}>
          {box.anime.tier}
        </span>
        <p className="text-[10px] text-white/80 font-semibold leading-tight line-clamp-2 text-left">
          {box.anime.title}
        </p>
        <p className="text-[11px] font-bold mt-0.5" style={{ color: tierColor }}>
          {box.anime.rating.toFixed(1)}
        </p>
      </div>
    </motion.div>
  );
}

export default function BoxGrid({ boxes, playerBoxId, phase, onSelectBox }: BoxGridProps) {
  const [spinningBoxId, setSpinningBoxId] = useState<number | null>(null);
  const [revealedBoxId, setRevealedBoxId] = useState<number | null>(null);
  const [dismissingBoxId, setDismissingBoxId] = useState<number | null>(null);

  function handleClick(box: Box) {
    const isPlayer = box.id === playerBoxId;
    if (box.isOpen || isPlayer || spinningBoxId !== null || revealedBoxId !== null) return;

    if (phase === 'pick_box') {
      onSelectBox(box.id);
      return;
    }

    if (phase === 'opening') {
      setSpinningBoxId(box.id);
    }
  }

  function handleSpinDone(boxId: number) {
    setSpinningBoxId(null);
    setRevealedBoxId(boxId);
  }

  function handleNext() {
    if (revealedBoxId === null) return;
    const id = revealedBoxId;
    setRevealedBoxId(null);
    setDismissingBoxId(id);
    setTimeout(() => {
      setDismissingBoxId(null);
      onSelectBox(id);
    }, 420);
  }

  const activeBoxes = boxes.filter(b => !b.isOpen);
  const revealedBox = revealedBoxId !== null ? boxes.find(b => b.id === revealedBoxId) ?? null : null;
  const revealedTierColor = revealedBox ? TIER_COLORS[revealedBox.anime.tier] : 'rgba(255,255,255,0.6)';

  return (
    <div className="flex gap-3 items-center">
      {/* 3x3 grid */}
      <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-4">
        {activeBoxes.map(box => {
          const isPlayer = box.id === playerBoxId;
          const isSpinning = spinningBoxId === box.id;
          const isRevealed = revealedBoxId === box.id;
          const isDismissing = dismissingBoxId === box.id;
          const showCard = isRevealed || isDismissing;

          const canOpen = phase === 'opening' && !isSpinning && !showCard && spinningBoxId === null && revealedBoxId === null && !isPlayer;
          const canPick = phase === 'pick_box' && !isPlayer;
          const clickable = canOpen || canPick;

          return (
            <motion.button
              key={box.id}
              onClick={() => handleClick(box)}
              disabled={!clickable && !isSpinning && !showCard}
              animate={isDismissing ? { opacity: 0, y: 80, scale: 0.65 } : { opacity: 1, y: 0, scale: 1 }}
              transition={isDismissing ? { duration: 0.4, ease: 'easeIn' } : {}}
              whileHover={clickable ? { scale: 1.04, y: -3 } : {}}
              whileTap={clickable ? { scale: 0.96 } : {}}
              className={clsx(
                'relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 overflow-hidden select-none',
                'h-40 sm:h-44 md:h-48',
                isPlayer && !showCard && 'border-yellow-400/70 bg-yellow-400/10',
                canPick && 'border-white/25 bg-white/6 hover:border-yellow-400/50 hover:bg-yellow-400/6 cursor-pointer',
                canOpen && 'border-white/25 bg-white/6 hover:border-blue-400/50 hover:bg-blue-400/6 cursor-pointer',
                isSpinning && 'border-transparent cursor-default',
                showCard && 'border-transparent cursor-default',
                !clickable && !isSpinning && !showCard && !isPlayer && 'border-white/8 bg-white/2 cursor-default opacity-40',
              )}
              style={isPlayer && !showCard ? { boxShadow: '0 0 22px rgba(250,204,21,0.25)' } : {}}
            >
              {/* Closed state */}
              {!isSpinning && !showCard && (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span className={clsx('text-4xl font-black tabular-nums', isPlayer ? 'text-yellow-300' : 'text-white/55')}>
                    {box.id}
                  </span>
                  {isPlayer && (
                    <span className="text-[10px] text-yellow-400 tracking-widest uppercase font-semibold border border-yellow-400/40 px-2 py-0.5 rounded-full">
                      Your box
                    </span>
                  )}
                  {canOpen && <span className="text-[9px] text-blue-400/50 tracking-wide uppercase">tap to open</span>}
                  {canPick && <span className="text-[9px] text-white/25 tracking-wide uppercase">pick this</span>}
                </div>
              )}

              {/* Spin suspense */}
              {isSpinning && (
                <SpinReveal targetTier={box.anime.tier} onDone={() => handleSpinDone(box.id)} />
              )}

              {/* Revealed card — stays until Next is pressed */}
              {showCard && <RevealedCard box={box} />}
            </motion.button>
          );
        })}
      </div>

      {/* Next button — appears on the right side when a box is revealed */}
      <AnimatePresence>
        {revealedBox !== null && (
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="flex-shrink-0"
          >
            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              className="flex flex-col items-center gap-3 px-4 py-6 rounded-2xl border font-black text-sm cursor-pointer"
              style={{
                border: `1.5px solid ${revealedTierColor}55`,
                color: revealedTierColor,
                background: revealedTierColor + '10',
                boxShadow: `0 0 20px ${revealedTierColor}20`,
                minHeight: 100,
              }}
            >
              <span
                className="text-[10px] uppercase tracking-widest font-black"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Next
              </span>
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
