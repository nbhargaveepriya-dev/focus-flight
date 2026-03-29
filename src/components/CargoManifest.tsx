import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import type { CargoItem } from '@/lib/miles';

interface CargoManifestProps {
  items: CargoItem[];
  onToggle: (id: string) => void;
}

export default function CargoManifest({ items, onToggle }: CargoManifestProps) {
  const [expanded, setExpanded] = useState(true);
  const done = items.filter(i => i.checked).length;

  return (
    <div className="w-full">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">Cargo Manifest</span>
          <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${done === items.length ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-foreground/60'}`}>
            {done}/{items.length}
          </span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-foreground/40" /> : <ChevronDown className="w-4 h-4 text-foreground/40" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mt-1 space-y-1"
          >
            {items.map(item => (
              <motion.li
                key={item.id}
                layout
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/3 border border-white/5 cursor-pointer hover:bg-white/6 transition-colors group"
                onClick={() => onToggle(item.id)}
              >
                <div className="flex-shrink-0 text-primary group-hover:scale-110 transition-transform">
                  {item.checked
                    ? <CheckCircle2 className="w-4 h-4 text-green-400" fill="rgba(74,222,128,0.15)" />
                    : <Circle className="w-4 h-4 text-foreground/40" />
                  }
                </div>
                <span className={`text-sm flex-1 transition-all ${item.checked ? 'line-through text-foreground/40' : 'text-foreground/90'}`}>
                  {item.text}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
