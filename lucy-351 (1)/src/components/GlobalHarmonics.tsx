import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { EarthEvent } from '../types';

interface GlobalHarmonicsProps {
  events: EarthEvent[];
}

const GlobalHarmonics: React.FC<GlobalHarmonicsProps> = ({ events }) => {
  // Calculate "Global Harmonics" based on event frequency and severity
  const equilibriumScore = useMemo(() => {
    if (events.length === 0) return 100;
    const totalSeverity = events.reduce((acc, e) => acc + e.severity, 0);
    const avgSeverity = totalSeverity / events.length;
    // Map avgSeverity (0-1) to equilibrium (100 - 0)
    return Math.max(0, 100 - (avgSeverity * 100) - (events.length * 0.5));
  }, [events]);

  const bars = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => ({
      id: i,
      height: 20 + Math.random() * 60 * (1 - equilibriumScore / 100),
      opacity: 0.3 + Math.random() * 0.7
    }));
  }, [equilibriumScore]);

  return (
    <div className="bg-agi-panel border border-agi-border rounded-3xl p-6 panel-glow relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[10px] text-agi-muted uppercase tracking-[0.2em] font-bold mb-1">Global Harmonics Index</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-agi-text tabular-nums">{equilibriumScore.toFixed(1)}</span>
            <span className="text-[10px] text-agi-accent font-bold">EQUILIBRIUM</span>
          </div>
        </div>
        <div className="text-right">
           <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${equilibriumScore > 70 ? 'bg-agi-success/10 text-agi-success border-agi-success/30' : equilibriumScore > 40 ? 'bg-agi-warning/10 text-agi-warning border-agi-warning/30' : 'bg-agi-danger/10 text-agi-danger border-agi-danger/30'}`}>
              {equilibriumScore > 70 ? 'STABLE' : equilibriumScore > 40 ? 'CAUTION' : 'CRITICAL'}
           </div>
        </div>
      </div>

      {/* Harmonic Wave Visualization */}
      <div className="h-24 flex items-center justify-between gap-1">
        {bars.map((bar) => (
          <motion.div
            key={bar.id}
            initial={{ height: 20 }}
            animate={{ 
              height: bar.height,
              opacity: bar.opacity 
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: 'mirror', 
              duration: 0.8 + Math.random() * 1.5,
              ease: "easeInOut"
            }}
            className={`w-1 rounded-full ${equilibriumScore > 70 ? 'bg-agi-success' : equilibriumScore > 40 ? 'bg-agi-warning' : 'bg-agi-danger'}`}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <div className="flex flex-col">
          <span className="text-[8px] text-agi-muted uppercase font-bold">Entropy</span>
          <span className="text-xs font-mono">{(100 - equilibriumScore).toFixed(2)}%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-agi-muted uppercase font-bold">Spectral Jitter</span>
          <span className="text-xs font-mono">{(Math.random() * 0.5).toFixed(3)}ms</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-agi-muted uppercase font-bold">Sync Integrity</span>
          <span className="text-xs font-mono">{Math.min(100, equilibriumScore + 20).toFixed(1)}%</span>
        </div>
      </div>

      {/* Decorative background noise */}
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-agi-accent/5 rounded-full blur-3xl" />
    </div>
  );
};

export default GlobalHarmonics;
