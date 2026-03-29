import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Check, Star } from 'lucide-react';
import { loadMiles, purchaseClass, SeatClass, CLASS_COSTS, CLASS_LABELS } from '@/lib/miles';

interface DutyFreeModalProps {
  open: boolean;
  onClose: () => void;
  onClassChange: (cls: SeatClass) => void;
}

const CLASS_INFO: Record<SeatClass, { icon: string; desc: string; perks: string[]; color: string }> = {
  economy: {
    icon: '✈️',
    desc: 'Classic Focus Flight experience',
    perks: ['Navy & Beige theme', 'Standard cabin sound', 'Core features'],
    color: 'border-white/20',
  },
  business: {
    icon: '🍸',
    desc: 'Sleek midnight glassmorphism upgrade',
    perks: ['Midnight dark mode', 'Cocktail lounge icon', 'Enhanced ambiance'],
    color: 'border-blue-400/40',
  },
  first: {
    icon: '👑',
    desc: 'Private suite in gold and navy',
    perks: ['Gold & Navy palette', 'Priority landing sound', 'Lo-fi piano ambiance', 'Premium shimmer effects'],
    color: 'border-yellow-400/50',
  },
};

export default function DutyFreeModal({ open, onClose, onClassChange }: DutyFreeModalProps) {
  const [milesData, setMilesData] = useState(loadMiles());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (open) setMilesData(loadMiles());
  }, [open]);

  const handlePurchase = (cls: SeatClass) => {
    if (cls === 'economy') {
      const updated = loadMiles();
      updated.seatClass = 'economy';
      import('@/lib/miles').then(m => m.saveMiles(updated));
      setMilesData({ ...updated });
      onClassChange('economy');
      setFlash('economy');
      return;
    }
    const result = purchaseClass(cls);
    if (result.success) {
      setMilesData(result.data);
      onClassChange(cls);
      setFlash(cls);
    } else {
      setFlash('insufficient');
      setTimeout(() => setFlash(null), 2000);
    }
  };

  const classes: SeatClass[] = ['economy', 'business', 'first'];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={e => e.stopPropagation()}
            className="bg-[hsl(212,29%,16%)] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-primary tracking-[0.2em] uppercase">Duty-Free Shop</span>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-foreground/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Seat Upgrades</h2>

            {/* Miles balance */}
            <div className="flex items-center gap-2 mb-6 bg-white/5 rounded-xl px-4 py-2.5 border border-white/10">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <span className="text-sm text-foreground/70">Your Balance:</span>
              <span className="font-mono font-bold text-yellow-300 ml-auto">{milesData.balance.toLocaleString()} miles</span>
            </div>

            {/* Error flash */}
            <AnimatePresence>
              {flash === 'insufficient' && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-xl px-4 py-2 text-center"
                >
                  Not enough miles for this upgrade.
                </motion.div>
              )}
            </AnimatePresence>

            {/* Class cards */}
            <div className="space-y-3">
              {classes.map(cls => {
                const info = CLASS_INFO[cls];
                const cost = CLASS_COSTS[cls];
                const owned = milesData.seatClass === cls;
                const canAfford = milesData.balance >= cost || cost === 0;
                const justPurchased = flash === cls;

                return (
                  <div
                    key={cls}
                    className={`rounded-2xl border p-4 transition-all ${info.color} ${owned ? 'bg-white/8' : 'bg-white/3 hover:bg-white/5'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{info.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-white text-sm">{CLASS_LABELS[cls]}</span>
                          {cost === 0 ? (
                            <span className="text-xs text-green-400 font-semibold">Free</span>
                          ) : (
                            <span className={`text-xs font-mono font-bold ${canAfford ? 'text-yellow-300' : 'text-foreground/40'}`}>
                              {cost.toLocaleString()} mi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/60 mb-2">{info.desc}</p>
                        <ul className="space-y-0.5">
                          {info.perks.map(p => (
                            <li key={p} className="flex items-center gap-1.5 text-[11px] text-foreground/70">
                              <Check className="w-3 h-3 text-primary flex-shrink-0" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex-shrink-0">
                        {owned ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePurchase(cls)}
                            disabled={!canAfford}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                              canAfford
                                ? 'bg-primary text-white hover:bg-primary/80'
                                : 'bg-white/5 text-foreground/30 cursor-not-allowed'
                            } ${justPurchased ? 'scale-95' : ''}`}
                          >
                            {justPurchased ? '✓' : 'Select'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-[11px] text-foreground/40 mt-4">Earn 10 miles per minute of focus</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
