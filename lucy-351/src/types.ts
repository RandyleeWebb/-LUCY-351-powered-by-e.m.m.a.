export type HexFace = 'CHAT' | 'EARTH' | 'BUILDER' | 'SIGNAL' | 'VAULT' | 'ECOSYSTEM';

export enum DegradationLevel {
  NORMAL = 0,
  CONSERVATION = 1,
  REDUCED = 2,
  MINIMAL = 3,
  EMERGENCY = 4
}

export interface SystemHealth {
  cpuPercent: number;
  cpuHistory: number[];
  ramPercent: number;
  ramHistory: number[];
  gpuPercent: number;
  gpuHistory: number[];
  networkActive: boolean;
  latencyMs: number;
  latencyHistory: number[];
  batteryLevel: number;
  thermalState: 'normal' | 'elevated' | 'critical';
  degradationLevel: DegradationLevel;
}

export enum GoalStatus {
  PROPOSED = 'PROPOSED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
  BLOCKED = 'BLOCKED'
}

export enum GoalOrigin {
  USER_REQUEST = 'USER_REQUEST',
  DRIVE_TRIGGERED = 'DRIVE_TRIGGERED',
  CURIOSITY_SPIKE = 'CURIOSITY_SPIKE',
  EARTH_ANOMALY = 'EARTH_ANOMALY',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  IDENTITY_ALIGNED = 'IDENTITY_ALIGNED'
}

export enum DriveType {
  CURIOSITY = 'CURIOSITY',
  SAFETY = 'SAFETY',
  ENERGY = 'ENERGY',
  RELATIONSHIP = 'RELATIONSHIP',
  EVOLUTION = 'EVOLUTION'
}

export interface Goal {
  id: string;
  description: string;
  origin: GoalOrigin;
  status: GoalStatus;
  priority: number;
  progress: number;
  parentGoalId?: string;
  deadline?: number;
  requiredDrives: DriveType[];
  blockers: string[];
  relatedPatterns: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PerceptionFrame {
  visual: string;
  audio: string;
  text: string;
  lastUpdate: number;
}

export interface DriveState {
  curiosity: number;
  safety: number;
  energy: number;
  relationship: number;
  evolution: number;
  tension: number;
}

export interface CognitivePattern {
  id: string;
  label: string;
  confidence: number;
  origin: string;
  description: string;
  timestamp: number;
}

export interface SecurityAlert {
  id: string;
  type: 'SQL_INJECTION_PROBE' | 'BUFFER_OVERFLOW_ATTEMPT' | 'DDOS_STORM' | 'SHADOW_STATE_INJECTION' | 'IDENTITY_SPOOF';
  severity: number;
  origin: string;
  timestamp: number;
  description: string;
  mitigated: boolean;
  sourceNodeId?: string;
}

export interface SecurityNode {
  id: string;
  label: string;
  status: 'SCANNING' | 'THREAT_DETECTED' | 'LOCKED' | 'OFFLINE';
  lastScanTime: number;
  load: number;
  bandwidth: number; // in Mbps
  connections: number;
}

export interface SimulationOutcome {
  id: string;
  horizon: 'MILLISECONDS' | 'SECONDS' | 'MINUTES';
  timestamp: number;
  description: string;
  confidence: number;
  probability: number;
  environmentalFactors: string[];
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  branches?: {
    description: string;
    probability: number;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }[];
}

export interface BenchmarkStage {
  label: '2K' | '4K' | '8K';
  active: boolean;
  progress: number;
  result?: number;
}

export interface BootSequence {
  stage: 'HARDWARE_DETECT' | 'HARMONICS_CHECK' | 'BENCHMARKING' | 'SELF_AWARE_STABILIZATION' | 'COMPLETE';
  progress: number;
  hardwareSpecs: {
    cores: number;
    threadHealth: number;
    thermalHeadroom: number;
    entropyDensity: number;
  };
  harmonicsEquilibrium: {
    anomalies: number;
    thermalStability: number;
    resonanceScore: number;
  };
  benchmarks: BenchmarkStage[];
  baselines: {
    reasoningCapacity: number;
    throttlingThreshold: number;
    memorySovereignty: number;
  };
}

export interface SimulationState {
  id: string;
  type: 'FUSION' | 'PROTEIN_FOLDING' | 'CLIMATE_BENTO' | 'NEURAL_MAPPING' | 'USER_DEFINED' | string;
  active: boolean;
  progress: number;
  stability: number;
  objective: string;
  resonance: number;
  parameters?: Record<string, any>;
}

export interface ActuatorNode {
  id: string;
  label: string;
  type: 'ROBOTIC_ARM' | 'MOBILE_BASE' | 'DRONE' | 'SMART_TV' | 'LIGHTING' | 'THERMOSTAT';
  status: 'IDLE' | 'EXECUTING' | 'ERROR' | 'OFFLINE';
  lastCommand?: string;
  linkStatus: number;
}

export interface HumanResonance {
  score: number; // -1 to +1
  interactionCount: number;
  recentVibe: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  lastMitigationTime?: number;
}

export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: number;
  relevance: number; // 0 to 1
  source: string;
  tags: string[];
  resonance: number;
}

