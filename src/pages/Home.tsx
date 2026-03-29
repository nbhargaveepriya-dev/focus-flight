import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import PhaseSearch from '@/components/PhaseSearch';
import PhaseBoarding from '@/components/PhaseBoarding';
import PhaseInFlight from '@/components/PhaseInFlight';
import PhaseLanded from '@/components/PhaseLanded';
import FlightLog from '@/components/FlightLog';
import type { FlightPlan } from '@/lib/flight-data';
import type { CargoItem, SeatClass } from '@/lib/miles';
import { loadMiles } from '@/lib/miles';

type AppPhase = 'search' | 'boarding' | 'inflight' | 'landed' | 'flightlog';

const CLASS_ROOT: Record<SeatClass, string> = {
  economy: '',
  business: 'theme-business',
  first: 'theme-first',
};

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('search');
  const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
  const [flightStats, setFlightStats] = useState<{ actualMinutes: number; completed: boolean; tasks: CargoItem[]; milesEarned: number } | null>(null);
  const [prevPhase, setPrevPhase] = useState<AppPhase>('search');
  const [tasks, setTasks] = useState<CargoItem[]>([]);
  const [seatClass, setSeatClass] = useState<SeatClass>(() => loadMiles().seatClass);

  // Sync class from localStorage in case it was updated in duty-free
  useEffect(() => {
    const refresh = () => setSeatClass(loadMiles().seatClass);
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const handleFlightPlanned = (plan: FlightPlan) => {
    setFlightPlan(plan);
    setSeatClass(loadMiles().seatClass);
    setPhase('boarding');
  };

  const handleBoarding = (boardingTasks: CargoItem[]) => {
    setTasks(boardingTasks);
    setPhase('inflight');
  };

  const handleCancel = () => {
    setFlightPlan(null);
    setTasks([]);
    setPhase('search');
  };

  const handleEndFlight = (stats: { actualMinutes: number; completed: boolean; tasks: CargoItem[]; milesEarned: number }) => {
    setFlightStats(stats);
    setPhase('landed');
  };

  const handleRestart = () => {
    setFlightPlan(null);
    setFlightStats(null);
    setTasks([]);
    setSeatClass(loadMiles().seatClass);
    setPhase('search');
  };

  const handleFlightLog = () => {
    setPrevPhase(phase);
    setPhase('flightlog');
  };

  const handleBackFromLog = () => setPhase(prevPhase === 'flightlog' ? 'search' : prevPhase);

  return (
    <div className={`min-h-screen bg-background text-foreground overflow-hidden selection:bg-primary selection:text-white ${CLASS_ROOT[seatClass]}`}>

      {phase === 'search' && (
        <button
          onClick={handleFlightLog}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-foreground/70 hover:text-white hover:bg-white/10 transition-colors text-sm backdrop-blur-md"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline font-medium">Flight Log</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === 'search' && (
          <PhaseSearch key="search" onComplete={handleFlightPlanned} />
        )}

        {phase === 'boarding' && flightPlan && (
          <PhaseBoarding key="boarding" plan={flightPlan} onBoard={handleBoarding} onCancel={handleCancel} />
        )}

        {phase === 'inflight' && flightPlan && (
          <PhaseInFlight key="inflight" plan={flightPlan} tasks={tasks} seatClass={seatClass} onEnd={handleEndFlight} />
        )}

        {phase === 'landed' && flightPlan && flightStats && (
          <PhaseLanded
            key="landed"
            plan={flightPlan}
            stats={flightStats}
            onRestart={handleRestart}
            onFlightLog={handleFlightLog}
          />
        )}

        {phase === 'flightlog' && (
          <FlightLog key="flightlog" onBack={handleBackFromLog} />
        )}
      </AnimatePresence>
    </div>
  );
}
