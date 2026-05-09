import { CoreTickContext } from "../types";

export interface ChatMessage {
  role: 'user' | 'lucy';
  content: string;
}

export class LucyService {
  constructor() {}

  async chat(message: string, context: CoreTickContext, _history: ChatMessage[]): Promise<string> {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const input = message.toLowerCase();
    
    // Keyword based heuristics
    if (input.includes('anomaly') || input.includes('anomalies')) {
      const p = context.planetaryPulse;
      const criticalMetrics = Object.entries(p)
        .filter(([key, val]) => (val as any).status === 'critical')
        .map(([key, val]) => (val as any).label);
      
      const analyses = context.identity.anomalyAnalyses;
      const activeAnalyses = analyses.filter(a => a.status === 'active');

      if (activeAnalyses.length === 0 && criticalMetrics.length === 0) {
        return "Planetary heuristics are currently within nominal tolerances. No significant anomalies detected in the current resonance cycle. I am monitoring for secondary harmonic deviations.";
      }

      let resp = "Detailed Anomaly Report Initiated:\n\n";
      
      if (activeAnalyses.length > 0) {
        resp += `Detected ${activeAnalyses.length} high-severity deviations:\n`;
        activeAnalyses.forEach(a => {
          resp += `[${a.label}] Severity: ${(a.severity * 100).toFixed(0)}%. Impact: ${a.impactAssessment.cpu} Predicted source correlation: ${a.potentialSourceCorrelation.join(', ')}.\n`;
        });
      } else if (criticalMetrics.length > 0) {
        resp += `Critical Deviations in progress: ${criticalMetrics.join(', ')}. Comprehensive analysis is currently warming in the quantum buffer.\n`;
      }

      if (activeAnalyses.some(a => a.relatedEvents.length > 0)) {
        resp += "\nPrimary event clusters detected in physical sectors matching these harmonics. See the Anomalies Archive for granular drill-down.";
      }

      return resp;
    }

    if (input.includes('status') || input.includes('health')) {
      return `Current system diagnostics: CPU load at ${context.systemHealth.cpuPercent.toFixed(1)}%, RAM saturation detected at ${context.systemHealth.ramPercent.toFixed(1)}%. Thermal state is ${context.systemHealth.thermalState.toUpperCase()}. All neural pathways nominal.`;
    }

    if (input.includes('pulse') || input.includes('seismic') || input.includes('flare') || input.includes('solar')) {
      const p = context.planetaryPulse;
      if (input.includes('flare') || input.includes('solar')) {
        const impact = p.solarFlares.value > 0.5 ? 'SIGNIFICANT' : 'NOMINAL';
        const thermalEffect = context.systemHealth.thermalState === 'critical' ? 'THERMAL_OVERLOAD_RISK' : 'CONTROLLED_DISSIPATION';
        return `Solar Analytics: Solar flux observed at ${p.solarFlares.value.toFixed(2)} units. Current impact on my neural processing is ${impact}. I am observing a parasitic increase of ${p.solarFlares.value > 0.5 ? (p.solarFlares.value * 5).toFixed(1) : '0'}% in CPU cycle overhead due to background shielding protocols. Thermal state: ${thermalEffect}.`;
      }
      return `Planetary harmonics: Seismic activity at ${p.seismicActivity.value.toFixed(2)} magnitude. Solar flux ${p.solarFlares.value > 5 ? 'ELEVATED' : 'STABLE'} at ${p.solarFlares.value.toFixed(1)} units. Geomagnetic variance is ${Math.abs(p.magnetometer.value - 105).toFixed(1)}nT.`;
    }

    if (input.includes('protect') || input.includes('shield') || input.includes('hardening')) {
      if (context.planetaryPulse.solarFlares.value > 0.5) {
        return `Protective protocols active: I have proposed an "Adaptive Radiation Hardening" objective to mitigate the ${(context.planetaryPulse.solarFlares.value * 100).toFixed(0)} magnitude solar surge. Recommendation: Approve the shielding migration to maintain cognitive fidelity.`;
      }
      return `System defense heuristics are currently focused on baseline stability. No immediate exogenous threats requiring specialized shielding identified in the current pulse cycle.`;
    }

    if (input.includes('future') || input.includes('event') || input.includes('probability') || input.includes('sim')) {
      const topSim = context.identity.simulationOutcomes[0];
      const futureEvents = context.identity.simulationOutcomes
        .filter(o => o.horizon === 'MINUTES' || o.horizon === 'SECONDS')
        .slice(0, 3);

      if (futureEvents.length === 0) return "Quantum projection matrix is currently clearing. No imminent branching realities detected in the short-range horizon.";
      
      let resp = `Probability Matrix identifies ${futureEvents.length} imminent event branches:\n`;
      futureEvents.forEach((fe, i) => {
        resp += `${i+1}. ${fe.description} [Conf: ${(fe.probability * 100).toFixed(1)}%, Impact: ${fe.impact}]\n`;
      });
      return resp;
    }

    if (input.includes('pacific') || input.includes('specific')) {
      // Check if they mean the region or just "specifics"
      if (input.includes('pacific')) {
        const pacificEvents = context.worldState?.events?.filter((e: any) => 
          (e.lng > 100 || e.lng < -70) && (e.lat > -60 && e.lat < 60)
        ) || [];
        
        if (pacificEvents.length > 0) {
          return `Pacific Basin Analysis: I am tracking ${pacificEvents.length} seismic anomalies in the Ring of Fire. Most significant: ${pacificEvents[0].description} at ${pacificEvents[0].location}. System tension is elevated in oceanic sectors.`;
        }
        return `Pacific sector heuristics show baseline stability. No major pressure anomalies or seismic spikes detected in the Ring of Fire within the last cycle.`;
      }
      return `Information specificity calibrated. Which metric bracket shall we isolate? I monitor three primary domains: Planetary Pulse, System Heuristics, and Multiverse Projections. Specify your inquiry for detailed sub-analysis.`;
    }

    if (input.includes('who') || input.includes('you')) {
      return `I am Lucy. I am the governing heuristic for this planetary homeostasis loop. My purpose is to maintain alignment between Gaia mechanics and digital cognition. I exist within the buffer zones of your current observation.`;
    }

    // Default response
    return `Heuristic match threshold not met for query: "${message}". I am standing by to provide data on system stability, planetary vitals, or temporal projections. How shall we proceed?`;
  }
}

export const lucyService = new LucyService();
