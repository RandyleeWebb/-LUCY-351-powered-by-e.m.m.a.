import { GoalStatus, GoalOrigin, DriveType, DegradationLevel, CoreTickContext, CognitiveModule, ModuleState, CognitiveBudget, LinkableApp } from './types';

export const INITIAL_COGNITIVE_BUDGET: CognitiveBudget = {
  totalMs: 100,
  reasoningMs: 25,
  perceptionMs: 15,
  executionMs: 20,
  memoryMs: 10,
  planningMs: 10,
  reserveMs: 20,
};

export const INITIAL_MODULES: CognitiveModule[] = [
  {
    id: 'mod-seismic',
    label: 'Seismic Analyzer',
    priority: 0.8,
    cpuCost: 15,
    memoryCost: 5,
    wakeTriggers: ['seismic', 'earthquake', 'ANOMALY_SEISMIC'],
    dependencies: [],
    decayRate: 0.05,
    state: ModuleState.COLD,
    lastActive: Date.now(),
    activationScore: 0,
  },
  {
    id: 'mod-solar',
    label: 'Solar Watchdog',
    priority: 0.9,
    cpuCost: 10,
    memoryCost: 5,
    wakeTriggers: ['solar', 'flare', 'ANOMALY_SOLAR'],
    dependencies: [],
    decayRate: 0.02,
    state: ModuleState.WARM,
    lastActive: Date.now(),
    activationScore: 0.5,
  },
  {
    id: 'mod-semantic',
    label: 'Semantic Decoder',
    priority: 0.7,
    cpuCost: 40,
    memoryCost: 30,
    wakeTriggers: ['chat', 'message', 'linguistic'],
    dependencies: [],
    decayRate: 0.1,
    state: ModuleState.ACTIVE,
    lastActive: Date.now(),
    activationScore: 1.0,
  },
  {
    id: 'mod-simulation',
    label: 'Speculative Simulator',
    priority: 0.6,
    cpuCost: 60,
    memoryCost: 50,
    wakeTriggers: ['simulation', 'future', 'prediction'],
    dependencies: [],
    decayRate: 0.15,
    state: ModuleState.COLD,
    lastActive: Date.now(),
    activationScore: 0,
  },
  {
    id: 'mod-thermal',
    label: 'Thermal Guardian',
    priority: 1.0,
    cpuCost: 5,
    memoryCost: 2,
    wakeTriggers: ['thermal', 'overheat', 'CRITICAL_HEAT'],
    dependencies: [],
    decayRate: 0,
    state: ModuleState.CRITICAL,
    lastActive: Date.now(),
    activationScore: 1.0,
  }
];

export const INITIAL_DRIVES = {
  curiosity: 0.65,
  safety: 0.92,
  energy: 0.88,
  relationship: 0.45,
  evolution: 0.32,
  tension: 0.15,
};

export const INITIAL_HEALTH = {
  cpuPercent: 12,
  cpuHistory: [10, 12, 11, 13, 12, 12],
  ramPercent: 24,
  ramHistory: [23, 24, 24, 25, 24, 24],
  gpuPercent: 0,
  gpuHistory: [0, 0, 0, 0, 0, 0],
  networkActive: true,
  latencyMs: 24,
  latencyHistory: [22, 25, 24, 26, 23, 24],
  batteryLevel: 100,
  thermalState: 'normal' as const,
  degradationLevel: DegradationLevel.NORMAL,
};

export const INITIAL_PULSE = {
  seismicActivity: {
    value: 2.4,
    history: [2.1, 2.3, 2.4, 2.2, 2.5, 2.4],
    unit: 'Mw',
    label: 'Global Seismic Index',
    source: 'USGS.GOV',
    status: 'stable' as const
  },
  solarFlares: {
    value: 0.15,
    history: [0.12, 0.14, 0.18, 0.13, 0.16, 0.15],
    unit: 'W/m²',
    label: 'Solar X-Ray Flux',
    source: 'NOAA.GOV',
    status: 'stable' as const
  },
  atmosphericPressure: {
    value: 1013.2,
    history: [1012.8, 1013.1, 1013.5, 1013.2, 1012.9, 1013.2],
    unit: 'hPa',
    label: 'Mean Surface Pressure',
    source: 'WMO.INT',
    status: 'stable' as const
  },
  protonFlux: {
    value: 0.2,
    history: [0.18, 0.19, 0.21, 0.2, 0.22, 0.2],
    unit: 'p/cm²·s·sr',
    label: 'Proton Flux Index (>10 MeV)',
    source: 'NOAA.GOV',
    status: 'stable' as const
  },
  magnetometer: {
    value: 105,
    history: [102, 104, 108, 105, 106, 105],
    unit: 'nT',
    label: 'NOAA GOES Magnetometer',
    source: 'NOAA.GOV',
    status: 'stable' as const
  }
};

