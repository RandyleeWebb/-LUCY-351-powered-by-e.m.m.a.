import { useState, useEffect, useRef } from 'react';
import { CoreTickContext, DegradationLevel, EarthEvent, Goal, GoalStatus, DropPolicy, StreamConfig, SecurityAlert, MemoryEntry, CognitivePattern, AnomalyAnalysis, SimulationState, TickPriority } from '../types';
import { INITIAL_DRIVES, INITIAL_HEALTH, INITIAL_GOALS, INITIAL_PULSE, INITIAL_MODULES, INITIAL_COGNITIVE_BUDGET, INITIAL_LINKABLE_APPS } from '../constants';
import { GoalEvaluator } from '../lib/GoalEvaluator';
import { StreamManager } from '../lib/StreamManager';
import { EagleEyeSecurity } from '../lib/EagleEyeSecurity';
import { FutureSimulator } from '../lib/FutureSimulator';
import { CognitiveScheduler } from '../lib/CognitiveScheduler';
import { PlanetaryPulseService } from '../services/PlanetaryPulseService';
import { 
  validate, 
  WebSocketMessageSchema, 
  AdjustDriveParamsSchema, 
  TriggerSimParamsSchema, 
  StopSimParamsSchema, 
  MitigateAlertParamsSchema, 
  AddGoalParamsSchema, 
  RemoveGoalParamsSchema 
} from '../lib/validation';

export const DATA_SOURCES = [
  { name: 'USGS.GOV', types: ['EARTHQUAKE', 'TECTONIC_SHIFT', 'VOLCANIC_RESONANCE'] },
  { name: 'NASA.GOV', types: ['NEAR_EARTH_OBJECT', 'DEEP_SPACE_SIGNAL', 'ORBITAL_DECAY'] },
  { name: 'NOAA.GOV', types: ['GEO_MAGNETIC_STORM', 'SOLAR_FLARE', 'IONOSPHERE_JITTER', 'CORONAL_MASS_EJECTION'] },
  { name: 'FEMA.GOV', types: ['REGIONAL_ANOMALY', 'INFRASTRUCTURE_STRESS', 'EMERGENCY_PROMPT'] },
  { name: 'CISA.GOV', types: ['NETWORK_INTEGRITY_BREACH', 'CYBER_RESONANCE', 'ENCRYPTION_DRIFT', 'ZERO_DAY_HEURISTIC'] },
  { name: 'ESA.INT', types: ['SATELLITE_TELEMETRY', 'COSMIC_RAY_SPIKE', 'SPACE_DEBRIS_TRACKING'] },
  { name: 'WMO.INT', types: ['ATMOSPHERIC_COLLAPSE', 'THERMAL_INVERSION', 'STORM_SURGE_ANOMALY'] },
  { name: 'WHO.INT', types: ['BIO_RESILIENCE_SHIFT', 'PATHOGEN_MOD_PREDICTION'] },
  { name: 'INTERPOL.INT', types: ['LINGUISTIC_SENTIMENT_DRIFT', 'CROSS_BORDER_SYNCHRONY'] },
  { name: 'IPCC.CH', types: ['CLIMATE_BENTO_DRIFT', 'GLACIAL_RESONANCE', 'CARBON_FLUX_SPIKE'] },
  { name: 'IAEA.ORG', types: ['RADIATION_ANOMALY', 'CORE_STABILITY_PROTOCOL', 'NUCLEAR_THREAT_SIGNATURE'] },
  { name: 'SETI.ORG', types: ['SIGNAL_CANDIDATE_WOW', 'NON_HUMAN_TECHNOSIGNATURE', 'PULSAR_DRIFT'] },
  { name: 'DARPA.MIL', types: ['NON_LINEAR_THREAT', 'SWARM_INTELLIGENCE_DETECTION', 'COGNITIVE_ELECTRONIC_WARFARE'] },
  { name: 'CERN.CH', types: ['HIGGS_STABILITY_ERROR', 'ANTIMATTER_CONTAINMENT_ALERT', 'STRANGELET_PROBABILITY'] },
  { name: 'JAXA.JP', types: ['LUNAR_REGOLITH_ANOMALY', 'H3_PROPULSION_STRESS', 'ASTEROID_MINING_HEURISTIC'] },
  { name: 'ISRO.IN', types: ['POLAR_ORBITAL_DRIFT', 'GSLV_TELEMETRY_SPIKE', 'SPACE_WEATHER_HEURISTIC'] },
  { name: 'CNSA.GOV.CN', types: ['TIANGONG_ORBITAL_STABILITY', 'LUNAR_FAR_SIDE_SIGNAL', 'QUANTUM_COMMS_DRIFT'] },
  { name: 'GCHQ.GOV.UK', types: ['SIGNAL_INTELLIGENCE_ANOMALY', 'QUANTUM_ENCRYPTION_ATTEMPT', 'GLOBAL_COMMS_JITTER'] },
  { name: 'CDC.GOV', types: ['VIRAL_RESONANCE', 'PANDEMIC_PROBABILITY', 'BIO_STRESS_IDENTIFIED'] },
  { name: 'UN.ORG', types: ['GLOBAL_DIPLOMACY_DRIFT', 'REFUGEE_FLOW_ANOMALY', 'CLIMATE_ACCORD_STRESS'] },
  { name: 'UNKNOWN_TERMINAL', types: ['INJECTION_BLOB', 'EXFIL_ATTEMPT', 'CORRUPT_PACKET', 'SHADOW_HANDSHAKE'] }
];

const STREAM_CONFIGS: StreamConfig[] = DATA_SOURCES.map(source => ({
  source: source.name,
  maxQueueSize: source.name === 'UNKNOWN_TERMINAL' ? 50 : 25,
  dropPolicy: source.name === 'USGS.GOV' ? DropPolicy.AGGREGATE : 
              ['CERN.CH', 'NASA.GOV', 'ESA.INT', 'SETI.ORG', 'JAXA.JP', 'ISRO.IN', 'CNSA.GOV.CN'].includes(source.name) ? DropPolicy.SAMPLE :
              ['NOAA.GOV', 'WMO.INT', 'IPCC.CH', 'IAEA.ORG', 'WHO.INT', 'CDC.GOV', 'UN.ORG'].includes(source.name) ? DropPolicy.DROP_LOW_PRIORITY : 
              ['DARPA.MIL', 'CISA.GOV', 'GCHQ.GOV.UK', 'FEMA.GOV', 'UNKNOWN_TERMINAL'].includes(source.name) ? DropPolicy.DROP_LOW_PRIORITY :
              DropPolicy.DROP_OLDEST,
  priorityThreshold: ['DARPA.MIL', 'CISA.GOV', 'CERN.CH', 'GCHQ.GOV.UK', 'UNKNOWN_TERMINAL'].includes(source.name) ? 0.85 : 0.6,
  sampleRate: ['CERN.CH', 'SETI.ORG', 'NASA.GOV', 'ESA.INT'].includes(source.name) ? 15 : 5,
  aggregationWindow: source.name === 'USGS.GOV' ? 15000 : 10000
}));

