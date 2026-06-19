'use client';

import { motion } from 'framer-motion';
import { BankerOffer, TIER_COLORS } from '@/types';
import { Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface OfferModalProps {
  offer: BankerOffer;
  onDeal: () => void;
  onNoDeal: () => void;
  isFinalSwap?: boolean;
}

function offerQualityLabel(pct: number): { label: string; color: string } {
  if (pct >= 95) return { label: 'Exceptional offer', color: '#FFD700' };
  if (pct >= 80) return { label: 'Strong offer', color: '#C084FC' };
  if (pct >= 60) return { label: 'Fair offer', color: '#60A5FA' };
  if (pct >= 40) return { label: 'Weak offer', color: '#4ADE80' };
  return { label: 'Insultingly low', color: '#F87171' };
}

export default function OfferModal({ offer, onDeal, onNoDeal, isFinalSwap = false }: OfferModalProps) {
  const quality = offerQualityLabel(offer.offerPercentage);
  const tierColor = TIER_COLORS[offer.anime.tier];
  const isNearMiss = offer.trigger === 'near_miss';
  const isFiftyFifty = offer.trigger === 'fifty_fifty';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8, 13, 26, 0.92)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="w-full max-w-md rounded-2xl border overflow-hidden"
        style={{
          borderColor: tierColor + '40',
          background: 'linear-gradient(160deg, #0f1628 0%, #151f35 100%)',
          boxShadow: `0 0 40px ${tierColor}20, 0 0 80px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4 text-center border-b"
          style={{ borderColor: tierColor + '20' }}
        >
          <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-1">
            {isFinalSwap ? 'Final Swap Offer' : `The Banker's Offer`}
          </p>
          {isFiftyFifty && (
            <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-xs mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>50/50 — the big moment</span>
            </div>
          )}
          {isNearMiss && (
            <div className="flex items-center justify-center gap-1.5 text-orange-400 text-xs mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Near miss — banker feels generous</span>
            </div>
          )}
        </div>

        {/* Offer anime card */}
        <div className="px-6 py-5">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl p-4 border mb-4"
            style={{
              borderColor: tierColor + '30',
              background: tierColor + '08',
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <span
                className={clsx('text-xs font-black border rounded px-2 py-0.5 tier-' + offer.anime.tier)}
              >
                {offer.anime.tier}-TIER
              </span>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5" style={{ color: tierColor }} />
                <span className="font-bold text-lg" style={{ color: tierColor }}>
                  {offer.anime.rating.toFixed(1)}
                </span>
              </div>
            </div>

            <h3 className="text-white font-bold text-lg leading-tight mb-1">
              {offer.anime.title}
            </h3>
            <p className="text-white/50 text-xs leading-relaxed">
              {offer.anime.description}
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-white/40">
              <span>{offer.anime.year}</span>
              <span>•</span>
              <span>{offer.anime.studio}</span>
              <span>•</span>
              <span>{offer.anime.genre}</span>
            </div>
          </motion.div>

          {/* Offer stats */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 rounded-lg px-3 py-2 bg-white/5 border border-white/8">
              <p className="text-xs text-white/40 mb-0.5">Offer</p>
              <p className="font-bold text-white">{offer.offerRating.toFixed(1)} / 10</p>
            </div>
            <div className="flex-1 rounded-lg px-3 py-2 bg-white/5 border border-white/8">
              <p className="text-xs text-white/40 mb-0.5">Board avg</p>
              <p className="font-bold text-white">{offer.expectedValue.toFixed(2)}</p>
            </div>
            <div className="flex-1 rounded-lg px-3 py-2 border" style={{ background: quality.color + '10', borderColor: quality.color + '30' }}>
              <p className="text-xs text-white/40 mb-0.5">% of EV</p>
              <p className="font-bold" style={{ color: quality.color }}>{offer.offerPercentage}%</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-4 text-xs" style={{ color: quality.color }}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{quality.label}</span>
          </div>

          {/* Banker message */}
          <p className="text-white/60 text-sm italic leading-relaxed mb-6 border-l-2 border-yellow-400/30 pl-3">
            "{offer.message}"
          </p>

          {/* Deal / No Deal buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onDeal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3.5 rounded-xl font-black text-lg uppercase tracking-wide transition-all"
              style={{
                background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}35)`,
                border: `1.5px solid ${tierColor}60`,
                color: tierColor,
                boxShadow: `0 0 20px ${tierColor}20`,
              }}
            >
              Deal
            </motion.button>
            <motion.button
              onClick={onNoDeal}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.3)' }}
              whileTap={{ scale: 0.97 }}
              className="flex-1 py-3.5 rounded-xl font-black text-lg uppercase tracking-wide text-white/70 border border-white/15 hover:text-white transition-all"
            >
              No Deal
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
