import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, QrCode, Plus, X, Package, AlertCircle } from 'lucide-react';
import { speakCaptainAnnouncement } from '@/lib/gameAudio';
import type { FlightPlan } from '@/lib/flight-data';
import type { CargoItem } from '@/lib/miles';

interface PhaseBoardingProps {
  plan: FlightPlan;
  onBoard: (tasks: CargoItem[]) => void;
  onCancel: () => void;
}

export default function PhaseBoarding({ plan, onBoard, onCancel }: PhaseBoardingProps) {
  const [tasks, setTasks] = useState<CargoItem[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [showCargoError, setShowCargoError] = useState(false);

  const formattedTimes = useMemo(() => {
    const now = new Date();
    const endTime = new Date(now.getTime() + plan.durationMinutes * 60000);
    return {
      dep: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      arr: endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
    };
  }, [plan.durationMinutes]);

  const durationStr = `${Math.floor(plan.durationMinutes / 60)}H ${plan.durationMinutes % 60}M`;

  const addTask = () => {
    const text = taskInput.trim();
    if (!text) return;
    setTasks(prev => [...prev, { id: `cargo-${Date.now()}`, text, checked: false }]);
    setTaskInput('');
    setShowCargoError(false);
  };

  const removeTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const handleBeginBoarding = () => {
    if (tasks.length === 0) { setShowCargoError(true); return; }
    speakCaptainAnnouncement(plan.destination.name);
    onBoard(tasks);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -100, rotateY: -10 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8"
    >
      <div className="w-full max-w-3xl space-y-6">

        {/* Boarding Pass */}
        <div className="flex flex-col md:flex-row w-full bg-[hsl(var(--boarding-pass))] rounded-3xl text-[hsl(var(--boarding-pass-foreground))] shadow-2xl overflow-hidden">
          <div className="flex-1 p-6 md:p-8">
            <div className="flex justify-between items-start border-b-2 border-[hsl(var(--boarding-pass-foreground))/0.1] pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">FOCUS FLIGHT</h2>
                  <p className="text-xs font-semibold opacity-60 uppercase tracking-widest">Boarding Pass</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold opacity-60 uppercase tracking-widest mb-1">Class</p>
                <p className="text-lg font-bold text-primary">FOCUS CLASS</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold opacity-60 uppercase tracking-widest mb-1">Passenger Name</p>
              <p className="text-xl font-mono font-bold tracking-wider">STUDENT</p>
            </div>

            <div className="flex items-center justify-between mb-8 px-2">
              <div className="text-center">
                <p className="text-5xl font-light tracking-tighter mb-1">{plan.departure.code}</p>
                <p className="text-sm font-semibold opacity-70">{plan.departure.name}</p>
                <p className="text-xs font-bold mt-2 bg-[hsl(var(--boarding-pass-foreground))/0.1] px-2 py-1 rounded">{formattedTimes.dep}</p>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                <div className="w-full border-t-2 border-dashed border-[hsl(var(--boarding-pass-foreground))/0.3] absolute top-1/2 -translate-y-1/2"></div>
                <Plane className="w-6 h-6 text-primary relative z-10 bg-[hsl(var(--boarding-pass))] px-1" />
                <p className="text-xs font-bold mt-4 tracking-widest opacity-80">{durationStr}</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-light tracking-tighter mb-1">{plan.destination.code}</p>
                <p className="text-sm font-semibold opacity-70">{plan.destination.name}</p>
                <p className="text-xs font-bold mt-2 bg-[hsl(var(--boarding-pass-foreground))/0.1] px-2 py-1 rounded">{formattedTimes.arr}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 bg-[hsl(var(--boarding-pass-foreground))/0.05] p-4 rounded-xl">
              <div><p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Flight</p><p className="font-mono font-bold text-lg">{plan.flightNumber}</p></div>
              <div><p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Date</p><p className="font-mono font-bold text-sm mt-1">{formattedTimes.date}</p></div>
              <div><p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Gate</p><p className="font-mono font-bold text-lg">{plan.gate}</p></div>
              <div><p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Seat</p><p className="font-mono font-bold text-lg">{plan.seat}</p></div>
            </div>
          </div>

          <div className="hidden md:flex w-8 relative justify-center">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-background z-10"></div>
            <div className="h-full w-full tear-line mx-auto"></div>
            <div className="absolute -bottom-4 w-8 h-8 rounded-full bg-background z-10"></div>
          </div>

          <div className="md:hidden h-8 relative flex items-center">
            <div className="absolute -left-4 w-8 h-8 rounded-full bg-background z-10"></div>
            <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--boarding-pass-foreground)/0.3) 50%, transparent 50%)', backgroundSize: '14px 2px', backgroundRepeat: 'repeat-x', backgroundPosition: 'center' }}></div>
            <div className="absolute -right-4 w-8 h-8 rounded-full bg-background z-10"></div>
          </div>

          <div className="md:w-64 p-6 md:p-8 flex flex-col justify-between bg-[hsl(var(--boarding-pass-foreground))/0.03]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg tracking-widest">STUB</h3>
                <QrCode className="w-6 h-6 opacity-40" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between"><p className="text-xs font-bold opacity-60 uppercase tracking-widest">Flight</p><p className="font-mono font-bold">{plan.flightNumber}</p></div>
                <div className="flex justify-between"><p className="text-xs font-bold opacity-60 uppercase tracking-widest">Seat</p><p className="font-mono font-bold">{plan.seat}</p></div>
                <div className="flex justify-between"><p className="text-xs font-bold opacity-60 uppercase tracking-widest">Cargo</p><p className="font-mono font-bold text-xs mt-0.5">{tasks.length} ITEM{tasks.length !== 1 ? 'S' : ''}</p></div>
              </div>
            </div>
            <div className="mt-8 h-16 w-full barcode-bg opacity-70"></div>
          </div>
        </div>

        {/* Cargo Manifest entry */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground/90 uppercase tracking-wider">Cargo Manifest</span>
            <span className="text-xs text-foreground/50 ml-auto">Add tasks to check off during your flight</span>
          </div>

          <AnimatePresence>
            {showCargoError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2 mb-3 text-sm text-red-300"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Add at least one cargo item before boarding.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTask(); }}
              placeholder="e.g. Finish Chapter 3, Write report outline…"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
            />
            <button
              onClick={addTask}
              disabled={!taskInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <AnimatePresence>
            {tasks.length > 0 && (
              <motion.ul className="space-y-1.5" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
                {tasks.map((task, i) => (
                  <motion.li
                    key={task.id}
                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-3 py-2"
                  >
                    <span className="text-xs font-mono text-foreground/40 w-4">{i + 1}</span>
                    <span className="flex-1 text-sm text-foreground/90">{task.text}</span>
                    <button onClick={() => removeTask(task.id)} className="text-foreground/30 hover:text-red-400 transition-colors p-0.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onCancel} className="px-8 py-3 rounded-xl font-semibold text-foreground/80 hover:text-white hover:bg-white/10 transition-colors">
            Cancel Booking
          </button>
          <button
            onClick={handleBeginBoarding}
            className="px-10 py-4 rounded-xl font-bold bg-primary text-white shadow-[0_0_20px_rgba(86,124,141,0.4)] hover:shadow-[0_0_30px_rgba(86,124,141,0.6)] hover:-translate-y-1 transition-all duration-300 text-lg uppercase tracking-wider flex items-center justify-center gap-2"
          >
            Begin Boarding
            <Plane className="w-5 h-5 ml-2" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
