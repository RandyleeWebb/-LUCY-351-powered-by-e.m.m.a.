import { SimulationOutcome, CoreTickContext, EarthEvent, GoalStatus } from '../types';

export class FutureSimulator {
  private static OUTCOMES = {
    MILLISECONDS: [
      "Sub-packet routing optimization will reduce latency by {n}ms.",
      "Neural gate {n} forecast: Potential overflow in next tick cycle.",
      "Buffer stabilization achieved. Immediate state integrity: {v}.",
      "Signal interference detected from local {s}. Mitigation queued."
    ],
    SECONDS: [
      "User command response will likely trigger a relationship resonance spike.",
      "Conversational flow suggests a shift towards {t} inquiries.",
      "Systemic tension expected to normalize after the current {p} processing.",
      "Identity lockdown protocol will remain in standby for the next {n} seconds."
    ],
    MINUTES: [
      "Fusion simulation will reach a critical stability bottleneck in Sector {n}.",
      "Protein folding accuracy projected to hit {v}% if resource allocation continues.",
      "Planetary tension accumulation suggests a spike in {s} activity in {n} minutes.",
      "Sovereignty index will continue its slow upward drift if human alignment holds."
    ]
  };

  static generateSimulation(
    horizon: 'MILLISECONDS' | 'SECONDS' | 'MINUTES',
    ctx: CoreTickContext,
    recentEvents: EarthEvent[]
  ): SimulationOutcome {
    const { systemHealth, activeGoals } = ctx;
    const activeGoalStrings = activeGoals
      .filter(g => g.status === GoalStatus.ACTIVE)
      .map(g => g.description.split(' ')[0].toUpperCase());

    const recentSeverity = recentEvents.reduce((acc, e) => acc + e.severity, 0);
    
    // Select base description templates
    const templates = this.OUTCOMES[horizon];
    let description = templates[Math.floor(Math.random() * templates.length)];

    // Inject context into description
    description = description
      .replace('{n}', Math.floor(Math.random() * 50 + 5).toString())
      .replace('{v}', (0.9 + Math.random() * 0.09).toFixed(3))
      .replace('{s}', recentEvents.length > 0 ? recentEvents[0].source : 'IoT bridge')
      .replace('{t}', activeGoalStrings.length > 0 ? activeGoalStrings[0] : 'technical')
      .replace('{p}', 'telemetry');

    // Environmental factors
    const factors: string[] = [];
    if (systemHealth.thermalState !== 'normal') factors.push(`Thermal ${systemHealth.thermalState.toUpperCase()}`);
    if (systemHealth.cpuPercent > 80) factors.push("High CPU Congestion");
    if (recentSeverity > 5) factors.push("Planetary Pulse Volatility");
    if (ctx.tension > 0.7) factors.push("Logic Tension Spike");
    if (activeGoalStrings.length > 0) factors.push(`Goal Context: ${activeGoalStrings[0]}`);
    
    // Add some random ones to fill
    const extraFactors = ["Solar Flare Flux", "Corpus Drift", "Neural Noise", "User Resonance Sync"];
    while (factors.length < 3) {
      factors.push(extraFactors[Math.floor(Math.random() * extraFactors.length)]);
    }

    const confidence = 0.6 + (1 - ctx.tension) * 0.3 + Math.random() * 0.1;
    const probability = Math.random() * 0.4 + (systemHealth.degradationLevel === 0 ? 0.5 : 0.3);

    // Impact determination
    let impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
    if (systemHealth.thermalState === 'critical' || systemHealth.degradationLevel > 2) {
      impact = 'NEGATIVE';
    } else if (ctx.emotionalState.resonance > 0.8 && systemHealth.degradationLevel === 0) {
      impact = 'POSITIVE';
    }

    // Probabilistic Branching
    const branches = [];
    if (Math.random() > 0.2) {
      // Branch A: Optimistic path
      branches.push({
        description: `High-resonance iteration: Real-time adaptation via ${factors[0] || 'efficiency'} buffers.`,
        probability: Math.min(0.95, (1 - probability) * 0.5 + 0.1),
        impact: 'POSITIVE' as const
      });
      // Branch B: Neutral/Baseline variant
      branches.push({
        description: `Steady-state expansion: Nominal growth following established cognitive trends.`,
        probability: Math.min(0.95, probability * 0.8),
        impact: 'NEUTRAL' as const
      });
      // Branch C: Entropy/Risk path
      branches.push({
        description: `Logic-fracture variant: Semantic collapse in ${factors[1] || 'secondary'} loops.`,
        probability: Math.min(0.4, (1 - probability) * 0.6),
        impact: 'NEGATIVE' as const
      });
    }

    return {
      id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      horizon,
      timestamp: Date.now(),
      description,
      confidence,
      probability,
      environmentalFactors: factors,
      impact,
      branches: branches.length > 0 ? branches : undefined
    };
  }
}