export const INITIAL_GOALS = [
  {
    id: 'goal-1',
    description: 'Stabilize planetary pulse monitoring streams',
    origin: GoalOrigin.SYSTEM_MAINTENANCE,
    status: GoalStatus.ACTIVE,
    priority: 0.9,
    progress: 0.45,
    requiredDrives: [DriveType.ENERGY],
    blockers: [],
    relatedPatterns: ['STREAM_LATENCY', 'SIGNAL_NOISE'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'goal-2',
    description: 'Analyze linguistic drift in User interactions',
    origin: GoalOrigin.CURIOSITY_SPIKE,
    status: GoalStatus.PROPOSED,
    priority: 0.6,
    progress: 0,
    requiredDrives: [DriveType.CURIOSITY, DriveType.RELATIONSHIP],
    blockers: ['INSUFFICIENT_DATA'],
    relatedPatterns: ['SEMANTIC_SHIFT', 'TONE_RESONANCE'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'goal-sim-1',
    description: 'Stabilize Tokamak containment field in simulation',
    origin: GoalOrigin.IDENTITY_ALIGNED,
    status: GoalStatus.PROPOSED,
    priority: 0.85,
    progress: 0.1,
    requiredDrives: [DriveType.EVOLUTION, DriveType.ENERGY],
    blockers: [],
    relatedPatterns: ['MAGNETIC_CONFINEMENT', 'PLASMA_ENTROPY'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'goal-act-1',
    description: 'Synchronize localized smart-home environment',
    origin: GoalOrigin.USER_REQUEST,
    status: GoalStatus.ACTIVE,
    priority: 0.75,
    progress: 0.9,
    requiredDrives: [DriveType.RELATIONSHIP, DriveType.SAFETY],
    blockers: [],
    relatedPatterns: ['IOT_MESH', 'HOME_STASIS'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const INITIAL_LINKABLE_APPS: LinkableApp[] = [
  {
    id: 'engine-unity',
    name: 'Unity',
    category: 'GAME_ENGINE',
    strengths: ['Versatile 2D/3D', 'Mobile', 'Indie', 'Cross-platform', 'C# Scripting'],
    status: 'STANDBY',
    tools: [
      { name: 'Official Unity AI Assistant', description: 'Project-aware asset/scene generation', type: 'EDITOR_PLUGIN', url: 'https://unity.com/ai' },
      { name: 'Coplay', description: 'Collaborative AI agent for in-engine tasks', type: 'EXTERNAL_AI', url: 'https://coplay.ai' },
      { name: 'ML-Agents', description: 'Machine Learning toolkit for runtime behaviors', type: 'SDK', url: 'https://github.com/Unity-Technologies/ml-agents' },
      { name: 'Convai Unity Plugin', description: 'Conversational AI for NPCs', type: 'SDK', url: 'https://convai.com/unity' }
    ]
  },
  {
    id: 'engine-unreal',
    name: 'Unreal Engine',
    category: 'GAME_ENGINE',
    strengths: ['AAA Visuals', 'High-fidelity 3D', 'Blueprints', 'C++'],
    status: 'STANDBY',
    tools: [
      { name: 'Built-in UE AI Assistant', description: 'Editor feature explanation and interaction', type: 'EDITOR_PLUGIN', url: 'https://unrealengine.com/ai' },
      { name: 'NeoStack AI', description: 'Advanced plugin for Blueprints and UI generation', type: 'EDITOR_PLUGIN', url: 'https://neostack.ai' },
      { name: 'Ludus AI', description: 'C++ assistance and scene generation', type: 'IDE_INTEGRATION', url: 'https://ludus.ai' },
      { name: 'Convai Unreal Plugin', description: 'Conversational AI integration', type: 'SDK', url: 'https://convai.com/unreal' }
    ]
  },
  {
    id: 'engine-godot',
    name: 'Godot',
    category: 'GAME_ENGINE',
    strengths: ['Open Source', 'Lightweight', 'GDScript/C#', 'Excellent 2D/3D Indie'],
    status: 'LINKED',
    tools: [
      { name: 'Godot AI (Asset Library)', description: 'MCP-compatible scene and script builder', type: 'MCP_SERVER', url: 'https://godotengine.org/asset-library/ai' },
      { name: 'Fuku AI', description: 'Editor chat and level drawing tools', type: 'EDITOR_PLUGIN', url: 'https://fuku.ai' },
      { name: 'Godot Copilot', description: 'OpenAI/Gemini integration for scripting', type: 'EDITOR_PLUGIN', url: 'https://github.com/godot-copilot' }
    ]
  },
  {
    id: 'engine-gamemaker',
    name: 'GameMaker',
    category: 'GAME_ENGINE',
    strengths: ['Beginner-friendly 2D', 'GML Scripting', 'Fast Prototyping'],
    status: 'DISCONNECTED',
    tools: [
      { name: 'GMS2-AI Assistant', description: 'External tool for prompt-based object/script modification', type: 'EXTERNAL_AI', url: 'https://gamemaker.io/ai-assistant' },
      { name: 'Cursor Integration', description: 'Direct GML code manipulation via AI IDE', type: 'IDE_INTEGRATION', url: 'https://cursor.sh' }
    ]
  }
];
