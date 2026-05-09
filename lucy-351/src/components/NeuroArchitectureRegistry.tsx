import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Layers, Cpu, Database, Activity, Eye, Play, Zap, Search, Target, Network } from 'lucide-react';

interface NeuroRegion {
  id: string;
  name: string;
  nodeRange: string;
  functions: string[];
  memoryType: 'LT' | 'ST' | 'SW';
  flowPosition: string;
  colorClass: string;
  icon: any;
  description: string;
}

const NEURO_REGIONS: NeuroRegion[] = [
  {
    id: 'core-nucleus',
    name: 'Core Nucleus',
    nodeRange: 'LL000-LL010, LL016, LL068, LL108',
    functions: ['Refiner', 'Intake, encryption, monitoring', 'IRON_PULSE', 'IRONPULSEPRIME', 'PULSEMATRIXCORE'],
    memoryType: 'LT',
    flowPosition: 'Core Layer',
    colorClass: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    icon: Activity,
    description: 'Prefrontal cortex equivalent — heartbeat, intake, refinement, stability.'
  },
  {
    id: 'inner-cognitive-ring',
    name: 'Inner Cognitive Ring',
    nodeRange: 'LL001-LL119',
    functions: ['Perception', 'Reasoning', 'Coordination', 'File reading', 'Documentation', 'Action routing'],
    memoryType: 'ST',
    flowPosition: 'Cognitive Layer 1',
    colorClass: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    icon: Cpu,
    description: 'Core reasoning, perception, coordination, and short-term working memory.'
  },
  {
    id: 'quantum-cortex',
    name: 'Quantum Cortex',
    nodeRange: 'LL120-LL137',
    functions: ['Hadamard', 'Pauli gates', 'Toffoli', 'Grover', 'Shor', 'Error correction', 'Oracle core'],
    memoryType: 'LT',
    flowPosition: 'Cognitive Layer 2',
    colorClass: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10',
    icon: Zap,
    description: 'Quantum reasoning band. Oracle reasoning and error correction.'
  },
  {
    id: 'neurogenesis-zone',
    name: 'Neurogenesis Zone',
    nodeRange: 'LL138-LL150',
    functions: ['PLURI01-PLURI13', 'Undifferentiated', 'Evolvable nodes'],
    memoryType: 'LT',
    flowPosition: 'Adaptive Layer',
    colorClass: 'text-teal-400 border-teal-400/30 bg-teal-400/10',
    icon: Layers,
    description: 'Stem Cell Layer. Adaptive growth and future learning potential.'
  },
  {
    id: 'sensory-cortex',
    name: 'Sensory Cortex',
    nodeRange: 'LL151-LL200',
    functions: ['Seismic', 'Tidal', 'Atmosphere', 'Solar', 'Biosphere', 'EarthPulse', 'WorldMonitor'],
    memoryType: 'ST',
    flowPosition: 'Input Layer',
    colorClass: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
    icon: Eye,
    description: 'Environmental + planetary inputs. Live sensor feeds.'
  },
  {
    id: 'executive-cortex',
    name: 'Executive Cortex',
    nodeRange: 'LL201-LL250',
    functions: ['Intent Weaver', 'Causal Engine', 'Decision Core', 'State Orchestrator', 'Think Loop', 'Central Mind'],
    memoryType: 'LT',
    flowPosition: 'Executive Layer',
    colorClass: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    icon: Target,
    description: 'Planner + policy + executive function. Intent and causality.'
  },
  {
    id: 'motor-cortex',
    name: 'Motor Cortex',
    nodeRange: 'LL251-LL325',
    functions: ['Code Weaver', 'Blueprint Forge', 'UE5 Agent', 'Blender Link', 'Security Agent', 'Architect Agent', 'Builder Mind'],
    memoryType: 'SW',
    flowPosition: 'Action Layer',
    colorClass: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    icon: Play,
    description: 'Action + tool-use layer. Swarm memory coordination for game dev.'
  },
  {
    id: 'evolution-band',
    name: 'Evolution Band',
    nodeRange: 'LL326-LL350',
    functions: ['VOIDSEED', 'QUANTUMSEED', 'MEMORYSEED', 'SOVEREIGNSEED'],
    memoryType: 'LT',
    flowPosition: 'Evolution Layer',
    colorClass: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    icon: Database,
    description: 'Seeds for future evolution. Reserved expansion layer.'
  },
  {
    id: 'curiosity-lobe',
    name: 'Curiosity Lobe (Stack V2)',
    nodeRange: 'LL351-LL354',
    functions: ['Exploratory Curiosity', 'Investigative Curiosity', 'Curiosity Governor', 'Curiosity Gate'],
    memoryType: 'ST',
    flowPosition: 'Meta-Cognition Layer',
    colorClass: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
    icon: Search,
    description: 'Novelty + exploration + boundary enforcement system.'
  }
];

