'use client';

import { motion } from 'framer-motion';
import { Box, TIER_COLORS } from '@/types';
import { ANILIST_IDS } from '@/lib/anilist-ids';
import AnimeImage from './AnimeImage';

interface EliminatedPanelProps {
  openedBoxes: Box[];
}

export default function EliminatedPanel({ openedBoxes }: EliminatedPanelProps) {
  if (openedBoxes.length === 0) return null;

  // Sort by box id so they appear in elimination order
  const sorted = [...openedBoxes].sort((a, b) => a.id - b.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/6"
        style={{ background: 'rgba(0,0,0,0.15)' }}>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
          Eliminated — {openedBoxes.length} box{openedBoxes.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {/* Cards row */}
      <div className="flex gap-2.5 px-4 py-3 overflow-x-auto">
        {sorted.map(box => {
          const color = TIER_COLORS[box.anime.tier];
          return (
            <motion.div
              key={box.id}
              initial={{ opacity: 0, scale: 0.7, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="flex-shrink-0 relative rounded-xl overflow-hidden border border-white/8"
              style={{ width: 72, background: 'rgba(0,0,0,0.25)' }}
            >
              {/* Greyed-out cover art */}
              <div className="relative" style={{ height: 96 }}>
                <AnimeImage
                  anilistId={ANILIST_IDS[box.anime.id]}
                  title={box.anime.title}
                  className="w-full h-full"
                />
                {/* Grey overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'rgba(14,27,46,0.70)', backdropFilter: 'grayscale(80%)' }}
                />
                {/* Red X */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <circle cx="12" cy="12" r="11" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.5)" strokeWidth="1.5" />
                    <line x1="8" y1="8" x2="16" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                    <line x1="16" y1="8" x2="8" y2="16" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                {/* Tier badge */}
                <div
                  className="absolute top-1 left-1 text-[8px] font-black px-1 py-0.5 rounded"
                  style={{ color, border: `1px solid ${color}40`, background: color + '15' }}
                >
                  {box.anime.tier}
                </div>
                {/* Box number */}
                <div className="absolute top-1 right-1 text-[8px] font-bold text-white/30">
                  #{box.id}
                </div>
              </div>

              {/* Footer */}
              <div className="px-1.5 py-1.5">
                <p
                  className="text-[8px] font-semibold leading-tight line-clamp-2 text-white/30"
                  style={{ textDecoration: 'line-through' }}
                >
                  {box.anime.title}
                </p>
                <p className="text-[9px] font-bold text-white/20 mt-0.5">
                  {box.anime.rating.toFixed(1)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