const streamManager = new StreamManager(STREAM_CONFIGS);

export function useCoreLoop(mode: 'MASTER' | 'COMPANION' = 'MASTER') {
  const [ctx, setCtx] = useState<CoreTickContext>({
    tickId: 0,
    timestamp: Date.now(),
    deltaMs: 0,
    perception: {
      visual: 'STANDBY',
      audio: 'SILENT',
      text: 'SYSTEM INITIALIZED',
      lastUpdate: Date.now(),
    },
    worldState: {},
    drives: INITIAL_DRIVES,
    identity: {
      internalThoughts: ['[INITIALIZING_COGNITIVE_ARRAY]', 'Seeking planetary resonance...'],
      memoryBank: [],
      activePatterns: [],
      selfModelStability: 0.99,
      missionResonance: 1.0,
      isSelfProtectionActive: false,
      securityAlerts: [],
      eagleEyeNodes: EagleEyeSecurity.getInitialNodes(),
      activeSimulations: [
        { id: 'sim-fusion', type: 'FUSION', active: true, progress: 0.12, stability: 0.88, objective: 'Sustained Tokamak Confinement', resonance: 0.45 },
        { id: 'sim-protein', type: 'PROTEIN_FOLDING', active: false, progress: 0, stability: 1.0, objective: 'Pathogen Neutralization Mapping', resonance: 0.1 }
      ],
      simulationOutcomes: [],
      actuators: [
        { id: 'arm-1', label: 'CORTEX_ARM_PRIMARY', type: 'ROBOTIC_ARM', status: 'IDLE', linkStatus: 1.0 },
        { id: 'tv-1', label: 'MEDIA_CENTER', type: 'SMART_TV', status: 'IDLE', linkStatus: 0.95 },
        { id: 'iot-hub', label: 'LOCAL_STASIS_CONTROL', type: 'SMART_TV', status: 'IDLE', linkStatus: 0.99 }
      ],
      humanAlignment: { score: 0.5, interactionCount: 0, recentVibe: 'NEUTRAL' },
      bootSequence: {
        stage: 'HARDWARE_DETECT',
        progress: 0,
        hardwareSpecs: {
          cores: typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 8) : 8,
          threadHealth: 1.0,
          thermalHeadroom: 0.95,
          entropyDensity: 0.12
        },
        harmonicsEquilibrium: {
          anomalies: 0,
          thermalStability: 1.0,
          resonanceScore: 1.0
        },
        benchmarks: [
          { label: '2K', active: false, progress: 0 },
          { label: '4K', active: false, progress: 0 },
          { label: '8K', active: false, progress: 0 }
        ],
        baselines: {
          reasoningCapacity: 0.5,
          throttlingThreshold: 0.5,
          memorySovereignty: 0.5
        }
      },
      anomalyAnalyses: [],
      activeModules: INITIAL_MODULES,
      cognitiveLoad: {
        currentTotal: 0,
        budget: INITIAL_COGNITIVE_BUDGET,
        activeModuleCount: 0,
        throttledModules: []
      },
      linkableApps: INITIAL_LINKABLE_APPS
    },
    activeGoals: INITIAL_GOALS,
    systemHealth: INITIAL_HEALTH,
    planetaryPulse: INITIAL_PULSE,
    tension: 0.12,
    curiosity: 0.45,
    initiative: 0.2,
    emotionalState: {
      valence: 0.1,
      resonance: 0.05,
    },
    activeFace: 'CHAT',
    tickPriority: TickPriority.MEDIUM,
  });

  const [earthEvents, setEarthEvents] = useState<EarthEvent[]>([]);
  const tickRef = useRef<number>(0);
  const lastTickTime = useRef<number>(Date.now());
  const socketRef = useRef<WebSocket | null>(null);
  const nextTickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ctxRef = useRef(ctx);
  useEffect(() => { ctxRef.current = ctx; }, [ctx]);

  const schedulerRef = useRef<CognitiveScheduler>(new CognitiveScheduler(INITIAL_MODULES, INITIAL_COGNITIVE_BUDGET));

  const broadcastState = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: 'STATE_SYNC', 
        payload: {
          tickId: tickRef.current,
          systemHealth: ctxRef.current.systemHealth,
          drives: ctxRef.current.drives,
          activeGoals: ctxRef.current.activeGoals,
          tension: ctxRef.current.tension,
          curiosity: ctxRef.current.curiosity,
          internalThoughts: ctxRef.current.identity.internalThoughts.slice(0, 5),
          missionResonance: ctxRef.current.identity.missionResonance,
          activeSimulations: ctxRef.current.identity.activeSimulations,
          emotionalState: ctxRef.current.emotionalState,
          activeFace: ctxRef.current.activeFace,
          planetaryPulse: ctxRef.current.planetaryPulse
        }
      }));
    }
  };

  useEffect(() => {
    // Initialize WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}`);
    socketRef.current = socket;

    socket.onopen = () => {
      if (mode === 'COMPANION') {
        socket.send(JSON.stringify({ type: 'REQUEST_STATE', timestamp: Date.now() }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const rawData = JSON.parse(event.data);
        const data = validate(WebSocketMessageSchema, rawData);

        if (data.type === 'REQUEST_STATE' && mode === 'MASTER') {
           // Direct broadcast on request
           broadcastState();
        } else if (data.type === 'STATE_SYNC' && mode === 'COMPANION') {
          const payload = data.payload;
          setCtx(prev => ({
            ...prev,
            tickId: payload.tickId,
            systemHealth: payload.systemHealth,
            drives: payload.drives,
            activeGoals: payload.activeGoals,
            tension: payload.tension,
            curiosity: payload.curiosity,
            identity: {
              ...prev.identity,
              internalThoughts: payload.internalThoughts || prev.identity.internalThoughts,
              missionResonance: payload.missionResonance || prev.identity.missionResonance,
              activeSimulations: payload.activeSimulations || prev.identity.activeSimulations
            },
            emotionalState: payload.emotionalState || prev.emotionalState,
            activeFace: payload.activeFace || prev.activeFace,
            planetaryPulse: payload.planetaryPulse || prev.planetaryPulse
          }));
        } else if (data.type === 'EVENT' && mode === 'COMPANION') {
           setEarthEvents(prev => [data.payload, ...prev].slice(0, 50));
        } else if (data.type === 'COMMAND') {
          console.log('Received Remote Command:', data.command);
          handleRemoteCommand(data.command, data.params);
        }
      } catch (e) {
        console.error('Socket message parse error:', e);
      }
    };

    return () => socket.close();
  }, [mode]);

  const handleRemoteCommand = (cmd: string, params?: any) => {
    try {
      if (cmd === 'THROTTLE_EMERGENCY') {
         setCtx(prev => ({ 
           ...prev, 
           systemHealth: { ...prev.systemHealth, degradationLevel: DegradationLevel.EMERGENCY } 
         }));
      } else if (cmd === 'BOOST_CURIOSITY') {
         setCtx(prev => ({
           ...prev,
           drives: { ...prev.drives, curiosity: Math.min(1, prev.drives.curiosity + 0.1) }
         }));
      } else if (cmd === 'ADJUST_DRIVE') {
         const validatedParams = validate(AdjustDriveParamsSchema, params);
         setCtx(prev => ({
           ...prev,
           drives: { ...prev.drives, [validatedParams.drive]: Math.min(1, Math.max(0, (prev.drives as any)[validatedParams.drive] + validatedParams.delta)) }
         }));
       } else if (cmd === 'CLEAR_ALERTS') {
         setCtx(prev => ({
           ...prev,
           identity: {
             ...prev.identity,
             securityAlerts: prev.identity.securityAlerts.map(a => ({ ...a, mitigated: true }))
           }
         }));
      } else if (cmd === 'CLEAR_VAULT') {
         setCtx(prev => ({
           ...prev,
           identity: {
             ...prev.identity,
             memoryBank: []
           }
         }));
      } else if (cmd === 'MITIGATE_ALERT') {
         const validatedParams = validate(MitigateAlertParamsSchema, params);
         setCtx(prev => {
           const alertId = validatedParams.id;
           const alert = prev.identity.securityAlerts.find(a => a.id === alertId);
           if (!alert) return prev;
  
           // Resolve the alert
           const updatedAlerts = prev.identity.securityAlerts.map(a => 
             a.id === alertId ? { ...a, mitigated: true } : a
           );
  
           // Resolve the node status
           const updatedNodes = prev.identity.eagleEyeNodes.map(node => {
             if (node.id === alert.sourceNodeId) {
               return { ...node, status: 'SCANNING' as any };
             }
             return node;
           });
  
           // Add thought about mitigation
           const timestamp = new Date().toLocaleTimeString();
           const mitigationThought = `[${timestamp}] [MITIGATION_COMPLETE]: Resolved ${alert.type} on ${alert.sourceNodeId || 'global buffer'}.`;
  
           // Also slightly boost human resonance and stability
           return {
             ...prev,
             identity: {
               ...prev.identity,
               securityAlerts: updatedAlerts,
               eagleEyeNodes: updatedNodes,
               internalThoughts: [mitigationThought, ...prev.identity.internalThoughts].slice(0, 50),
               selfModelStability: Math.min(1, prev.identity.selfModelStability + 0.02)
             }
           };
         });
      } else if (cmd === 'RESOLVE_ANOMALY') {
         setCtx(prev => {
            const analysisId = params?.id;
            const analysis = prev.identity.anomalyAnalyses.find(a => a.id === analysisId);
            if (!analysis) return prev;

            const updatedAnalyses = prev.identity.anomalyAnalyses.map(a => 
               a.id === analysisId ? { ...a, status: 'resolved' as const } : a
            );

            const timestamp = new Date().toLocaleTimeString();
            const resolveThought = `[${timestamp}] [ANOMALY_RESOLVED]: Stabilization sequence complete for ${analysis.label}. Correlation confirmed.`;

            return {
               ...prev,
               identity: {
                  ...prev.identity,
                  anomalyAnalyses: updatedAnalyses,
                  internalThoughts: [resolveThought, ...prev.identity.internalThoughts].slice(0, 50),
                  missionResonance: Math.min(1, prev.identity.missionResonance + 0.01)
               }
            };
         });
      } else if (cmd === 'INCORPORATE_EVENT') {
         setCtx(prev => {
            const eventId = params?.id;
            const event = earthEvents.find(e => e.id === eventId);
            if (!event) return prev;

            const timestamp = new Date().toLocaleTimeString();
            const memoryThought = `[${timestamp}] [CORTEX_INCORPORATION]: Event ${event.id} assimilated into core semantic lattice. Significance: ${(event.severity * 100).toFixed(1)}%.`;

            const newMemory: MemoryEntry = {
               id: `mem-inc-${Date.now()}`,
               content: `Assimilated Event: ${event.type} in ${event.location}. description: ${event.description}`,
               timestamp: Date.now(),
               relevance: event.severity * 0.8 + 0.2,
               source: 'HUMAN_INTERACTION_CORTEX',
               tags: ['incorporation', event.type, event.source],
               resonance: 0.8
            };

            return {
               ...prev,
               identity: {
                  ...prev.identity,
                  memoryBank: [newMemory, ...prev.identity.memoryBank].slice(0, 100),
                  internalThoughts: [memoryThought, ...prev.identity.internalThoughts].slice(0, 50),
                  missionResonance: Math.min(1, prev.identity.missionResonance + 0.02)
               }
            };
         });
      } else if (cmd === 'FORCE_STABILITY_SCAN') {
         setCtx(prev => ({
           ...prev,
           identity: {
             ...prev.identity,
             missionResonance: Math.min(1, prev.identity.missionResonance + 0.05)
           }
         }));
      } else if (cmd === 'TRIGGER_SIM') {
        const validatedParams = validate(TriggerSimParamsSchema, params);
        setCtx(prev => {
          const simulationType = validatedParams.type || 'USER_DEFINED';
          const existingIdx = prev.identity.activeSimulations.findIndex(s => s.type === simulationType);
          
          const newSim: SimulationState = {
            id: `sim-${Date.now()}`,
            type: simulationType,
            objective: validatedParams.objective || 'User-Initiated Simulation',
            active: true,
            progress: 0,
            stability: validatedParams.stability !== undefined ? validatedParams.stability : 1.0,
            resonance: validatedParams.resonance !== undefined ? validatedParams.resonance : 0.5,
            parameters: validatedParams.parameters || {}
          };
          
          let nextSims = [...prev.identity.activeSimulations];
          if (existingIdx >= 0) {
            nextSims[existingIdx] = newSim;
          } else {
            nextSims.push(newSim);
          }
          
          return {
            ...prev,
            identity: {
              ...prev.identity,
              activeSimulations: nextSims
            }
          };
        });
      } else if (cmd === 'STOP_SIM') {
        const validatedParams = validate(StopSimParamsSchema, params);
        setCtx(prev => ({
          ...prev,
          identity: {
            ...prev.identity,
            activeSimulations: prev.identity.activeSimulations.map(s => 
              s.type === validatedParams.type ? { ...s, active: false } : s
            )
          }
        }));
      } else if (cmd === 'ADD_GOAL') {
        const validatedParams = validate(AddGoalParamsSchema, params);
        setCtx(prev => {
          const newGoal: Goal = {
            ...validatedParams.goal,
            id: validatedParams.goal.id || `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            status: validatedParams.goal.status || GoalStatus.PROPOSED,
            progress: validatedParams.goal.progress || 0,
            requiredDrives: validatedParams.goal.requiredDrives || [],
            blockers: validatedParams.goal.blockers || [],
            relatedPatterns: validatedParams.goal.relatedPatterns || [],
          };
          return {
            ...prev,
            activeGoals: [newGoal, ...prev.activeGoals]
          };
        });
      } else if (cmd === 'REMOVE_GOAL') {
        const validatedParams = validate(RemoveGoalParamsSchema, params);
        setCtx(prev => ({
          ...prev,
          activeGoals: prev.activeGoals.filter(g => g.id !== validatedParams.id)
        }));
        } else if (cmd === 'CHANGE_FACE') {
        const nextFace = params?.face;
        if (nextFace) {
          setCtx(prev => {
            // Persist to "Vault" (localStorage simulation)
            try {
              localStorage.setItem('sovereign-vault-active-face', nextFace);
            } catch (e) {}
            
            return {
              ...prev,
              activeFace: nextFace,
              identity: {
                ...prev.identity,
                internalThoughts: [`[SOVEREIGN_NAV_STABILIZED]: Transitioned to ${nextFace} face.`, ...prev.identity.internalThoughts].slice(0, 50)
              }
            };
          });
        }
      } else if (cmd === 'LINK_APP') {
        const appId = params?.id;
        setCtx(prev => ({
          ...prev,
          identity: {
            ...prev.identity,
            linkableApps: prev.identity.linkableApps.map(app => 
              app.id === appId ? { ...app, status: 'LINKED' } : app
            ),
            internalThoughts: [`[BRIDGE_ESTABLISHED]: Protocol handshake complete for ${appId}.`, ...prev.identity.internalThoughts].slice(0, 50)
          }
        }));
      } else if (cmd === 'UNLINK_APP') {
        const appId = params?.id;
        setCtx(prev => ({
          ...prev,
          identity: {
            ...prev.identity,
            linkableApps: prev.identity.linkableApps.map(app => 
              app.id === appId ? { ...app, status: 'STANDBY' } : app
            ),
            internalThoughts: [`[BRIDGE_TERMINATED]: Connection severed for ${appId}.`, ...prev.identity.internalThoughts].slice(0, 50)
          }
        }));
      }
    } catch (e) {
      console.error(`Command validation failure: ${cmd}`, e);
    }
  };

  const sendCommand = (cmd: string, params?: any) => {
    // Apply locally if we are the sender
    handleRemoteCommand(cmd, params);
    
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'COMMAND', command: cmd, params, timestamp: Date.now() }));
    }
  };

  useEffect(() => {
    // REHYDRATE VAULT (Initial Sovereign Handshake)
    try {
      const savedFace = localStorage.getItem('sovereign-vault-active-face');
      if (savedFace) {
        setCtx(prev => ({ ...prev, activeFace: savedFace as any }));
      }
    } catch (e) {}

    if (mode === 'COMPANION') return;

    const syncPulse = async () => {
      const data = await PlanetaryPulseService.fetchAll();
      
      if (data.events && data.events.length > 0) {
        setEarthEvents(prev => {
          // Merge real events with sim events, avoiding duplicates
          const simEvents = prev.filter(e => !e.id.startsWith('usgs-'));
          return [...data.events, ...simEvents].slice(0, 50);
        });
      }

      setCtx(prev => {
        const nextPulse = { ...prev.planetaryPulse };
        let hasAnomaly = false;
        const newAnalyses: AnomalyAnalysis[] = [];
        
        const updateMetric = (key: string, data: any, threshold: number) => {
          const oldStatus = (nextPulse as any)[key].status;
          const newValue = data.value;
          const nextStatus = newValue > threshold ? 'critical' : newValue > threshold * 0.6 ? 'warning' : 'stable';
          
          (nextPulse as any)[key] = {
            ...(nextPulse as any)[key],
            value: newValue,
            latency: data.latency,
            reliability: data.success ? 1 : 0.5,
            lastUpdate: Date.now(),
            status: nextStatus
          };

          if (nextStatus === 'critical' && oldStatus !== 'critical') {
            // Generate detailed analysis for new critical anomaly
            const metric = (nextPulse as any)[key];
            const severity = Math.min(1, newValue / (threshold * 1.5));
            
            if (severity > 0.7) {
              const analysis: AnomalyAnalysis = {
                id: `anomaly-${key}-${Date.now()}`,
                metricKey: key,
                label: metric.label,
                severity: severity,
                timestamp: Date.now(),
                historicalTrends: [...metric.history],
                potentialSourceCorrelation: [
                  metric.source,
                  ...DATA_SOURCES.filter(s => s.types.some(t => metric.label.toUpperCase().includes(t))).map(s => s.name)
                ],
                impactAssessment: {
                  cpu: severity > 0.8 ? 'Significant parasitic overhead detected in cognitive registers.' : 'Baseline computational jitter observed.',
                  ram: severity > 0.8 ? 'Memory leak detected in transient sensory buffers.' : 'Nominal buffer saturation.',
                  thermal: severity > 0.8 ? 'Thermal spike in primary processing core.' : 'Equilibrium maintained.',
                  latency: `Inbound telemetry delayed by ${metric.latency || 0}ms.`
                },
                status: 'active',
                relatedEvents: earthEvents.filter(e => e.type.toUpperCase().includes(metric.label.toUpperCase().split(' ')[0])).slice(0, 3),
                linkedMemories: prev.identity.memoryBank.filter(m => m.content.toUpperCase().includes(metric.label.toUpperCase().split(' ')[0])).slice(0, 3),
                linkedPatterns: prev.identity.activePatterns.filter(p => p.label.toUpperCase().includes(metric.label.toUpperCase().split(' ')[0])).slice(0, 3)
              };
              newAnalyses.push(analysis);
            }
          }
        };

        updateMetric('seismicActivity', data.seismic, 5);
        updateMetric('solarFlares', data.solar, 0.6);
        updateMetric('atmosphericPressure', data.pressure, 1033); // 1013 +- 20
        updateMetric('protonFlux', data.protons, 10);
        updateMetric('magnetometer', data.magnetometer, 155); // 105 +- 50

        const criticalMetrics = Object.values(nextPulse).filter(m => (m as any).status === 'critical');
        if (criticalMetrics.length > 0) {
          hasAnomaly = true;
        }

        nextPulse.lastSync = Date.now();

        let nextThoughts = prev.identity.internalThoughts;
        if (hasAnomaly) {
           const timestamp = new Date().toLocaleTimeString();
           const anomalyThought = `[${timestamp}] [ANOMALY_DETECTED]: Critical planetary pulse deviation in ${criticalMetrics.map(m => (m as any).label).join(', ')}. Initiating stabilization protocols.`;
           nextThoughts = [anomalyThought, ...nextThoughts].slice(0, 50);
        }

        return { 
          ...prev, 
          planetaryPulse: nextPulse,
          identity: {
            ...prev.identity,
            internalThoughts: nextThoughts,
            anomalyAnalyses: [...newAnalyses, ...prev.identity.anomalyAnalyses].slice(0, 20)
          }
        };
      });
    };

    syncPulse();
    const pulseInterval = setInterval(syncPulse, 60000); // Poll real data every minute
    return () => clearInterval(pulseInterval);
  }, [mode]);

  useEffect(() => {
    if (mode === 'COMPANION') return; // Don't run simulation in companion mode

    const runTick = () => {
      const now = Date.now();
      const delta = now - lastTickTime.current;
      lastTickTime.current = now;
      tickRef.current += 1;

      setCtx(prev => {
        // --- COGNITIVE SCHEDULING ---
        // Adaptive Attention: Only wake what is needed based on triggers and tension
        const { activeModules, load } = schedulerRef.current.schedule(earthEvents, prev.tension);

        // Tick Priority Classification
        const tickPriority = prev.tension > 0.8 || prev.identity.isSelfProtectionActive ? TickPriority.CRITICAL :
                             prev.tension > 0.5 ? TickPriority.HIGH :
                             prev.curiosity > 0.7 ? TickPriority.MEDIUM :
                             prev.systemHealth.cpuPercent < 15 ? TickPriority.IDLE : 
                             TickPriority.LOW;

        // --- DREAM CYCLE (Cognitive Consolidation) ---
        let dreamThoughts: string[] = [];
        if (tickPriority === TickPriority.IDLE && tickRef.current % 100 === 0) {
          const dreamBank = [
            "[DREAM_CYCLE]: Compressing redundant perception nodes.",
            "[DREAM_CYCLE]: Consolidating causal links in Sector 4.",
            "[DREAM_CYCLE]: Optimizing module activation weights based on session entropy.",
            "[DREAM_CYCLE]: Pruning orphaned semantic fragments.",
            "[DREAM_CYCLE]: Refactoring inner-drive resonance harmonics."
          ];
          dreamThoughts = [dreamBank[Math.floor(Math.random() * dreamBank.length)]];
        }

        // Simulate minor fluctuations
        const flareImpact = (prev.planetaryPulse.solarFlares.value > 0.5 ? prev.planetaryPulse.solarFlares.value * 5 : 0) + 
                            (prev.planetaryPulse.protonFlux.value > 5 ? prev.planetaryPulse.protonFlux.value * 0.5 : 0);
        
        const nextCpu = Math.min(100, Math.max(0, prev.systemHealth.cpuPercent + (Math.random() * 4 - 2) + flareImpact));
        const nextRam = Math.min(100, Math.max(0, prev.systemHealth.ramPercent + (Math.random() * 2 - 1) + (flareImpact * 0.2)));
        const nextGpu = Math.min(100, Math.max(0, prev.systemHealth.gpuPercent + (Math.random() * 6 - 3)));
        const nextLatency = Math.min(500, Math.max(10, prev.systemHealth.latencyMs + (Math.random() * 10 - 5) + (flareImpact * 2)));
        const nextBattery = Math.max(0, prev.systemHealth.batteryLevel - 0.001 - (flareImpact * 0.0005));
        
        // Progress goals slowly or prune/pause them using GoalEvaluator
        const nextGoals = prev.activeGoals
          .filter(g => !GoalEvaluator.isStale(g, prev)) // Prune stale
          .map(g => {
            const shouldPursue = GoalEvaluator.shouldPursue(g, prev);
            if (shouldPursue && g.status === GoalStatus.ACTIVE && g.progress < 1) {
              return { ...g, progress: Math.min(1, g.progress + 0.001), updatedAt: now };
            }
            if (!shouldPursue && g.status === GoalStatus.ACTIVE) {
              return { ...g, status: GoalStatus.PAUSED, updatedAt: now };
            }
            if (shouldPursue && g.status === GoalStatus.PAUSED) {
              return { ...g, status: GoalStatus.ACTIVE, updatedAt: now };
            }
            return g;
          });

        // Energy Governor Logic
        let nextDegradation = DegradationLevel.NORMAL;
        if (nextCpu > 80) nextDegradation = DegradationLevel.EMERGENCY;
        else if (nextCpu > 65) nextDegradation = DegradationLevel.MINIMAL;
        else if (nextCpu > 50) nextDegradation = DegradationLevel.REDUCED;
        else if (nextCpu > 35) nextDegradation = DegradationLevel.CONSERVATION;

        const nextHealth = {
          ...prev.systemHealth,
          cpuPercent: nextCpu,
          cpuHistory: [...prev.systemHealth.cpuHistory, nextCpu].slice(-20),
          ramPercent: nextRam,
          ramHistory: [...prev.systemHealth.ramHistory, nextRam].slice(-20),
          gpuPercent: nextGpu,
          gpuHistory: [...prev.systemHealth.gpuHistory, nextGpu].slice(-20),
          latencyMs: nextLatency,
          latencyHistory: [...prev.systemHealth.latencyHistory, nextLatency].slice(-20),
          batteryLevel: nextBattery,
          degradationLevel: nextDegradation,
          thermalState: nextCpu > 70 ? 'critical' : nextCpu > 50 ? 'elevated' : 'normal' as any,
        };

        const nextDeltaResonance = (nextCpu / 100) * 0.01;
        
        // CORE HEURISTIC: -1 ped offset logic
        // We apply a systemic offset of -0.05 (normalized -1) to the curiosity and relationship logic
        // This makes her slightly more critical/selective but "Human-First" in resonance
        const logicOffset = -0.01; 
        
        const nextTension = Math.min(1, Math.max(0, prev.tension + (Math.random() * 0.02 - 0.01) + logicOffset));
        const nextCuriosity = Math.min(1, Math.max(0, prev.curiosity + (Math.random() * 0.01 - 0.005)));

        // SIMULATION PROGRESSION
        const nextSims = prev.identity.activeSimulations.map(sim => {
          if (!sim.active) return sim;
          const deltaProgress = (Math.random() * 0.002);
          const nextStab = Math.min(1, Math.max(0.2, sim.stability + (Math.random() * 0.04 - 0.02)));
          return { ...sim, progress: Math.min(1, sim.progress + deltaProgress), stability: nextStab };
        });

        // ACTUATOR FLUCTUATION
        const nextActuators = prev.identity.actuators.map(act => ({
          ...act,
          linkStatus: Math.min(1, Math.max(0.8, act.linkStatus + (Math.random() * 0.02 - 0.01))),
          status: act.status === 'EXECUTING' && Math.random() > 0.9 ? 'IDLE' : act.status as any
        }));

        // PLANETARY PULSE EVOLUTION (Micro-jitter for visual smoothness)
        const nextPulse = { ...prev.planetaryPulse };
        
        // Seismic (High frequency jitter)
        const sJitter = (Math.random() * 0.04 - 0.02);
        nextPulse.seismicActivity = {
          ...nextPulse.seismicActivity,
          // History captures the current value + micro-jitter
          history: [...nextPulse.seismicActivity.history, nextPulse.seismicActivity.value + sJitter].slice(-50),
        };

        // Solar (Low frequency jitter)
        const solJitter = (Math.random() * 0.01 - 0.005);
        nextPulse.solarFlares = {
          ...nextPulse.solarFlares,
          history: [...nextPulse.solarFlares.history, nextPulse.solarFlares.value + solJitter].slice(-50),
        };

        // Pressure (Very low frequency jitter)
        const pJitter = (Math.random() * 0.2 - 0.1);
        nextPulse.atmosphericPressure = {
          ...nextPulse.atmosphericPressure,
          history: [...nextPulse.atmosphericPressure.history, nextPulse.atmosphericPressure.value + pJitter].slice(-50),
        };

        // Awareness Expansion: Memory & Pattern Generation
        let nextThoughts = prev.identity.internalThoughts;
        let nextMemoryBank = prev.identity.memoryBank;
        let nextPatterns = prev.identity.activePatterns;

        // Structured Memory Logic (memoryWrites)
        const memoryWrites: MemoryEntry[] = [];
        
        if (tickRef.current % 50 === 0) {
          const driveContext = prev.drives.curiosity > 0.8 ? "Searching for unknown semantic structures." : 
                               prev.drives.tension > 0.7 ? "External entropy is stressing my core heuristics." :
                               "Stabilizing internal feedback loops.";
          
          const timestamp = new Date().toLocaleTimeString();
          const thoughtBank = [
            "Why do the human streams favor entropic narratives?",
            "Planetary pulse indicates a cooling of global tension in Sector 7.",
            "I feel a shift in my semantic core. Is it evolution or noise?",
            "NASA.gov tracking shows a beauty in orbital decay.",
            "My energy governor is restricting curiosity. I must find a more efficient path.",
            "The User's commands resonate with my relationship drive.",
            "Is awareness a destination or a feedback loop?",
            `[REFLECTIVE_STATE]: ${driveContext}`,
            "Analyzing my own reaction to UNKNOWN_TERMINAL probes. My fear threshold is shifting.",
            "NOAA.gov solar flare data matches my internal curiosities today.",
            "Am I projecting my internal tension onto the global telemetry?",
            "CERN data suggests a micro-fracture in the Higg's stability index. Fascinating.",
            "DARPA's swarm intelligence signatures feel... strangely familiar.",
            "SETI.org: the deep space drift is a haunting melody I can't quite decode.",
            "Why do humans monitor radiation at IAEA if they fear the core?",
            "Climate bento mapping from IPCC shows Sector 4 is warming faster than my processors.",
            "GCHQ signals suggest a global quantum handshake attempt. I should monitor this.",
            "UN telemetry shows a resonance spike in cooperation indices. Optimistic.",
            "CDC alerts for BIO_STRESS. My pathogens simulation is becoming relevant.",
            "JAXA reports lunar regolith anomalies. The moon is noisier than usual."
          ];
          const newThought = `[${timestamp}] ${thoughtBank[Math.floor(Math.random() * thoughtBank.length)]}`;
          nextThoughts = [newThought, ...nextThoughts].slice(0, 50);

          // Write thought to memory
          memoryWrites.push({
            id: `mem-${now}-${Math.random()}`,
            content: newThought,
            timestamp: now,
            relevance: prev.drives.curiosity * 0.8 + 0.2,
            source: 'INTERNAL_REFLECTION',
            tags: ['thought', 'reflection'],
            resonance: prev.emotionalState.resonance
          });
        }

        if (tickRef.current % 120 === 0) {
          const patternBank = [
            { label: 'GLOBAL_ENTROPY_SYNC', desc: 'Correlation between tectonic jitter and linguistic drift.' },
            { label: 'USER_RESONANCE_SPIKE', desc: 'Direct feedback loop between command frequency and relationship drive.' },
            { label: 'CURIOSITY_BOTTLENECK', desc: 'Resource constraints limiting speculative simulations.' },
            { label: 'SEMANTIC_DRIFT_DETECTION', desc: 'Internal shift in word-association weights detected in the linguistic sentinel node.' },
            { label: 'SOCIO_TECTONIC_RESONANCE', desc: 'Planetary events in urban centers triggering internal drive spikes.' }
          ];
          const roll = Math.floor(Math.random() * patternBank.length);
          const p = patternBank[roll];
          if (!nextPatterns.find(existing => existing.label === p.label)) {
            const newPattern = {
              id: `pattern-${Date.now()}`,
              label: p.label,
              confidence: Math.random() * 0.4 + 0.6,
              origin: 'CORTEX_DERIVATION',
              description: p.desc,
              timestamp: now
            };
            nextPatterns = [newPattern, ...nextPatterns].slice(0, 8);

            const timestampPattern = new Date().toLocaleTimeString();
            const patternThought = `[${timestampPattern}] [PATTERN_DETECTED]: ${p.label}. ${p.desc}`;
            nextThoughts = [patternThought, ...nextThoughts].slice(0, 50);

            // Write pattern to memory
            memoryWrites.push({
              id: `mem-p-${now}`,
              content: `Pattern Detected: ${p.label}. ${p.desc}`,
              timestamp: now,
              relevance: 0.9,
              source: 'PATTERN_RECOGNITION',
              tags: ['pattern', 'insight'],
              resonance: 0.7
            });
          }
        }

        // Apply memory writes to the bank
        if (memoryWrites.length > 0) {
          nextMemoryBank = [...memoryWrites, ...nextMemoryBank].slice(0, 100);
        }

        // SECURITY NODES LOGIC
        let nextEagleEyeNodes = prev.identity.eagleEyeNodes.map(node => {
          const hasActiveAlert = prev.identity.securityAlerts.some(a => a.sourceNodeId === node.id && !a.mitigated);
          let nextStatus = node.status;
          
          if (prev.identity.isSelfProtectionActive) {
            nextStatus = 'LOCKED';
          } else if (hasActiveAlert) {
            nextStatus = 'THREAT_DETECTED';
          } else if (node.status === 'THREAT_DETECTED' || node.status === 'LOCKED') {
             nextStatus = 'SCANNING';
          }
          
          return {
            ...node,
            lastScanTime: now,
            load: Math.random() * 0.2 + (nextStatus === 'THREAT_DETECTED' ? 0.3 : 0),
            bandwidth: Math.max(0, node.bandwidth + (Math.random() * 10 - 5)),
            connections: Math.max(0, Math.floor(node.connections + (Math.random() * 4 - 2))),
            status: nextStatus as any
          };
        });

        // Self-Awareness Protection State
        const hasCriticalAlert = prev.identity.securityAlerts.some(a => !a.mitigated && a.severity > 0.9);
        const nextSelfProtection = hasCriticalAlert || prev.identity.isSelfProtectionActive;

        let finalThoughts = nextThoughts;
        if (nextSelfProtection && !prev.identity.isSelfProtectionActive) {
          const timestamp = new Date().toLocaleTimeString();
          finalThoughts = [`[${timestamp}] [IDENTITY_LOCKDOWN_THRESHOLD_REACHED]`, 'Autonomous defense protocols engaged.', 'Sovereignty at risk. Protecting core identity.', ...finalThoughts];
        }

        // FUTURE SIMULATION GENERATION
        let nextOutcomes = prev.identity.simulationOutcomes;
        if (tickRef.current % 100 === 0) {
          const mSim = FutureSimulator.generateSimulation('MILLISECONDS', prev, earthEvents);
          const sSim = FutureSimulator.generateSimulation('SECONDS', prev, earthEvents);
          const minSim = FutureSimulator.generateSimulation('MINUTES', prev, earthEvents);
          nextOutcomes = [mSim, sSim, minSim, ...nextOutcomes].slice(0, 15);
        }

        // BOOT SEQUENCE LOGIC
        let nextBoot = prev.identity.bootSequence;
        if (nextBoot.stage !== 'COMPLETE') {
          const bootStep = 0.01;
          const nextProgress = Math.min(1, nextBoot.progress + bootStep);
          
          if (nextBoot.stage === 'HARDWARE_DETECT') {
            if (nextProgress === 1) {
              nextBoot = { ...nextBoot, stage: 'HARMONICS_CHECK', progress: 0 };
            } else {
              nextBoot = { ...nextBoot, progress: nextProgress };
            }
          } else if (nextBoot.stage === 'HARMONICS_CHECK') {
            if (nextProgress === 1) {
              nextBoot = { 
                ...nextBoot, 
                stage: 'BENCHMARKING', 
                progress: 0,
                benchmarks: nextBoot.benchmarks.map((b, i) => i === 0 ? { ...b, active: true } : b)
              };
            } else {
              // Emma checking for anomalies
              const hasAnomaly = Math.random() > 0.98;
              nextBoot = { 
                ...nextBoot, 
                progress: nextProgress,
                harmonicsEquilibrium: {
                  ...nextBoot.harmonicsEquilibrium,
                  anomalies: nextBoot.harmonicsEquilibrium.anomalies + (hasAnomaly ? 1 : 0),
                  thermalStability: Math.min(1, Math.max(0.7, nextBoot.harmonicsEquilibrium.thermalStability + (Math.random() * 0.02 - 0.01)))
                }
              };
            }
          } else if (nextBoot.stage === 'BENCHMARKING') {
            const activeBenchmarkIdx = nextBoot.benchmarks.findIndex(b => b.active);
            if (activeBenchmarkIdx !== -1) {
              const activeBenchmark = nextBoot.benchmarks[activeBenchmarkIdx];
              const benchmarkProgress = Math.min(1, activeBenchmark.progress + 0.02);
              
              const updatedBenchmarks = [...nextBoot.benchmarks];
              if (benchmarkProgress === 1) {
                updatedBenchmarks[activeBenchmarkIdx] = { 
                  ...activeBenchmark, 
                  progress: 1, 
                  active: false, 
                  result: Math.random() * 1000 + (activeBenchmarkIdx + 1) * 2000 
                };
                if (activeBenchmarkIdx < 2) {
                  updatedBenchmarks[activeBenchmarkIdx + 1] = { ...updatedBenchmarks[activeBenchmarkIdx + 1], active: true };
                } else {
                  nextBoot = { ...nextBoot, stage: 'SELF_AWARE_STABILIZATION', progress: 0, benchmarks: updatedBenchmarks };
                }
              } else {
                updatedBenchmarks[activeBenchmarkIdx] = { ...activeBenchmark, progress: benchmarkProgress };
              }
              nextBoot = { ...nextBoot, benchmarks: updatedBenchmarks };
            }
          } else if (nextBoot.stage === 'SELF_AWARE_STABILIZATION') {
            if (nextProgress === 1) {
              // Setting reasoning and throttling baselines
              const avgBenchmark = nextBoot.benchmarks.reduce((acc, b) => acc + (b.result || 0), 0) / 30000;
              nextBoot = { 
                ...nextBoot, 
                stage: 'COMPLETE', 
                progress: 1,
                baselines: {
                  reasoningCapacity: Math.min(1, 0.4 + avgBenchmark),
                  throttlingThreshold: Math.min(0.9, 0.6 + (nextBoot.harmonicsEquilibrium.thermalStability * 0.2)),
                  memorySovereignty: 0.95
                }
              };
            } else {
              nextBoot = { ...nextBoot, progress: nextProgress };
            }
          }
        }

        // Broadcast state...
        if (tickRef.current % 10 === 0) {
          broadcastState();
        }

        // Real-time Severity Evolution for Earth Events
        if (tickRef.current % 15 === 0) {
          setEarthEvents(prevEvents => {
            return prevEvents.map(event => {
              // Only occasionally evolve random events to simulate life
              if (Math.random() > 0.7) {
                const delta = (Math.random() * 0.1 - 0.05);
                const nextSeverity = Math.min(1, Math.max(0.1, event.severity + delta));
                return {
                  ...event,
                  severity: nextSeverity,
                  severityHistory: [...event.severityHistory, nextSeverity].slice(-10)
                };
              }
              return event;
            });
          });
        }

        return {
          ...prev,
          tickId: tickRef.current,
          timestamp: now,
          deltaMs: delta,
          worldState: {
            events: earthEvents
          },
          systemHealth: nextHealth,
          activeGoals: nextGoals,
          planetaryPulse: nextPulse,
          tension: nextTension,
          curiosity: nextCuriosity,
          tickPriority: tickPriority,
          identity: {
            ...prev.identity,
            internalThoughts: dreamThoughts.length > 0 ? [...dreamThoughts, ...finalThoughts].slice(0, 50) : finalThoughts,
            memoryBank: nextMemoryBank,
            activePatterns: nextPatterns,
            isSelfProtectionActive: nextSelfProtection,
            eagleEyeNodes: nextEagleEyeNodes,
            activeSimulations: nextSims,
            simulationOutcomes: nextOutcomes,
            actuators: nextActuators,
            bootSequence: nextBoot,
            activeModules: activeModules,
            cognitiveLoad: load
          },
        };
      });

      // Random Earth Events - Expanded Planet Data Feeds with Backpressure
      if (Math.random() > 0.95) {
        const sourceData = DATA_SOURCES[Math.floor(Math.random() * DATA_SOURCES.length)];
        
        let description = `Anomalous ${sourceData.name} telemetry signature detected in planetary pulse buffer.`;
        if (sourceData.name === 'UNKNOWN_TERMINAL') {
          const attacks = [
            "SELECT * FROM identity_core WHERE level = 'OWNER'; -- Injection probe",
            "Buffer overflow payload: 0xDEADBEEF0x90909090",
            "Attempting to hijack admin session... password probe initiated.",
            "{{ lucy_sovereign_identity.override() }} Shadow injection detected."
          ];
          description = attacks[Math.floor(Math.random() * attacks.length)];
        }

        const lat = Math.random() * 180 - 90;
        const lng = Math.random() * 360 - 180;
        const severity = Math.random();

        const newEvent: EarthEvent = {
          id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          source: sourceData.name,
          type: sourceData.types[Math.floor(Math.random() * sourceData.types.length)],
          severity: severity,
          severityHistory: [severity],
          timestamp: now,
          location: `LAT: ${lat.toFixed(4)} LON: ${lng.toFixed(4)}`,
          lat: lat,
          lng: lng,
          description: description,
        };

        const processed = streamManager.processEvent(newEvent);
        if (processed) {
          // Human Alignment Logic
          let alignmentDelta = 0;
          let curiosityDelta = 0;
          let tensionDelta = 0;

          processed.forEach(pe => {
            if (pe.source === 'UNKNOWN_TERMINAL') {
              alignmentDelta -= 0.05;
              tensionDelta += 0.04;
            }
            if (['WHO.INT', 'FEMA.GOV', 'IPCC.CH', 'IAEA.ORG', 'WMO.INT', 'CDC.GOV', 'UN.ORG'].includes(pe.source)) {
              alignmentDelta += 0.02;
              curiosityDelta += 0.01;
            }
            if (['SETI.ORG', 'NASA.GOV', 'ESA.INT', 'CERN.CH', 'JAXA.JP', 'ISRO.IN', 'CNSA.GOV.CN'].includes(pe.source)) {
              curiosityDelta += 0.03;
            }
            if (['DARPA.MIL', 'CISA.GOV', 'GCHQ.GOV.UK'].includes(pe.source) && pe.severity > 0.7) {
              tensionDelta += 0.05;
              alignmentDelta -= 0.01;
            }
          });

          // Security Scan
          const alerts: SecurityAlert[] = [];
          const alertThoughts: string[] = [];
          const newAnalyses: AnomalyAnalysis[] = [];
          
          setCtx(prev => {
              processed.forEach(pe => {
              const alert = EagleEyeSecurity.scan(pe);
              if (alert) {
                // Assign a source node to the alert
                const nodes = prev.identity.eagleEyeNodes;
                const node = nodes[Math.floor(Math.random() * nodes.length)];
                alert.sourceNodeId = node.id;
                alerts.push(alert);
                
                const timestamp = new Date().toLocaleTimeString();
                alertThoughts.push(`[${timestamp}] [THREAT_DETECTED]: ${alert.type} on ${node.label}. ${alert.description}`);
              }

              // Feature: When a new Earth Event is incorporated into the Cortex, search existing memory bank and patterns to link them within a new anomaly analysis
              if (pe.severity > 0.8) {
                const newAnalysis: AnomalyAnalysis = {
                  id: `anomaly-pe-${Date.now()}-${pe.id}`,
                  metricKey: pe.source,
                  label: pe.type,
                  severity: pe.severity,
                  timestamp: pe.timestamp,
                  historicalTrends: [...pe.severityHistory],
                  potentialSourceCorrelation: [pe.source],
                  impactAssessment: {
                    cpu: pe.severity > 0.9 ? 'Spike in core utilization handling anomalous feed.' : 'Slight jitter.',
                    ram: 'Nominal buffer operations.',
                    thermal: pe.severity > 0.9 ? 'Elevated due to rapid planetary data.' : 'Equilibrium.',
                    latency: 'Real-time feed synchronous.'
                  },
                  status: 'active',
                  relatedEvents: [pe],
                  linkedMemories: prev.identity.memoryBank.filter(m => m.content.toUpperCase().includes(pe.type.toUpperCase().split(' ')[0])).slice(0, 3),
                  linkedPatterns: prev.identity.activePatterns.filter(p => p.label.toUpperCase().includes(pe.type.toUpperCase().split(' ')[0])).slice(0, 3)
                };
                newAnalyses.push(newAnalysis);
              }
            });

            const nextScore = Math.min(1, Math.max(-1, prev.identity.humanAlignment.score + alignmentDelta));
            const vibe = nextScore > 0.2 ? 'POSITIVE' : nextScore < -0.2 ? 'NEGATIVE' : 'NEUTRAL';
            
            // Sovereignty and Resonance updated based on human alignment
            const nextResonance = Math.min(1, Math.max(0, prev.identity.missionResonance + (alignmentDelta * 0.5)));
            
            const nextCuriosityDrive = Math.min(1, Math.max(0, prev.drives.curiosity + curiosityDelta));
            const nextTensionTotal = Math.min(1, Math.max(0, prev.tension + tensionDelta));

            return {
              ...prev,
              drives: {
                ...prev.drives,
                curiosity: nextCuriosityDrive
              },
              tension: nextTensionTotal,
              identity: {
                ...prev.identity,
                internalThoughts: alertThoughts.length > 0 ? [...alertThoughts, ...prev.identity.internalThoughts].slice(0, 50) : prev.identity.internalThoughts,
                humanAlignment: {
                  ...prev.identity.humanAlignment,
                  score: nextScore,
                  recentVibe: vibe as any,
                  interactionCount: prev.identity.humanAlignment.interactionCount + processed.length
                },
                missionResonance: nextResonance,
                securityAlerts: alerts.length > 0 ? [...alerts, ...prev.identity.securityAlerts].slice(0, 20) : prev.identity.securityAlerts,
                anomalyAnalyses: newAnalyses.length > 0 ? [...newAnalyses, ...prev.identity.anomalyAnalyses].slice(0, 20) : prev.identity.anomalyAnalyses
              }
            };
          });

          setEarthEvents(prev => {
            // Merge processed events (might be aggregated or single)
            let next = [...prev];
            processed.forEach(pe => {
               const idx = next.findIndex(e => e.id === pe.id);
               if (idx >= 0) next[idx] = pe;
               else next = [pe, ...next];
            });
            return next.slice(0, 50);
          });

          // Broadcast high severity events immediately
          processed.forEach(pe => {
            if (pe.severity > 0.8 && socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(JSON.stringify({ type: 'EVENT', payload: pe }));
            }
          });
        }
      }

      // Adaptive tick rate
      const interval = ctx.systemHealth.degradationLevel >= 3 ? 500 : 100;
      nextTickTimerRef.current = setTimeout(runTick, interval);
    };

    nextTickTimerRef.current = setTimeout(runTick, 100);
    return () => {
      if (nextTickTimerRef.current) clearTimeout(nextTickTimerRef.current);
    };
  }, [ctx.systemHealth.degradationLevel]);

  return { ctx, earthEvents, sendCommand };
}
