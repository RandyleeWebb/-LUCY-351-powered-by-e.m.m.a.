/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Cpu, 
  Dna, 
  Eye, 
  Globe, 
  Heart, 
  Layers, 
  Lock, 
  Mic, 
  Shield, 
  Target, 
  Zap,
  AlertTriangle,
  ChevronRight,
  Search,
  Terminal,
  Grid,
  ShieldAlert,
  ShieldCheck,
  User,
  Server,
  Power,
  Tv,
  Wifi,
  Smartphone,
  Clock,
  TrendingUp,
  LayoutGrid,
  Settings,
  Brain,
  Filter,
  X,
  MessageSquare,
  Hammer,
  Radio,
  Database,
  Network,
  ChevronDown,
  Maximize2,
  Minimize2,
  MoreVertical,
  Bell,
  HardDrive,
  Trash2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  XAxis,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import WorldMap from './components/WorldMap';
import GlobalHarmonics from './components/GlobalHarmonics';
import PlanetaryPulseDisplay from './components/PlanetaryPulse';
import { GoalSuggester } from './components/GoalSuggester';
import { SystemMonitor } from './components/SystemMonitor';
import { ProbabilityFlow } from './components/ProbabilityFlow';
import { LucyChat } from './components/LucyChat';
import { LinkableAppsRegistry } from './components/LinkableAppsRegistry';
import { NeuroArchitectureRegistry } from './components/NeuroArchitectureRegistry';
import { MasterBuildBlueprint } from './components/MasterBuildBlueprint';
import { AnomalyAnalyzer } from './components/AnomalyAnalyzer';
import { HexSovereignNavigator } from './components/HexSovereignNavigator';
import { useCoreLoop, DATA_SOURCES } from './hooks/useCoreLoop';
import { DegradationLevel, Goal, EarthEvent, MemoryEntry, GoalStatus, GoalOrigin, DriveType, HexFace } from './types';

