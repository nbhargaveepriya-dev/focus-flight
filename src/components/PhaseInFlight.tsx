import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Volume2, VolumeX, AlertTriangle, Coffee, ShoppingBag, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cabinAudio } from '@/lib/gameAudio';
import CabinServiceModal from '@/components/CabinServiceModal';
import TurbulenceOverlay from '@/components/TurbulenceOverlay';
import CargoManifest from '@/components/CargoManifest';
import DutyFreeModal from '@/components/DutyFreeModal';
import type { FlightPlan } from '@/lib/flight-data';
import type { CargoItem, SeatClass } from '@/lib/miles';
import { loadMiles, addMiles, deductMiles } from '@/lib/miles';

interface PhaseInFlightProps {
  plan: FlightPlan;
  tasks: CargoItem[];
  seatClass: SeatClass;
  onEnd: (stats: { actualMinutes: number; completed: boolean; tasks: CargoItem[]; milesEarned: number }) => void;
}

function getTimeMode(): 'day' | 'night' {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? 'day' : 'night';
}

const CLASS_CONTAINER: Record<SeatClass, string> = {
  economy: '',
  business: 'flight-business',
  first: 'flight-first',
};

export default function PhaseInFlight({ plan, tasks: initialTasks, seatClass, onEnd }: PhaseInFlightProps) {
  const totalSeconds = plan.durationMinutes * 60;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isLayover, setIsLayover] = useState(false);
  const [layoverRemaining, setLayoverRemaining] = useState(0);
  const [cabinServiceOpen, setCabinServiceOpen] = useState(false);
  const [turbulence, setTurbulence] = useState(false);
  const [timeMode] = useState<'day' | 'night'>(getTimeMode);
  const [tasks, setTasks] = useState<CargoItem[]>(initialTasks);
  const [dutyFreeOpen, setDutyFreeOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState<SeatClass>(seatClass);
  const [milesEarned, setMilesEarned] = useState(0);
  const [miles, setMiles] = useState(loadMiles().balance);
  const [toast, setToast] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const turbulenceRef = useRef(false);
  const turbulenceStartRef = useRef<number>(0);
  const lastPomodoroTrigger = useRef(-1);
  const lastMinute = useRef(-1);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    return () => {
      cabinAudio.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    cabinAudio.playChime();
    cabinAudio.setClass(currentClass);
  }, []);

  useEffect(() => {
    cabinAudio.setClass(currentClass);
    setMiles(loadMiles().balance);
  }, [currentClass]);

  // Turbulence via visibilityState
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        setTurbulence(true);
        turbulenceRef.current = true;
        turbulenceStartRef.current = Date.now();
        pausedRef.current = true;
        cabinAudio.setTurbulence(true);
        cabinAudio.playWindGust();
        document.body.classList.add('turbulence');
      } else {
        setTurbulence(false);
        turbulenceRef.current = false;
        document.body.classList.remove('turbulence');
        pausedRef.current = false;
        cabinAudio.setTurbulence(false);
        // Penalty: lose 1 mile per second of turbulence
        const turbSecs = Math.floor((Date.now() - turbulenceStartRef.current) / 1000);
        if (turbSecs > 0) {
          const penalty = turbSecs; // 1 mile per second = 60 miles/min penalty
          const updated = deductMiles(penalty);
          setMiles(updated.balance);
          setMilesEarned(prev => Math.max(0, prev - penalty));
          showToast(`⚡ Turbulence penalty: −${penalty} miles`);
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      document.body.classList.remove('turbulence');
    };
  }, [showToast]);

  // Main timer
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (pausedRef.current || cabinServiceOpen) return;

      setElapsedSeconds(prev => {
        const next = prev + 1;

        // Miles: earn 10 per minute of focused time
        const currentMinute = Math.floor(next / 60);
        if (currentMinute > lastMinute.current && currentMinute > 0) {
          lastMinute.current = currentMinute;
          const updated = addMiles(10);
          setMiles(updated.balance);
          setMilesEarned(p => p + 10);
        }

        // Pomodoro: every 25 minutes trigger cabin service
        const pomodoroBlock = Math.floor(next / (25 * 60));
        if (pomodoroBlock > 0 && pomodoroBlock !== lastPomodoroTrigger.current && next % (25 * 60) === 0) {
          lastPomodoroTrigger.current = pomodoroBlock;
          pausedRef.current = true;
          setCabinServiceOpen(true);
        }

        // Legacy layover logic
        if (plan.breakSchedule !== 'none' && !isLayover) {
          const hourCycle = next % 3600;
          const focusLimit = plan.breakSchedule === 'short' ? 3300 : 3000;
          const layoverDuration = plan.breakSchedule === 'short' ? 300 : 600;
          if (hourCycle === focusLimit && next < totalSeconds) {
            setIsLayover(true);
            setLayoverRemaining(layoverDuration);
            return prev;
          }
        }

        if (next >= totalSeconds) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleLand(true, next);
        }
        return next;
      });
    }, 1000);

    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [plan.breakSchedule, isLayover, totalSeconds, cabinServiceOpen]);

  // Layover timer
  useEffect(() => {
    let id: number;
    if (isLayover && layoverRemaining > 0) {
      id = window.setInterval(() => {
        setLayoverRemaining(prev => {
          if (prev <= 1) { setIsLayover(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (id) clearInterval(id); };
  }, [isLayover, layoverRemaining]);

  const handleCabinServiceDone = () => {
    setCabinServiceOpen(false);
    pausedRef.current = false;
  };

  const handleLand = (completed: boolean, finalElapsed: number) => {
    cabinAudio.stop();
    setIsAudioOn(false);
    if (completed) {
      if (currentClass === 'first') {
        cabinAudio.playPriorityLanding();
      } else {
        cabinAudio.playChime();
      }
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.3 }, colors: ['#567C8D', '#C8D9E6', '#FFFFFF'] });
    }
    const earned = milesEarned;
    setTimeout(() => {
      onEnd({ actualMinutes: Math.floor(finalElapsed / 60), completed, tasks, milesEarned: earned });
    }, 1500);
  };

  const handleCargoToggle = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t);
      const item = prev.find(t => t.id === id);
      if (item && !item.checked) {
        showToast(`✅ Cargo delivered: "${item.text}"`);
      }
      return updated;
    });
  };

  const toggleAudio = () => {
    const active = cabinAudio.toggle();
    setIsAudioOn(active);
  };

  const remainingMainSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const progressPercent = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextPomodoroSeconds = 25 * 60 - (elapsedSeconds % (25 * 60));

  const classLabel: Record<SeatClass, string> = { economy: '', business: '🍸 Business', first: '👑 First Class' };

  return (
    <>
      <TurbulenceOverlay active={turbulence} />
      <CabinServiceModal open={cabinServiceOpen} onDone={handleCabinServiceDone} />
      <DutyFreeModal open={dutyFreeOpen} onClose={() => setDutyFreeOpen(false)} onClassChange={cls => setCurrentClass(cls)} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: -10, x: '-50%' }}
            className="fixed bottom-28 left-1/2 z-[60] bg-[hsl(212,29%,20%)] border border-white/15 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className={`relative min-h-screen w-full flex flex-col justify-between overflow-hidden ${CLASS_CONTAINER[currentClass]}`}
      >
        {/* Dynamic background */}
        {currentClass === 'first' ? (
          <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(135deg, #1a1200 0%, #2F4156 40%, #1e2d40 100%)' }}>
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(1px 1px at 20% 30%, rgba(212,175,55,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 60% 20%, rgba(212,175,55,0.6) 0%, transparent 100%), radial-gradient(2px 2px at 80% 60%, rgba(212,175,55,0.7) 0%, transparent 100%), radial-gradient(1px 1px at 40% 70%, rgba(212,175,55,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 90% 40%, rgba(212,175,55,0.6) 0%, transparent 100%)' }}></div>
            <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(212,175,55,0.15) 0%, transparent 70%)' }}></div>
            <div className="absolute inset-0 bg-background/40"></div>
          </div>
        ) : currentClass === 'business' ? (
          <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #070d18 0%, #0e1a2e 50%, #1a2540 100%)' }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(ellipse at 30% 20%, rgba(86,124,141,0.5) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(47,65,86,0.4) 0%, transparent 50%)' }}></div>
          </div>
        ) : timeMode === 'day' ? (
          <>
            <div className="absolute inset-0 z-0 day-sky-bg">
              <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <g className="clouds-slow">
                  <ellipse cx="15%" cy="25%" rx="12%" ry="5%" fill="white" opacity="0.6"/>
                  <ellipse cx="18%" cy="22%" rx="8%" ry="4%" fill="white" opacity="0.5"/>
                  <ellipse cx="55%" cy="35%" rx="14%" ry="5%" fill="white" opacity="0.55"/>
                  <ellipse cx="82%" cy="20%" rx="10%" ry="4%" fill="white" opacity="0.5"/>
                </g>
                <g className="clouds-fast" style={{ animationDelay: '-15s' }}>
                  <ellipse cx="35%" cy="60%" rx="11%" ry="4%" fill="white" opacity="0.4"/>
                  <ellipse cx="70%" cy="70%" rx="13%" ry="5%" fill="white" opacity="0.4"/>
                </g>
              </svg>
            </div>
            <div className="absolute inset-0 bg-background/60 z-0"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #0d1b2e 0%, #1a2f4a 40%, #2F4156 100%)' }}>
              <div className="stars-bg absolute inset-0"></div>
              <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(86,124,141,0.25) 0%, transparent 70%)' }}></div>
            </div>
            <div className="absolute inset-0 bg-background/40 z-0"></div>
          </>
        )}

        {/* Top Bar */}
        <header className="z-10 w-full p-5 flex justify-between items-start gap-4">
          <div>
            <h2 className="text-3xl font-light text-white tracking-widest">
              {plan.departure.code} <span className="opacity-50 text-xl mx-2">✈</span> {plan.destination.code}
            </h2>
            <p className="text-sm font-bold text-primary mt-1 tracking-widest uppercase">Flight {plan.flightNumber}</p>
            {currentClass !== 'economy' && (
              <p className="text-xs mt-1 font-semibold" style={{ color: currentClass === 'first' ? '#D4AF37' : '#93c5fd' }}>
                {classLabel[currentClass]}
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLayover || cabinServiceOpen ? 'bg-orange-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLayover || cabinServiceOpen ? 'bg-orange-500' : 'bg-green-500'}`}></span>
              </span>
              <span className="text-xs font-bold text-white tracking-widest">
                {cabinServiceOpen ? 'DINING' : isLayover ? 'LAYOVER' : 'CRUISING'}
              </span>
            </div>
            {/* Miles display */}
            <button
              onClick={() => setDutyFreeOpen(true)}
              className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
              <span className="text-xs font-mono font-bold text-yellow-300">{miles.toLocaleString()}</span>
              <ShoppingBag className="w-3.5 h-3.5 text-foreground/60" />
            </button>
            <p className="text-xs font-mono text-foreground/50">ALT: 35,000 FT</p>
          </div>
        </header>

        {/* Center Timer */}
        <main className="z-10 flex-1 flex flex-col items-center justify-center p-4">
          <AnimatePresence mode="wait">
            {isLayover ? (
              <motion.div key="layover" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <div className="mb-6 bg-orange-500/20 text-orange-200 px-6 py-2 rounded-full flex items-center gap-3 border border-orange-500/30">
                  <Coffee className="w-5 h-5" />
                  <span className="font-bold tracking-widest uppercase text-sm">Layover in Progress</span>
                </div>
                <div className="text-7xl md:text-9xl font-mono font-bold text-orange-400 tracking-tighter drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                  {formatTime(layoverRemaining)}
                </div>
              </motion.div>
            ) : (
              <motion.div key="focus" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                <p className="mb-4 text-foreground/60 font-bold tracking-widest uppercase text-sm">Time Remaining</p>
                <div
                  className="text-7xl md:text-9xl font-mono font-bold text-white tracking-tighter"
                  style={{ textShadow: currentClass === 'first' ? '0 0 40px rgba(212,175,55,0.5)' : '0 0 40px rgba(200,217,230,0.4)' }}
                >
                  {formatTime(remainingMainSeconds)}
                </div>
                <div className="mt-8 flex gap-10">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1">Next Service</p>
                    <p className="font-mono text-lg text-foreground">{formatTime(nextPomodoroSeconds)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-foreground/50 mb-1">Miles This Flight</p>
                    <p className="font-mono text-lg text-yellow-300">+{milesEarned}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="z-10 w-full p-5 pb-8 bg-gradient-to-t from-background/90 to-transparent pt-12">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Progress Track */}
            <div className="relative px-4">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: currentClass === 'first' ? 'linear-gradient(90deg, #B8860B, #D4AF37)' : 'hsl(var(--primary))' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ ease: 'linear', duration: 1 }}
                />
              </div>
              <motion.div
                className="absolute top-1/2 -mt-3 -ml-3 text-white drop-shadow-md"
                initial={{ left: '16px' }}
                animate={{ left: `calc(${progressPercent}% + 16px)` }}
                transition={{ ease: 'linear', duration: 1 }}
              >
                <Plane className="w-6 h-6 rotate-90" fill="currentColor" />
              </motion.div>
              <div className="flex justify-between mt-3 px-1">
                <span className="text-xs font-bold text-foreground/50 tracking-widest">{plan.departure.code}</span>
                <span className="text-xs font-bold text-foreground/50 tracking-widest">{plan.destination.code}</span>
              </div>
            </div>

            {/* Cargo Manifest */}
            <CargoManifest items={tasks} onToggle={handleCargoToggle} />

            {/* Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={toggleAudio}
                className={`flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-300 border ${
                  isAudioOn ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(86,124,141,0.3)]' : 'bg-white/5 border-white/10 text-foreground/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isAudioOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="text-sm font-semibold tracking-wide hidden sm:inline">
                  {currentClass === 'first' ? 'Piano Suite' : currentClass === 'business' ? 'Lounge Sound' : 'Cabin Sound'}
                </span>
              </button>
              <button
                onClick={() => handleLand(false, elapsedSeconds)}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-destructive/50 text-destructive-foreground hover:bg-destructive hover:border-destructive transition-all duration-300"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-bold tracking-widest uppercase hidden sm:inline">End Flight Early</span>
              </button>
            </div>
          </div>
        </footer>

        <style>{`
          .day-sky-bg { background: linear-gradient(180deg, #87CEEB 0%, #b0e0f5 40%, #d0eef8 70%, #C8D9E6 100%); }
          @keyframes cloudDrift { from { transform: translateX(0); } to { transform: translateX(-30%); } }
          .clouds-slow { animation: cloudDrift 90s linear infinite; }
          .clouds-fast { animation: cloudDrift 55s linear infinite; }
          .stars-bg {
            background-image:
              radial-gradient(1px 1px at 10% 15%, rgba(200,217,230,0.9) 0%, transparent 100%),
              radial-gradient(1px 1px at 25% 40%, rgba(200,217,230,0.7) 0%, transparent 100%),
              radial-gradient(2px 2px at 40% 10%, rgba(200,217,230,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 55% 55%, rgba(200,217,230,0.9) 0%, transparent 100%),
              radial-gradient(2px 2px at 80% 70%, rgba(200,217,230,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 35% 65%, rgba(200,217,230,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 85% 15%, rgba(200,217,230,0.8) 0%, transparent 100%);
            animation: twinkle 4s ease-in-out infinite;
          }
          @keyframes twinkle { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
          .flight-business { filter: saturate(0.85) brightness(0.95); }
        `}</style>
      </motion.div>
    </>
  );
}
