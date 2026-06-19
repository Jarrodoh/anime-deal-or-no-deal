'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TIER_COLORS, TIER_LABELS, AnimeTier } from '@/types';
import { getTodayString } from '@/lib/daily-seed';
import { Trophy, Clock, Star, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

interface Entry {
  id: string;
  player_name: string;
  anime_title: string;
  anime_rating: number;
  anime_tier: AnimeTier;
  accepted_deal: boolean;
  round_ended: number;
  duration_seconds: number;
  date: string;
  created_at: string;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'today' | 'all'>('today');
  const today = getTodayString();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const url = filter === 'today'
        ? `/api/leaderboard?date=${today}&limit=50`
        : `/api/leaderboard?limit=50`;
      const res = await fetch(url);
      const json = await res.json();
      setEntries(json.data ?? []);
      setLoading(false);
    }
    load();
  }, [filter, today]);

  return (
    <div className="min-h-screen p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pt-4">
        <Link href="/" className="text-white/40 hover:text-white/80 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          <p className="text-white/40 text-sm">Best anime outcomes across all players</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(['today', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-bold border transition-all',
              filter === f
                ? 'border-yellow-400/50 text-yellow-400 bg-yellow-400/10'
                : 'border-white/10 text-white/40 hover:text-white/70',
            )}
          >
            {f === 'today' ? "Today's Board" : 'All Time'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-16 text-white/30">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No scores yet. Be the first to play and save your result!</p>
          <Link
            href="/game"
            className="inline-block mt-4 px-5 py-2 rounded-xl border border-yellow-400/30 text-yellow-400 text-sm font-bold hover:bg-yellow-400/10 transition-colors"
          >
            Play Now
          </Link>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, i) => {
            const color = TIER_COLORS[entry.anime_tier];
            const mins = Math.floor(entry.duration_seconds / 60);
            const secs = entry.duration_seconds % 60;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/3 px-4 py-3 hover:border-white/12 transition-colors"
              >
                {/* Rank */}
                <div className="text-lg font-black text-white/30 w-7 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                </div>

                {/* Tier badge */}
                <div
                  className={clsx('text-xs font-black border rounded px-2 py-1 w-8 text-center tier-' + entry.anime_tier)}
                >
                  {entry.anime_tier}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{entry.anime_title}</p>
                  <p className="text-white/40 text-xs truncate">{entry.player_name}</p>
                </div>

                {/* Rating */}
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" style={{ color }} />
                    <span className="font-bold text-sm" style={{ color }}>{entry.anime_rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end text-white/25 text-xs">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{mins}m {String(secs).padStart(2, '0')}s</span>
                  </div>
                </div>

                {/* Deal badge */}
                <div
                  className={clsx(
                    'text-[10px] font-bold px-2 py-1 rounded',
                    entry.accepted_deal
                      ? 'bg-blue-400/15 text-blue-300'
                      : 'bg-green-400/15 text-green-300',
                  )}
                >
                  {entry.accepted_deal ? 'Deal' : 'No Deal'}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
