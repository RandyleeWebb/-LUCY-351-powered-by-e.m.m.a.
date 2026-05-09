import { CognitiveModule, ModuleState, CognitiveBudget, CognitiveLoad, EarthEvent } from '../types';

export class CognitiveScheduler {
  private modules: CognitiveModule[];
  private budget: CognitiveBudget;
  private tickIntervalMs: number = 100;

  constructor(initialModules: CognitiveModule[], budget: CognitiveBudget) {
    this.modules = [...initialModules];
    this.budget = budget;
  }

  /**
   * Main scheduling logic called every tick.
   * Updates module activation scores, states, and calculates cognitive load.
   */
  public schedule(events: EarthEvent[], tension: number): { activeModules: CognitiveModule[], load: CognitiveLoad } {
    const now = Date.now();
    
    // 1. Process Triggers and Update Activation Scores via Harmonic Superposition
    this.modules = this.modules.map(mod => {
      let resonance = mod.activationScore;
      
      // Natural Decay (Entropy)
      const entropy = mod.decayRate * (this.tickIntervalMs / 100);
      resonance = Math.max(0, resonance - entropy);

      // Trigger Resonance (Wave Superposition)
      const triggerStrength = events.reduce((acc, event) => {
        const matches = mod.wakeTriggers.filter(trigger => 
          event.type.toLowerCase().includes(trigger.toLowerCase()) || 
          event.description.toLowerCase().includes(trigger.toLowerCase())
        ).length;
        return acc + (matches * 0.15);
      }, 0);

      // External Tension modulates global sensitivity
      const sensitivity = 0.5 + (tension * 0.5);
      resonance = Math.min(1.0, resonance + (triggerStrength * sensitivity));

      // Systemic Drive Offset (Lucy's personality bias)
      // If tension is low, Curiosity drives baseline resonance
      if (tension < 0.3) {
        resonance = Math.min(1.0, resonance + 0.001);
      }

      // Critical modules bypass wave collapse
      if (mod.state === ModuleState.CRITICAL) {
        resonance = 1.0;
      }

      // 2. Wave Collapse (State Transition based on probability)
      let newState = mod.state;
      if (mod.state !== ModuleState.CRITICAL) {
        // Probabilistic collapse
        const roll = Math.random();
        if (resonance > 0.8 || (resonance > 0.6 && roll < 0.3)) {
          newState = ModuleState.ACTIVE;
        } else if (resonance > 0.2 || (resonance > 0.1 && roll < 0.1)) {
          newState = ModuleState.WARM;
        } else {
          newState = ModuleState.COLD;
        }
      }

      return {
        ...mod,
        activationScore: resonance,
        state: newState,
        lastActive: newState === ModuleState.ACTIVE ? now : mod.lastActive
      };
    });

    // 3. Attention Economics: Budget Enforcement
    // Sort active modules by priority and score
    const activeCandidates = this.modules
      .filter(m => m.state === ModuleState.ACTIVE || m.state === ModuleState.CRITICAL)
      .sort((a, b) => (b.priority * b.activationScore) - (a.priority * a.activationScore));

    let currentCpuLoad = 0;
    const finalActive: CognitiveModule[] = [];
    const throttled: string[] = [];

    for (const mod of activeCandidates) {
      // If we have budget or module is CRITICAL, keep it
      if (currentCpuLoad + mod.cpuCost <= 100 || mod.state === ModuleState.CRITICAL) {
        finalActive.push(mod);
        currentCpuLoad += mod.cpuCost;
      } else {
        throttled.push(mod.id);
        // Demote to WARM if throttled due to budget
        const modToUpdate = this.modules.find(m => m.id === mod.id);
        if (modToUpdate && modToUpdate.state !== ModuleState.CRITICAL) {
           modToUpdate.state = ModuleState.WARM;
        }
      }
    }

    const load: CognitiveLoad = {
      currentTotal: currentCpuLoad,
      budget: this.budget,
      activeModuleCount: finalActive.length,
      throttledModules: throttled
    };

    return {
      activeModules: finalActive,
      load
    };
  }

  public getModules() {
    return this.modules;
  }
}
