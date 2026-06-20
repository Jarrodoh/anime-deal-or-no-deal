'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, AnimeTier, TIER_COLORS } from '@/types';
import { ANILIST_IDS } from '@/lib/anilist-ids';
import AnimeImage from './AnimeImage';
import { clsx } from 'clsx';
import { ChevronsRight } from 'lucide-react';

interface BoxGridProps {
  boxes: Box[];
  playerBoxId: number | null;
  phase: string;
  onSelectBox: (id: number) => void;
}

const SPIN_TIERS: AnimeTier[] = ['B', 'C', 'A', 'F', 'S', 'D', 'A', 'B', 'C', 'S', 'A', 'D'];
const SPIN_INTERVALS = [60, 65, 70, 80, 95, 115, 140, 170, 210, 260, 320, 390, 470, 560, 660];

function SpinReveal({
  targetTier,
  onDone,
  skip,
}: {
  targetTier: AnimeTier;
  onDone: () => void;
  skip: boolean;
}) {
  const [displayTier, setDisplayTier] = useState<AnimeTier>('B');
  const cancelledRef = useRef(false);
  const doneCalledRef = useRef(false);

  useEffect(() => {
    if (skip && !doneCalledRef.current) {
      cancelledRef.current = true;
      doneCalledRef.current = true;
      setDisplayTier(targetTier);
      onDone();
    }
  }, [skip, targetTier, onDone]);

  const runSpin = useCallback(() => {
    const seq: AnimeTier[] = [...SPIN_TIERS, targetTier];
    let i = 0;

    function tick() {
      if (cancelledRef.current) return;
      setDisplayTier(seq[i % seq.length]);
      i++;
      if (i < SPIN_INTERVALS.length) {
        setTimeout(tick, SPIN_INTERVALS[i]);
      } else {
        setDisplayTier(targetTier);
        setTimeout(() => {
          if (!doneCalledRef.current) {
            doneCalledRef.current = true;
            onDone();
          }
        }, 500);
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
          transition={{ duration: skip ? 0.1 : (SPIN_INTERVALS.reduce((s, v) => s + v, 0)) / 1000, ease: 'easeIn' }}
        />
      </div>
    </motion.div>
  );
}

function RevealedCard({ box, onNext }: { box: Box; onNext: () => void }) {
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
        className="absolute inset-x-0 bottom-0 flex flex-col items-start px-2 pb-2 pt-14"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.72) 55%, transparent 100%)' }}
      >
        <span className={clsx('text-[9px] font-black border rounded px-1.5 py-0.5 mb-1 tier-' + box.anime.tier)}>
          {box.anime.tier}
        </span>
        <p className="text-sm font-bold leading-tight line-clamp-2 w-full mb-1 text-white/90">
          {box.anime.title}
        </p>
        <p className="text-xl font-black mb-2" style={{ color: tierColor }}>
          {box.anime.rating.toFixed(1)}
        </p>

        {/* Next button — pops in after card settles. This is a real <button> inside a <div>, so it works. */}
        <motion.button
          initial={{ opacity: 0, scale: 0.75, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 350, damping: 22 }}
          onClick={e => { e.stopPropagation(); onNext(); }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider text-center cursor-pointer"
          style={{
            background: tierColor + '28',
            border: `1px solid ${tierColor}70`,
            color: tierColor,
            boxShadow: `0 0 12px ${tierColor}30`,
          }}
        >
          Next →
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function BoxGrid({ boxes, playerBoxId, phase, onSelectBox }: BoxGridProps) {
  const [spinningBoxId, setSpinningBoxId] = useState<number | null>(null);
  const [revealedBoxId, setRevealedBoxId] = useState<number | null>(null);
  const [dismissingBoxId, setDismissingBoxId] = useState<number | null>(null);
  const [skipSpin, setSkipSpin] = useState(false);

  function handleClick(box: Box) {
    const isPlayer = box.id === playerBoxId;
    if (box.isOpen || isPlayer || spinningBoxId !== null || revealedBoxId !== null || dismissingBoxId !== null) return;

    if (phase === 'pick_box') {
      onSelectBox(box.id);
      return;
    }

    if (phase === 'opening') {
      setSkipSpin(false);
      setSpinningBoxId(box.id);
    }
  }

  function handleSpinDone(boxId: number) {
    setSpinningBoxId(null);
    setSkipSpin(false);
    setRevealedBoxId(boxId);
  }

  function handleSkip() {
    setSkipSpin(true);
  }

  function handleNext() {
    if (revealedBoxId === null) return;
    const id = revealedBoxId;
    setRevealedBoxId(null);
    setDismissingBoxId(id);
    setTimeout(() => {
      setDismissingBoxId(null);
      onSelectBox(id);
    }, 400);
  }

  const activeBoxes = boxes.filter(b => !b.isOpen);
  const showSkip = spinningBoxId !== null && !skipSpin;

  return (
    <div className="flex gap-3 items-stretch">
      {/* 3×3 grid — cells are divs (not buttons) so RevealedCard's inner button works correctly */}
      <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-4">
        {activeBoxes.map(box => {
          const isPlayer = box.id === playerBoxId;
          const isSpinning = spinningBoxId === box.id;
          const isRevealed = revealedBoxId === box.id;
          const isDismissing = dismissingBoxId === box.id;
          const showCard = isRevealed || isDismissing;

          const canOpen =
            phase === 'opening' && !isSpinning && !showCard &&
            spinningBoxId === null && revealedBoxId === null && dismissingBoxId === null && !isPlayer;
          const canPick = phase === 'pick_box' && !isPlayer;
          const clickable = canOpen || canPick;

          return (
            // div instead of button — avoids invalid nested <button> when RevealedCard is shown
            <motion.div
              key={box.id}
              onClick={() => handleClick(box)}
              animate={isDismissing ? { opacity: 0, y: 70, scale: 0.6 } : { opacity: 1, y: 0, scale: 1 }}
              transition={isDismissing ? { duration: 0.38, ease: 'easeIn' } : {}}
              whileHover={clickable ? { scale: 1.04, y: -3 } : {}}
              whileTap={clickable ? { scale: 0.96 } : {}}
              className={clsx(
                'relative flex flex-col items-center justify-center rounded-2xl transition-colors duration-200 overflow-hidden select-none',
                'h-40 sm:h-44 md:h-48',
                isPlayer && !showCard && 'border-2 border-yellow-400 bg-yellow-50',
                canPick && 'border-2 border-gray-300 bg-white hover:border-yellow-400 hover:bg-yellow-50 cursor-pointer',
                canOpen && 'border-2 border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer',
                (isSpinning || showCard || isDismissing) && 'border-2 border-transparent',
                !clickable && !isSpinning && !showCard && !isDismissing && !isPlayer && 'border-2 border-white/12 bg-white/6 opacity-40',
              )}
              style={isPlayer && !showCard ? { boxShadow: '0 0 22px rgba(250,204,21,0.25)' } : {}}
            >
              {/* Closed */}
              {!isSpinning && !showCard && (
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <span className={clsx('text-6xl font-black tabular-nums leading-none', isPlayer ? 'text-yellow-600' : 'text-black/50')}>
                    {box.id}
                  </span>
                  {isPlayer && (
                    <span className="mt-2 text-[10px] text-yellow-600 tracking-widest uppercase font-semibold border border-yellow-400/60 px-2 py-0.5 rounded-full">
                      Your box
                    </span>
                  )}
                </div>
              )}

              {isSpinning && (
                <SpinReveal
                  targetTier={box.anime.tier}
                  skip={skipSpin}
                  onDone={() => handleSpinDone(box.id)}
                />
              )}

              {showCard && <RevealedCard box={box} onNext={handleNext} />}
            </motion.div>
          );
        })}
      </div>

      {/* Skip button — right side of grid, visible during spin */}
      <div className="flex-shrink-0 w-12 flex items-center justify-center">
        <AnimatePresence>
          {showSkip && (
            <motion.button
              key="skip"
              initial={{ opacity: 0, x: 16, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              onClick={handleSkip}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex flex-col items-center gap-2 px-2.5 py-5 rounded-2xl border cursor-pointer"
              style={{
                border: '1.5px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              <span
                className="text-[9px] uppercase tracking-widest font-black"
                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
              >
                Skip
              </span>
              <ChevronsRight className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
