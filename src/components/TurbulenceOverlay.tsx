import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cabinAudio } from '@/lib/gameAudio';

interface TurbulenceOverlayProps {
  active: boolean;
}

export default function TurbulenceOverlay({ active }: TurbulenceOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(active);
    if (active) {
      cabinAudio.setTurbulence(true);
      cabinAudio.playWindGust();
      document.body.classList.add('turbulence');
    } else {
      cabinAudio.setTurbulence(false);
      document.body.classList.remove('turbulence');
    }
    return () => {
      document.body.classList.remove('turbulence');
    };
  }, [active]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-red-950/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="max-w-md w-full bg-[hsl(0,60%,12%)] border-2 border-red-500/60 rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(239,68,68,0.3)]"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-300 tracking-tight mb-3">
              TURBULENCE DETECTED
            </h2>
            <p className="text-red-200/80 leading-relaxed">
              Please return to your seat and fasten your seatbelt to resume the flight!
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-red-400/70 tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Flight paused — return to tab to continue
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
