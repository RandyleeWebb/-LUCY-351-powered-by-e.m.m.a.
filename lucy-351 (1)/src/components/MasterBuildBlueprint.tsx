import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Database, Shield, Radio, Layers, Activity, GitBranch, FileText, ChevronRight } from 'lucide-react';

const MASTER_BLUEPRINT_SECTIONS = [
  {
    id: 'runtime-spine',
    title: 'Phase 1: Runtime Spine & Infrastructure',
    icon: Server,
    colorClass: 'text-zinc-400 border-zinc-400/30 bg-zinc-400/10',
    details: [
      { label: 'Core Tech', value: 'Python 3.11+, FastAPI, Uvicorn, AsyncIO' },
      { label: 'Node Mesh', value: 'Async EventBus, DAG Builder, Node Registry (355 nodes)' },
      { label: 'Schemas', value: 'Strict Pydantic models (NodeMessage, StructuredInput)' },
      { label: 'Logging', value: 'Structured JSON Traces, Error Logger (ELK ready)' },
    ],
    description: 'The foundation of the machine mind. Operates entirely on an async EventBus. No bypassing allowed. A strict message schema guarantees interoperability across all 355 potential nodes.'
  },
  {
    id: 'perception-memory',
    title: 'Phase 2: Perception & Memory Systems',
    icon: Database,
    colorClass: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    details: [
      { label: 'Perception', value: 'Input Processor, Intent/Domain Classifier, Normalizer' },
      { label: 'Memory DBs', value: 'Vector Store (Chroma), Graph Store (Neo4j), Episodic (JSON)' },
      { label: 'Retrieval', value: 'Top-K RAG context retrieval before reasoning' },
      { label: 'Memory Types', value: 'Long-Term (Identity), Short-Term (Session), Swarm' },
    ],
    description: 'Translates raw external triggers into normalized concepts. Dips into hierarchical memory bands (LT/ST/SW) to append relevant context before passing off to Emma.'
  },
  {
    id: 'supervisory-control',
    title: 'Phase 3: Supervisory Control (EmmaPrime)',
    icon: Shield,
    colorClass: 'text-fuchsia-400 border-fuchsia-400/30 bg-fuchsia-400/10',
    details: [
      { label: 'Router', value: 'Selects active Little Lucys based on intent/domain' },
      { label: 'Merge Engine', value: 'Weighted scoring (confidence:0.4, relevance:0.3, consistency:0.2, novelty:0.1)' },
      { label: 'Safety Gate', value: 'Implements Eagle Eye policies, handles contradiction checking' },
      { label: 'Audit Engine', value: 'Cryptographic trace generation and decision logging' },
    ],
    description: 'The governance and control layer. Emma limits hallucinations, scores outcomes from the Little Lucy swarm, and ensures strict alignment with system directives.'
  },
  {
    id: 'lucy-swarm',
    title: 'Phase 4: Cognitive Swarm (Little Lucys)',
    icon: GitBranch,
    colorClass: 'text-teal-400 border-teal-400/30 bg-teal-400/10',
    details: [
      { label: 'Analytical', value: 'L1-L16: Logic, Math, SysAdmin, Troubleshooting' },
      { label: 'Creative', value: 'L17-L28: Synthesis, Ideation, Generative processes' },
      { label: 'Strategic', value: 'L29-L38: Planning, DAG generation, Systems OS' },
      { label: 'Reflective', value: 'L39-L48: Self-correction, Evaluation, Bias checking' },
    ],
    description: 'The parallel worker bees of the system. Little Lucys run concurrently but NEVER speak externally. They propose reasoning drafts and confidence scores to EmmaPrime.'
  },
  {
    id: 'lucy-prime',
    title: 'Phase 5: Synthesis & Execution (LucyPrime)',
    icon: Activity,
    colorClass: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    details: [
      { label: 'Identity Core', value: 'Maintains tone, personality, and sovereign directives' },
      { label: 'Synthesis Engine', value: 'Fuses audited Emma output into cohesive responses' },
      { label: 'Long-Term I/O', value: 'The ONLY entity allowed to trigger durable memory writes' },
      { label: 'State Manager', value: 'Controls system status (thinking, idle, synthesizing, responding)' },
    ],
    description: 'The sovereign ego. Takes the audited, merged package from Emma and structures it into the final output. The single source of external truth and memory persistence.'
  },
  {
    id: 'external-actuation',
    title: 'Phase 6: External Actuation Bridges',
    icon: Radio,
    colorClass: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    details: [
      { label: 'MobileAPI', value: 'FastAPI standardizing endpoints (/input, /state, /response)' },
      { label: 'Visual Stream / WS', value: 'WebSockets pushing 60Hz telemetry to React Twin' },
      { label: 'Actuation Envs', value: 'Unity ML-Agents, Unreal Engine Blueprints, Godot MCP' },
      { label: 'Action Dispatch', value: 'Executes approved actions (spawn object, run script)' },
    ],
    description: 'Where thought turns into action. Lucy uses bridges (like Unity or Unreal) as literal limbs to affect the external world. Mobile devices act as real-time viewports.'
  },
  {
    id: 'training-evolution',
    title: 'Phase 7: Training & Evolution Pipeline',
    icon: Layers,
    colorClass: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    details: [
      { label: 'JSONL Recorder', value: 'Records context, agents, scores, and output for fine-tuning' },
      { label: 'Handbook Gen', value: 'Compiles repeated failure/solution patterns into static playbooks' },
      { label: 'Curiosity Stack', value: 'Novelty detection (LL351-LL354) pushing boundaries' },
      { label: 'Evolution Band', value: 'Nodes LL326-LL350 reserved for sovereign expansions' },
    ],
    description: 'Continuous self-improvement. Logs are gathered and structured to map failure patterns and generate new heuristic handbooks. Facilitates Sovereign independence.'
  }
];

