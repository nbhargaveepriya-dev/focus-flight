import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Wind, HelpCircle } from 'lucide-react';
import { cabinAudio } from '@/lib/gameAudio';

interface CabinServiceModalProps {
  open: boolean;
  onDone: () => void;
}

const DINING_SECONDS = 5 * 60;

const CITY_FACTS = [
  { city: 'London', fact: 'London has over 170 museums, more than any other city in the world.' },
  { city: 'Tokyo', fact: 'Tokyo has the world\'s busiest railway station — Shinjuku, with 3.5 million passengers daily.' },
  { city: 'Paris', fact: 'Paris has only one stop sign in the entire city — at an exit of a construction company.' },
  { city: 'Singapore', fact: 'Singapore is the only city-state in Southeast Asia and spans just 50 km across.' },
  { city: 'Sydney', fact: 'Sydney\'s Opera House has over one million roof tiles that self-clean when it rains.' },
  { city: 'Dubai', fact: 'Dubai has no postal addresses — residents navigate by landmarks instead.' },
  { city: 'New York', fact: 'New York City has 20,000 licensed food carts and trucks — one for every 400 residents.' },
  { city: 'Berlin', fact: 'Berlin has more bridges than Venice — over 1,700 bridges cross its canals and rivers.' },
];

const RIDDLES = [
  { q: 'What has wings but never flies?', a: 'A stage — in a theatre!' },
  { q: 'I have hands but no arms, and a face but no eyes. What am I?', a: 'A clock.' },
  { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps.' },
  { q: 'What travels the world while staying in a corner?', a: 'A postage stamp.' },
  { q: 'I speak without a mouth and hear without ears. What am I?', a: 'An echo.' },
];

type MagazineTab = 'tray' | 'fact' | 'breathe' | 'riddle';

export default function CabinServiceModal({ open, onDone }: CabinServiceModalProps) {
  const [remaining, setRemaining] = useState(DINING_SECONDS);
  const [tab, setTab] = useState<MagazineTab>('tray');
  const [fact] = useState(() => CITY_FACTS[Math.floor(Math.random() * CITY_FACTS.length)]);
  const [riddle] = useState(() => RIDDLES[Math.floor(Math.random() * RIDDLES.length)]);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (!open) { setRemaining(DINING_SECONDS); setTab('tray'); setShowAnswer(false); return; }
    cabinAudio.playChime();
    const id = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(id); onDone(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open]);

  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');

  const tabs: { key: MagazineTab; label: string; icon: React.ReactNode }[] = [
    { key: 'tray', label: 'Meal', icon: '🍽' },
    { key: 'fact', label: 'City Facts', icon: <BookOpen className="w-3 h-3" /> },
    { key: 'breathe', label: 'Breathe', icon: <Wind className="w-3 h-3" /> },
    { key: 'riddle', label: 'Riddle', icon: <HelpCircle className="w-3 h-3" /> },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="bg-[hsl(212,29%,18%)] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          >
            <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase mb-1 text-center">✦ Sky-High Magazine ✦</p>
            <h2 className="text-xl font-bold text-white mb-1 text-center">Cabin Service</h2>
            <div className="text-center text-3xl font-mono font-bold text-white tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(200,217,230,0.3)]">
              {m}:{s}
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 bg-black/20 rounded-xl p-1 mb-5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                    tab === t.key ? 'bg-primary text-white' : 'text-foreground/50 hover:text-foreground/80'
                  }`}
                >
                  <span className="text-sm leading-none">{typeof t.icon === 'string' ? t.icon : t.icon}</span>
                  <span className="leading-none">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              {tab === 'tray' && (
                <motion.div key="tray" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="mx-auto mb-4 w-28 h-28"
                  >
                    <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <ellipse cx="64" cy="96" rx="52" ry="10" fill="#567C8D" opacity="0.4"/>
                      <rect x="18" y="78" width="92" height="12" rx="6" fill="#567C8D"/>
                      <rect x="28" y="44" width="30" height="34" rx="5" fill="#F5EFEB"/>
                      <rect x="30" y="46" width="26" height="30" rx="4" fill="#7a5c3e"/>
                      <path d="M58 56 Q68 56 68 63 Q68 70 58 70" stroke="#F5EFEB" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M36 40 Q38 34 36 28" stroke="#C8D9E6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                      <path d="M43 40 Q45 32 43 26" stroke="#C8D9E6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                      <path d="M50 40 Q52 34 50 28" stroke="#C8D9E6" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
                      <ellipse cx="88" cy="62" rx="20" ry="12" fill="#D4A76A" transform="rotate(-15 88 62)"/>
                      <path d="M70 70 Q78 48 88 50 Q98 48 106 56" stroke="#b8882f" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <ellipse cx="88" cy="60" rx="14" ry="8" fill="#E8BC7A" transform="rotate(-15 88 60)"/>
                      <ellipse cx="88" cy="74" rx="22" ry="5" fill="#F5EFEB" opacity="0.8"/>
                    </svg>
                  </motion.div>
                  <p className="text-sm text-foreground/70">Your meal is served. Relax and recharge.</p>
                </motion.div>
              )}

              {tab === 'fact' && (
                <motion.div key="fact" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center px-2">
                  <div className="text-4xl mb-3">🌍</div>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Did you know?</p>
                  <p className="text-base text-white font-medium leading-relaxed mb-2">{fact.fact}</p>
                  <p className="text-xs text-foreground/50">— {fact.city}</p>
                </motion.div>
              )}

              {tab === 'breathe' && (
                <motion.div key="breathe" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex flex-col items-center gap-4">
                  <div className="relative flex items-center justify-center w-36 h-36">
                    <motion.div
                      className="absolute rounded-full bg-primary/15 border border-primary/30"
                      animate={{ width: ['80px', '140px', '80px'], height: ['80px', '140px', '80px'] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="absolute rounded-full bg-primary/25"
                      animate={{ width: ['50px', '100px', '50px'], height: ['50px', '100px', '50px'] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    />
                    <motion.p
                      className="relative text-sm font-semibold text-white z-10"
                      animate={{ opacity: [1, 0.4, 1] }}
                      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      Breathe
                    </motion.p>
                  </div>
                  <p className="text-xs text-foreground/60 text-center">Inhale as the bubble expands · Exhale as it contracts</p>
                </motion.div>
              )}

              {tab === 'riddle' && (
                <motion.div key="riddle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-center px-2">
                  <div className="text-4xl mb-3">🧩</div>
                  <p className="text-base font-semibold text-white leading-relaxed mb-4">"{riddle.q}"</p>
                  <AnimatePresence mode="wait">
                    {showAnswer ? (
                      <motion.div key="ans" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-primary/15 border border-primary/30 rounded-xl px-4 py-3">
                        <p className="text-sm text-primary font-semibold">{riddle.a}</p>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="btn"
                        onClick={() => setShowAnswer(true)}
                        className="px-5 py-2 rounded-full bg-white/8 border border-white/15 text-sm text-foreground/70 hover:text-white hover:bg-white/15 transition-colors"
                      >
                        Reveal Answer
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={onDone}
              className="w-full mt-6 py-2 rounded-full text-sm font-semibold text-foreground/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              Skip Break & Resume Flight
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
