'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface BankerCallProps {
  onCallComplete: () => void;
}

const CALL_STAGES = [
  { label: 'Incoming call from the Banker...', duration: 2200 },
  { label: 'The Banker is evaluating your board...', duration: 2800 },
  { label: 'An offer is being prepared...', duration: 2800 },
];

export default function BankerCall({ onCallComplete }: BankerCallProps) {
  const [stage, setStage] = useState(0);
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function advance() {
      setStage(s => {
        const next = s + 1;
        if (next >= CALL_STAGES.length) {
          timeout = setTimeout(onCallComplete, 1200);
          return s;
        }
        timeout = setTimeout(advance, CALL_STAGES[next].duration);
        return next;
      });
    }

    timeout = setTimeout(advance, CALL_STAGES[0].duration);
    return () => clearTimeout(timeout);
  }, [onCallComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8"
    >
      {/* Animated phone */}
      <div className="relative">
        <motion.div
          animate={ringing ? { rotate: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
          className="w-20 h-20 rounded-full border-2 border-yellow-400/40 bg-yellow-400/10 flex items-center justify-center"
        >
          <Phone className="w-10 h-10 text-yellow-400" />
        </motion.div>

        {/* Ripple rings */}
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-yellow-400/20"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 2 + i * 0.6, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Stage text */}
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-white/90 font-medium text-lg">{CALL_STAGES[stage]?.label}</p>
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
