'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/hooks/useGame';
import BoxGrid from '@/components/game/BoxGrid';
import AnimeValueBoard from '@/components/game/AnimeValueBoard';
import BankerCall from '@/components/game/BankerCall';
import OfferModal from '@/components/game/OfferModal';
import ResultScreen from '@/components/game/ResultScreen';
import PlayerBoxDisplay from '@/components/game/PlayerBoxDisplay';
import RoundTracker from '@/components/game/RoundTracker';
import { getPlayerBox, getRemainingBoardBoxes, getBoxesToOpenThisRound, acceptDeal, rejectDeal, acceptSwap, keepOwnBox } from '@/lib/game-logic';
import { GameState, PartyVote } from '@/types';
import { Users, Copy, Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import { clsx } from 'clsx';

function getPlayerId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('anime_dond_player_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('anime_dond_player_id', id);
  }
  return id;
}

export default function PartyRoomPage() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const code = params.code.toUpperCase();
  const isHost = searchParams.get('host') === '1';
  const playerName = searchParams.get('name') ?? 'Player';

  const { state, pickBox, openABox, showOffer, takeDeal, declineDeal, swap, keepBox, reset } = useGame();
  const [showingBankerCall, setShowingBankerCall] = useState(false);
  const [votes, setVotes] = useState<PartyVote[]>([]);
  const [myVote, setMyVote] = useState<'deal' | 'no_deal' | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [codeCopied, setCodeCopied] = useState(false);
  const [remoteState, setRemoteState] = useState<GameState | null>(null);
  const syncRef = useRef(false);

  const playerId = getPlayerId();
  const displayState = isHost ? state : (remoteState ?? state);
  const playerBox = getPlayerBox(displayState);
  const remainingBoard = getRemainingBoardBoxes(displayState);
  const boxesLeft = getBoxesToOpenThisRound(displayState);

  // Poll for room state (audience) or push state (host)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    async function poll() {
      const res = await fetch(`/api/party/${code}`);
      if (!res.ok) return;
      const json = await res.json();
      const room = json.data;
      if (!room) return;

      if (room.votes) setVotes(room.votes);
      if (room.participants) setParticipants(room.participants.map((p: { player_name: string }) => p.player_name));

      if (!isHost && room.game_state) {
        setRemoteState(room.game_state);
        if (room.game_state.phase === 'banker_call' || room.game_state.phase === 'final_swap') {
          setShowingBankerCall(true);
        }
      }
    }

    interval = setInterval(poll, 2000);
    poll();
    return () => clearInterval(interval);
  }, [code, isHost]);

  // Host syncs game state to server
  useEffect(() => {
    if (!isHost) return;
    async function sync() {
      await fetch(`/api/party/${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_state: state, votes: [] }),
      });
    }
    sync();
  }, [state, code, isHost]);

  // Phase transitions
  useEffect(() => {
    if (displayState.phase === 'banker_call' || displayState.phase === 'final_swap') {
      setShowingBankerCall(true);
    }
  }, [displayState.phase]);

  function handleBankerCallComplete() {
    setShowingBankerCall(false);
    if (isHost) showOffer();
  }

  function handleBoxOpen(boxId: number) {
    if (!isHost) return;
    openABox(boxId);
  }

  async function castVote(vote: 'deal' | 'no_deal') {
    setMyVote(vote);
    const newVotes = votes.filter(v => v.player_id !== playerId);
    newVotes.push({ player_id: playerId, player_name: playerName, vote });

    await fetch(`/api/party/${code}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ votes: newVotes }),
    });
    setVotes(newVotes);
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  const dealVotes = votes.filter(v => v.vote === 'deal').length;
  const noDealVotes = votes.filter(v => v.vote === 'no_deal').length;

  async function handleSaveScore(name: string, anime: typeof state.finalAnime) {
    if (!anime) return;
    await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        player_name: name,
        anime_title: anime.title,
        anime_rating: anime.rating,
        anime_tier: anime.tier,
        accepted_deal: state.acceptedOffer !== null,
        round_ended: state.currentRound,
        date: new Date().toISOString().slice(0, 10),
        duration_seconds: Math.floor((Date.now() - state.startedAt) / 1000),
      }),
    }).catch(() => {});
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 py-3 border-b border-white/6"
        style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/40" />
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 font-mono text-sm font-bold text-white/70 hover:text-white transition-colors"
            >
              {code}
              {codeCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Role badge */}
          <span className={clsx(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            isHost ? 'bg-yellow-400/15 text-yellow-400' : 'bg-blue-400/15 text-blue-400',
          )}>
            {isHost ? 'Host' : 'Audience'}
          </span>

          <div className="flex-1">
            <RoundTracker
              currentRound={displayState.currentRound}
              boxesOpenedThisRound={displayState.boxesOpenedThisRound}
              phase={displayState.phase}
            />
          </div>

          {/* Participant count */}
          {participants.length > 0 && (
            <span className="text-xs text-white/30">
              {participants.length} watching
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main game */}
          <div className="flex-1 space-y-5">
            {displayState.phase === 'pick_box' && isHost && (
              <div className="text-center py-3">
                <h2 className="text-xl font-black text-white mb-1">Choose your box</h2>
                <p className="text-white/50 text-sm">Pick one to hold until the end</p>
              </div>
            )}
            {displayState.phase === 'pick_box' && !isHost && (
              <div className="text-center py-3">
                <h2 className="text-xl font-black text-white mb-1">Waiting for host to pick a box...</h2>
              </div>
            )}
            {displayState.phase === 'opening' && (
              <div className="text-center py-3">
                <h2 className="text-xl font-black text-white mb-1">
                  {isHost ? `Open ${boxesLeft} box${boxesLeft !== 1 ? 'es' : ''}` : `Host is opening boxes...`}
                </h2>
              </div>
            )}

            <BoxGrid
              boxes={displayState.boxes}
              playerBoxId={displayState.playerBoxId}
              phase={displayState.phase}
              onSelectBox={isHost ? (displayState.phase === 'pick_box' ? pickBox : handleBoxOpen) : () => {}}
            />

            {/* Audience vote panel */}
            {!isHost && (displayState.phase === 'offer' || displayState.phase === 'final_swap') && !showingBankerCall && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/10 bg-white/4 p-5"
              >
                <p className="text-center text-sm font-bold text-white mb-4">
                  Cast your vote — should the host take the deal?
                </p>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => castVote('deal')}
                    whileTap={{ scale: 0.96 }}
                    className={clsx(
                      'flex-1 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2',
                      myVote === 'deal'
                        ? 'border-yellow-400/60 bg-yellow-400/15 text-yellow-400'
                        : 'border-white/15 text-white/60 hover:border-yellow-400/30',
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" /> Deal ({dealVotes})
                  </motion.button>
                  <motion.button
                    onClick={() => castVote('no_deal')}
                    whileTap={{ scale: 0.96 }}
                    className={clsx(
                      'flex-1 py-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-2',
                      myVote === 'no_deal'
                        ? 'border-blue-400/60 bg-blue-400/15 text-blue-400'
                        : 'border-white/15 text-white/60 hover:border-blue-400/30',
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" /> No Deal ({noDealVotes})
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Vote tally for host */}
            {isHost && (displayState.phase === 'offer' || displayState.phase === 'final_swap') && votes.length > 0 && !showingBankerCall && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-3 flex items-center gap-4 text-sm">
                <span className="text-white/40">Audience votes:</span>
                <span className="text-yellow-400 font-bold">{dealVotes} Deal</span>
                <span className="text-white/20">vs</span>
                <span className="text-blue-400 font-bold">{noDealVotes} No Deal</span>
              </div>
            )}

            {/* Host offer modal */}
            {isHost && displayState.phase === 'offer' && displayState.currentOffer && !showingBankerCall && (
              <OfferModal
                offer={displayState.currentOffer}
                onDeal={takeDeal}
                onNoDeal={declineDeal}
              />
            )}

            {/* Final swap for host */}
            {isHost && displayState.phase === 'final_swap' && displayState.currentOffer && !showingBankerCall && (
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-center">
                <h3 className="text-lg font-black text-white mb-1">Final Decision</h3>
                <div className="flex gap-3 mt-4">
                  <button onClick={swap} className="flex-1 py-3 rounded-xl font-bold border border-blue-400/40 text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-all">Swap Box</button>
                  <button onClick={keepBox} className="flex-1 py-3 rounded-xl font-bold border border-white/20 text-white/80 hover:bg-white/10 transition-all">Keep Mine</button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:w-52 xl:w-56 space-y-4">
            {playerBox && (
              <div className="hidden lg:flex justify-center">
                <PlayerBoxDisplay box={playerBox} phase={displayState.phase} />
              </div>
            )}

            {displayState.phase !== 'pick_box' && (
              <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                <p className="text-xs text-white/40 mb-1">Board avg</p>
                <p className="text-lg font-bold text-white">
                  {(remainingBoard.reduce((s, b) => s + b.anime.rating, 0) / Math.max(remainingBoard.length, 1)).toFixed(2)}
                </p>
                <p className="text-xs text-white/30">{remainingBoard.length} boxes left</p>
              </div>
            )}

            <div className="rounded-xl border border-white/8 bg-white/3 p-3">
              <AnimeValueBoard openedAnime={displayState.openedHistory.map(h => h.anime)} />
            </div>
          </aside>
        </div>
      </div>

      {/* Banker call overlay */}
      <AnimatePresence>
        {showingBankerCall && (
          <motion.div
            key="banker"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center"
            style={{ background: 'rgba(8,13,26,0.92)', backdropFilter: 'blur(8px)' }}
          >
            <BankerCall
              onCallComplete={handleBankerCallComplete}
              boxesLeft={displayState.boxes.filter((b: import('@/types').Box) => !b.isOpen && !b.isPlayerBox).length}
              round={displayState.currentRound}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {displayState.phase === 'result' && displayState.finalAnime && (
          <ResultScreen
            state={displayState}
            playerName={playerName}
            onPlayAgain={isHost ? () => reset() : () => {}}
            onSaveScore={handleSaveScore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
