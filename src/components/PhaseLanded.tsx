import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, MapPin, RefreshCw, BookOpen, Package, Star, CheckCircle2, Clock } from 'lucide-react';
import { addStamp, isDiamondStatus, loadPassport } from '@/lib/passport';
import { cabinAudio } from '@/lib/gameAudio';
import type { FlightPlan } from '@/lib/flight-data';
import type { CargoItem } from '@/lib/miles';

interface PhaseLandedProps {
  plan: FlightPlan;
  stats: { actualMinutes: number; completed: boolean; tasks: CargoItem[]; milesEarned: number };
  onRestart: () => void;
  onFlightLog: () => void;
}

export default function PhaseLanded({ plan, stats, onRestart, onFlightLog }: PhaseLandedProps) {
  const [diamond, setDiamond] = useState(false);
  const [stampAdded, setStampAdded] = useState(false);

  const completedTasks = stats.tasks.filter(t => t.checked);
  const pendingTasks = stats.tasks.filter(t => !t.checked);
  const allDelivered = pendingTasks.length === 0;

  useEffect(() => {
    if (stats.completed && !stampAdded) {
      setStampAdded(true);
      const updated = addStamp(
        plan.destination.code,
        plan.destination.name,
        plan.flightNumber,
        stats.actualMinutes
      );
      setDiamond(isDiamondStatus(updated));
      cabinAudio.playChime();
    } else {
      const passport = loadPassport();
      setDiamond(isDiamondStatus(passport));
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen w-full flex items-center justify-center p-4 ${diamond ? 'diamond-theme' : ''}`}
    >
      <div className="w-full max-w-lg glass-panel rounded-3xl p-8 relative overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] rounded-full z-0 ${
          diamond ? 'bg-yellow-400/30' : stats.completed ? 'bg-primary/40' : 'bg-orange-500/20'
        }`}></div>

        <div className="relative z-10">
          {/* Icon */}
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto rounded-full bg-background/50 border border-white/10 flex items-center justify-center mb-6 shadow-xl"
          >
            {stats.completed ? (
              <MapPin className={`w-10 h-10 ${diamond ? 'text-yellow-400' : 'text-primary'}`} />
            ) : (
              <Award className="w-10 h-10 text-foreground/50" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className={`text-4xl font-bold mb-2 tracking-tight text-center ${diamond ? 'text-yellow-300' : 'text-white'}`}
          >
            {stats.completed ? "You've Landed! 🎉" : 'Flight Diverted'}
          </motion.h2>

          {diamond && stats.completed && (
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
              className="text-yellow-400/80 text-sm font-semibold mb-2 tracking-widest uppercase text-center"
            >
              ✦ Diamond Medallion Status ✦
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-foreground/80 font-light mb-6 text-center"
          >
            {stats.completed
              ? `Welcome to ${plan.destination.name}. Passport stamp earned!`
              : `You safely landed early. Sometimes weather conditions require it.`}
          </motion.p>

          {/* Flight Stats */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 }}
            className="bg-black/20 rounded-2xl p-5 border border-white/5 mb-4"
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Focus Time</p>
                <p className="text-2xl font-mono text-white">{stats.actualMinutes}<span className="text-xs font-sans text-foreground/60 ml-1">MIN</span></p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1">Route</p>
                <p className="text-lg font-bold text-white mt-0.5">{plan.departure.code} → {plan.destination.code}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 mb-1 flex items-center justify-center gap-1"><Star className="w-3 h-3 text-yellow-400" fill="currentColor" />Miles</p>
                <p className="text-2xl font-mono text-yellow-300">+{stats.milesEarned}</p>
              </div>
            </div>
          </motion.div>

          {/* Black Box Report — Cargo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="bg-black/25 border border-white/8 rounded-2xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-foreground/60" />
              <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">Black Box Report</span>
              <span className="ml-auto text-xs text-foreground/40 font-mono">CARGO</span>
            </div>

            {allDelivered ? (
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                All cargo delivered successfully.
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-orange-300 text-sm font-semibold mb-2">
                  <Clock className="w-4 h-4" />
                  Flight arrived, but cargo was delayed.
                </div>
                <ul className="space-y-1">
                  {pendingTasks.map(t => (
                    <li key={t.id} className="flex items-center gap-2 text-xs text-foreground/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400/60 flex-shrink-0"></span>
                      {t.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <p className="text-xs text-foreground/40">
                  {completedTasks.length} item{completedTasks.length !== 1 ? 's' : ''} delivered in-flight
                </p>
              </div>
            )}
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {stats.completed && (
              <motion.button
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
                onClick={onFlightLog}
                className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border ${
                  diamond
                    ? 'border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10'
                    : 'border-primary/50 text-primary hover:bg-primary/10'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                View Flight Log
              </motion.button>
            )}
            <motion.button
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}
              onClick={onRestart}
              className="w-full bg-white text-background hover:bg-foreground font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Book Another Flight
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
