import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plane } from 'lucide-react';
import { loadPassport, isDiamondStatus } from '@/lib/passport';

interface FlightLogProps {
  onBack: () => void;
}

const STAMP_COLORS = [
  '#567C8D', '#4a8fa0', '#3d7a8a', '#2f6b7a', '#5a8e7d', '#6b7fad',
  '#7d6bae', '#ae6b8e', '#ae8e6b', '#6bae8e',
];

function PassportStampSVG({ code, date, color }: { code: string; date: string; color: string }) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="60" cy="60" r="55" fill="none" stroke={color} strokeWidth="3" strokeDasharray="6 3"/>
      <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <text x="60" y="52" textAnchor="middle" fill={color} fontSize="22" fontFamily="monospace" fontWeight="bold">
        {code}
      </text>
      <line x1="20" y1="62" x2="100" y2="62" stroke={color} strokeWidth="1.5" opacity="0.6"/>
      <text x="60" y="78" textAnchor="middle" fill={color} fontSize="9.5" fontFamily="monospace" opacity="0.9">
        FOCUS FLIGHT
      </text>
      <text x="60" y="90" textAnchor="middle" fill={color} fontSize="8" fontFamily="monospace" opacity="0.7">
        {date}
      </text>
    </svg>
  );
}

function DiamondMedallionBadge() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.3 }}
      className="relative mx-auto w-40 h-40 mb-8"
    >
      <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_24px_rgba(212,175,55,0.6)]">
        <defs>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E07F"/>
            <stop offset="40%" stopColor="#D4AF37"/>
            <stop offset="70%" stopColor="#B8860B"/>
            <stop offset="100%" stopColor="#F9E07F"/>
          </linearGradient>
          <linearGradient id="goldShimmer" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F9E07F" stopOpacity="0"/>
            <stop offset="50%" stopColor="#FFFACD" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#F9E07F" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <polygon points="80,10 140,40 150,110 80,150 10,110 20,40" fill="url(#gold)" stroke="#D4AF37" strokeWidth="2"/>
        <polygon points="80,10 140,40 150,110 80,150 10,110 20,40" fill="url(#goldShimmer)" opacity="0.5"/>
        <polygon points="80,35 115,55 122,100 80,120 38,100 45,55" fill="none" stroke="#F9E07F" strokeWidth="1.5" opacity="0.7"/>
        <text x="80" y="88" textAnchor="middle" fill="#2F4156" fontSize="28" fontFamily="serif" fontWeight="bold">💎</text>
      </svg>
    </motion.div>
  );
}

export default function FlightLog({ onBack }: FlightLogProps) {
  const passport = loadPassport();
  const diamond = isDiamondStatus(passport);
  const totalHours = (passport.totalMinutesFocused / 60).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-full p-4 md:p-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-foreground/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Back</span>
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">Flight Log</h1>
            <p className="text-foreground/60 text-sm mt-0.5">Your passport of focused journeys</p>
          </div>
          <div className="text-right glass-panel rounded-xl px-4 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-0.5">Total Focus</p>
            <p className="font-mono font-bold text-white">{totalHours} <span className="text-xs text-foreground/60">hrs</span></p>
          </div>
        </div>

        {/* Diamond Status */}
        {diamond && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel rounded-2xl p-6 mb-8 border border-yellow-400/30 text-center bg-gradient-to-br from-yellow-900/20 to-transparent"
          >
            <DiamondMedallionBadge />
            <h2 className="text-2xl font-bold text-yellow-300 mb-1">Diamond Medallion Status</h2>
            <p className="text-yellow-200/70 text-sm">You've achieved 100+ hours of focused flight. Extraordinary.</p>
          </motion.div>
        )}

        {/* Stamps grid */}
        {passport.stamps.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center">
            <Plane className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground/50 mb-2">No Stamps Yet</h3>
            <p className="text-foreground/40 text-sm">Complete a full flight to earn your first passport stamp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {passport.stamps.map((stamp, i) => (
              <motion.div
                key={stamp.id}
                initial={{ opacity: 0, scale: 0.7, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 16 }}
                className="aspect-square relative group cursor-default"
                title={`${stamp.cityName} — ${stamp.date} — ${stamp.minutesFocused} min`}
              >
                <div className={`w-full h-full ${diamond ? 'drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]' : 'drop-shadow-[0_0_8px_rgba(86,124,141,0.4)]'} group-hover:scale-105 transition-transform`}>
                  <PassportStampSVG
                    code={stamp.cityCode}
                    date={stamp.date}
                    color={diamond ? '#D4AF37' : STAMP_COLORS[i % STAMP_COLORS.length]}
                  />
                </div>
                <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    {stamp.minutesFocused}m
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats footer */}
        {passport.stamps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass-panel rounded-xl p-4 flex justify-around text-center"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Flights</p>
              <p className="font-mono font-bold text-white text-2xl">{passport.stamps.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Destinations</p>
              <p className="font-mono font-bold text-white text-2xl">
                {new Set(passport.stamps.map(s => s.cityCode)).size}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Hours</p>
              <p className="font-mono font-bold text-white text-2xl">{totalHours}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