export const MasterBuildBlueprint: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>(MASTER_BLUEPRINT_SECTIONS[0].id);

  return (
    <section className="bg-agi-panel border border-agi-border rounded-3xl p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h3 className="text-xs font-bold text-agi-accent uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <FileText size={16} /> Final_Engineering_Blueprint_Specification
          </h3>
          <p className="text-[10px] text-agi-muted font-mono tracking-tight uppercase opacity-60">The comprehensive top-down master build roadmap for full system completion.</p>
        </div>
        <div className="flex items-center gap-4 bg-agi-bg/50 px-4 py-2 border border-agi-border rounded-xl">
           <span className="text-[9px] font-bold text-agi-accent uppercase tracking-widest pl-2">Target_Architecture_Status: Final</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left column navigation */}
        <div className="lg:w-1/3 flex flex-col gap-2 relative">
           <div className="absolute left-[20px] top-4 bottom-4 w-px bg-agi-border/50 z-0 hidden lg:block" />
          
          {MASTER_BLUEPRINT_SECTIONS.map((section, index) => {
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`relative z-10 flex items-center gap-4 p-3 rounded-xl transition-all text-left ${
                  isActive ? 'bg-agi-accent/10 border-l-2 border-agi-accent shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'hover:bg-agi-border/50 bg-transparent border-l-2 border-transparent hover:border-agi-border/80'
                }`}
              >
                <div className={`p-2 rounded-lg bg-agi-bg border ${isActive ? section.colorClass : 'border-agi-border text-agi-muted'}`}>
                  <section.icon size={16} />
                </div>
                <div className={`flex-1 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  isActive ? 'text-agi-accent' : 'text-agi-muted'
                }`}>
                  {section.title}
                </div>
                {isActive && <ChevronRight size={14} className="text-agi-accent" />}
              </button>
            )
          })}
        </div>

        {/* Right column details */}
        <div className="lg:w-2/3 border border-agi-border rounded-2xl bg-agi-bg/50 p-6 flex flex-col min-h-[400px]">
          <AnimatePresence mode="wait">
            {MASTER_BLUEPRINT_SECTIONS.map((section) => 
               section.id === activeSectionId ? (
                 <motion.div
                   key={section.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                   className="flex flex-col h-full"
                 >
                   <div className="flex items-center gap-4 mb-6 pb-6 border-b border-agi-border/50">
                     <div className={`p-4 rounded-xl border ${section.colorClass}`}>
                       <section.icon size={24} />
                     </div>
                     <div>
                       <h2 className="text-xl font-black text-agi-text uppercase tracking-widest leading-tight">{section.title.split(': ')[1]}</h2>
                       <p className="text-[10px] font-mono font-bold text-agi-muted uppercase mt-1">{section.title.split(': ')[0]}</p>
                     </div>
                   </div>

                   <p className="text-sm text-agi-text/90 leading-relaxed mb-8 indent-4 border-l-4 border-agi-border/50 pl-4 py-1">
                     {section.description}
                   </p>

                   <h4 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-4">Core Structural Specs</h4>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                     {section.details.map((detail, idx) => (
                       <div key={idx} className="bg-agi-panel border border-agi-border rounded-lg p-4 flex flex-col justify-between">
                         <span className="text-[9px] font-black uppercase text-agi-muted mb-2 tracking-[0.2em]">{detail.label}</span>
                         <span className="text-xs font-mono text-agi-text tracking-tight font-medium leading-relaxed">{detail.value}</span>
                       </div>
                     ))}
                   </div>
                 </motion.div>
               ) : null
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
