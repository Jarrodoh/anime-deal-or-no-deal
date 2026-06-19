'use client';

import { motion } from 'framer-motion';
import { Box, TIER_COLORS } from '@/types';
import { Package } from 'lucide-react';

interface PlayerBoxDisplayProps {
  box: Box | null;
  phase: string;
}

export default function PlayerBoxDisplay({ box, phase }: PlayerBoxDisplayProps) {
  if (!box) return null;

  const isRevealed = phase === 'result' && box.anime;
  const tierColor = isRevealed ? TIER_COLORS[box.anime.tier] : undefined;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
        Your Box
      </p>
      <motion.div
        animate={!isRevealed ? { boxShadow: ['0 0 0 0 rgba(255,215,0,0)', '0 0 0 6px rgba(255,215,0,0.15)', '0 0 0 0 rgba(255,215,0,0)'] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1"
        style={{
          borderColor: isRevealed ? (tierColor + '60') : 'rgba(255,215,0,0.5)',
          background: isRevealed ? (tierColor + '10') : 'rgba(255,215,0,0.05)',
          boxShadow: isRevealed ? `0 0 20px ${tierColor}30` : undefined,
        }}
      >
        <Package
          className="w-7 h-7"
          style={{ color: isRevealed ? tierColor : '#ffd700' }}
        />
        {!isRevealed && (
          <span className="text-xs font-black text-yellow-400">{box.id}</span>
        )}
        {isRevealed && (
          <span className="text-xs font-black" style={{ color: tierColor }}>
            {box.anime.rating.toFixed(1)}
          </span>
        )}
      </motion.div>

      {isRevealed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-white/60 text-center max-w-20 leading-tight"
        >
          {box.anime.title.length > 16 ? box.anime.title.slice(0, 15) + '…' : box.anime.title}
        </motion.p>
      )}
    </div>
  );
}