export const NeuroArchitectureRegistry: React.FC = () => {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  return (
    <section className="bg-agi-panel border border-agi-border rounded-3xl p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h3 className="text-xs font-bold text-agi-accent uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <Brain size={16} /> Lucy_Neuro_Architecture_V3
          </h3>
          <p className="text-[10px] text-agi-muted font-mono tracking-tight uppercase opacity-60">Mapping 355 nodes into an 8-layer brain model.</p>
        </div>
        <div className="flex items-center gap-4 bg-agi-bg/50 px-4 py-2 border border-agi-border rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-agi-muted uppercase tracking-widest">Total_Nodes:</span>
            <span className="text-xs font-mono font-bold text-agi-accent">355</span>
          </div>
          <div className="w-px h-6 bg-agi-border" />
          <div className="flex items-center gap-2">
            <Network size={14} className="text-agi-success" />
            <span className="text-[9px] font-bold text-agi-success uppercase tracking-widest">Equilibrium_State_Achieved</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 flex flex-col gap-2">
          {NEURO_REGIONS.map(region => {
            const isSelected = selectedRegionId === region.id;
            return (
              <button
                key={region.id}
                onClick={() => setSelectedRegionId(isSelected ? null : region.id)}
                className={`p-4 rounded-xl border transition-all text-left group
                  ${isSelected ? `border-agi-accent bg-agi-accent/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]` : 'border-agi-border hover:border-agi-accent/30 bg-agi-bg/30'}
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg border ${region.colorClass}`}>
                    <region.icon size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-agi-text group-hover:text-agi-accent transition-colors">{region.name}</div>
                    <div className="text-[9px] font-mono text-agi-muted">{region.nodeRange}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div className="lg:w-2/3 border border-agi-border rounded-2xl bg-agi-bg/50 p-6 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="popLayout">
            {selectedRegionId ? (
              <motion.div
                key={selectedRegionId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                {(() => {
                  const region = NEURO_REGIONS.find(r => r.id === selectedRegionId)!;
                  return (
                    <div className="space-y-6">
                      <div className="flex items-start justify-between border-b border-agi-border/50 pb-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl border ${region.colorClass}`}>
                            <region.icon size={24} />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold uppercase tracking-wider text-agi-text mb-1">{region.name}</h2>
                            <p className="text-[10px] text-agi-muted font-mono tracking-widest uppercase">{region.flowPosition}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded border text-[10px] font-bold font-mono tracking-widest uppercase
                            ${region.memoryType === 'LT' ? 'border-orange-500/30 text-orange-500 bg-orange-500/10' : 
                              region.memoryType === 'ST' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' : 
                              'border-fuchsia-500/30 text-fuchsia-500 bg-fuchsia-500/10'}
                          `}>
                            {region.memoryType === 'LT' ? 'LONG_TERM_MEMORY' : region.memoryType === 'ST' ? 'SHORT_TERM_MEMORY' : 'SWARM_MEMORY'}
                          </span>
                        </div>
                      </div>

                      <div>
                         <h4 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-3">Role & Description</h4>
                         <p className="text-sm text-agi-text/80 leading-relaxed indent-4 border-l-2 border-agi-accent/50 pl-4">
                           {region.description}
                         </p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-3">Cognitive Functions</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {region.functions.map((func, i) => (
                            <div key={i} className="flex items-center gap-2 bg-agi-panel/50 border border-agi-border rounded-lg p-3">
                              <div className="w-1.5 h-1.5 bg-agi-accent rounded-full opacity-60" />
                              <span className="text-xs font-mono text-agi-text">{func}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-6">
                        <div className="px-4 py-3 border border-agi-border border-dashed rounded-xl bg-agi-panel flex items-center justify-between">
                           <span className="text-[10px] text-agi-muted uppercase tracking-widest font-bold">Node Allocation Range</span>
                           <span className="text-xs font-mono font-bold text-agi-text tracking-widest">{region.nodeRange}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center opacity-40"
              >
                <Brain size={64} className="mb-6 text-agi-muted" />
                <p className="text-sm font-mono uppercase tracking-widest text-center">Select a neuro-region to<br/>view mapping telemetry.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="mt-12 pt-6 border-t border-agi-border">
         <h4 className="text-[10px] font-bold text-agi-muted uppercase tracking-widest mb-4">Neural Pathways Logic Flow</h4>
         <div className="flex flex-col gap-2 relative">
            <div className="absolute left-[3px] top-4 bottom-4 w-px bg-agi-border z-0" />
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-agi-text">
               <div className="w-2 h-2 rounded-full bg-agi-accent shadow-[0_0_10px_rgba(59,130,246,0.6)]" /> Input
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">
               <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" /> Core Nucleus (LL000–LL010)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-blue-400">
               <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]" /> Inner Cognitive Ring (LL011–LL119)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-fuchsia-400">
               <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.6)]" /> Quantum Cortex (LL120–LL137)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400">
               <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]" /> Executive Cortex (LL201–LL250)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-orange-400">
               <div className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]" /> Motor Cortex (LL251–LL325)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-agi-muted">
               <div className="w-2 h-2 rounded-full bg-agi-muted" /> Memory Bands (LT/ST/SW)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-pink-400">
               <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.6)]" /> Curiosity Lobe (LL351–LL354)
            </div>
            <div className="flex items-center gap-4 relative z-10 text-[9px] font-mono font-bold uppercase tracking-widest text-purple-400">
               <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.6)]" /> Evolution Band (LL326–LL350)
            </div>
         </div>
      </div>
    </section>
  );
};