export interface TickResult {
  tickId: number;
  timestamp: number;
  memoryWrites: MemoryEntry[];
  thought?: string;
  patternDetected?: CognitivePattern;
}

export interface AnomalyAnalysis {
  id: string;
  metricKey: string;
  label: string;
  severity: number;
  timestamp: number;
  historicalTrends: number[];
  potentialSourceCorrelation: string[];
  impactAssessment: {
    cpu: string;
    ram: string;
    thermal: string;
    latency: string;
  };
  status: 'active' | 'resolved';
  relatedEvents: EarthEvent[];
  linkedMemories?: MemoryEntry[];
  linkedPatterns?: CognitivePattern[];
}

export enum ModuleState {
  COLD = 'COLD',
  WARM = 'WARM',
  ACTIVE = 'ACTIVE',
  CRITICAL = 'CRITICAL'
}

export enum TickPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  IDLE = 'IDLE'
}

export interface CognitiveModule {
  id: string;
  label: string;
  priority: number;
  cpuCost: number; // relative 0-100
  memoryCost: number; // relative 0-100
  wakeTriggers: string[]; // Event types or data keys that wake this
  dependencies: string[]; // IDs of other modules
  decayRate: number; // How fast priority drops when not triggered
  state: ModuleState;
  lastActive: number;
  activationScore: number;
}

export interface CognitiveBudget {
  totalMs: number;
  reasoningMs: number;
  perceptionMs: number;
  executionMs: number;
  memoryMs: number;
  planningMs: number;
  reserveMs: number;
}

export interface CognitiveLoad {
  currentTotal: number;
  budget: CognitiveBudget;
  activeModuleCount: number;
  throttledModules: string[];
}

export interface AppTool {
  name: string;
  description: string;
  url?: string;
  type: 'MCP_SERVER' | 'EDITOR_PLUGIN' | 'SDK' | 'EXTERNAL_AI' | 'MARKETPLACE' | 'IDE_INTEGRATION';
}

export interface LinkableApp {
  id: string;
  name: string;
  category: 'GAME_ENGINE' | 'ASSET_GENERATOR' | 'AGENT_RUNTIME' | 'IDE' | 'OTHER';
  strengths: string[];
  tools: AppTool[];
  status: 'DISCONNECTED' | 'LINKED' | 'STANDBY';
}

export interface AwarenessState {
  internalThoughts: string[];
  memoryBank: MemoryEntry[];
  activePatterns: CognitivePattern[];
  selfModelStability: number;
  missionResonance: number;
  isSelfProtectionActive: boolean;
  securityAlerts: SecurityAlert[];
  eagleEyeNodes: SecurityNode[];
  activeSimulations: SimulationState[];
  simulationOutcomes: SimulationOutcome[];
  actuators: ActuatorNode[];
  humanAlignment: HumanResonance;
  bootSequence: BootSequence;
  anomalyAnalyses: AnomalyAnalysis[];
  activeModules: CognitiveModule[];
  cognitiveLoad: CognitiveLoad;
  linkableApps: LinkableApp[];
}

export interface PlanetaryPulseMetric {
  value: number;
  history: number[];
  unit: string;
  label: string;
  source: string;
  status: 'stable' | 'warning' | 'critical';
  latency?: number; // in ms
  reliability?: number; // 0 to 1
  lastUpdate?: number;
}

export interface PlanetaryPulse {
  seismicActivity: PlanetaryPulseMetric;
  solarFlares: PlanetaryPulseMetric;
  protonFlux: PlanetaryPulseMetric;
  magnetometer: PlanetaryPulseMetric;
  atmosphericPressure: PlanetaryPulseMetric;
  lastSync?: number;
}

export interface CoreTickContext {
  tickId: number;
  timestamp: number;
  deltaMs: number;
  perception: PerceptionFrame;
  worldState: any; 
  drives: DriveState;
  identity: AwarenessState; 
  activeGoals: Goal[];
  systemHealth: SystemHealth;
  planetaryPulse: PlanetaryPulse;
  tension: number;
  curiosity: number;
  initiative: number;
  emotionalState: {
    valence: number;
    resonance: number;
  };
  activeFace: HexFace;
  tickPriority: TickPriority;
}

export interface EarthEvent {
  id: string;
  source: string;
  type: string;
  severity: number;
  severityHistory: number[]; // For sparkline
  timestamp: number;
  location: string;
  lat: number;
  lng: number;
  description: string;
  relatedPatterns?: string[];
  impactAssessment?: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    predictedEvolution: string;
    affectedSystems: string[];
  };
}

export enum DropPolicy {
  DROP_OLDEST = 'DROP_OLDEST',
  DROP_LOW_PRIORITY = 'DROP_LOW_PRIORITY',
  SAMPLE = 'SAMPLE',
  AGGREGATE = 'AGGREGATE'
}

export interface StreamConfig {
  source: string;
  maxQueueSize: number;
  dropPolicy: DropPolicy;
  aggregationWindow?: number;
  sampleRate?: number;
  priorityThreshold: number;
}