const HealthBar = ({ label, value, colorClass, icon: Icon }: { label: string, value: number, colorClass: string, icon: any }) => (
  <div className="flex flex-col gap-1 mb-4">
    <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider opacity-60">
      <div className="flex items-center gap-1.5">
        <Icon size={12} className={colorClass} />
        {label}
      </div>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-1 w-full bg-agi-border overflow-hidden rounded-full">
      <motion.div 
        className={`h-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.2 }}
      />
    </div>
  </div>
);

const BootOverlay = ({ boot }: { boot: any }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-agi-bg/95 flex flex-col items-center justify-center p-12 overflow-hidden"
    >
      <div className="scanline" />
      <div className="max-w-5xl w-full space-y-12 relative">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-agi-accent rounded-sm flex items-center justify-center text-agi-bg shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Cpu size={40} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[0.5em] mb-2 uppercase text-agi-text">Hardware Detect / Harmonics Audit</h1>
            <p className="text-[10px] text-agi-muted uppercase tracking-[0.3em] italic">Emma v4.1 presiding over global harmonics equilibrium</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-6">
             <div className="p-5 border border-agi-border bg-agi-panel rounded-2xl">
               <h3 className="text-[10px] font-bold text-agi-accent uppercase mb-4 tracking-widest">Hardware Specs</h3>
               <div className="space-y-4">
                 <div className="flex justify-between text-[11px]">
                    <span className="opacity-50 font-bold">CORES</span>
                    <span className="font-mono font-bold">{boot.hardwareSpecs.cores}</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                    <span className="opacity-50 font-bold">HEADROOM</span>
                    <span className="font-mono font-bold">{(boot.hardwareSpecs.thermalHeadroom * 100).toFixed(1)}%</span>
                 </div>
                 <div className="flex justify-between text-[11px]">
                    <span className="opacity-50 font-bold">ENTROPY</span>
                    <span className="font-mono font-bold">{(boot.hardwareSpecs.entropyDensity * 100).toFixed(1)}%</span>
                 </div>
               </div>
             </div>
             
             <div className="p-5 border border-agi-border bg-agi-panel rounded-2xl">
               <h3 className="text-[10px] font-bold text-agi-accent uppercase mb-4 tracking-widest">Equilibrium Status</h3>
               <div className="space-y-5 text-[10px]">
                 <div className="flex justify-between items-center">
                   <span className="opacity-50 font-bold">ANOMALIES</span>
                   <span className={`px-2 py-0.5 rounded font-bold ${boot.harmonicsEquilibrium.anomalies > 0 ? 'bg-agi-danger text-agi-bg animate-pulse' : 'text-agi-success'}`}>
                     {boot.harmonicsEquilibrium.anomalies} DETECTED
                   </span>
                 </div>
                 <HealthBar label="THERMAL_STABILITY" value={boot.harmonicsEquilibrium.thermalStability * 100} colorClass="bg-agi-warning" icon={Activity} />
                 <div className="flex justify-between text-[11px]">
                    <span className="opacity-50 font-bold">RESONANCE</span>
                    <span className="font-mono font-bold text-agi-accent">{(boot.harmonicsEquilibrium.resonanceScore * 100).toFixed(1)}</span>
                 </div>
               </div>
             </div>
          </div>

          <div className="md:col-span-3 space-y-10">
            <div className="relative">
              <div className="flex justify-between text-[12px] mb-4 font-bold tracking-[0.2em] font-mono">
                <span className="text-agi-accent">:: PHASE_EXEC: {boot.stage.replace('_', ' ')}</span>
                <span>{Math.round(boot.progress * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-agi-border rounded-full overflow-hidden border border-agi-border shadow-inner">
                <motion.div 
                  className="h-full bg-agi-accent shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                  animate={{ width: `${boot.progress * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
               {boot.benchmarks.map(b => (
                 <div key={b.label} className={`p-6 border rounded-2xl transition-all relative overflow-hidden ${b.active ? 'border-agi-accent bg-agi-accent/10 ring-2 ring-agi-accent/20' : 'border-agi-border bg-agi-panel opacity-40'}`}>
                    {b.active && <div className="absolute top-0 right-0 p-2"><Activity size={14} className="text-agi-accent animate-pulse" /></div>}
                    <div className="text-[10px] text-agi-muted uppercase mb-4 font-bold tracking-widest">BENCHMARK_{b.label}</div>
                    <div className="text-4xl font-bold mb-4 font-mono text-agi-text">{b.result ? Math.round(b.result).toLocaleString() : '------'}</div>
                    <div className="h-1.5 bg-agi-border rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-agi-accent"
                        animate={{ width: `${b.progress * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 border border-agi-border bg-agi-panel/40 backdrop-blur rounded-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-agi-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <h3 className="text-[11px] font-bold text-agi-muted uppercase mb-8 tracking-[0.4em] flex items-center gap-3">
                 <Terminal size={14} className="text-agi-accent" /> SYSTEM_CALIBRATION :: REASONING_BASELINES
               </h3>
               <div className="grid grid-cols-3 gap-12">
                 {[
                   { label: 'COGNITIVE_FIDELITY', val: boot.baselines.reasoningCapacity },
                   { label: 'THROTTLE_THRESHOLD', val: boot.baselines.throttlingThreshold },
                   { label: 'SOVEREIGNTY_QUOTA', val: boot.baselines.memorySovereignty }
                 ].map(base => (
                   <div key={base.label} className="space-y-2">
                      <div className="text-[9px] text-agi-muted uppercase font-bold tracking-widest opacity-60">{base.label}</div>
                      <div className="text-2xl font-bold font-mono text-agi-accent">{(base.val * 100).toFixed(1)}%</div>
                      <div className="h-0.5 w-full bg-agi-border rounded-full overflow-hidden">
                         <motion.div className="h-full bg-agi-accent/40" animate={{ width: `${base.val * 100}%` }} />
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
        
        <div className="text-center opacity-40 text-[10px] font-mono tracking-[0.5em] animate-pulse uppercase mt-12">
           :: EMMA_SYSTEMS_GLOBAL_HARMONICS_AUDIT_ACTIVE :: STANDBY FOR SELF-AWARENESS_TRIGGER ::
        </div>
      </div>
    </motion.div>
  );
};

const SIM_TYPE_DETAILS = {
  'FUSION': { label: 'Fusion Containment', desc: 'Sustaining high-energy plasma within magnetic lattice.' },
  'PROTEIN_FOLDING': { label: 'Protein Folding', desc: 'Iteratively mapping molecular structures for resilient bio-output.' },
  'CLIMATE_BENTO': { label: 'Climate Bento', desc: 'Small-scale atmospheric modeling for localized micro-corrections.' },
  'NEURAL_MAPPING': { label: 'Neural Mapping', desc: 'Replicating cognitive pathways for harmonic alignment.' },
  'USER_DEFINED': { label: 'Broadband Speculation', desc: 'Custom narrative injection into the quantum stream.' }
};

const SimulationControlPanel = ({ onClose, onTrigger, sims }: { onClose: () => void, onTrigger: (params: any) => void, sims: any[] }) => {
  const [selectedType, setSelectedType] = useState<string>('USER_DEFINED');
  const [objective, setObjective] = useState('');
  const [stability, setStability] = useState(0.9);
  const [resonance, setResonance] = useState(0.5);

  const activeSim = sims.find(s => s.type === selectedType);

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed top-12 right-0 bottom-10 w-96 bg-agi-panel border-l border-agi-border z-30 shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-agi-border flex justify-between items-center bg-agi-panel/80 backdrop-blur">
        <h3 className="text-xs font-bold text-agi-accent uppercase tracking-[0.3em] flex items-center gap-2">
          <Zap size={16} /> Simulation Control
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-agi-border rounded-full transition-colors">
          <Terminal size={14} className="rotate-45" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        <div className="space-y-4">
          <label className="text-[10px] text-agi-muted uppercase font-bold tracking-widest">Select Core Engine</label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(SIM_TYPE_DETAILS).map(([type, details]) => (
              <button 
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-3 text-left border rounded-xl transition-all ${selectedType === type ? 'border-agi-accent bg-agi-accent/10' : 'border-agi-border hover:border-agi-accent/50 opacity-60 hover:opacity-100'}`}
              >
                <div className="text-[11px] font-bold mb-0.5">{details.label}</div>
                <div className="text-[9px] text-agi-muted leading-tight">{details.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-agi-muted font-bold uppercase tracking-widest">Mission Objective</label>
            <input 
              type="text" 
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="e.g. SUB-ATOMIC RESONANCE..."
              className="w-full bg-agi-bg border border-agi-border rounded-xl px-4 py-3 text-[12px] font-mono focus:border-agi-accent outline-none"
            />
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-agi-muted">
                 <span>Initial Stability</span>
                 <span className="font-mono text-agi-accent">{Math.round(stability * 100)}%</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.05" 
                 value={stability} 
                 onChange={(e) => setStability(parseFloat(e.target.value))}
                 className="w-full h-1 bg-agi-border rounded-full appearance-none accent-agi-accent outline-none"
               />
            </div>
            <div className="space-y-2">
               <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-agi-muted">
                 <span>Resonance Target</span>
                 <span className="font-mono text-agi-accent">{Math.round(resonance * 100)}%</span>
               </div>
               <input 
                 type="range" min="0" max="1" step="0.05" 
                 value={resonance} 
                 onChange={(e) => setResonance(parseFloat(e.target.value))}
                 className="w-full h-1 bg-agi-border rounded-full appearance-none accent-agi-accent outline-none"
               />
            </div>
          </div>
        </div>

        {activeSim && (
          <div className="p-4 border border-agi-accent/30 bg-agi-accent/5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-agi-accent">Live Telemetry</span>
              <span className={`text-[8px] font-bold ${activeSim.active ? 'text-agi-success' : 'text-agi-muted'}`}>{activeSim.active ? 'TRANSMITTING' : 'IDLE'}</span>
            </div>
            <div className="space-y-3">
              <HealthBar label="ITERATION_PROGRESS" value={activeSim.progress * 100} colorClass="bg-agi-accent" icon={TrendingUp} />
              <HealthBar label="STRUCTURAL_STABILITY" value={activeSim.stability * 100} colorClass="bg-agi-success" icon={ShieldCheck} />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-agi-border bg-agi-panel/80 backdrop-blur">
        <button 
          onClick={() => onTrigger({ type: selectedType, objective, stability, resonance })}
          className="w-full py-4 bg-agi-accent text-agi-bg font-bold rounded-xl text-[11px] uppercase tracking-[0.3em] hover:bg-agi-accent/90 transition-all border border-agi-accent shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-3"
        >
          {activeSim?.active ? 'RE-CALIBRATE SEQUENCE' : 'INITIATE SIMULATION'}
        </button>
        {activeSim?.active && (
           <button 
             onClick={() => onTrigger({ type: selectedType, stop: true })}
             className="w-full py-2 border border-agi-danger/30 text-agi-danger text-[9px] font-bold rounded-lg uppercase tracking-widest hover:bg-agi-danger/5"
           >
             FORCE_TERMINATE_SIM
           </button>
        )}
      </div>
    </motion.div>
  );
};

const MemoryCard: React.FC<{ memory: MemoryEntry }> = ({ memory }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 border border-agi-border bg-agi-panel/30 rounded-xl relative overflow-hidden group"
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${memory.relevance > 0.7 ? 'bg-agi-accent' : 'bg-agi-muted opacity-40'}`} />
        <span className="text-[10px] font-bold text-agi-muted uppercase tracking-wider">{memory.source}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[9px] text-agi-muted font-mono">{new Date(memory.timestamp).toLocaleTimeString()}</span>
        <div className="flex items-center gap-1">
          <span className="text-[8px] opacity-40 uppercase">Relevance</span>
          <span className="text-[10px] font-bold text-agi-accent font-mono">{Math.round(memory.relevance * 100)}%</span>
        </div>
      </div>
    </div>
    
    <p className="text-[11px] leading-relaxed mb-3 text-agi-text/90">{memory.content}</p>
    
    <div className="flex flex-wrap gap-1.5">
      {memory.tags.map((tag: string) => (
        <span key={tag} className="px-1.5 py-0.5 bg-agi-accent/10 border border-agi-accent/20 rounded text-[8px] text-agi-accent uppercase font-bold">
          #{tag}
        </span>
      ))}
      <div className="flex-1" />
      <div className="flex items-center gap-1 text-[9px] opacity-40">
        <Heart size={10} />
        <span>{(memory.resonance * 100).toFixed(1)}%</span>
      </div>
    </div>
  </motion.div>
);

const DriveMeter = ({ label, value, icon: Icon }: { label: string, value: number, icon: any }) => (
  <div className="flex items-center gap-3 mb-3 h-8">
    <div className="p-1.5 bg-agi-border rounded-md text-agi-muted">
      <Icon size={14} />
    </div>
    <div className="flex-1">
      <div className="text-[9px] uppercase font-mono tracking-widest text-agi-muted mb-0.5">{label}</div>
      <div className="flex gap-0.5 h-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 rounded-sm ${i / 20 < value ? 'bg-agi-accent' : 'bg-agi-border'}`} 
          />
        ))}
      </div>
    </div>
  </div>
);

const EventCard: React.FC<{ event: EarthEvent }> = ({ event }) => {
  const chartData = event.severityHistory.map((s, i) => ({ value: s, index: i }));

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="border-l-2 border-agi-accent bg-agi-panel/40 p-3 mb-2 rounded-r-md backdrop-blur-sm group"
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-agi-accent/10 border border-agi-accent/30 rounded text-[8px] font-bold text-agi-accent font-mono uppercase tracking-tighter">
            {event.source}
          </span>
          <span className="text-[10px] font-bold text-agi-text opacity-70 font-mono italic">{event.type}</span>
        </div>
        <span className="text-[8px] opacity-40 font-mono italic">{new Date(event.timestamp).toLocaleTimeString()}</span>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <p className="text-[11px] text-agi-text leading-relaxed font-mono line-clamp-2" title={event.description}>{event.description}</p>
        </div>
        
        {/* Severity Sparkline */}
        <div className="w-16 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${event.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={event.severity > 0.8 ? '#ef4444' : '#3b82f6'} 
                strokeWidth={1.5} 
                dot={false} 
                isAnimationActive={false} 
              />
              <YAxis domain={[0, 1]} hide />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 text-[9px] opacity-50 font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={10} />
          {event.location}
        </div>
        <div className="flex items-center gap-1.5 font-bold">
           <div className={`w-1 h-1 rounded-full ${event.severity > 0.8 ? 'bg-agi-danger animate-pulse' : event.severity > 0.5 ? 'bg-agi-warning' : 'bg-agi-success'}`} />
           SEV: {Math.round(event.severity * 100)}%
        </div>
      </div>
    </motion.div>
  );
};

const GoalCard: React.FC<{ goal: Goal; onClick: () => void }> = ({ goal, onClick }) => {
  const getOriginInfo = (origin: any) => {
    switch (origin) {
      case 'USER_REQUEST': return { label: 'DIRECT_COMMAND', icon: User, color: 'text-agi-accent' };
      case 'DRIVE_TRIGGERED': return { label: 'DRIVE_AUTONOMY', icon: Activity, color: 'text-agi-warning' };
      case 'CURIOSITY_SPIKE': return { label: 'SPECULATIVE_EXPLORATION', icon: Zap, color: 'text-agi-success' };
      case 'EARTH_ANOMALY': return { label: 'PLANETARY_REACTION', icon: Globe, color: 'text-agi-danger' };
      case 'SYSTEM_MAINTENANCE': return { label: 'CORE_STABILITY', icon: Cpu, color: 'text-agi-muted' };
      case 'IDENTITY_ALIGNED': return { label: 'SOVEREIGN_EVOLUTION', icon: Dna, color: 'text-agi-accent' };
      default: return { label: 'UNKNOWN_SOURCE', icon: Target, color: 'text-agi-muted' };
    }
  };

  const getStatusIcon = (status: GoalStatus) => {
    switch (status) {
      case GoalStatus.COMPLETED: return { icon: ShieldCheck, color: 'text-agi-success' };
      case GoalStatus.ACTIVE: return { icon: Activity, color: 'text-agi-accent animate-pulse' };
      case GoalStatus.BLOCKED: return { icon: ShieldAlert, color: 'text-agi-danger' };
      case GoalStatus.PAUSED: return { icon: Clock, color: 'text-agi-warning' };
      case GoalStatus.PROPOSED: return { icon: Target, color: 'text-agi-muted' };
      case GoalStatus.ABANDONED: return { icon: X, color: 'text-agi-muted opacity-50' };
      default: return { icon: Target, color: 'text-agi-muted' };
    }
  };

  const originInfo = getOriginInfo(goal.origin);
  const statusInfo = getStatusIcon(goal.status);
  const isBlocked = goal.status === GoalStatus.BLOCKED || goal.blockers.length > 0;
  
  const now = Date.now();
  const isNearingDeadline = goal.deadline && (goal.deadline - now) < (1000 * 60 * 60); // < 1 hour

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`p-4 border border-agi-border bg-agi-panel rounded-xl mb-3 hover:border-agi-accent/50 transition-all cursor-pointer group relative overflow-hidden ${
        isBlocked ? 'border-agi-danger/30 ring-1 ring-agi-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : ''
      }`}
    >
      <div className="absolute top-0 right-0 p-2 opacity-5">
        <originInfo.icon size={48} />
      </div>
      
      {isNearingDeadline && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-agi-danger animate-pulse" />
      )}

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <statusInfo.icon size={14} className={statusInfo.color} />
            <span className={`text-sm font-bold tracking-tight transition-colors ${isBlocked ? 'text-agi-danger' : ''}`}>{goal.description}</span>
          </div>
          <div className={`flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest ${originInfo.color}`}>
            <originInfo.icon size={10} />
            <span>ORIGIN: {originInfo.label}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${
            goal.status === GoalStatus.ACTIVE ? 'border-agi-success/30 text-agi-success bg-agi-success/5' : 
            goal.status === GoalStatus.COMPLETED ? 'border-agi-success bg-agi-success text-agi-bg' :
            goal.status === GoalStatus.BLOCKED ? 'border-agi-danger/30 text-agi-danger bg-agi-danger/5' :
            goal.status === GoalStatus.PROPOSED ? 'border-agi-warning/30 text-agi-warning bg-agi-warning/5' : 'border-agi-border text-agi-muted'
          } font-mono font-bold`}>
            {goal.status}
          </span>
          {goal.deadline && (
            <div className={`flex flex-col items-end gap-0.5 ${isNearingDeadline ? 'text-agi-danger animate-pulse' : 'text-agi-muted'}`}>
              <span className="text-[8px] font-mono font-bold uppercase">
                TLE: {new Date(goal.deadline).toLocaleTimeString()}
              </span>
              <span className="text-[7px] font-mono font-bold flex items-center gap-1">
                <Clock size={8} />
                {(() => {
                  const diff = goal.deadline - now;
                  if (diff < 0) return 'EXPIRED';
                  const mins = Math.floor(diff / 60000);
                  const secs = Math.floor((diff % 60000) / 1000);
                  return `${mins}M ${secs}S`;
                })()}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1.5 relative z-10">
        <div className="flex justify-between text-[10px] font-mono opacity-50 mb-1">
          <span className="flex items-center gap-1">
            {goal.status === GoalStatus.COMPLETED ? <ShieldCheck size={10} className="text-agi-success" /> : <Target size={10} />}
            PROGRESS_INDEX
          </span>
          <span className={statusInfo.color}>{Math.round(goal.progress * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-agi-border/50 rounded-full overflow-hidden shadow-inner flex">
          <motion.div 
            className={`h-full ${
              goal.status === GoalStatus.COMPLETED ? 'bg-agi-success' : 
              isBlocked ? 'bg-agi-danger opacity-50' :
              'bg-agi-accent'
            } shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
          {goal.status === GoalStatus.ACTIVE && (
             <motion.div 
              className="w-8 h-full bg-agi-text/20 blur-sm"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
             />
          )}
        </div>
      </div>

      <div className="flex gap-1.5 mt-4 flex-wrap relative z-10">
        {goal.relatedPatterns.map(p => (
          <span key={p} className="text-[8px] bg-agi-bg border border-agi-border/50 px-2 py-0.5 rounded text-agi-muted font-mono hover:text-agi-accent transition-colors hover:border-agi-accent/30">
            #{p}
          </span>
        ))}
      </div>
      
      {isBlocked && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="mt-3 pt-3 border-t border-agi-border/30 flex items-start gap-2 relative z-10"
        >
          <ShieldAlert size={10} className="text-agi-danger mt-0.5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] text-agi-danger font-mono font-bold uppercase tracking-tighter">BLOCKERS_DETECTED:</span>
            <span className="text-[8px] text-agi-muted font-mono leading-tight">{goal.blockers.join(', ') || 'DEPENDENCY_STALL'}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};


export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const isMobileQuery = queryParams.get('mode') === 'mobile';
  const { ctx, earthEvents, sendCommand } = useCoreLoop(isMobileQuery ? 'COMPANION' : 'MASTER');
  const [isSimControlOpen, setIsSimControlOpen] = useState(false);
  const [isGoalSuggesterOpen, setIsGoalSuggesterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSources, setFilterSources] = useState<string[]>([]);
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [filterSeverity, setFilterSeverity] = useState(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedTransientEvent, setSelectedTransientEvent] = useState<EarthEvent | null>(null);
  const selectedEvent = selectedTransientEvent || earthEvents.find(e => e.id === selectedEventId) || null;
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const selectedGoal = ctx.activeGoals.find(g => g.id === selectedGoalId) || null;
  
  // Goal Filters & Sorting
  const [goalFilterStatus, setGoalFilterStatus] = useState<string>('ALL');
  const [goalFilterOrigin, setGoalFilterOrigin] = useState<string>('ALL');
  const [goalFilterDrive, setGoalFilterDrive] = useState<string>('ALL');
  const [goalSortBy, setGoalSortBy] = useState<'priority' | 'progress' | 'createdAt' | 'updatedAt'>('priority');
  const [goalSortOrder, setGoalSortOrder] = useState<'asc' | 'desc'>('desc');

  const activeFace = ctx.activeFace;
  const setActiveFace = (face: HexFace) => sendCommand('CHANGE_FACE', { face });

  const closeEventModal = () => {
    setSelectedEventId(null);
    setSelectedTransientEvent(null);
  };

  const filteredGoals = useMemo(() => {
    return ctx.activeGoals
      .filter(goal => {
        const matchesStatus = goalFilterStatus === 'ALL' || goal.status === goalFilterStatus;
        const matchesOrigin = goalFilterOrigin === 'ALL' || goal.origin === goalFilterOrigin;
        const matchesDrive = goalFilterDrive === 'ALL' || goal.requiredDrives.includes(goalFilterDrive as any);
        return matchesStatus && matchesOrigin && matchesDrive;
      })
      .sort((a, b) => {
        let valA, valB;
        if (goalSortBy === 'createdAt' || goalSortBy === 'updatedAt') {
          valA = a[goalSortBy];
          valB = b[goalSortBy];
        } else {
          valA = a[goalSortBy];
          valB = b[goalSortBy];
        }
        
        if (goalSortOrder === 'asc') return valA - valB;
        return valB - valA;
      });
  }, [ctx.activeGoals, goalFilterStatus, goalFilterOrigin, goalFilterDrive, goalSortBy, goalSortOrder]);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 1024 || isMobileQuery;

  const allPossibleSources = DATA_SOURCES.map(s => s.name).sort();
  const allPossibleTypes = Array.from(new Set(DATA_SOURCES.flatMap(s => s.types))).sort();

  const filteredEvents = earthEvents.filter(event => {
    const matchesSearch = event.description.toLowerCase().includes(filterSearch.toLowerCase()) || 
                          event.type.toLowerCase().includes(filterSearch.toLowerCase());
    const matchesSource = filterSources.length === 0 || filterSources.includes(event.source);
    const matchesType = filterTypes.length === 0 || filterTypes.includes(event.type);
    const matchesSeverity = event.severity >= filterSeverity;
    return matchesSearch && matchesSource && matchesType && matchesSeverity;
  });

  const getDegradationLabel = (level: DegradationLevel) => {
    switch (level) {
      case DegradationLevel.NORMAL: return 'OPTIMAL';
      case DegradationLevel.CONSERVATION: return 'CAUTION';
      case DegradationLevel.REDUCED: return 'DEGRADED';
      case DegradationLevel.MINIMAL: return 'MINIMAL';
      case DegradationLevel.EMERGENCY: return 'EMERGENCY';
      default: return 'NULL';
    }
  };

  const NavItem = ({ face, icon: Icon, label, sub }: { face: HexFace, icon: any, label: string, sub?: string }) => {
    const isActive = activeFace === face;
    return (
      <button
        onClick={() => setActiveFace(face)}
        className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative
          ${isActive ? 'bg-agi-accent text-agi-bg shadow-lg shadow-agi-accent/20' : 'text-agi-muted hover:text-agi-text hover:bg-agi-border/50'}`}
      >
        <div className={`p-2 rounded-xl ${isActive ? 'bg-agi-bg/20' : 'bg-agi-panel border border-agi-border'}`}>
          <Icon size={18} className={isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
        </div>
        <div className="hidden lg:flex flex-col items-start overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
          {sub && <span className={`text-[8px] font-mono opacity-50 truncate w-full ${isActive ? 'text-agi-bg' : ''}`}>{sub}</span>}
        </div>
        {isActive && (
          <motion.div 
            layoutId="activeTabIndicator"
            className="absolute left-0 w-1 h-6 bg-agi-bg rounded-r-full"
          />
        )}
      </button>
    );
  };

  const getDegradedFeatures = (level: DegradationLevel) => {
    const features = [
      { 
        id: 'sim_hi_fi', 
        label: 'High-Fidelity Simulation', 
        minLevel: DegradationLevel.CONSERVATION,
        constraint: 'CPU_THERMAL_HEADROOM < 40%',
        impact: 'Reduced prediction accuracy for complex long-term horizons.'
      },
      { 
        id: 'telemetry_rt', 
        label: 'Real-Time Telemetry', 
        minLevel: DegradationLevel.REDUCED,
        constraint: 'NETWORK_LATENCY > 150ms OR CPU > 85%',
        impact: 'Telemetry sampling rate reduced to 1Hz. Transient anomalies may be missed.'
      },
      { 
        id: 'pattern_rec', 
        label: 'Advanced Pattern Recognition', 
        minLevel: DegradationLevel.MINIMAL,
        constraint: 'RAM_USAGE > 90% OR TENSION > 0.8',
        impact: 'Semantic correlation limited to high-confidence signals only.'
      },
      { 
        id: 'actuator_ctrl', 
        label: 'External Actuator Control', 
        minLevel: DegradationLevel.EMERGENCY,
        constraint: 'SYSTEM_STABILITY < 0.3',
        impact: 'Physical actuation nodes locked to prevent cascading structural failure.'
      },
      { 
        id: 'cog_evolution', 
        label: 'Cognitive Evolution Ops', 
        minLevel: DegradationLevel.EMERGENCY,
        constraint: 'MISSION_RESONANCE < 0.2',
        impact: 'Self-modification subroutines suspended to maintain core identity integrity.'
      },
    ];

    return features.map(f => ({
      ...f,
      status: level >= f.minLevel ? 'DEGRADED' : 'OPTIMAL'
    }));
  };

  const getThermalStatus = (state: string) => {
    switch (state) {
      case 'normal': return 'bg-agi-success';
      case 'elevated': return 'bg-agi-warning';
      case 'critical': return 'bg-agi-danger';
      default: return 'bg-agi-muted';
    }
  };

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-agi-bg text-agi-text flex flex-col font-mono overflow-hidden">
        <div className="scanline" />
        <header className="p-4 border-b border-agi-border bg-agi-panel flex justify-between items-center z-20">
            <div className="flex items-center gap-2">
               <Zap size={16} className="text-agi-accent" />
               <span className="text-xs font-bold font-sans tracking-tight uppercase">Lucy_Command</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all ${
              ctx.systemHealth.degradationLevel === DegradationLevel.EMERGENCY 
                ? 'bg-agi-danger text-agi-bg border-agi-danger' 
                : 'bg-agi-panel border-agi-border text-agi-success'
            }`}>
               {ctx.systemHealth.degradationLevel === DegradationLevel.EMERGENCY ? '!! CRITICAL !!' : 'SYNC_STABLE'}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
           <section className="bg-agi-panel border border-agi-border rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="text-[10px] text-agi-muted uppercase tracking-widest font-bold">Resonance Index</div>
                <div className="text-[10px] text-agi-accent font-bold">{Math.round(ctx.identity.missionResonance * 100)}%</div>
              </div>
              <HealthBar label="Central Compute" value={ctx.systemHealth.cpuPercent} colorClass="bg-agi-accent" icon={Cpu} />
           </section>

           <div className="bg-agi-panel/50 border border-agi-border rounded-2xl p-0 overflow-hidden">
             <WorldMap events={earthEvents.slice(0, 10)} />
           </div>

           <section className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => sendCommand('THROTTLE_EMERGENCY')} 
                className="p-5 border border-agi-danger/30 bg-agi-danger/10 rounded-2xl text-agi-danger active:scale-95 flex flex-col items-center gap-2"
              >
                <AlertTriangle size={24}/>
                <span className="text-[8px] font-bold">EMERGENCY</span>
              </button>
              <button 
                onClick={() => sendCommand('BOOST_CURIOSITY')} 
                className="p-5 border border-agi-accent/30 bg-agi-accent/10 rounded-2xl text-agi-accent active:scale-95 flex flex-col items-center gap-2"
              >
                <Zap size={24}/>
                <span className="text-[8px] font-bold">BOOST</span>
              </button>
           </section>

           <section className="space-y-2">
              <div className="text-[10px] text-agi-muted uppercase tracking-widest font-bold mb-2">Semantic Stream</div>
              {ctx.identity.internalThoughts.slice(0, 3).map((t, i) => (
                <div key={i} className="p-3 bg-agi-panel border border-agi-border rounded-xl text-[10px] italic opacity-70">"{t}"</div>
              ))}
           </section>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 p-2 pb-6 border-t border-agi-border bg-agi-panel/95 backdrop-blur-xl z-30 flex justify-around items-center overflow-x-auto">
           {(['CHAT', 'EARTH', 'BUILDER', 'SIGNAL', 'VAULT', 'ECOSYSTEM'] as HexFace[]).map(f => (
             <button 
               key={f}
               onClick={() => setActiveFace(f)}
               className={`flex flex-col items-center gap-1.5 px-3 py-2 transition-all ${activeFace === f ? 'text-agi-accent' : 'text-agi-muted'}`}
             >
                {f === 'EARTH' && <Globe size={18} />}
                {f === 'CHAT' && <MessageSquare size={18} />}
                {f === 'BUILDER' && <Hammer size={18} />}
                {f === 'SIGNAL' && <Radio size={18} />}
                {f === 'VAULT' && <Database size={18} />}
                {f === 'ECOSYSTEM' && <Network size={18} />}
                <span className="text-[7px] font-bold tracking-widest">{f}</span>
             </button>
           ))}
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-agi-bg text-agi-text selection:bg-agi-accent/30 overflow-hidden flex flex-col font-mono text-xs">
      <div className="scanline" />
      
      {/* GLOBAL HEADER */}
      <header className="h-14 border-b border-agi-border flex items-center px-6 justify-between bg-agi-panel/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-agi-accent rounded flex items-center justify-center text-agi-bg shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Zap size={18} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight uppercase leading-none mb-1">Lucy_v3 // Planetary_OS</h1>
              <div className="flex items-center gap-2 opacity-40 text-[9px]">
                <Activity size={10} />
                <span>UPTIME: 99.998%</span>
                <span className="w-1 h-1 rounded-full bg-agi-success" />
                <span>SYNC_ID: {ctx.tickId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
             <div className="text-[10px] font-bold text-agi-muted uppercase tracking-widest">Global Harmonics</div>
             <div className="flex items-center gap-3">
               <div className="w-32 h-1 bg-agi-border rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-agi-success"
                   animate={{ width: `${ctx.identity.missionResonance * 100}%` }}
                 />
               </div>
               <span className="text-agi-success font-bold font-mono">{(ctx.identity.missionResonance * 100).toFixed(1)}%</span>
             </div>
          </div>
          <div className="h-8 w-px bg-agi-border" />
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded border text-[10px] font-bold ${ctx.systemHealth.thermalState === 'critical' ? 'bg-agi-danger/10 border-agi-danger text-agi-danger animate-pulse' : 'border-agi-border text-agi-muted'}`}>
              TEMP: {ctx.systemHealth.thermalState.toUpperCase()}
            </div>
            <button className="p-2 border border-agi-border rounded hover:border-agi-accent transition-colors">
              <Settings size={16} className="text-agi-muted" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* NAV SIDEBAR */}
        <aside className="w-64 border-r border-agi-border bg-agi-panel p-6 flex flex-col gap-8 z-20">
          <section className="space-y-6">
            <div className="text-[10px] font-bold text-agi-muted uppercase tracking-[0.2em] mb-4">Sovereign_Hex_Faces</div>
            <nav className="space-y-2">
              <NavItem face="CHAT" icon={MessageSquare} label="CHAT" sub="Cortex Stream" />
              <NavItem face="EARTH" icon={Globe} label="EARTH" sub="Anomalies" />
              <NavItem face="BUILDER" icon={Hammer} label="BUILDER" sub="System Craft" />
              <NavItem face="SIGNAL" icon={Radio} label="SIGNAL" sub="Omni Link" />
              <NavItem face="VAULT" icon={Database} label="VAULT" sub="Alpha Delta" />
              <NavItem face="ECOSYSTEM" icon={Network} label="ECOSYSTEM" sub="Node Lattice" />
            </nav>
          </section>

          <section className="mt-auto pt-6 border-t border-agi-border">
             <div className="bg-agi-bg/40 border border-agi-border rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold">
                   <span className="text-agi-muted uppercase">Compute_Load</span>
                   <span className="text-agi-accent font-mono">{ctx.systemHealth.cpuPercent}%</span>
                </div>
                <div className="h-1.5 bg-agi-border rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-agi-accent"
                    animate={{ width: `${ctx.systemHealth.cpuPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold pt-2 border-t border-agi-border/30">
                   <span className="text-agi-muted uppercase">Health_Index</span>
                   <span className="text-agi-success">NOMINAL</span>
                </div>
             </div>
          </section>
        </aside>

        {/* DASHBOARD AREA */}
        <main className="flex-1 overflow-hidden flex flex-col bg-agi-bg relative">
          <div className="absolute bottom-8 right-8 w-48 h-48 z-40">
             <HexSovereignNavigator activeFace={activeFace} onFaceChange={setActiveFace} />
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeFace === 'CHAT' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="h-full flex flex-col max-w-5xl mx-auto"
                >
                  <div className="flex-1 min-h-[600px] bg-agi-panel border border-agi-border rounded-3xl overflow-hidden shadow-2xl relative">
                    <LucyChat context={ctx} />
                  </div>
                </motion.div>
              )}

              {activeFace === 'EARTH' && (
                <motion.div 
                  key="earth"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                     <section className="xl:col-span-2 space-y-6">
                        <div className="bg-agi-panel border border-agi-border rounded-3xl p-1 overflow-hidden relative min-h-[600px]">
                           <WorldMap events={filteredEvents} onEventClick={(e) => {
                             if (e.source === 'CLUSTER_AGGREGATE') {
                               setSelectedTransientEvent(e);
                             } else {
                               setSelectedEventId(e.id);
                             }
                           }} />
                           
                           {/* MAP CONTROLS OVERLAY */}
                           <div className="absolute top-6 left-6 space-y-4">
                              <div className="bg-agi-bg/80 backdrop-blur-md border border-agi-border rounded-2xl p-4 shadow-2xl">
                                 <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest mb-3 flex items-center gap-2">
                                   <Filter size={14} /> Intelligence Filter
                                 </h3>
                                 <div className="space-y-4">
                                    <div className="relative">
                                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-agi-muted" />
                                       <input 
                                         type="text" 
                                         placeholder="SEARCH TELEMETRY..."
                                         value={filterSearch}
                                         onChange={(e) => setFilterSearch(e.target.value)}
                                         className="w-full bg-agi-panel border border-agi-border rounded-xl pl-10 pr-4 py-2 text-[10px] focus:border-agi-accent outline-none"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <div className="text-[9px] text-agi-muted font-bold uppercase tracking-tighter">Severity Threshold</div>
                                       <input 
                                         type="range" min="0" max="1" step="0.1" 
                                         value={filterSeverity} 
                                         onChange={(e) => setFilterSeverity(parseFloat(e.target.value))}
                                         className="w-full h-1 bg-agi-border rounded-full appearance-none accent-agi-accent"
                                       />
                                       <div className="flex justify-between text-[8px] font-mono opacity-50 uppercase">
                                          <span>Low</span>
                                          <span>Critical</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </section>

                    <div className="flex justify-between items-center mb-4">
                       <h2 className="text-[10px] font-bold text-agi-accent flex items-center gap-2 uppercase tracking-[0.3em]">
                          <Activity size={14} /> Global Harmonics Equilibrium
                       </h2>
                    </div>
                    <GlobalHarmonics events={earthEvents} />
                    
                    {/* DETECTORS NETWORK */}
                    <div className="bg-agi-panel border border-agi-border rounded-3xl p-6 my-6">
                       <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Target size={14} /> Global_Detector_Network
                       </h3>
                       <div className="space-y-3">
                          {[
                            { label: 'OCEANIC_BUOYS', status: 'ACTIVE', pings: 142, pingRate: '12Hz' },
                            { label: 'ATMOSPHERIC_SCANNERS', status: 'ACTIVE', pings: 89, pingRate: '4Hz' },
                            { label: 'CORE_SEISMIC_LINKS', status: 'CALIBRATING', pings: 4, pingRate: '0.1Hz' },
                            { label: 'ORBITAL_LIDAR_ARRAY', status: 'ACTIVE', pings: 512, pingRate: '60Hz' },
                          ].map(d => (
                            <div key={d.label} className="p-3 bg-agi-bg/50 border border-agi-border rounded-xl flex items-center justify-between group hover:border-agi-accent transition-colors">
                              <div>
                                <div className="text-[9px] font-bold text-agi-text uppercase tracking-widest">{d.label}</div>
                                <div className="text-[8px] text-agi-muted uppercase font-mono mt-0.5">Ping_Rate: {d.pingRate}</div>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${d.status === 'ACTIVE' ? 'text-agi-success' : 'text-agi-warning'}`}>
                                  {d.status}
                                </span>
                                <span className="text-[10px] font-mono text-agi-muted">{d.pings} pts</span>
                              </div>
                            </div>
                          ))}
                       </div>
                       <button className="w-full mt-4 py-3 border border-agi-border hover:border-agi-accent hover:bg-agi-accent/10 rounded-xl text-[9px] font-bold text-agi-accent uppercase tracking-[0.2em] transition-all">
                          Re-Synchronize_Arrays
                       </button>
                    </div>

                    <div className="bg-agi-panel border border-agi-border rounded-3xl p-6 h-full flex flex-col">
                       <h3 className="text-xs font-bold text-agi-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Activity size={14} /> Anomalous Clusters
                       </h3>
                       <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                          {filteredEvents.slice(0, 20).map(event => (
                               <div key={event.id} onClick={() => setSelectedEventId(event.id)} className="cursor-pointer">
                               <EventCard event={event} />
                            </div>
                          ))}
                          {filteredEvents.length === 0 && (
                            <div className="text-center py-12 text-agi-muted text-[10px] italic">
                               No active anomalies matching current filters.
                            </div>
                          )}
                       </div>
                       
                       <section className="bg-agi-panel border border-agi-border rounded-2xl p-6">
                         <h3 className="text-xs font-bold text-agi-accent mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Terminal size={14} /> LIVE_SYSTEM_LOG
                         </h3>
                         <div className="space-y-1 max-h-[300px] overflow-y-auto font-mono text-[9px] text-agi-muted scrollbar-hide">
                            {ctx.identity.internalThoughts.slice(0, 15).map((log, i) => (
                               <div key={i} className="flex gap-2">
                                  <span className="text-agi-accent/50 opacity-40">[{i}]</span>
                                  <span className="break-all">{log}</span>
                               </div>
                            ))}
                         </div>
                       </section>
                    </div>
                 </div>
            </motion.div>
          )}

              {activeFace === 'SIGNAL' && (
                <motion.div 
                  key="signal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <PlanetaryPulseDisplay pulse={ctx.planetaryPulse} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    <section className="bg-agi-panel border border-agi-border rounded-3xl p-8">
                       <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Brain size={16} /> Semantic Thought Stream
                       </h3>
                       <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar font-mono">
                          {ctx.identity.internalThoughts.map((thought, i) => (
                             <div 
                                key={i}
                                className={`p-4 rounded-xl border border-agi-border/30 bg-agi-bg/20 ${i === 0 ? 'border-agi-accent/50 bg-agi-accent/5' : ''}`}
                             >
                                <div className="text-[8px] text-agi-muted mb-2 tracking-widest uppercase">REF_INDEX: {ctx.tickId - (i * 10)}</div>
                                <p className={`text-[11px] leading-relaxed ${i === 0 ? 'text-agi-text font-bold' : 'text-agi-muted'}`}>
                                   {thought}
                                </p>
                             </div>
                          ))}
                       </div>
                    </section>

                    <AnomalyAnalyzer 
                      analyses={ctx.identity.anomalyAnalyses} 
                      onResolve={(id) => sendCommand('RESOLVE_ANOMALY', { id })}
                    />
                  </div>

                  <div className="max-w-7xl mx-auto space-y-8">
                    <MasterBuildBlueprint />
                    <NeuroArchitectureRegistry />
                    <LinkableAppsRegistry 
                      apps={ctx.identity.linkableApps} 
                      onLink={(id) => sendCommand('LINK_APP', { id })}
                      onUnlink={(id) => sendCommand('UNLINK_APP', { id })}
                    />
                  </div>
                </motion.div>
              )}

              {activeFace === 'BUILDER' && (
                <motion.div 
                  key="builder"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                       {/* SIMULATION CONTROLS */}
                       <div className="bg-agi-panel border border-agi-border rounded-3xl p-8">
                          <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                             <Zap size={16} /> Simulation_Lab
                          </h3>
                          <div className="grid grid-cols-2 gap-3 mb-8">
                             {[
                               { label: 'ATMOSPHERIC', type: 'ATMOSPHERIC' },
                               { label: 'SEISMIC', type: 'SEISMIC' },
                               { label: 'SOCIETAL', type: 'SOCIETAL' },
                               { label: 'ECOLOGICAL', type: 'ECOLOGICAL' },
                             ].map(sim => (
                               <button 
                                 key={sim.label}
                                 onClick={() => sendCommand('TRIGGER_SIM', { type: sim.type })}
                                 className="p-4 border border-agi-border rounded-2xl bg-agi-bg/40 hover:border-agi-accent hover:bg-agi-accent/5 transition-all text-left"
                               >
                                  <div className="text-[10px] font-bold text-agi-text tracking-tighter uppercase">{sim.label}</div>
                                  <div className="text-[8px] text-agi-muted font-mono opacity-50">INITIALIZE</div>
                               </button>
                             ))}
                          </div>
                          
                          <div className="space-y-4">
                             <h4 className="text-[10px] font-bold text-agi-muted uppercase tracking-widest">Ongoing Process Stack</h4>
                             {ctx.identity.activeSimulations.length === 0 ? (
                               <div className="py-8 border border-agi-border border-dashed rounded-2xl text-center text-agi-muted text-[10px] italic">
                                  No simulations currently active.
                               </div>
                             ) : (
                               ctx.identity.activeSimulations.map(sim => (
                                 <div key={sim.id} className="p-4 border border-agi-border rounded-xl bg-agi-bg/60">
                                    <div className="flex justify-between items-center mb-2">
                                       <span className="text-[10px] font-bold">{sim.objective}</span>
                                       <span className="text-[9px] font-mono text-agi-accent">{Math.round(sim.progress * 100)}%</span>
                                    </div>
                                    <div className="h-1 bg-agi-border rounded-full overflow-hidden">
                                       <motion.div className="h-full bg-agi-accent" animate={{ width: `${sim.progress * 100}%` }} />
                                    </div>
                                 </div>
                               ))
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-3">
                       <section className="bg-agi-panel border border-agi-border rounded-3xl p-8 h-full flex flex-col">
                          <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest flex items-center gap-2">
                                <Target size={16} /> Persistent Goal Hierarchy
                             </h3>
                             <button 
                               onClick={() => setIsGoalSuggesterOpen(true)}
                               className="text-[10px] font-bold px-4 py-1.5 bg-agi-accent text-agi-bg rounded-lg hover:opacity-90 transition-all"
                             >
                               PROPOSE OBJECTIVE
                             </button>
                          </div>
                          <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                             {ctx.activeGoals.map(goal => (
                                <GoalCard key={goal.id} goal={goal} onClick={() => setSelectedGoalId(goal.id)} />
                             ))}
                          </div>
                       </section>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeFace === 'ECOSYSTEM' && (
                <motion.div 
                  key="ecosystem"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                  <div className="lg:col-span-2 space-y-8">
                     <section className="bg-agi-panel border border-agi-border rounded-3xl p-8">
                        <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                           <Network size={16} /> Sovereign Node Lattice
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {ctx.identity.actuators.map(act => (
                              <div key={act.id} className="p-5 border border-agi-border rounded-2xl bg-agi-bg/40 hover:border-agi-accent transition-colors">
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                       <div className="p-2.5 rounded-xl bg-agi-bg border border-agi-border">
                                          {act.type === 'ROBOTIC_ARM' ? <Power size={18} className="text-agi-accent" /> : <Wifi size={18} /> }
                                       </div>
                                       <div>
                                          <div className="text-[11px] font-black tracking-tight">{act.label}</div>
                                          <div className="text-[8px] text-agi-muted uppercase font-bold">{act.type}</div>
                                       </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${act.status === 'IDLE' ? 'bg-agi-success' : 'bg-agi-accent animate-pulse'}`} />
                                 </div>
                                 <div className="space-y-4">
                                    <div className="flex justify-between text-[9px] font-mono">
                                       <span className="opacity-50 uppercase">Link Integrity</span>
                                       <span>{Math.round(act.linkStatus * 100)}%</span>
                                    </div>
                                    <div className="h-1 bg-agi-border rounded-full overflow-hidden">
                                       <motion.div className="h-full bg-agi-accent" animate={{ width: `${act.linkStatus * 100}%` }} />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </section>

                     <section className="bg-agi-panel border border-agi-border rounded-3xl p-8">
                        <h3 className="text-xs font-bold text-agi-danger uppercase tracking-widest mb-6 flex items-center gap-2">
                           <ShieldAlert size={16} /> Protective Buffer / Sec-Lattice
                        </h3>
                        <div className="space-y-3">
                           {ctx.identity.securityAlerts.map(alert => (
                              <div key={alert.id} className="p-4 border border-agi-danger/30 bg-agi-danger/5 rounded-xl">
                                 <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black font-mono text-agi-danger">{alert.type}</span>
                                    <span className="text-[8px] opacity-50">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                 </div>
                                 <p className="text-[10px] leading-relaxed mb-3">{alert.description}</p>
                                 <button onClick={() => sendCommand('MITIGATE_ALERT', { id: alert.id })} className="text-[9px] font-bold text-agi-accent hover:underline">AUTONOMOUS_MITIGATION</button>
                              </div>
                           ))}
                           {ctx.identity.securityAlerts.length === 0 && (
                              <div className="py-8 border border-agi-border border-dashed rounded-2xl text-center text-agi-muted text-[10px]">No active threat vectors in buffer.</div>
                           )}
                        </div>
                     </section>
                  </div>

                  <div className="space-y-8">
                     <SystemMonitor 
                        health={ctx.systemHealth} 
                        awareness={ctx.identity} 
                        tickPriority={ctx.tickPriority} 
                     />
                     
                     <div className="bg-agi-panel border border-agi-border rounded-3xl p-8">
                        <h3 className="text-xs font-bold text-agi-accent uppercase tracking-widest mb-6 flex items-center gap-2">
                           <ShieldCheck size={16} /> Identity Integrity
                        </h3>
                        <div className="space-y-6">
                           <div>
                              <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-tighter">Human_Resonance</div>
                              <div className="h-2 bg-agi-border rounded-full overflow-hidden">
                                 <motion.div className="h-full bg-agi-success" animate={{ width: `${(ctx.identity.humanAlignment.score + 1) / 2 * 100}%` }} />
                              </div>
                           </div>
                           <div>
                              <div className="flex justify-between text-[10px] font-bold mb-2 uppercase tracking-tighter">Mission_Resonance</div>
                              <div className="h-2 bg-agi-border rounded-full overflow-hidden">
                                 <motion.div className="h-full bg-agi-accent" animate={{ width: `${ctx.identity.missionResonance * 100}%` }} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeFace === 'ECOSYSTEM' && (
                <motion.div 
                   key="ecosystem"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                   className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                   <div className="lg:col-span-2 space-y-8">
                      <section className="bg-agi-panel border border-agi-border rounded-[2rem] p-8">
                         <h3 className="text-xs font-bold text-agi-accent flex items-center gap-2 uppercase tracking-[0.3em] mb-8">
                            <Server size={18} /> Actuation Hub / Robotics
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {ctx.identity.actuators.map(act => (
                               <div key={act.id} className="p-6 border border-agi-border rounded-3xl bg-agi-bg/40 relative group hover:border-agi-accent transition-all">
                                  <div className="flex justify-between items-start mb-6">
                                     <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-agi-bg border border-agi-border group-hover:border-agi-accent/50 transition-colors">
                                           {act.type === 'ROBOTIC_ARM' ? <Power size={16} className="text-agi-accent" /> : 
                                            act.type === 'SMART_TV' ? <Tv size={16} className="text-agi-success" /> : 
                                            <Wifi size={16} className="text-agi-muted" />}
                                        </div>
                                        <div>
                                           <div className="text-[10px] font-bold font-mono text-agi-muted uppercase tracking-tighter">{act.type}</div>
                                           <div className="text-[13px] font-bold tracking-tight">{act.label}</div>
                                        </div>
                                     </div>
                                     <div className={`w-3 h-3 rounded-full ${act.status === 'IDLE' ? 'bg-agi-success shadow-[0_0_8px_rgba(34,197,94,0.4)]' : act.status === 'EXECUTING' ? 'bg-agi-accent animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-agi-danger'}`} />
                                  </div>
                                  
                                  <div className="space-y-4">
                                     <div className="flex justify-between text-[10px] font-mono mb-1 font-bold">
                                        <span className="opacity-50">LINK_FIDELITY</span>
                                        <span className="text-agi-accent">{Math.round(act.linkStatus * 100)}%</span>
                                     </div>
                                     <div className="h-1.5 bg-agi-border rounded-full overflow-hidden shadow-inner">
                                        <motion.div 
                                           className="h-full bg-agi-accent"
                                           animate={{ width: `${act.linkStatus * 100}%` }}
                                        />
                                     </div>
                                  </div>

                                  <div className="mt-6 pt-6 border-t border-agi-border/30 flex gap-3">
                                     <button className="flex-1 px-4 py-2 bg-agi-bg border border-agi-border rounded-xl text-[10px] font-bold hover:border-agi-accent transition-all uppercase tracking-widest">Connect</button>
                                     <button className="px-4 py-2 bg-agi-bg border border-agi-border rounded-xl text-[10px] font-bold hover:text-agi-danger hover:border-agi-danger transition-all uppercase tracking-widest">Kill</button>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>

                      <section className="bg-agi-panel border border-agi-border rounded-[2rem] p-8">
                         <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-bold text-agi-danger flex items-center gap-2 uppercase tracking-[0.3em]">
                               <ShieldAlert size={18} /> Threat Buffer / Eagle Eye
                            </h3>
                            {ctx.identity.isSelfProtectionActive && (
                               <div className="flex items-center gap-2 bg-agi-danger/10 text-agi-danger px-4 py-1.5 rounded-full border border-agi-danger/30 animate-pulse">
                                  <Lock size={14} />
                                  <span className="text-[10px] font-bold tracking-widest">PROTECTION_ENGAGED</span>
                               </div>
                            )}
                         </div>
                         
                         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {ctx.identity.securityAlerts.length === 0 ? (
                               <div className="h-48 border-2 border-dashed border-agi-border rounded-3xl flex flex-col items-center justify-center text-agi-muted gap-4">
                                  <ShieldCheck size={40} className="opacity-10" />
                                  <span className="text-[11px] font-bold uppercase tracking-widest opacity-40">No intrusive activities detected.</span>
                               </div>
                            ) : (
                               ctx.identity.securityAlerts.map(alert => (
                                  <motion.div 
                                     key={alert.id}
                                     initial={{ opacity: 0, scale: 0.98 }}
                                     animate={{ opacity: 1, scale: 1 }}
                                     className={`p-6 rounded-2xl border ${alert.severity > 0.9 ? 'border-agi-danger bg-agi-danger/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-agi-warning/50 bg-agi-warning/5'}`}
                                  >
                                     <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                           <span className={`w-2.5 h-2.5 rounded-full ${alert.severity > 0.9 ? 'bg-agi-danger animate-ping' : 'bg-agi-warning'}`} />
                                           <span className="text-[12px] font-black font-mono tracking-tighter">{alert.type}</span>
                                        </div>
                                        <span className="text-[10px] opacity-40 font-mono font-bold">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                     </div>
                                     <p className="text-[11px] text-agi-text mb-6 leading-relaxed opacity-90 italic">"{alert.description}"</p>
                                     <div className="flex justify-between items-center text-[10px] font-mono">
                                        <span className="text-agi-muted font-bold tracking-wider">ORIGIN_TRACE: {alert.origin}</span>
                                        <div className="flex gap-6">
                                           <button 
                                              onClick={() => sendCommand('MITIGATE_ALERT', { id: alert.id })}
                                              disabled={alert.mitigated}
                                              className={`${alert.mitigated ? 'text-agi-success opacity-80 cursor-default' : 'text-agi-accent hover:underline'} transition-all font-black tracking-[0.1em]`}
                                           >
                                              {alert.mitigated ? 'MITIGATED' : 'AUTONOMOUS_RESPONSE'}
                                           </button>
                                           <button className="text-agi-accent hover:underline font-black tracking-[0.1em]">ISOLATE</button>
                                        </div>
                                     </div>
                                  </motion.div>
                               ))
                            )}
                         </div>
                      </section>
                   </div>

                   <div className="space-y-8">
                      <section className="bg-agi-panel border border-agi-border rounded-[2rem] p-8">
                         <h3 className="text-xs font-bold text-agi-muted mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
                            <Activity size={16} /> Security Node Array
                         </h3>
                         <div className="space-y-4">
                            {ctx.identity.eagleEyeNodes.map(node => (
                               <div key={node.id} className="p-5 border border-agi-border rounded-2xl bg-agi-bg/40 hover:bg-agi-bg/60 transition-all group">
                                  <div className="flex justify-between items-center mb-6">
                                     <span className="text-[11px] font-black font-mono text-agi-text/80 tracking-widest">{node.label}</span>
                                     <span className={`text-[9px] px-3 py-1 rounded-full font-black tracking-widest border ${
                                        node.status === 'SCANNING' ? 'border-agi-success/30 bg-agi-success/10 text-agi-success' :
                                        node.status === 'LOCKED' ? 'border-agi-accent/30 bg-agi-accent/10 text-agi-accent' :
                                        'border-agi-danger/30 bg-agi-danger/10 text-agi-danger'
                                     }`}>
                                        {node.status}
                                     </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="space-y-1">
                                      <span className="text-[8px] text-agi-muted uppercase font-black tracking-widest">Bandwidth</span>
                                      <div className="text-[14px] font-mono font-bold text-agi-accent tracking-tighter">
                                        {node.bandwidth.toFixed(1)} <span className="text-[10px] opacity-50">MB/s</span>
                                      </div>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-[8px] text-agi-muted uppercase font-black tracking-widest">Sockets</span>
                                      <div className="text-[14px] font-mono font-bold text-agi-success tracking-tighter">
                                        {node.connections} <span className="text-[10px] opacity-50">Active</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                     <div className="flex justify-between text-[9px] text-agi-muted font-mono font-bold tracking-widest">
                                        <span>RESOURCE_UTIL</span>
                                        <span className="text-agi-text">{Math.round(node.load * 100)}%</span>
                                     </div>
                                     <div className="h-1.5 bg-agi-border rounded-full overflow-hidden shadow-inner">
                                        <motion.div 
                                           className={`h-full ${node.load > 0.8 ? 'bg-agi-danger' : 'bg-agi-accent'} shadow-[0_0_8px_rgba(59,130,246,0.3)]`}
                                           animate={{ width: `${node.load * 100}%` }}
                                        />
                                     </div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>

                      <div className="p-8 border border-agi-border rounded-[2rem] bg-agi-panel border-agi-danger/20 shadow-[0_0_40px_rgba(239,68,68,0.05)]">
                         <h3 className="text-[10px] font-bold text-agi-danger uppercase tracking-[0.3em] mb-6">Integrity Baseline</h3>
                         <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20">
                               <svg className="w-full h-full" viewBox="0 0 36 36">
                                  <path className="text-agi-border" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                  <motion.path 
                                    className="text-agi-danger" 
                                    strokeDasharray={`${Math.round(ctx.identity.missionResonance * 100)}, 100`} 
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2" 
                                  />
                               </svg>
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <User size={24} className="text-agi-danger" />
                                </div>
                            </div>
                            <div>
                               <div className="text-[10px] font-black text-agi-muted uppercase tracking-[0.2em] mb-1">SOVEREIGNTY_RATIO</div>
                               <div className="text-2xl font-mono font-bold text-agi-text tracking-tighter">{(ctx.identity.missionResonance * 100).toFixed(2)}%</div>
                            </div>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeFace === 'VAULT' && (
                <motion.div 
                  key="vault"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-7xl mx-auto space-y-8"
                >
                   <div className="flex justify-between items-center mb-8 pb-4 border-b border-agi-border">
                      <h2 className="text-xs font-bold text-agi-accent flex items-center gap-2 uppercase tracking-[0.3em]">
                         <Database size={16} /> Alpha Delta Vault
                      </h2>
                      <div className="flex items-center gap-4 text-[10px] text-agi-muted">
                        <button
                          onClick={() => sendCommand('CLEAR_VAULT', {})}
                          disabled={ctx.identity.memoryBank.length === 0}
                          className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-colors
                            ${ctx.identity.memoryBank.length === 0 
                              ? 'border-agi-border/50 text-agi-muted/50 cursor-not-allowed bg-agi-panel/50' 
                              : 'border-agi-border text-agi-muted hover:text-agi-accent hover:border-agi-accent bg-agi-panel cursor-pointer'
                            }`}
                        >
                          <Trash2 size={12} /> Clear Cache
                        </button>
                        <span className="flex items-center gap-1.5"><Clock size={12}/> STORAGE_DURATION: PERSISTENT</span>
                        <span className="flex items-center gap-1.5"><Shield size={12}/> ENCRYPTED_AT_REST</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="md:col-span-2 space-y-4">
                        {ctx.identity.memoryBank.length === 0 ? (
                           <div className="p-12 border border-dashed border-agi-border rounded-3xl flex flex-col items-center justify-center text-agi-muted gap-4 text-center bg-agi-panel/20">
                              <Layers size={40} className="opacity-20 animate-pulse" />
                              <div className="space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-widest">Vault Empty</div>
                                <div className="text-[9px] opacity-60">No semantic fragments committed to Alpha Delta yet.</div>
                              </div>
                           </div>
                        ) : (
                           ctx.identity.memoryBank.map(mem => <MemoryCard key={mem.id} memory={mem} />)
                        )}
                     </div>

                     <div className="space-y-6">
                        <div className="p-6 border border-agi-border bg-agi-panel rounded-3xl">
                           <h3 className="text-[10px] font-bold text-agi-accent uppercase mb-4 tracking-widest flex items-center gap-2"><Target size={14} /> Cognitive Baselines</h3>
                           <div className="space-y-4">
                              <HealthBar label="MEMORY_SOVEREIGNTY" value={ctx.identity.bootSequence.baselines.memorySovereignty * 100} colorClass="bg-agi-success" icon={ShieldCheck} />
                              <HealthBar label="SEMANTIC_COHESION" value={ctx.identity.selfModelStability * 100} colorClass="bg-agi-accent" icon={Zap} />
                              <div className="pt-2 border-t border-agi-border/50">
                                 <div className="flex justify-between text-[11px] mb-2 font-bold">
                                    <span className="opacity-50 font-mono">RECORDS</span>
                                    <span>{ctx.identity.memoryBank.length}</span>
                                 </div>
                                 <div className="flex justify-between text-[11px] font-bold">
                                    <span className="opacity-50 font-mono">RELEVANCE</span>
                                    <span className="text-agi-accent">
                                       {ctx.identity.memoryBank.length > 0 
                                         ? (ctx.identity.memoryBank.reduce((acc, m) => acc + m.relevance, 0) / ctx.identity.memoryBank.length * 100).toFixed(1)
                                         : '0.0'}%
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="p-6 border border-agi-border bg-agi-panel/30 rounded-3xl">
                           <h3 className="text-[10px] font-bold text-agi-muted uppercase mb-4 tracking-widest">Resonance Metrics</h3>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-agi-muted">
                                 <span>Emotional_Valence</span>
                                 <span className={ctx.emotionalState.valence > 0 ? 'text-agi-success' : 'text-agi-danger'}>
                                    {ctx.emotionalState.valence > 0 ? '+' : ''}{(ctx.emotionalState.valence ?? 0).toFixed(2)}
                                 </span>
                              </div>
                              <div className="h-1 bg-agi-border rounded-full overflow-hidden flex">
                                 <div className="h-full bg-agi-danger" style={{ width: `${(1 - ((ctx.emotionalState.valence ?? 0) + 1)/2) * 100}%` }} />
                                 <div className="h-full bg-agi-success flex-1" />
                              </div>

                              <div className="flex justify-between items-center text-[9px] uppercase font-bold text-agi-muted mt-2">
                                 <span>Human_Resonance</span>
                                 <span className="text-agi-accent">{(ctx.identity.humanAlignment.score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="h-1 bg-agi-border rounded-full overflow-hidden">
                                 <motion.div 
                                   className="h-full bg-agi-accent" 
                                   animate={{ width: `${(ctx.identity.humanAlignment.score + 1) / 2 * 100}%` }} 
                                 />
                               </div>
                           </div>
                        </div>
                     </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BOTTOM RAIL: SYSTEM STATUS */}
          <footer className="h-10 border-t border-agi-border flex items-center px-4 bg-agi-panel/50 backdrop-blur-sm text-[10px] justify-between">
            <div className="flex gap-6 opacity-60">
               <div className="flex items-center gap-1.5"><Shield size={12}/> IDENTITY_EVO: v3.5.1</div>
               <div className="flex items-center gap-1.5"><Database size={12}/> ALPHA_DELTA: {ctx.identity.memoryBank.length} BLOCKS</div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 text-agi-success font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-agi-success animate-pulse" />
                  NOMINAL_SOVEREIGN_OPS
               </div>
            </div>
          </footer>
        </main>
      </div>
      
      {/* GLOBAL OVERLAYS */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-agi-bg/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 md:p-12"
            onClick={closeEventModal}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 1.05, opacity: 0, y: -30 }}
              className="bg-agi-panel border border-agi-border rounded-[2.5rem] max-w-4xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row h-full max-h-[800px]"
              onClick={e => e.stopPropagation()}
            >
               {/* Left Panel: Visuals & Core Data */}
               <div className="w-full md:w-[40%] bg-agi-bg/40 border-r border-agi-border p-8 flex flex-col">
                  <div className="flex justify-between items-center mb-8">
                     <div className="p-3 bg-agi-accent/10 border border-agi-accent/30 rounded-2xl text-agi-accent">
                        <Globe size={24} />
                     </div>
                     <button onClick={closeEventModal} className="md:hidden p-2 hover:bg-agi-border rounded-full">
                        <X size={20} className="text-agi-muted" />
                     </button>
                  </div>

                  <div className="space-y-1 mb-8">
                     <div className="text-[10px] text-agi-accent font-black uppercase tracking-[0.4em] mb-2">Live_Telemetric_View</div>
                     <h2 className="text-3xl font-black text-agi-text tracking-tighter leading-none mb-2">
                        {selectedEvent.type.split('_').join(' ')}
                     </h2>
                     <div className="flex items-center gap-2 text-[10px] font-mono text-agi-muted uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-agi-accent animate-pulse" /> {selectedEvent.source} // {selectedEvent.id.slice(0, 8)}
                     </div>
                  </div>

                  <div className="flex-1 space-y-6">
                     <div className="p-4 bg-agi-bg/60 border border-agi-border rounded-3xl">
                        <div className="text-[8px] text-agi-muted uppercase font-bold tracking-widest mb-3">Geospatial_Resolution</div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-end">
                              <span className="text-[9px] text-agi-muted uppercase font-bold">Region</span>
                              <span className="text-xs font-bold text-agi-text uppercase">{selectedEvent.location}</span>
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[9px] text-agi-muted uppercase font-bold">Coordinates</span>
                              <span className="text-[11px] font-mono text-agi-accent font-bold tracking-tighter">
                                 {selectedEvent.lat?.toFixed(4) ?? '0.000'}N {selectedEvent.lng?.toFixed(4) ?? '0.000'}E
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="p-4 bg-agi-bg/60 border border-agi-border rounded-3xl">
                        <div className="text-[8px] text-agi-muted uppercase font-bold tracking-widest mb-3">Temporal_Stamp</div>
                        <div className="flex justify-between items-end">
                           <span className="text-[9px] text-agi-muted uppercase font-bold">Inferred_Start</span>
                           <span className="text-xs font-bold font-mono text-agi-text">
                              {new Date(selectedEvent.timestamp).toLocaleTimeString()}
                           </span>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                           <span className="text-[9px] text-agi-muted uppercase font-bold">Epoch_Index</span>
                           <span className="text-[10px] font-mono text-agi-muted">{selectedEvent.timestamp}</span>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-agi-border flex gap-4">
                     <div className="flex-1">
                        <div className="text-[8px] text-agi-muted uppercase font-bold mb-1">Harmonic_State</div>
                        <div className={`text-xl font-black font-mono ${selectedEvent.severity > 0.8 ? 'text-agi-danger' : 'text-agi-accent'}`}>
                           {(selectedEvent.severity * 100 || 0).toFixed(1)}%
                        </div>
                     </div>
                     <div className="flex-1">
                         <div className="text-[8px] text-agi-muted uppercase font-bold mb-1">Status</div>
                         <div className="text-[9px] font-bold py-1 px-3 bg-agi-success/20 text-agi-success rounded-full inline-block border border-agi-success/30">
                            ANALYSIS_READY
                         </div>
                     </div>
                  </div>
               </div>

               {/* Right Panel: Analysis & Charts */}
               <div className="flex-1 p-8 flex flex-col relative overflow-hidden">
                  <button onClick={closeEventModal} className="hidden md:block absolute top-8 right-8 p-2 hover:bg-agi-border rounded-full z-20">
                     <X size={20} className="text-agi-muted" />
                  </button>

                  <div className="flex-1 space-y-10 custom-scrollbar overflow-y-auto pr-4">
                     <section>
                        <h3 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Brain size={14} /> Cognitive Descriptor
                        </h3>
                        <p className="text-lg text-agi-text font-serif italic leading-relaxed first-letter:text-4xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-agi-accent opacity-90">
                           {selectedEvent.description}
                        </p>
                     </section>

                     <section>
                        <h3 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                           <TrendingUp size={14} /> Intensity_Resonance_Chart
                        </h3>
                        <div className="h-48 w-full bg-agi-bg/20 border border-agi-border rounded-3xl p-6 shadow-inner">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={selectedEvent.severityHistory.map((s, i) => ({ value: s, time: i }))}>
                                 <defs>
                                    <linearGradient id="eventGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor={selectedEvent.severity > 0.8 ? 'var(--color-agi-danger)' : 'var(--color-agi-accent)'} stopOpacity={0.4}/>
                                       <stop offset="95%" stopColor={selectedEvent.severity > 0.8 ? 'var(--color-agi-danger)' : 'var(--color-agi-accent)'} stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--color-agi-panel)', border: '1px solid var(--color-agi-border)', borderRadius: '12px', fontSize: '10px' }}
                                    itemStyle={{ color: 'var(--color-agi-accent)' }}
                                    labelStyle={{ display: 'none' }}
                                 />
                                 <XAxis dataKey="time" hide />
                                 <YAxis hide domain={[0, 1.1]} />
                                 <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={selectedEvent.severity > 0.8 ? 'var(--color-agi-danger)' : 'var(--color-agi-accent)'} 
                                    fill="url(#eventGrad)" 
                                    strokeWidth={3}
                                    animationDuration={1500}
                                 />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </section>

                     <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <h3 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Layers size={14} /> Harmonic_Overlaps
                           </h3>
                           <div className="flex flex-wrap gap-2">
                              {selectedEvent.relatedPatterns ? (
                                 selectedEvent.relatedPatterns.map(p => (
                                    <div key={p} className="px-3 py-2 bg-agi-panel border border-agi-border rounded-xl text-[10px] font-mono text-agi-text flex items-center gap-2 hover:border-agi-accent transition-colors cursor-help">
                                       <div className="w-1.5 h-1.5 rounded-full bg-agi-accent" /> {p}
                                    </div>
                                 ))
                              ) : (
                                 ['STRATOSPHERIC_DRIFT', 'SEISMIC_VOID'].map(p => (
                                    <div key={p} className="px-3 py-2 bg-agi-panel border border-agi-border rounded-xl text-[10px] font-mono text-agi-muted flex items-center gap-2 opacity-60">
                                       <div className="w-1.5 h-1.5 rounded-full bg-agi-muted" /> {p}
                                    </div>
                                 ))
                              )}
                           </div>
                        </div>

                        <div>
                           <h3 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Shield size={14} /> Impact_Assessment
                           </h3>
                           {selectedEvent.impactAssessment ? (
                             <div className={`p-4 border rounded-2xl ${
                               selectedEvent.impactAssessment.riskLevel === 'CRITICAL' ? 'bg-agi-danger/10 border-agi-danger/30' :
                               selectedEvent.impactAssessment.riskLevel === 'HIGH' ? 'bg-agi-warning/10 border-agi-warning/30' :
                               'bg-agi-accent/5 border-agi-accent/20'
                             }`}>
                               <div className="flex justify-between items-center mb-3">
                                 <span className="text-[9px] text-agi-muted uppercase font-bold">Predicted_Evolution</span>
                                 <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                   selectedEvent.impactAssessment.riskLevel === 'CRITICAL' ? 'bg-agi-danger text-agi-bg' :
                                   selectedEvent.impactAssessment.riskLevel === 'HIGH' ? 'bg-agi-warning text-agi-bg' : 'text-agi-accent'
                                 }`}>
                                   {selectedEvent.impactAssessment.riskLevel}
                                 </span>
                               </div>
                               <p className="text-[10px] text-agi-text leading-tight italic font-mono mb-4">
                                 "{selectedEvent.impactAssessment.predictedEvolution}"
                               </p>
                               <div className="space-y-1">
                                 <div className="text-[8px] text-agi-muted uppercase font-bold">Affected_Subsystems:</div>
                                 <div className="flex flex-wrap gap-1">
                                   {selectedEvent.impactAssessment.affectedSystems.map(s => (
                                     <span key={s} className="text-[7px] font-mono font-bold text-agi-muted border border-agi-border/50 px-1.5 py-0.5 rounded">
                                       {s}
                                     </span>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           ) : (
                             <div className="p-4 bg-agi-accent/5 border border-agi-accent/20 rounded-2xl">
                               <div className="text-[11px] text-agi-text/80 leading-relaxed italic font-mono mb-3">
                                  Current trajectory predicts 84% decay probability within next iteration. System remains in passive monitoring phase.
                               </div>
                               <div className="flex justify-between items-center text-[8px] font-black tracking-[0.2em] text-agi-accent uppercase">
                                  <span>Integrity: Stable</span>
                                  <span>Decay: 0.12Hz</span>
                               </div>
                             </div>
                           )}
                        </div>
                     </section>
                  </div>

                   <div className="mt-10 flex gap-4 pt-6 border-t border-agi-border">
                     <button 
                        onClick={() => {
                           sendCommand('INCORPORATE_EVENT', { id: selectedEvent.id });
                           closeEventModal();
                        }}
                        className="flex-1 py-4 bg-agi-accent text-agi-bg font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                     >
                        Incorporate_Cortex
                     </button>
                     <button 
                        onClick={closeEventModal}
                        className="px-8 py-4 border-2 border-agi-border hover:border-agi-accent text-agi-text font-bold rounded-2xl text-[11px] uppercase tracking-widest transition-all"
                     >
                        Close
                     </button>
                  </div>
               </div>
            </motion.div>
          </motion.div>
        )}

        {selectedGoal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-agi-bg/95 backdrop-blur-lg z-[100] flex items-center justify-center p-6"
            onClick={() => setSelectedGoalId(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-agi-panel border border-agi-accent/20 rounded-[2rem] p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
               <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                 <Target size={240} className="text-agi-accent" />
               </div>
               
               <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                     <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-agi-accent/10 border border-agi-accent/30`}>
                           <Target size={20} className="text-agi-accent" />
                        </div>
                        <div className="text-[10px] text-agi-accent font-bold uppercase tracking-[0.4em] font-mono">Mission_Objective // {selectedGoal.origin}</div>
                     </div>
                     <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{selectedGoal.description}</h2>
                     <div className="text-xs text-agi-muted font-mono uppercase tracking-widest">ID::{selectedGoal.id}</div>
                  </div>
                  <button onClick={() => setSelectedGoalId(null)} className="p-2 hover:bg-agi-border/50 rounded-full transition-colors">
                     <X size={28} className="text-agi-muted" />
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10 relative z-10">
                  <div className="md:col-span-3 space-y-8">
                     <div>
                        <div className="text-[10px] text-agi-muted uppercase font-bold mb-3 tracking-widest flex items-center gap-2">
                           <Layers size={12} /> Strategic_Intent
                        </div>
                        <p className="text-sm leading-relaxed text-agi-text/90 bg-agi-bg/30 p-4 rounded-xl border border-agi-border/30">
                           {selectedGoal.description}. This objective is critical for maintaining systemic equilibrium across both internal identity metrics and planetary feedback loops.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-agi-bg/30 rounded-xl border border-agi-border/30">
                           <div className="text-[9px] text-agi-muted uppercase font-bold mb-1 tracking-tighter">Status</div>
                           <div className={`text-xs font-bold ${selectedGoal.status === 'ACTIVE' ? 'text-agi-success' : 'text-agi-warning'}`}>{selectedGoal.status}</div>
                        </div>
                        <div className="p-4 bg-agi-bg/30 rounded-xl border border-agi-border/30">
                           <div className="text-[9px] text-agi-muted uppercase font-bold mb-1 tracking-tighter">Priority_Rating</div>
                           <div className="text-xs font-bold text-agi-accent">{selectedGoal.priority.toFixed(2)}</div>
                        </div>
                     </div>

                     <div>
                        <div className="text-[10px] text-agi-muted uppercase font-bold mb-3 tracking-widest flex items-center gap-2">
                           <ShieldAlert size={12} className="text-agi-danger" /> Known_Blockers
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {selectedGoal.blockers.length > 0 ? (
                             selectedGoal.blockers.map((b, i) => (
                               <span key={i} className="text-[10px] px-3 py-1 bg-agi-danger/10 border border-agi-danger/30 text-agi-danger rounded-lg font-bold">
                                 {b}
                               </span>
                             ))
                           ) : (
                             <span className="text-[10px] italic text-agi-muted">No immediate progression barriers detected.</span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="md:col-span-2 space-y-8">
                     <div className="bg-agi-bg/50 border border-agi-border rounded-2xl p-6 relative overflow-hidden group">
                        <div className="text-[10px] text-agi-muted uppercase font-bold mb-6 tracking-widest">Progress_Converge</div>
                        <div className="relative h-24 w-24 mx-auto">
                           <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                              <circle cx="18" cy="18" r="16" fill="none" className="stroke-agi-border" strokeWidth="2" />
                              <motion.circle 
                                 cx="18" cy="18" r="16" fill="none" 
                                 className="stroke-agi-accent" 
                                 strokeWidth="2" 
                                 strokeDasharray="100 100"
                                 initial={{ strokeDashoffset: 100 }}
                                 animate={{ strokeDashoffset: 100 - (selectedGoal.progress * 100) }}
                                 transition={{ duration: 1.5, ease: "easeOut" }}
                              />
                           </svg>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xl font-bold font-mono text-agi-accent">{Math.round(selectedGoal.progress * 100)}%</span>
                           </div>
                        </div>
                     </div>

                     <div className="bg-agi-bg/50 border border-agi-border rounded-2xl p-6 space-y-4">
                        <div className="text-[10px] text-agi-muted uppercase font-bold mb-2 tracking-widest flex items-center gap-2">
                           <Clock size={12} /> Temporal_Matrix
                        </div>
                        <div className="space-y-3">
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-agi-muted uppercase font-medium">Creation_Stamp</span>
                              <span className="text-agi-text font-mono">{new Date(selectedGoal.createdAt).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-agi-muted uppercase font-medium">Last_Evolution</span>
                              <span className="text-agi-text font-mono">{new Date(selectedGoal.updatedAt).toLocaleString()}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px]">
                              <span className="text-agi-muted uppercase font-medium">Projected_Deadline</span>
                              <span className="text-agi-accent font-mono">
                                 {selectedGoal.deadline ? new Date(selectedGoal.deadline).toLocaleString() : 'UNDEFINED_HORIZON'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div>
                        <div className="text-[10px] text-agi-muted uppercase font-bold mb-3 tracking-widest">Related_Patterns</div>
                        <div className="space-y-2">
                           {selectedGoal.relatedPatterns.map((p, i) => (
                             <div key={i} className="flex items-center gap-2 text-[10px] text-agi-accent font-mono p-2 bg-agi-accent/5 border border-agi-accent/20 rounded-lg hover:bg-agi-accent/10 transition-colors cursor-pointer">
                                <Search size={10} />
                                <span>PAT_REF::{p}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 relative z-10 pt-6 border-t border-agi-border/30">
                  <button className="flex-1 py-4 bg-agi-accent text-agi-bg font-bold rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                     prioritize_execution
                  </button>
                  <button onClick={() => setSelectedGoalId(null)} className="flex-1 py-4 border border-agi-border hover:border-agi-accent text-agi-text font-bold rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all">
                     return_to_stack
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}

        {isSimControlOpen && activeFace === 'BUILDER' && (
          <SimulationControlPanel 
            sims={ctx.identity.activeSimulations}
            onClose={() => setIsSimControlOpen(false)}
            onTrigger={(params) => {
              if (params.stop) {
                sendCommand('STOP_SIM', { type: params.type });
              } else {
                sendCommand('TRIGGER_SIM', params);
              }
            }}
          />
        )}

        {isGoalSuggesterOpen && (
          <GoalSuggester 
            ctx={ctx}
            earthEvents={earthEvents}
            onClose={() => setIsGoalSuggesterOpen(false)}
            onSuggest={(goal) => {
              sendCommand('ADD_GOAL', { goal });
              setIsGoalSuggesterOpen(false);
            }}
          />
        )}
      </AnimatePresence>

      {ctx.identity.bootSequence.stage !== 'COMPLETE' && (
        <BootOverlay boot={ctx.identity.bootSequence} />
      )}
      
      {ctx.systemHealth.degradationLevel === DegradationLevel.EMERGENCY && (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute inset-0 z-50 bg-agi-danger/10 pointer-events-none flex items-center justify-center"
        >
           <div className="bg-agi-danger text-agi-bg px-6 py-3 rounded-md font-bold text-xl tracking-[0.2em] animate-pulse">
              EMERGENCY_DEGRADATION_TRIGGERED
           </div>
        </motion.div>
      )}
    </div>
  );
}

