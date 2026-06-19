'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, AnimeTier, TIER_COLORS } from '@/types';
import { ANILIST_IDS } from '@/lib/anilist-ids';
import AnimeImage from './AnimeImage';
import { clsx } from 'clsx';

interface BoxGridProps {
  boxes: Box[];
  playerBoxId: number | null;
  phase: string;
  onSelectBox: (id: number) => void;
}

function tierGlowStyle(tier: AnimeTier) {
  const c = TIER_COLORS[tier];
  return { boxShadow: `0 0 18px ${c}40, inset 0 0 18px ${c}10` };
}

export default function BoxGrid({ boxes, playerBoxId, phase, onSelectBox }: BoxGridProps) {
  const canClick = phase === 'pick_box' || phase === 'opening';

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {boxes.map(box => {
        const isPlayer = box.id === playerBoxId;
        const isOpen = box.isOpen;
        const clickable = canClick && !isOpen && !isPlayer;
        const tierColor = TIER_COLORS[box.anime.tier];

        return (
          <motion.button
            key={box.id}
            onClick={() => clickable && onSelectBox(box.id)}
            disabled={!clickable}
            whileHover={clickable ? { scale: 1.04, y: -3 } : {}}
            whileTap={clickable ? { scale: 0.96 } : {}}
            className={clsx(
              'relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-200 overflow-hidden select-none',
              'h-40 sm:h-44 md:h-48',
              isPlayer && !isOpen && 'border-yellow-400/70 bg-yellow-400/10',
              isOpen && 'border-white/10 bg-white/2 cursor-default',
              clickable && phase === 'pick_box' && 'border-white/25 bg-white/6 hover:border-yellow-400/50 hover:bg-yellow-400/6 cursor-pointer',
              clickable && phase === 'opening' && 'border-white/25 bg-white/6 hover:border-blue-400/50 hover:bg-blue-400/6 cursor-pointer',
              !clickable && !isOpen && !isPlayer && 'border-white/10 bg-white/3 cursor-default opacity-60',
            )}
            style={isPlayer && !isOpen ? { boxShadow: '0 0 22px rgba(250,204,21,0.25)' } : {}}
          >
            {/* Closed state */}
            {!isOpen && (
              <div className="flex flex-col items-center justify-center gap-1.5">
                <span className={clsx(
                  'text-4xl font-black tabular-nums',
                  isPlayer ? 'text-yellow-300' : 'text-white/60',
                )}>
                  {box.id}
                </span>
                {isPlayer && (
                  <span className="text-[10px] text-yellow-400 tracking-widest uppercase font-semibold border border-yellow-400/40 px-2 py-0.5 rounded-full">
                    Your box
                  </span>
                )}
                {clickable && phase === 'opening' && (
                  <span className="text-[10px] text-blue-400/60 tracking-wide uppercase">tap to open</span>
                )}
                {clickable && phase === 'pick_box' && (
                  <span className="text-[10px] text-white/30 tracking-wide uppercase">pick this</span>
                )}
              </div>
            )}

            {/* Opened state */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="absolute inset-0 flex flex-col"
                  style={tierGlowStyle(box.anime.tier)}
                >
                  {/* Cover art fills the box */}
                  <AnimeImage
                    anilistId={ANILIST_IDS[box.anime.id]}
                    title={box.anime.title}
                    className="w-full h-full"
                  />

                  {/* Gradient overlay + info */}
                  <div
                    className="absolute inset-x-0 bottom-0 flex flex-col items-start justify-end px-2 pb-2 pt-6"
                    style={{ background: 'linear-gradient(to top, rgba(8,13,26,0.96) 0%, transparent 100%)' }}
                  >
                    <span
                      className={clsx('text-[9px] font-black border rounded px-1.5 py-0.5 mb-1 tier-' + box.anime.tier)}
                    >
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
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
