import React from 'react';
import { motion } from 'motion/react';
import { SimulationOutcome } from '../types';
import { GitBranch, AlertCircle, CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface ProbabilityFlowProps {
  outcome: SimulationOutcome;
}

export const ProbabilityFlow: React.FC<ProbabilityFlowProps> = ({ outcome }) => {
  const branches = outcome.branches || [];
  
  if (branches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-dashed border-agi-border rounded-xl opacity-40">
        <GitBranch size={24} className="mb-2" />
        <span className="text-[9px] uppercase tracking-tighter">Linear Timeline - No Branches Detected</span>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return 'text-agi-success';
      case 'NEGATIVE': return 'text-agi-danger';
      default: return 'text-agi-accent';
    }
  };

  const getImpactBg = (impact: string) => {
    switch (impact) {
      case 'POSITIVE': return 'bg-agi-success';
      case 'NEGATIVE': return 'bg-agi-danger';
      default: return 'bg-agi-accent';
    }
  };

  return (
    <div className="relative pt-4 pb-8 px-2 overflow-hidden">
      {/* Root Node */}
      <div className="flex justify-center mb-12 relative z-10">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group"
        >
          <div className={`absolute inset-0 blur-xl opacity-20 ${getImpactBg(outcome.impact)}`} />
          <div className={`relative px-4 py-2 bg-agi-bg border border-agi-border rounded-xl flex items-center gap-3 shadow-lg`}>
            <div className={`p-2 rounded-lg ${getImpactBg(outcome.impact)}/10`}>
              {outcome.impact === 'POSITIVE' ? <CheckCircle2 className="w-4 h-4 text-agi-success" /> : 
               outcome.impact === 'NEGATIVE' ? <AlertCircle className="w-4 h-4 text-agi-danger" /> : 
               <Circle className="w-4 h-4 text-agi-accent" />}
            </div>
            <div>
              <div className="text-[8px] uppercase font-bold text-agi-muted">Base Realization</div>
              <div className="text-[10px] font-bold text-agi-text">{(outcome.probability * 100).toFixed(0)}% PROBABILITY</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* SVG Container for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: '200px' }}>
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-agi-border)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-agi-accent)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {branches.map((_, i) => {
          const total = branches.length;
          const xStart = 50; // percentage
          const yStart = 30; // pixels approx
          const xEnd = (i + 1) * (100 / (total + 1));
          const yEnd = 80; // percentage
          
          return (
            <motion.path
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
              d={`M ${xStart}% 48 C ${xStart}% 80, ${xEnd}% 60, ${xEnd}% 80`}
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
          );
        })}
      </svg>

      {/* Branch Nodes */}
      <div className="flex justify-between items-start gap-4 relative z-10 px-2 min-h-[120px]">
        {branches.map((branch, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className={`flex-1 flex flex-col items-center text-center group/branch`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-agi-border mb-2 group-hover/branch:bg-agi-accent transition-colors" />
            
            <div className={`p-3 bg-agi-bg/80 backdrop-blur-sm border border-agi-border rounded-2xl w-full hover:border-agi-accent/50 transition-all shadow-md relative`}>
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-agi-panel border border-agi-border rounded text-[7px] font-bold text-agi-accent">
                {(branch.probability * 100).toFixed(1)}%
              </div>
              
              <div className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${getImpactColor(branch.impact)}`}>
                {branch.impact}
              </div>
              <p className="text-[9px] leading-tight opacity-70 group-hover/branch:opacity-100 transition-opacity italic">
                "{branch.description}"
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 opacity-30 text-[8px] font-mono">
        <ArrowRight size={10} />
        <span>STOCHASTIC CALCULUS ACTIVE // MULTIVERSE_BUFFER_RESERVED</span>
      </div>
    </div>
  );
};
