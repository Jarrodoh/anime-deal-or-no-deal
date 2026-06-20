'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface BankerCallProps {
  onCallComplete: () => void;
  boxesLeft: number;
  round: number;
  playerBoxRank?: number; // rank of the player's own box among all 9 by rating (1 = best)
}

function buildStages(boxesLeft: number, round: number, playerBoxRank?: number) {
  const isTop3 = playerBoxRank !== undefined && playerBoxRank <= 3;

  // Mid-call lines — replace with mocking ones if player is holding a top-3 anime
  const mid: string[] = isTop3 ? [
    playerBoxRank === 1
      ? "Wait. Hold on. The #1 anime is in YOUR box. Why are you even here."
      : `Bro is sitting on the #${playerBoxRank} anime and still gambling. Respect. (not really)`,
    `Your box is literally top ${playerBoxRank} on the whole board. I can't with you.`,
    `${playerBoxRank === 1 ? 'THE best' : `A top ${playerBoxRank}`} anime. In your hands. And you're opening more boxes. Wow.`,
  ] : [
    `Oh I see you still got ${boxesLeft} boxes left on the board...`,
    `${boxesLeft} boxes remaining. One of them is yours. Bold strategy.`,
    `Round ${round} already? You move fast. Maybe too fast.`,
    `So you've been opening boxes. ${boxesLeft} left. Let's talk.`,
    `I've been watching. ${boxesLeft} boxes. One is yours. Interesting.`,
  ];

  // End lines — also shade player if they're top 3
  const end: string[] = isTop3 ? [
    "I'm making you an offer. You should probably just say no deal and go home.",
    "This offer exists. You don't need it. But here we are.",
    `Preparing a number for someone holding top ${playerBoxRank}... this is painful to watch.`,
  ] : [
    "An offer is being prepared... it's generous. For me.",
    "The numbers have been run. You have not.",
    "Be honest — you're kinda curious what I'm about to offer.",
    "The banker doesn't lose. He just lets you feel good first.",
    "Crunching numbers... this might sting a little.",
  ];

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  return [
    { label: 'Incoming call from the Banker...', duration: 2200 },
    { label: pick(mid), duration: 3000 },
    { label: pick(end), duration: 2800 },
  ];
}

export default function BankerCall({ onCallComplete, boxesLeft, round, playerBoxRank }: BankerCallProps) {
  // Build stages once on mount so they don't re-randomise on re-render
  const stages = useRef(buildStages(boxesLeft, round, playerBoxRank)).current;
  const [stage, setStage] = useState(0);

  // Stable ref to onCallComplete so the effect doesn't restart when the
  // parent re-renders and creates a new function reference
  const callbackRef = useRef(onCallComplete);
  useEffect(() => { callbackRef.current = onCallComplete; }, [onCallComplete]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function advance() {
      setStage(s => {
        const next = s + 1;
        if (next >= stages.length) {
          timeout = setTimeout(() => callbackRef.current(), 1200);
          return s;
        }
        timeout = setTimeout(advance, stages[next].duration);
        return next;
      });
    }

    timeout = setTimeout(advance, stages[0].duration);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — run once on mount

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Animated phone */}
      <div className="relative">
        <motion.div
          animate={{ rotate: [-8, 8, -6, 6, -4, 4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
          className="w-20 h-20 rounded-full border-2 border-yellow-400/40 bg-yellow-400/10 flex items-center justify-center"
        >
          <Phone className="w-10 h-10 text-yellow-400" />
        </motion.div>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-yellow-400/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2 + i * 0.6, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
          />
        ))}
      </div>

      {/* Stage text */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm px-4"
      >
        <p className="text-white/90 font-medium text-lg leading-snug">{stages[stage]?.label}</p>
        <div className="flex justify-center gap-1 mt-3">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-yellow-400"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
