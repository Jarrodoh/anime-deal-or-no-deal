'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Box, AnimeTier, TIER_COLORS } from '@/types';
import { clsx } from 'clsx';

interface BoxGridProps {
  boxes: Box[];
  playerBoxId: number | null;
  phase: string;
  onSelectBox: (id: number) => void;
  highlightable?: boolean;
}

function tierGlowClass(tier: AnimeTier): string {
  if (tier === 'S') return 'glow-s';
  if (tier === 'A') return 'glow-a';
  if (tier === 'B') return 'glow-b';
  return '';
}

export default function BoxGrid({ boxes, playerBoxId, phase, onSelectBox, highlightable = false }: BoxGridProps) {
  const canClick = phase === 'pick_box' || phase === 'opening';

  return (
    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-2 md:gap-3">
      {boxes.map(box => {
        const isPlayer = box.id === playerBoxId;
        const isOpen = box.isOpen;
        const clickable = canClick && !isOpen && !isPlayer;

        return (
          <motion.button
            key={box.id}
            onClick={() => clickable && onSelectBox(box.id)}
            disabled={!clickable}
            whileHover={clickable ? { scale: 1.06, y: -2 } : {}}
            whileTap={clickable ? { scale: 0.96 } : {}}
            className={clsx(
              'relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200',
              'h-16 sm:h-18 md:h-20 text-xs font-bold select-none',
              isPlayer && !isOpen && 'border-yellow-400/70 bg-yellow-400/10 pulse-gold',
              isOpen && 'border-white/5 bg-white/3 opacity-50 cursor-default',
              clickable && !isPlayer && phase === 'pick_box' && 'border-white/20 bg-white/5 hover:border-yellow-400/50 hover:bg-yellow-400/8 cursor-pointer',
              clickable && !isPlayer && phase === 'opening' && 'border-white/20 bg-white/5 hover:border-blue-400/50 hover:bg-blue-400/8 cursor-pointer',
              !clickable && !isOpen && !isPlayer && 'border-white/10 bg-white/3 cursor-default opacity-70',
            )}
          >
            {/* Box number */}
            {!isOpen && (
              <span className={clsx(
                'text-sm font-bold tabular-nums',
                isPlayer ? 'text-yellow-300' : 'text-white/70',
              )}>
                {box.id}
              </span>
            )}

            {/* Player label */}
            {isPlayer && !isOpen && (
              <span className="text-[9px] text-yellow-400 mt-0.5 tracking-wide uppercase">
                Yours
              </span>
            )}

            {/* Open state — show tier badge */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, rotateY: 90 }}
                  animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                  className={clsx(
                    'absolute inset-0 flex flex-col items-center justify-center rounded-xl',
                    tierGlowClass(box.anime.tier),
                  )}
                >
                  <span
                    className={clsx('text-[10px] font-black border rounded px-1 py-0.5 tier-' + box.anime.tier)}
                  >
                    {box.anime.tier}
                  </span>
                  <span className="text-[8px] text-white/50 mt-0.5 text-center px-1 leading-tight line-clamp-2">
                    {box.anime.title.length > 14 ? box.anime.title.slice(0, 13) + '…' : box.anime.title}
                  </span>
                  <span className="text-[9px] font-bold" style={{ color: TIER_COLORS[box.anime.tier] }}>
                    {box.anime.rating.toFixed(1)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glow pulse on hover for openable boxes */}
            {clickable && phase === 'opening' && (
              <span className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-200 bg-blue-400/5 pointer-events-none" />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
