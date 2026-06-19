'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, Plus, LogIn, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

function getOrCreatePlayerId(): string {
  let id = localStorage.getItem('anime_dond_player_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('anime_dond_player_id', id);
  }
  return id;
}

export default function PartyPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('anime_dond_player_name');
    if (saved) setName(saved);
  }, []);

  async function createRoom() {
    if (!name.trim()) { setError('Enter your name first'); return; }
    setLoading(true);
    setError(null);
    localStorage.setItem('anime_dond_player_name', name.trim());
    const playerId = getOrCreatePlayerId();

    const res = await fetch('/api/party/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host_name: name.trim(), host_id: playerId }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.error) { setError(json.error); return; }
    router.push(`/party/${json.data.code}?host=1&name=${encodeURIComponent(name.trim())}`);
  }

  async function joinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!name.trim()) { setError('Enter your name first'); return; }
    if (code.length !== 6) { setError('Room code must be 6 characters'); return; }
    setLoading(true);
    setError(null);
    localStorage.setItem('anime_dond_player_name', name.trim());
    const playerId = getOrCreatePlayerId();

    const res = await fetch('/api/party/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, player_name: name.trim(), player_id: playerId }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.error) { setError(json.error); return; }
    router.push(`/party/${code}?name=${encodeURIComponent(name.trim())}`);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-white/40 hover:text-white/80 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">Party Mode</h1>
            <p className="text-white/40 text-sm">Watch and vote live with friends</p>
          </div>
        </div>

        {/* Name input */}
        <div className="mb-5">
          <label className="block text-xs text-white/40 uppercase tracking-wide font-semibold mb-1.5">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/15 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 transition-colors text-sm"
          />
        </div>

        {/* Create room */}
        <motion.button
          onClick={createRoom}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-xl font-bold border border-yellow-400/40 text-yellow-400 bg-yellow-400/8 hover:bg-yellow-400/15 transition-all mb-3 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Create a Room
        </motion.button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-xs text-white/25">or</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* Join room */}
        <div className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="ROOM CODE"
            maxLength={6}
            className="flex-1 px-4 py-3 rounded-xl bg-white/6 border border-white/15 text-white placeholder-white/20 focus:outline-none focus:border-blue-400/50 transition-colors text-sm font-mono tracking-widest uppercase"
          />
          <motion.button
            onClick={joinRoom}
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-3 rounded-xl font-bold border border-white/15 text-white/70 hover:border-white/30 hover:text-white transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            Join
          </motion.button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-red-400 text-sm text-center"
          >
            {error}
          </motion.p>
        )}

        {/* How party mode works */}
        <div className="mt-8 rounded-xl border border-white/6 bg-white/3 p-4 space-y-2">
          <p className="text-xs text-white/50 font-semibold uppercase tracking-wide flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            How party mode works
          </p>
          <ul className="space-y-1.5 text-xs text-white/40 leading-relaxed">
            <li>The host plays the game normally as the contestant.</li>
            <li>Audience members see the board in real time.</li>
            <li>When the banker calls, everyone votes Deal or No Deal.</li>
            <li>Votes are tallied — the host still makes the final call.</li>
            <li>Rooms close automatically after 4 hours.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
