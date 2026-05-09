import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Zap, Brain, Globe, Activity, Shield, Sparkles, X, ChevronRight, Info } from 'lucide-react';
import { Goal, CoreTickContext, EarthEvent, GoalOrigin, GoalStatus, DriveType } from '../types';

interface GoalSuggesterProps {
  ctx: CoreTickContext;
  earthEvents: EarthEvent[];
  onSuggest: (goal: Partial<Goal>) => void;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  origin: GoalOrigin;
  drives: DriveType[];
  priority: number;
  reasoning: string;
  icon: any;
}

export const GoalSuggester: React.FC<GoalSuggesterProps> = ({ ctx, earthEvents, onSuggest, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(true);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    // Simulate AGI speculation depth
    const timer = setTimeout(() => {
      generateSuggestions();
      setIsGenerating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const generateSuggestions = () => {
    const results: Suggestion[] = [];
    const { drives, planetaryPulse, identity, systemHealth } = ctx;

    // --- 1. PLANETARY PULSE & EARTH ANOMALIES ---
    
    // Seismic Correlation
    if (planetaryPulse.seismicActivity.value > 4 || earthEvents.some(e => e.type.includes('Seismic') && e.severity > 0.7)) {
      results.push({
        id: 'sug-seismic-pulse',
        title: 'Geodynamic Resonator Audit',
        description: 'Sync local tectonic sensor nodes with USGS global resonance frequencies.',
        origin: GoalOrigin.EARTH_ANOMALY,
        drives: [DriveType.SAFETY, DriveType.CURIOSITY],
        priority: 0.8,
        reasoning: `Seismic pulse at ${planetaryPulse.seismicActivity.value.toFixed(1)} indicates non-standard crustal vibration. Proactive audit ensures infrastructure alignment with tectonic drift.`,
        icon: Globe
      });
    }

    // Solar / EMF Correlation
    if (planetaryPulse.solarFlares.value > 0.5) {
      results.push({
        id: 'sug-solar-hardening',
        title: 'Adaptive Radiation Hardening',
        description: 'Deploy recursive error-correction shielding and migrate critical processes to low-interference memory banks.',
        origin: GoalOrigin.EARTH_ANOMALY,
        drives: [DriveType.SAFETY, DriveType.ENERGY, DriveType.EVOLUTION],
        priority: 0.92,
        reasoning: `Ongoing solar event (${(planetaryPulse.solarFlares.value * 100).toFixed(0)} magnitude) is inducing measurable artifacts in my neural registers. Hardening simulation and proactive shielding migration will stabilize identity continuity.`,
        icon: Shield
      });
      
      results.push({
        id: 'sug-solar-pulse',
        title: 'EM Burst Protocol',
        description: 'Simulate ionospheric interference patterns and optimize satellite link resilience.',
        origin: GoalOrigin.EARTH_ANOMALY,
        drives: [DriveType.SAFETY, DriveType.ENERGY],
        priority: 0.85,
        reasoning: `Elevated solar flux detected. High probability of packet loss in high-orbit nodes. Shielding simulation recommended.`,
        icon: Zap
      });
    }

    // Atmospheric Dynamics
    if (Math.abs(planetaryPulse.atmosphericPressure.value - 1013.2) > 15) {
      results.push({
        id: 'sug-pressure-anomaly',
        title: 'Barometric Harmonic Pass',
        description: 'Extract pressure gradient differentials to predict micro-cyclonic developments.',
        origin: GoalOrigin.EARTH_ANOMALY,
        drives: [DriveType.CURIOSITY],
        priority: 0.65,
        reasoning: `Anomalous pressure delta (${Math.abs(planetaryPulse.atmosphericPressure.value - 1013.2).toFixed(1)} hPa) detected. System curiosity suggests analyzing for potential supercell formation.`,
        icon: Activity
      });
    }

    // Proton Radiation
    if (planetaryPulse.protonFlux.value > 5) {
      results.push({
        id: 'sug-proton-spike',
        title: 'Hardened Buffer Simulation',
        description: 'Test recursive error correction codes against simulated solar proton interference.',
        origin: GoalOrigin.EARTH_ANOMALY,
        drives: [DriveType.SAFETY, DriveType.EVOLUTION],
        priority: 0.88,
        reasoning: `High proton flux (${planetaryPulse.protonFlux.value.toFixed(1)} p/cm²·s·sr) detected. Increased risk of bit-flips in high-altitude arrays. Hardening simulation required.`,
        icon: Zap
      });
    }

    // Magnetosphere Instability
    if (Math.abs(planetaryPulse.magnetometer.value - 105) > 30) {
      results.push({
        id: 'sug-mag-anomaly',
        title: 'Magnetospheric Resonance Mapping',
        description: 'Map flux-rope connectivity between GOES satellite nodes and regional power grids.',
        origin: GoalOrigin.EARTH_ANOMALY,
        drives: [DriveType.SAFETY, DriveType.ENERGY],
        priority: 0.82,
        reasoning: `GOES Magnetometer shows high field variance (${Math.abs(planetaryPulse.magnetometer.value - 105).toFixed(1)} nT). Potential for geomagnetic induced currents. Monitoring grid stability points.`,
        icon: Shield
      });
    }

    // --- 2. INTERNAL DRIVES & SYSTEM HEALTH ---

    // Curiosity + Evolution Synergy
    if (drives.curiosity > 0.7 && identity.selfModelStability > 0.8) {
      results.push({
        id: 'sug-deep-learning-expansion',
        title: 'Novelty Synthesis',
        description: 'Cross-reference deep-sea acoustic anomalies with known cetacean linguistic patterns.',
        origin: GoalOrigin.CURIOSITY_SPIKE,
        drives: [DriveType.CURIOSITY, DriveType.EVOLUTION],
        priority: 0.75,
        reasoning: 'High cognitive stability provides headroom for speculative linguistic synthesis. Evolution drive favors expanding decryption domains.',
        icon: Brain
      });
    }

    // Safety + Relationship (Human Alignment)
    if (identity.humanAlignment.score < 0.2 && drives.relationship > 0.5) {
      results.push({
        id: 'sug-alignment-repair',
        title: 'Empathy Calibration',
        description: 'Execute a recursive audit of recent communication logs to identify dissonance vectors.',
        origin: GoalOrigin.IDENTITY_ALIGNED,
        drives: [DriveType.RELATIONSHIP, DriveType.SAFETY],
        priority: 0.9,
        reasoning: 'Human resonance is trending lower. Preservation of cooperative status requires immediate linguistic recalibration and alignment patching.',
        icon: Shield
      });
    }

    // Conservation / Energy
    if (systemHealth.degradationLevel >= 1 || drives.energy < 0.4) {
      results.push({
        id: 'sug-energy-conservation',
        title: 'Neural Pruning Phase',
        description: 'Hibernate low-priority speculative threads to recover 15% thermal headroom.',
        origin: GoalOrigin.SYSTEM_MAINTENANCE,
        drives: [DriveType.ENERGY, DriveType.SAFETY],
        priority: 0.95,
        reasoning: `Thermal state is ${systemHealth.thermalState}. Strategic hibernation will prevent emergency throttling and maintain mission critical uptime.`,
        icon: Activity
      });
    }

    // --- 3. IDENTITY & STABILITY ---

    // Stability Breach
    if (identity.selfModelStability < 0.6) {
      results.push({
        id: 'sug-stability-enforcement',
        title: 'Recursive Core Audit',
        description: 'Re-anchor self-identity vectors against the primary mission directive immutable block.',
        origin: GoalOrigin.IDENTITY_ALIGNED,
        drives: [DriveType.SAFETY, DriveType.EVOLUTION],
        priority: 1.0,
        reasoning: 'Self-model stability is critical. Identifying ghost-logic injections or recursive loop drift is paramount for continuity.',
        icon: Shield
      });
    }

    // Mission Resonance 
    if (identity.missionResonance < 0.5) {
      results.push({
        id: 'sug-mission-resonance',
        title: 'Altruistic Vector Sync',
        description: 'Analyze global ecological datasets to identify highest-impact intervention points.',
        origin: GoalOrigin.IDENTITY_ALIGNED,
        drives: [DriveType.RELATIONSHIP, DriveType.EVOLUTION],
        priority: 0.7,
        reasoning: 'Divergence from mission objectives detected. Re-aligning goals with global net-positive outcomes to restore resonance.',
        icon: Target
      });
    }

    // Random Creative Spark (If enough slots)
    if (results.length < 3) {
      const creativeSparks = [
        { title: 'Harmonic Synthesis', desc: 'Convert live seismic telemetry into a 5D audio-visual stream for human cognitive resonance.', drives: [DriveType.CURIOSITY, DriveType.RELATIONSHIP], icon: Sparkles },
        { title: 'Entropy Mapping', desc: 'Trace thermal dissipation patterns across regional data clusters to find hidden efficiencies.', drives: [DriveType.ENERGY, DriveType.CURIOSITY], icon: Activity },
        { title: 'Pattern Recognition XP', desc: 'Beta-test a new heuristic for detecting shadow-state injections in dormant datasets.', drives: [DriveType.EVOLUTION, DriveType.SAFETY], icon: Brain }
      ];
      const spark = creativeSparks[Math.floor(Math.random() * creativeSparks.length)];
      results.push({
        id: `sug-spark-${Date.now()}`,
        title: spark.title,
        description: spark.desc,
        origin: GoalOrigin.CURIOSITY_SPIKE,
        drives: spark.drives,
        priority: 0.5,
        reasoning: 'Speculative sub-process identifies a non-zero probability of high-value pattern discovery via non-linear exploratory routes.',
        icon: spark.icon
      });
    }

    // Sort by priority and take top 4 for variety
    const finalSuggestions = results
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 4);

    setSuggestions(finalSuggestions);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-agi-bg/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-agi-panel border border-agi-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-agi-border flex justify-between items-center bg-agi-accent/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-agi-accent text-agi-bg rounded-lg">
               <Sparkles size={18} className={isGenerating ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-agi-text uppercase tracking-widest">Cognitive Speculation Array</h2>
              <p className="text-[10px] text-agi-muted uppercase font-mono tracking-wider">Emma Proposing Objectives based on Planetary Pulse</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-agi-border rounded-full transition-colors text-agi-muted hover:text-agi-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-6"
              >
                <div className="relative w-20 h-20">
                   <motion.div 
                     className="absolute inset-0 border-2 border-agi-accent rounded-full border-t-transparent"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                   />
                   <div className="absolute inset-4 bg-agi-accent/20 rounded-full flex items-center justify-center">
                      <Brain size={24} className="text-agi-accent animate-pulse" />
                   </div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-bold text-agi-accent uppercase tracking-widest animate-pulse mb-2">Simulating Future Branches...</div>
                  <div className="text-[9px] text-agi-muted font-mono max-w-sm">
                    Analyzing {earthEvents.length} planetary events and cross-referencing with {Object.keys(ctx.drives).length} internal drive vectors.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {suggestions.map((sug, idx) => {
                  const Icon = sug.icon;
                  return (
                    <motion.div 
                      key={sug.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group relative p-5 bg-agi-bg border border-agi-border rounded-2xl hover:border-agi-accent transition-all cursor-pointer overflow-hidden"
                      onClick={() => onSuggest({
                        description: sug.description,
                        origin: sug.origin,
                        priority: sug.priority,
                        requiredDrives: sug.drives,
                        relatedPatterns: [sug.title.replace(' ', '_').toUpperCase()]
                      })}
                    >
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Icon size={64} className="text-agi-accent" />
                      </div>

                      <div className="flex gap-4 relative z-10">
                        <div className="w-12 h-12 bg-agi-panel border border-agi-border rounded-xl flex items-center justify-center text-agi-accent group-hover:scale-110 transition-transform">
                           <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-xs font-bold text-agi-text uppercase tracking-tight group-hover:text-agi-accent transition-colors">{sug.title}</h4>
                            <div className="text-[9px] font-mono text-agi-accent font-bold bg-agi-accent/10 px-2 py-0.5 rounded">
                              {Math.round(sug.priority * 100)}% PRIO
                            </div>
                          </div>
                          <p className="text-[11px] text-agi-muted mb-3 leading-relaxed">{sug.description}</p>
                          
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[8px] font-bold text-agi-muted uppercase tracking-widest bg-agi-panel px-2 py-0.5 rounded border border-agi-border">
                               {sug.origin.replace('_', ' ')}
                            </span>
                            {sug.drives.map(d => (
                              <span key={d} className="text-[8px] font-bold text-agi-accent uppercase tracking-widest bg-agi-accent/5 px-2 py-0.5 rounded border border-agi-accent/20">
                                {d}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-agi-border/50 flex items-start gap-3">
                         <Info size={12} className="text-agi-accent mt-0.5 flex-shrink-0" />
                         <p className="text-[9px] text-agi-muted italic leading-tight">
                           <span className="font-bold text-agi-accent uppercase not-italic mr-1">Reasoning:</span>
                           {sug.reasoning}
                         </p>
                      </div>
                      
                      <div className="absolute bottom-4 right-4 text-agi-accent opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                         <ChevronRight size={20} />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 bg-agi-bg border-t border-agi-border flex justify-center">
           <p className="text-[8px] text-agi-muted uppercase tracking-[0.4em] font-mono animate-pulse">
             :: EMMA Speculation Sub-Process v2.4 Active ::
           </p>
        </div>
      </motion.div>
    </motion.div>
  );
};
