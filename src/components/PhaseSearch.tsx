import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlaneTakeoff, Plane, Clock } from 'lucide-react';
import { cities, City, BreakSchedule, calculateFlightDuration, generateFlightNumber, generateGate } from '@/lib/flight-data';
import type { FlightPlan } from '@/lib/flight-data';

interface PhaseSearchProps {
  onComplete: (plan: FlightPlan) => void;
}

export default function PhaseSearch({ onComplete }: PhaseSearchProps) {
  const [departure, setDeparture] = useState<City>(cities[0]);
  const [destination, setDestination] = useState<City>(cities[1]);
  const [breakSchedule, setBreakSchedule] = useState<BreakSchedule>('none');

  // Particle background effect
  useEffect(() => {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(particle);
    }

    return () => {
      if (container) container.innerHTML = '';
    };
  }, []);

  const handleCalculate = () => {
    const durationMinutes = calculateFlightDuration(departure, destination);
    
    onComplete({
      departure,
      destination,
      breakSchedule,
      durationMinutes,
      flightNumber: generateFlightNumber(),
      gate: generateGate(),
      seat: '1A'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      <div id="particles-container" className="particles" />

      <div className="z-10 text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20"
        >
          <Plane className="w-10 h-10 text-white" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
        >
          Focus Flight
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-lg md:text-xl text-foreground font-light tracking-wide max-w-md mx-auto"
        >
          Elevate Your Focus. One Flight at a Time.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="z-10 w-full max-w-lg glass-panel rounded-3xl p-6 md:p-8"
      >
        <div className="space-y-6">
          {/* Routing Selection */}
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2 pl-1">Departure</label>
              <select 
                className="w-full bg-input/50 border border-border/50 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                value={departure.code}
                onChange={(e) => setDeparture(cities.find(c => c.code === e.target.value) || cities[0])}
              >
                {cities.map(c => <option key={c.code} value={c.code} className="bg-background">{c.name} ({c.code})</option>)}
              </select>
            </div>

            <div className="absolute left-8 top-[48%] transform -translate-y-1/2 w-0.5 h-12 bg-border/50 hidden md:block"></div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-2 pl-1">Destination</label>
              <select 
                className="w-full bg-input/50 border border-border/50 text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                value={destination.code}
                onChange={(e) => setDestination(cities.find(c => c.code === e.target.value) || cities[1])}
              >
                {cities.map(c => <option key={c.code} value={c.code} className="bg-background">{c.name} ({c.code})</option>)}
              </select>
            </div>
          </div>

          {/* Break Schedule */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground/80 uppercase tracking-wider mb-3 pl-1">
              <Clock className="w-3.5 h-3.5" /> Break Schedule
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'No Breaks' },
                { id: 'short', label: 'Short Layover', sub: '5m/hr' },
                { id: 'long', label: 'Long Layover', sub: '10m/hr' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBreakSchedule(option.id as BreakSchedule)}
                  className={`
                    flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200
                    ${breakSchedule === option.id 
                      ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(86,124,141,0.2)] text-white' 
                      : 'bg-input/20 border-border/30 text-foreground hover:bg-input/40'}
                  `}
                >
                  <span className="font-medium text-sm">{option.label}</span>
                  {option.sub && <span className="text-[10px] opacity-70 mt-0.5">{option.sub}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="pt-4">
            <button
              onClick={handleCalculate}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-lg py-4 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <PlaneTakeoff className="w-5 h-5" />
              Calculate Flight
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
