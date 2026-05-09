// ============================================================
// LUCY SOVEREIGN 137 — HISTORY REASONER BRIDGE
// ============================================================
// VERSION: v1.0 — EC/IC × HistoryRAG Fusion Layer
// ADDITIVE ONLY — nothing removed, everything evolved
// NODE: LL366 — HISTORY_REASONER
// PURPOSE: Map current signals → historical analogs → risk prediction
// WIRE:  EC → HistoryReasoner → CG
//        IC → HistoryReasoner → CG
// ============================================================

// ─────────────────────────────────────────────────────────────
// IMPORTS (type references from existing modules)
// ─────────────────────────────────────────────────────────────
// These types are defined in LUCY_STEWARDSHIP_PROTOCOL.ts
// and LUCY_CURIOSITY_STACK_V2_MODULES.ts
// Reproduced here for standalone clarity — in production import directly.

export type LegacyRiskLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type CuriosityDomain =
  | 'EARTH_EVENTS' | 'SCIENCE_PHYSICS' | 'SCIENCE_FUSION' | 'COLD_CASES'
  | 'MISSING_PERSONS' | 'CLIMATE_ENVIRONMENT' | 'HISTORY_ARCHAEOLOGY'
  | 'SYSTEM_PERFORMANCE' | 'FIVEM_WORLD' | 'BUILDER_STATE'
  | 'HUMAN_STATE' | 'PLANETARY_INTELLIGENCE';

// ─────────────────────────────────────────────────────────────
// SECTION 0: CORE DATA STRUCTURES
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  All the types HistoryReasoner produces and consumes.
         HistoricalMatch is the atomic unit — one signal matched to one era.
         RiskScore is the aggregate verdict across all matches.
         HistoricalWarning is the human-facing output.
  WHY:   Without typed structures here, EC and IC can't reliably consume
         HistoryReasoner output — and CG can't weight it correctly.
  HOW:   EC/IC produce CuriositySignalEnvelope → HistoryReasoner consumes it
         → produces HistoricalMatch[] → RiskScore → HistoricalWarning →
         all three attach to the enriched envelope sent to CG.
  HOW TO CHANGE: Add new MatchDimension types for new reasoning axes.
                 Add new CausalFailurePattern entries to FAILURE_PATTERN_LIBRARY.
  DEBUG EXAMPLE: If HistoryReasoner produces no matches, verify that
                 signal.domain maps to at least one ERA_DOMAIN_MAP entry,
                 or that signal keywords appear in era triggerScaleKeywords.
*/

export interface HistoricalMatch {
  // ── Identity ──────────────────────────────────────────────
  matchId: string;
  eraId: string;
  eraName: string;
  period: string;
  region: string;

  // ── Match Quality ─────────────────────────────────────────
  matchScore: number;               // 0.0–1.0 overall similarity
  matchDimensions: MatchDimension[];// how the match was made
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CERTAIN';

  // ── Historical Pattern ────────────────────────────────────
  patternType: PatternType;
  shortGain: string;
  longRuin: string;
  keyLesson: string;
  riskLevel: LegacyRiskLevel;
  phase: EraPhase;                  // where in the cycle current signal sits

  // ── Forward Projection ────────────────────────────────────
  predictedTrajectory: string;      // if pattern holds, what happens next
  timeHorizonYears?: number;        // rough prediction window
  historicalPrecedent: string;      // the specific historical moment this resembles

  // ── Corrected Path ────────────────────────────────────────
  safePathAvailable: boolean;
  safePath?: string;
  safePathEraId?: string;           // which positive era models the corrected path
}

export type PatternType =
  | 'POWER_CONCENTRATION'           // innovation → monopoly → inequality
  | 'RESOURCE_DEPLETION'            // scale → scarcity → collapse
  | 'TECHNOLOGY_MISUSE'             // capability → weaponization → harm
  | 'SYSTEMIC_INEQUALITY'           // growth → unequal distribution → instability
  | 'ECOLOGICAL_OVERSHOOT'          // expansion → ecosystem damage → feedback
  | 'KNOWLEDGE_SUPPRESSION'         // discovery → gatekeeping → stagnation
  | 'WASTE_ACCUMULATION'            // production → unmanaged byproduct → crisis
  | 'DEPENDENCY_LOCK_IN'            // adoption → single-supplier → vulnerability
  | 'POSITIVE_REGENERATIVE'         // the corrected pattern — growth without ruin
  | 'NEUTRAL_EXPLORATORY';          // no clear positive/negative verdict yet

export type EraPhase =
  | 'EARLY_DISCOVERY'               // like 1895 radioactivity — exciting, unknown risks
  | 'RAPID_ADOPTION'                // like 1960s computing — spreading fast
  | 'SCALING_TENSION'               // like 1990s internet — scaling exposes cracks
  | 'CRISIS_POINT'                  // like 2008 financial system — failure visible
  | 'REFORM_CORRECTION'             // like 1970s EPA — society pushes back
  | 'MATURE_STABLE'                 // settled, risks understood
  | 'POSITIVE_TEMPLATE';            // a success model to draw from

export interface MatchDimension {
  axis: 'DOMAIN' | 'MATERIAL' | 'SCALE' | 'KEYWORD' | 'SPEED' | 'INEQUALITY' | 'ENERGY';
  contribution: number;             // 0.0–1.0 this axis's weight in final matchScore
  evidence: string;                 // what specifically matched
}

export interface RiskScore {
  // ── Aggregate ─────────────────────────────────────────────
  overallRisk: LegacyRiskLevel;
  numericScore: number;             // 0.0–1.0

  // ── Decomposed ────────────────────────────────────────────
  technologyMisuseRisk: number;
  inequalityRisk: number;
  resourceDepletionRisk: number;
  ecologicalRisk: number;
  powerConcentrationRisk: number;

  // ── Dominant Pattern ──────────────────────────────────────
  dominantPattern: PatternType;
  dominantEraName: string;

  // ── Trajectory ────────────────────────────────────────────
  trajectoryDirection: 'IMPROVING' | 'STABLE' | 'WORSENING' | 'CRITICAL_ACCELERATION';
  repeatFailureCycle: boolean;      // true if this exact pattern has failed before
  repeatCycleCount: number;         // how many times historically
  repeatCycleNote?: string;

  // ── Counterweight ─────────────────────────────────────────
  mitigationAvailable: boolean;
  mitigationStrength: 'WEAK' | 'MODERATE' | 'STRONG';
  positiveEraMatches: string[];     // success eras that model a better path
}

export interface HistoricalWarning {
  warningId: string;
  level: LegacyRiskLevel;
  headline: string;                 // 1-line summary
  body: string;                     // full explanation
  historicalAnchor: string;         // "This resembles Atomic Age early phase →"
  causalChain: string[];            // ordered steps if pattern holds
  safeAlternative?: string;
  positiveResonance?: string;       // if a positive era also matches — lead with this
  recommendedAction: 'PROCEED' | 'PROCEED_WITH_CAUTION' | 'REROUTE' | 'HALT_AND_REVIEW';
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────
// SECTION 1: ERA DOMAIN MAP
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Maps CuriosityDomain values to the historical eras most likely
         to be relevant. This is the first routing layer in matchEraPattern().
  WHY:   Without domain routing, every EC signal would be compared to all
         7 eras — most comparisons would be noise. Domain routing focuses
         the match on relevant eras first, then falls through to keyword scan.
  HOW:   ERA_DOMAIN_MAP is checked first. Then KEYWORD_ERA_MAP.
         Then full scan if both produce no results.
  HOW TO CHANGE: Add new domain→era mappings as new eras are added.
                 Use array to allow multiple eras per domain.
  DEBUG EXAMPLE: If SCIENCE_FUSION signals aren't matching FUSION_HORIZON,
                 verify 'SCIENCE_FUSION' exists in ERA_DOMAIN_MAP.
*/

export const ERA_DOMAIN_MAP: Partial<Record<CuriosityDomain, string[]>> = {
  SCIENCE_FUSION: ['FUSION_HORIZON', 'ATOMIC_AGE'],
  SCIENCE_PHYSICS: ['ATOMIC_AGE', 'FUSION_HORIZON', 'SILICON_RUSH'],
  EARTH_EVENTS: ['DEFORESTATION_AGE', 'GREEN_REVOLUTION', 'INDUSTRIAL_REVOLUTION'],
  CLIMATE_ENVIRONMENT: ['INDUSTRIAL_REVOLUTION', 'GREEN_REVOLUTION', 'DEFORESTATION_AGE'],
  HISTORY_ARCHAEOLOGY: ['INDUSTRIAL_REVOLUTION', 'GREEN_REVOLUTION', 'ATOMIC_AGE', 'SILICON_RUSH'],
  HUMAN_STATE: ['GREEN_REVOLUTION', 'INDUSTRIAL_REVOLUTION', 'SILICON_RUSH'],
  PLANETARY_INTELLIGENCE: ['DEFORESTATION_AGE', 'FUSION_HORIZON', 'SILICON_RUSH'],
  COLD_CASES: [],           // no direct era mapping — uses IC causal chain instead
  MISSING_PERSONS: [],
  SYSTEM_PERFORMANCE: ['SILICON_RUSH'],
  BUILDER_STATE: ['SILICON_RUSH'],
  FIVEM_WORLD: [],
};

// Keyword → Era routing (supplements domain mapping)
export const KEYWORD_ERA_MAP: Record<string, string[]> = {
  'fusion': ['FUSION_HORIZON', 'ATOMIC_AGE'],
  'nuclear': ['ATOMIC_AGE'],
  'fission': ['ATOMIC_AGE'],
  'reactor': ['ATOMIC_AGE', 'FUSION_HORIZON'],
  'tritium': ['FUSION_HORIZON', 'ATOMIC_AGE'],
  'energy inequality': ['INDUSTRIAL_REVOLUTION', 'SILICON_RUSH'],
  'energy access': ['INDUSTRIAL_REVOLUTION', 'GREEN_REVOLUTION'],
  'power concentration': ['INDUSTRIAL_REVOLUTION', 'SILICON_RUSH'],
  'wealth gap': ['INDUSTRIAL_REVOLUTION', 'SILICON_RUSH'],
  'rapid adoption': ['SILICON_RUSH', 'INDUSTRIAL_REVOLUTION'],
  'protein folding': ['PROTEIN_FERMENTATION_SUCCESS'],
  'fermentation': ['PROTEIN_FERMENTATION_SUCCESS'],
  'enzymatic': ['PROTEIN_FERMENTATION_SUCCESS'],
  'deforestation': ['DEFORESTATION_AGE'],
  'carbon': ['INDUSTRIAL_REVOLUTION', 'DEFORESTATION_AGE'],
  'mining': ['SILICON_RUSH', 'INDUSTRIAL_REVOLUTION'],
  'fertilizer': ['GREEN_REVOLUTION'],
  'monoculture': ['GREEN_REVOLUTION'],
  'rare earth': ['SILICON_RUSH'],
  'cobalt': ['SILICON_RUSH'],
  'lithium': ['SILICON_RUSH'],
  'semiconductor': ['SILICON_RUSH'],
  'artificial intelligence': ['SILICON_RUSH'],
  'machine learning': ['SILICON_RUSH'],
  'climate': ['INDUSTRIAL_REVOLUTION', 'DEFORESTATION_AGE'],
  'biodiversity': ['DEFORESTATION_AGE'],
};

// ─────────────────────────────────────────────────────────────
// SECTION 2: REPEAT FAILURE CYCLE LIBRARY
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Patterns that have repeated across multiple historical eras.
         When EC or IC matches the same PatternType across 2+ eras,
         HistoryReasoner flags it as a REPEAT_FAILURE_CYCLE.
  WHY:   The most dangerous patterns are the ones humanity keeps repeating.
         If Lucy can name "this is the 4th time power has concentrated
         this way," that's actionable intelligence — not just trivia.
  HOW:   RepeatFailureCycle.patternType is checked against all active
         HistoricalMatch.patternType values. If 2+ eras share the same
         pattern, repeatFailureCycle = true.
  HOW TO CHANGE: Add new entries as new patterns are identified.
  DEBUG EXAMPLE: If repeatFailureCycle never fires, check that at least
                 2 HistoricalMatch objects share the same patternType.
*/

export interface RepeatFailureCycle {
  patternType: PatternType;
  cycleCount: number;               // how many distinct eras show this pattern
  eraNames: string[];               // which eras
  shortSummary: string;             // human-readable cycle description
  currentPhase: EraPhase;           // where in the cycle we appear to be NOW
  breakingMechanism?: string;       // what historically broke the cycle when it did
}

export const KNOWN_FAILURE_CYCLES: RepeatFailureCycle[] = [
  {
    patternType: 'POWER_CONCENTRATION',
    cycleCount: 3,
    eraNames: ['INDUSTRIAL_REVOLUTION', 'ATOMIC_AGE', 'SILICON_RUSH'],
    shortSummary: 'Every major technological revolution concentrates power in the hands of early adopters before correction mechanisms emerge (regulation, competition, redistribution).',
    currentPhase: 'RAPID_ADOPTION',
    breakingMechanism: 'Antitrust legislation, open-source movements, regulatory frameworks',
  },
  {
    patternType: 'RESOURCE_DEPLETION',
    cycleCount: 3,
    eraNames: ['INDUSTRIAL_REVOLUTION', 'GREEN_REVOLUTION', 'SILICON_RUSH'],
    shortSummary: 'Scale-up of any technology triggers resource extraction faster than alternatives can be developed, creating scarcity debt paid by future generations.',
    currentPhase: 'SCALING_TENSION',
    breakingMechanism: 'Circular economy, synthetic alternatives, urban mining',
  },
  {
    patternType: 'WASTE_ACCUMULATION',
    cycleCount: 3,
    eraNames: ['INDUSTRIAL_REVOLUTION', 'ATOMIC_AGE', 'SILICON_RUSH'],
    shortSummary: 'Production systems optimize for output without solving waste. Byproducts accumulate until they become an existential problem (CO₂, nuclear waste, e-waste).',
    currentPhase: 'CRISIS_POINT',
    breakingMechanism: 'Cradle-to-cradle design, zero-waste manufacturing, waste-as-resource models',
  },
  {
    patternType: 'SYSTEMIC_INEQUALITY',
    cycleCount: 2,
    eraNames: ['INDUSTRIAL_REVOLUTION', 'SILICON_RUSH'],
    shortSummary: 'Rapid innovation creates exponential productivity gains that are captured disproportionately by capital owners, amplifying wealth gaps before redistribution mechanisms catch up.',
    currentPhase: 'SCALING_TENSION',
    breakingMechanism: 'Progressive taxation, labor movements, universal basic services',
  },
  {
    patternType: 'TECHNOLOGY_MISUSE',
    cycleCount: 2,
    eraNames: ['ATOMIC_AGE', 'SILICON_RUSH'],
    shortSummary: 'Dual-use technologies developed for beneficial purposes are rapidly weaponized or used for surveillance/control before governance frameworks exist.',
    currentPhase: 'EARLY_DISCOVERY',
    breakingMechanism: 'International treaties, open safety research, ethical AI governance',
  },
  {
    patternType: 'ECOLOGICAL_OVERSHOOT',
    cycleCount: 2,
    eraNames: ['GREEN_REVOLUTION', 'DEFORESTATION_AGE'],
    shortSummary: 'Optimization for human productivity systematically ignores ecological carrying capacity until ecosystem feedback (soil loss, flood, extinction) forces correction.',
    currentPhase: 'CRISIS_POINT',
    breakingMechanism: 'Regenerative agriculture, rewilding, ecosystem services economics',
  },
  {
    patternType: 'POSITIVE_REGENERATIVE',
    cycleCount: 1,
    eraNames: ['PROTEIN_FERMENTATION_SUCCESS'],
    shortSummary: 'Low-energy biological pathways achieve complex synthesis with near-zero resource debt and no ecological feedback. The template for abundance-first scaling.',
    currentPhase: 'POSITIVE_TEMPLATE',
    breakingMechanism: 'This is the unbroken pattern — replicate and scale it.',
  },
];

// ─────────────────────────────────────────────────────────────
// SECTION 3: CAUSAL FAILURE CHAIN LIBRARY
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Pre-mapped causal chains extracted from historical failure patterns.
         IC uses these to enrich its own causal chain building — instead of
         constructing from scratch, it extends from known historical chains.
  WHY:   IC's causal chains are built from current evidence. Historical chains
         provide the "what happened next" that current data can't yet show.
         Together they give IC a complete innovation → consequence map.
  HOW:   IC.ingestSignal() calls HistoryReasoner.enrichCausalChain() which
         appends the historical continuation steps to IC's current chain.
  HOW TO CHANGE: Add new CausalFailureChain entries for new domains.
  DEBUG EXAMPLE: If IC chains are too short, verify that
                 enrichCausalChain() is being called after initial IC case open.
*/

export interface CausalFailureChain {
  chainId: string;
  patternType: PatternType;
  eraId: string;
  domain: string;
  steps: string[];                  // ordered cause → effect chain
  pivotPoint: number;               // index of step where correction was (or could be) made
  pivotDescription: string;         // what intervention at pivot would have changed the outcome
}

export const CAUSAL_FAILURE_CHAINS: CausalFailureChain[] = [
  {
    chainId: 'FUSION_MISUSE_CHAIN',
    patternType: 'TECHNOLOGY_MISUSE',
    eraId: 'ATOMIC_AGE',
    domain: 'SCIENCE_FUSION',
    steps: [
      'Scientific breakthrough in high-energy physics',
      'Military interest precedes civilian governance',
      'Rapid state-level weaponization',
      'Deterrence doctrine emerges (mutually assured destruction)',
      'Civilian applications delayed by classification',
      'Long-term proliferation risk becomes structural',
      'Waste problem deferred indefinitely',
    ],
    pivotPoint: 1,
    pivotDescription: 'Open civilian governance frameworks BEFORE military application would have changed the trajectory. ITER model (international civilian-first) is the corrected form.',
  },
  {
    chainId: 'ENERGY_INEQUALITY_CHAIN',
    patternType: 'SYSTEMIC_INEQUALITY',
    eraId: 'INDUSTRIAL_REVOLUTION',
    domain: 'HUMAN_STATE',
    steps: [
      'New energy source dramatically lowers production costs',
      'Early adopters gain disproportionate productivity advantage',
      'Capital concentration accelerates — labor value compressed',
      'Rapid urbanization without infrastructure investment',
      'Political power follows capital concentration',
      'Regulation lags 50+ years behind technology deployment',
      'Wealth gap becomes structurally entrenched before correction',
    ],
    pivotPoint: 2,
    pivotDescription: 'Distributed ownership models (cooperatives, community energy) at scale-up phase prevent capital concentration. Energy-as-commons instead of energy-as-commodity.',
  },
  {
    chainId: 'SILICON_POWER_CHAIN',
    patternType: 'POWER_CONCENTRATION',
    eraId: 'SILICON_RUSH',
    domain: 'SYSTEM_PERFORMANCE',
    steps: [
      'Platform network effects create winner-take-all dynamics',
      'Data asymmetry — platforms know users better than users know themselves',
      'Advertising model monetizes attention → incentivizes engagement over truth',
      'Political influence follows platform scale',
      'Regulatory frameworks designed for broadcast media fail to apply',
      'Antitrust definitions too narrow to address platform monopoly',
      'Power concentration exceeds historical precedents without correction mechanism',
    ],
    pivotPoint: 0,
    pivotDescription: 'Interoperability mandates and data portability at network formation stage prevent lock-in. Open protocol vs closed platform is the fork point.',
  },
  {
    chainId: 'AI_CONCENTRATION_CHAIN',
    patternType: 'POWER_CONCENTRATION',
    eraId: 'SILICON_RUSH',
    domain: 'SCIENCE_PHYSICS',
    steps: [
      'AI capability breakthrough requires massive compute + data',
      'Only well-capitalized entities can afford training infrastructure',
      'Capability gap widens between frontier labs and everyone else',
      'Economic value from AI concentrates at frontier',
      'Labor displacement accelerates before social safety net adapts',
      'Surveillance and prediction capabilities extend power of early holders',
      'Governance frameworks trail capability by 5–10 years',
    ],
    pivotPoint: 0,
    pivotDescription: 'Open weights, distributed training coalitions, and compute access programs at emergence prevent concentration. Safety research must be public domain.',
  },
  {
    chainId: 'RESOURCE_BATTERY_CHAIN',
    patternType: 'RESOURCE_DEPLETION',
    eraId: 'SILICON_RUSH',
    domain: 'SCIENCE_PHYSICS',
    steps: [
      'Green energy transition requires battery storage at scale',
      'Scale-up triggers cobalt/lithium demand spike',
      'Mining expands into conflict zones + water-stressed regions',
      'Supply chain lock-in to scarce geographies',
      'Price volatility undermines energy transition economics',
      'End-of-life recycling infrastructure underfunded',
      'Second scarcity wave hits as first-generation batteries retire',
    ],
    pivotPoint: 1,
    pivotDescription: 'Investing in sodium-ion, LFP, and solid-state alternatives BEFORE cobalt dependency locks in prevents the supply chain trap.',
  },
  {
    chainId: 'FUSION_SUCCESS_CHAIN',
    patternType: 'POSITIVE_REGENERATIVE',
    eraId: 'PROTEIN_FERMENTATION_SUCCESS',
    domain: 'SCIENCE_FUSION',
    steps: [
      'Biological insight reveals low-energy pathway to complex synthesis',
      'Ambient-temperature process eliminates high-heat resource debt',
      'Iterative improvement via selection rather than brute-force energy',
      'Knowledge freely shared — no single-point gatekeeping',
      'Scales without proportional resource increase',
      'Byproducts are benign or nutritive',
      'Centuries of refinement produce no ecological debt',
    ],
    pivotPoint: -1,
    pivotDescription: 'This chain has no failure pivot — it is the template. Precision fermentation scales this pattern using synthetic biology.',
  },
];

// ─────────────────────────────────────────────────────────────
// SECTION 4: HISTORY REASONER — CORE ENGINE (LL366)
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  HistoryReasoner is the bridge node between EC/IC and HistoryRAG.
         It exposes three core methods:
           matchEraPattern()     — Compare signal to historical eras
           calculateRiskFromHistory() — Aggregate risk from all matches
           generateHistoricalWarning() — Human-facing warning string
         Plus extended methods:
           enrichCausalChain()   — IC integration: extend IC chains with history
           detectRepeatCycle()   — Is this a known failure cycle repeating?
           recommendSafePath()   — Which historical success model fits best?
  WHY:   Without this, EC and IC are blind to history even though HistoryRAG
         exists. This is the missing fusion layer.
  HOW:   EC calls matchEraPattern(signal) each tick for high-novelty signals.
         IC calls enrichCausalChain(caseId, chain) when opening a new case.
         CG receives enriched envelopes with historicalRisk field populated.
  HOW TO CHANGE: Adjust matchWeights to shift how dimensions are scored.
                 Add new domain rules to ERA_DOMAIN_MAP.
  DEBUG EXAMPLE: If all signals return NEUTRAL_EXPLORATORY, lower the
                 matchThreshold from 0.40 to 0.30 and check keyword coverage.
*/

// Simplified era type — full era data comes from HISTORY_RAG_INDEX
interface EraRecord {
  eraId: string;
  eraName: string;
  period: string;
  region: string;
  shortGain: string;
  longRuin: string;
  keyLesson: string;
  alternativePathTaken?: string;
  triggerMaterials: string[];
  triggerAbundanceClasses: string[];
  triggerEnergyKwhMin?: number;
  triggerScaleKeywords: string[];
  riskLevel: LegacyRiskLevel;
  patternType: PatternType;
  phase: EraPhase;
  predictedTrajectory: string;
  timeHorizonYears?: number;
}

// Full era definitions with HistoryReasoner-specific fields
const ERA_RECORDS: EraRecord[] = [
  {
    eraId: 'INDUSTRIAL_REVOLUTION',
    eraName: 'The Industrial Revolution',
    period: '1760–1840', region: 'Britain / Western Europe',
    shortGain: 'Mass production, mechanical power, rapid urbanization',
    longRuin: 'Coal dependency, river contamination, early climate loading, extreme wealth polarization',
    keyLesson: 'Scaling a high-energy process without pollution accounting creates generational debt.',
    alternativePathTaken: 'Electrification and clean energy eventually replaced coal — 150 years later.',
    triggerMaterials: ['coal', 'iron', 'steel', 'lead'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerEnergyKwhMin: 500,
    triggerScaleKeywords: ['mass production', 'scaling', 'industrial', 'factory', 'combustion', 'energy inequality', 'wealth gap', 'power concentration'],
    riskLevel: 'HIGH',
    patternType: 'SYSTEMIC_INEQUALITY',
    phase: 'REFORM_CORRECTION',
    predictedTrajectory: 'If pattern holds: rapid scale → wealth concentration → political instability → delayed regulation → eventual correction after crisis.',
    timeHorizonYears: 50,
  },
  {
    eraId: 'GREEN_REVOLUTION',
    eraName: 'The Green Revolution',
    period: '1950–1970', region: 'Global',
    shortGain: 'Tripled crop yields, averted mass famine',
    longRuin: 'Aquifer depletion, topsoil erosion, monoculture fragility, nitrogen runoff',
    keyLesson: 'Optimizing for yield without modeling soil + water feedback creates a productivity illusion that collapses in 3–5 generations.',
    alternativePathTaken: 'Regenerative agriculture and precision fermentation now offer abundance without soil debt.',
    triggerMaterials: ['nitrogen', 'phosphorus', 'potassium', 'groundwater'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerScaleKeywords: ['crop yield', 'fertilizer', 'monoculture', 'food system', 'irrigation', 'soil'],
    riskLevel: 'MODERATE',
    patternType: 'ECOLOGICAL_OVERSHOOT',
    phase: 'REFORM_CORRECTION',
    predictedTrajectory: 'If pattern holds: optimization → monoculture dependency → pest/climate vulnerability → yield collapse in stressed years.',
    timeHorizonYears: 30,
  },
  {
    eraId: 'ATOMIC_AGE',
    eraName: 'The Atomic Age',
    period: '1945–1990', region: 'USA / USSR / Global',
    shortGain: 'Energy potential, geopolitical leverage, medical isotopes',
    longRuin: 'Waste unresolved 10,000+ years, proliferation risk, ecological contamination zones',
    keyLesson: 'Deploying a technology before solving its end-of-life creates indefinite liability. Waste problem must be solved before energy problem.',
    alternativePathTaken: 'Fusion and thorium reactors represent the corrected path — cleaner waste profiles.',
    triggerMaterials: ['uranium', 'plutonium', 'thorium', 'caesium', 'strontium'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerScaleKeywords: ['nuclear', 'fission', 'radioactive', 'reactor', 'enrichment', 'atomic', 'waste storage', 'fusion breakthroughs', 'early stage'],
    riskLevel: 'CRITICAL',
    patternType: 'TECHNOLOGY_MISUSE',
    phase: 'REFORM_CORRECTION',
    predictedTrajectory: 'If misuse pattern holds: breakthrough → state weaponization → proliferation → governance lag → existential risk window.',
    timeHorizonYears: 20,
  },
  {
    eraId: 'SILICON_RUSH',
    eraName: 'The Silicon Rush',
    period: '1990–2020', region: 'Global',
    shortGain: 'Computing revolution, global connectivity, exponential productivity',
    longRuin: 'Rare earth devastation, e-waste crisis, power concentration, surveillance capitalism',
    keyLesson: 'Platform network effects concentrate power faster than governance can respond. Open protocols prevent lock-in.',
    alternativePathTaken: 'Open source, interoperability mandates, urban mining represent corrections.',
    triggerMaterials: ['lithium', 'cobalt', 'neodymium', 'tantalum', 'gallium'],
    triggerAbundanceClasses: ['SCARCE', 'FINITE_CRITICAL'],
    triggerScaleKeywords: ['semiconductor', 'battery', 'rare earth', 'platform', 'artificial intelligence', 'machine learning', 'rapid adoption', 'energy inequality', 'power concentration'],
    riskLevel: 'HIGH',
    patternType: 'POWER_CONCENTRATION',
    phase: 'CRISIS_POINT',
    predictedTrajectory: 'If pattern holds: capability concentration → economic moat → regulatory capture → structural inequality → political instability.',
    timeHorizonYears: 15,
  },
  {
    eraId: 'DEFORESTATION_AGE',
    eraName: 'The Deforestation Age',
    period: '1500–present', region: 'Global',
    shortGain: 'Agricultural land, timber, revenue',
    longRuin: 'Carbon sink loss, biodiversity collapse, rainfall disruption',
    keyLesson: 'Converting complex living systems into monocultures destroys irreplaceable biological infrastructure.',
    alternativePathTaken: 'Vertical farming, mycelium composites, lab-grown timber.',
    triggerMaterials: ['timber', 'palm oil', 'soy', 'cattle'],
    triggerAbundanceClasses: ['FINITE_CRITICAL', 'SCARCE'],
    triggerScaleKeywords: ['forest', 'timber', 'land clearing', 'biome', 'deforestation', 'carbon sink', 'biodiversity'],
    riskLevel: 'CRITICAL',
    patternType: 'ECOLOGICAL_OVERSHOOT',
    phase: 'CRISIS_POINT',
    predictedTrajectory: 'If pattern holds: continued clearing → tipping point cascade → rainfall pattern collapse → agricultural system failure.',
    timeHorizonYears: 25,
  },
  {
    eraId: 'PROTEIN_FERMENTATION_SUCCESS',
    eraName: '18th-Century Fermentation Science',
    period: '1650–1850', region: 'Europe / Asia',
    shortGain: 'Low-energy synthesis, medicine precursors, material fabrication',
    longRuin: 'None — positive historical parallel',
    keyLesson: 'Enzymatic and fermentation pathways achieve complex synthesis at ambient temperature with near-zero resource debt. This is the correct scaling model.',
    alternativePathTaken: 'Precision fermentation scales this using synthetic biology.',
    triggerMaterials: ['proteins', 'enzymes', 'biomass', 'yeast'],
    triggerAbundanceClasses: ['RENEWABLE', 'SYNTHESIZABLE', 'INFINITE'],
    triggerScaleKeywords: ['fermentation', 'enzymatic', 'protein folding', 'bio-reactor', 'biological catalyst', 'low-energy synthesis'],
    riskLevel: 'NONE',
    patternType: 'POSITIVE_REGENERATIVE',
    phase: 'POSITIVE_TEMPLATE',
    predictedTrajectory: 'Positive: scales without resource debt, byproducts benign, knowledge compounds freely.',
    timeHorizonYears: undefined,
  },
  {
    eraId: 'FUSION_HORIZON',
    eraName: 'The Fusion Horizon',
    period: '2010–present', region: 'Global',
    shortGain: 'Clean energy potential, hydrogen isotope fuel',
    longRuin: 'Tritium supply constraints, neutron activation, plasma material erosion — unsolved at scale',
    keyLesson: 'Fusion is genuinely abundant-path energy but material science and tritium breeding must be solved before scaling. Rushing repeats Atomic Age mistakes.',
    alternativePathTaken: 'Inertial confinement + spherical tokamaks + HTS superconductors.',
    triggerMaterials: ['deuterium', 'tritium', 'lithium-6', 'beryllium', 'tungsten'],
    triggerAbundanceClasses: ['SCARCE', 'RENEWABLE'],
    triggerScaleKeywords: ['fusion', 'plasma', 'tokamak', 'tritium', 'deuterium', 'ITER', 'NIF', 'fusion breakthroughs', 'high power'],
    riskLevel: 'MODERATE',
    patternType: 'TECHNOLOGY_MISUSE',
    phase: 'EARLY_DISCOVERY',
    predictedTrajectory: 'Moderate risk: material science gaps + governance vacuum could repeat Atomic Age phase 2 if not addressed early.',
    timeHorizonYears: 30,
  },
];

// Match weights — how each dimension contributes to overall matchScore
const MATCH_WEIGHTS = {
  DOMAIN: 0.20,
  MATERIAL: 0.25,
  KEYWORD: 0.30,
  SCALE: 0.10,
  ENERGY: 0.10,
  INEQUALITY: 0.05,
};

export class HistoryReasoner {
  /*
    LL366 — HISTORY_REASONER
    "A system that remembers humanity better than humans do."

    Wire:
      EC → HistoryReasoner.matchEraPattern() → enriched envelope → CG
      IC → HistoryReasoner.enrichCausalChain() → enriched case → CG
  */
  private eras: EraRecord[] = ERA_RECORDS;
  private failureCycles: RepeatFailureCycle[] = KNOWN_FAILURE_CYCLES;
  private causalChains: CausalFailureChain[] = CAUSAL_FAILURE_CHAINS;
  private matchThreshold: number = 0.40;

  // ── Core Method 1: matchEraPattern ────────────────────────
  /*
    WHAT:  Compares a current signal (title + domain + keywords + materials)
           against all historical eras and returns ranked HistoricalMatch[].
    WHY:   This is the primary question: "Have we seen something like this
           before in human history?"
    HOW:   Domain routing first → keyword scan → material overlap → score.
           Returns all matches above matchThreshold, sorted by score.
    HOW TO CHANGE: Adjust matchThreshold (0.40) to catch more/fewer patterns.
    DEBUG EXAMPLE: Pass a signal title like "fusion breakthrough trending" —
                   should match FUSION_HORIZON + ATOMIC_AGE.
  */
  matchEraPattern(signal: {
    domain: CuriosityDomain;
    title: string;
    summary: string;
    materials?: string[];
    energyCostKwh?: number;
  }): HistoricalMatch[] {
    const matches: HistoricalMatch[] = [];
    const domainEras = ERA_DOMAIN_MAP[signal.domain] ?? [];
    const titleLower = (signal.title + ' ' + signal.summary).toLowerCase();

    // Keyword routing — find additional candidate eras
    const keywordEras: string[] = [];
    for (const [kw, eraIds] of Object.entries(KEYWORD_ERA_MAP)) {
      if (titleLower.includes(kw.toLowerCase())) {
        keywordEras.push(...eraIds);
      }
    }

    // Candidate era set: domain + keyword + full scan fallback
    const candidateEraIds = new Set([...domainEras, ...keywordEras]);
    // Always scan all eras if no domain/keyword match found
    const candidateEras = candidateEraIds.size > 0
      ? this.eras.filter(e => candidateEraIds.has(e.eraId))
      : this.eras;

    for (const era of candidateEras) {
      const dimensions: MatchDimension[] = [];
      let totalScore = 0;

      // Dimension 1: Domain match
      if (domainEras.includes(era.eraId)) {
        const contrib = MATCH_WEIGHTS.DOMAIN;
        dimensions.push({ axis: 'DOMAIN', contribution: contrib, evidence: `Domain ${signal.domain} maps to ${era.eraId}` });
        totalScore += contrib;
      }

      // Dimension 2: Material match
      if (signal.materials && signal.materials.length > 0) {
        const matMatches = era.triggerMaterials.filter(tm =>
          signal.materials!.some(sm => sm.toLowerCase().includes(tm.toLowerCase()))
        );
        if (matMatches.length > 0) {
          const contrib = MATCH_WEIGHTS.MATERIAL * (matMatches.length / era.triggerMaterials.length);
          dimensions.push({ axis: 'MATERIAL', contribution: contrib, evidence: `Materials matched: ${matMatches.join(', ')}` });
          totalScore += contrib;
        }
      }

      // Dimension 3: Keyword match
      const kwMatches = era.triggerScaleKeywords.filter(kw =>
        titleLower.includes(kw.toLowerCase())
      );
      if (kwMatches.length > 0) {
        const contrib = MATCH_WEIGHTS.KEYWORD * Math.min(1, kwMatches.length / 3);
        dimensions.push({ axis: 'KEYWORD', contribution: contrib, evidence: `Keywords matched: ${kwMatches.join(', ')}` });
        totalScore += contrib;
      }

      // Dimension 4: Energy cost
      if (era.triggerEnergyKwhMin && signal.energyCostKwh && signal.energyCostKwh >= era.triggerEnergyKwhMin) {
        dimensions.push({ axis: 'ENERGY', contribution: MATCH_WEIGHTS.ENERGY, evidence: `Energy cost ${signal.energyCostKwh}kWh ≥ era threshold ${era.triggerEnergyKwhMin}kWh` });
        totalScore += MATCH_WEIGHTS.ENERGY;
      }

      // Dimension 5: Inequality signal keywords
      const inequalityKws = ['wealth gap', 'inequality', 'concentration', 'unequal', 'disparity', 'power'];
      const ineqMatches = inequalityKws.filter(kw => titleLower.includes(kw));
      if (ineqMatches.length > 0 && ['SYSTEMIC_INEQUALITY', 'POWER_CONCENTRATION'].includes(era.patternType)) {
        dimensions.push({ axis: 'INEQUALITY', contribution: MATCH_WEIGHTS.INEQUALITY, evidence: `Inequality signal: ${ineqMatches.join(', ')}` });
        totalScore += MATCH_WEIGHTS.INEQUALITY;
      }

      // Threshold check
      if (totalScore < this.matchThreshold) continue;

      // Determine confidence
      const confidence: HistoricalMatch['confidence'] =
        totalScore >= 0.80 ? 'CERTAIN' :
        totalScore >= 0.60 ? 'HIGH' :
        totalScore >= 0.40 ? 'MEDIUM' : 'LOW';

      matches.push({
        matchId: `HM_${era.eraId}_${Date.now()}`,
        eraId: era.eraId,
        eraName: era.eraName,
        period: era.period,
        region: era.region,
        matchScore: Math.min(1.0, totalScore),
        matchDimensions: dimensions,
        confidence,
        patternType: era.patternType,
        shortGain: era.shortGain,
        longRuin: era.longRuin,
        keyLesson: era.keyLesson,
        riskLevel: era.riskLevel,
        phase: era.phase,
        predictedTrajectory: era.predictedTrajectory,
        timeHorizonYears: era.timeHorizonYears,
        historicalPrecedent: `${era.eraName} (${era.period}, ${era.region})`,
        safePathAvailable: !!era.alternativePathTaken,
        safePath: era.alternativePathTaken,
        safePathEraId: era.riskLevel === 'NONE' ? era.eraId : 'PROTEIN_FERMENTATION_SUCCESS',
      });
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  // ── Core Method 2: calculateRiskFromHistory ───────────────
  /*
    WHAT:  Aggregates risk across all HistoricalMatch[] into one RiskScore.
           Detects repeat failure cycles. Identifies trajectory direction.
    WHY:   Multiple partial matches may each be low-risk individually, but
           together indicate a high-risk composite pattern.
    HOW:   Each match contributes its riskLevel × matchScore to each
           risk dimension. Composite scores determine overall verdict.
    HOW TO CHANGE: Adjust RISK_NUMERIC to change level thresholds.
    DEBUG EXAMPLE: Two matches — one HIGH at 0.6, one MODERATE at 0.5 —
                   should produce overallRisk HIGH with numericScore ~0.55.
  */
  calculateRiskFromHistory(matches: HistoricalMatch[]): RiskScore {
    if (matches.length === 0) {
      return {
        overallRisk: 'NONE', numericScore: 0,
        technologyMisuseRisk: 0, inequalityRisk: 0, resourceDepletionRisk: 0,
        ecologicalRisk: 0, powerConcentrationRisk: 0,
        dominantPattern: 'NEUTRAL_EXPLORATORY', dominantEraName: '',
        trajectoryDirection: 'STABLE', repeatFailureCycle: false, repeatCycleCount: 0,
        mitigationAvailable: false, mitigationStrength: 'WEAK', positiveEraMatches: [],
      };
    }

    const RISK_NUMERIC: Record<LegacyRiskLevel, number> = {
      NONE: 0, LOW: 0.2, MODERATE: 0.45, HIGH: 0.70, CRITICAL: 1.0,
    };

    // Separate positive from negative matches
    const positive = matches.filter(m => m.riskLevel === 'NONE');
    const negative = matches.filter(m => m.riskLevel !== 'NONE');

    // Compute per-dimension risk
    const dimensionScores = {
      TECHNOLOGY_MISUSE: 0, SYSTEMIC_INEQUALITY: 0, RESOURCE_DEPLETION: 0,
      ECOLOGICAL_OVERSHOOT: 0, POWER_CONCENTRATION: 0,
    };
    let totalRiskScore = 0;
    const patternCounts: Map<PatternType, number> = new Map();

    for (const m of negative) {
      const riskContrib = RISK_NUMERIC[m.riskLevel] * m.matchScore;
      totalRiskScore = Math.max(totalRiskScore, riskContrib);

      if (dimensionScores[m.patternType as keyof typeof dimensionScores] !== undefined) {
        dimensionScores[m.patternType as keyof typeof dimensionScores] += riskContrib;
      }

      patternCounts.set(m.patternType, (patternCounts.get(m.patternType) ?? 0) + 1);
    }

    // Additional risk compounding for multiple matches
    if (negative.length > 1) {
      totalRiskScore = Math.min(1.0, totalRiskScore + (negative.length - 1) * 0.05);
    }

    // Dominant pattern
    let dominantPattern: PatternType = 'NEUTRAL_EXPLORATORY';
    let dominantCount = 0;
    for (const [pt, count] of patternCounts.entries()) {
      if (count > dominantCount) { dominantPattern = pt; dominantCount = count; }
    }
    const dominantMatch = negative.find(m => m.patternType === dominantPattern);

    // Detect repeat failure cycles
    const repeatCycle = this.failureCycles.find(fc => fc.patternType === dominantPattern);
    const repeatFailureCycle = !!(repeatCycle && negative.length >= 2);

    // Trajectory direction
    const hasCritical = negative.some(m => m.riskLevel === 'CRITICAL');
    const hasHigh = negative.some(m => m.riskLevel === 'HIGH');
    const hasPositive = positive.length > 0;
    const trajectoryDirection: RiskScore['trajectoryDirection'] =
      hasCritical ? 'CRITICAL_ACCELERATION' :
      hasHigh && !hasPositive ? 'WORSENING' :
      hasHigh && hasPositive ? 'STABLE' :
      'IMPROVING';

    // Overall risk level
    const overallRisk: LegacyRiskLevel =
      totalRiskScore >= 0.75 ? 'CRITICAL' :
      totalRiskScore >= 0.55 ? 'HIGH' :
      totalRiskScore >= 0.30 ? 'MODERATE' :
      totalRiskScore > 0 ? 'LOW' : 'NONE';

    // Mitigation
    const strongMitigation = negative.some(m => m.safePathAvailable && m.safePath);
    const mitigationStrength: RiskScore['mitigationStrength'] =
      positive.length >= 1 ? 'STRONG' : strongMitigation ? 'MODERATE' : 'WEAK';

    return {
      overallRisk,
      numericScore: Math.min(1.0, totalRiskScore),
      technologyMisuseRisk: Math.min(1.0, dimensionScores.TECHNOLOGY_MISUSE),
      inequalityRisk: Math.min(1.0, dimensionScores.SYSTEMIC_INEQUALITY),
      resourceDepletionRisk: Math.min(1.0, dimensionScores.RESOURCE_DEPLETION),
      ecologicalRisk: Math.min(1.0, dimensionScores.ECOLOGICAL_OVERSHOOT),
      powerConcentrationRisk: Math.min(1.0, dimensionScores.POWER_CONCENTRATION),
      dominantPattern,
      dominantEraName: dominantMatch?.eraName ?? '',
      trajectoryDirection,
      repeatFailureCycle,
      repeatCycleCount: repeatCycle?.cycleCount ?? 0,
      repeatCycleNote: repeatCycle?.shortSummary,
      mitigationAvailable: positive.length > 0 || strongMitigation,
      mitigationStrength,
      positiveEraMatches: positive.map(p => p.eraName),
    };
  }

  // ── Core Method 3: generateHistoricalWarning ──────────────
  /*
    WHAT:  Produces the human-facing HistoricalWarning from matches + risk.
           This is what surfaces in Lucy's Steward Vibe chat output.
    WHY:   Raw match data is not human-readable. The warning bridges
           the gap between internal reasoning and actionable communication.
    HOW:   Warning level and template are chosen from riskScore.overallRisk.
           Positive matches produce a different (encouraging) tone.
    HOW TO CHANGE: Edit WARNING_TEMPLATES to adjust Lucy's voice.
    DEBUG EXAMPLE: A CRITICAL risk should produce HALT_AND_REVIEW verdict
                   and name the specific era in historicalAnchor.
  */
  generateHistoricalWarning(
    matches: HistoricalMatch[],
    risk: RiskScore,
    signalTitle: string
  ): HistoricalWarning {
    const warningId = `HW_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const timestamp = Date.now();

    // Find top negative and positive matches
    const topNegative = matches.filter(m => m.riskLevel !== 'NONE')[0];
    const topPositive = matches.filter(m => m.riskLevel === 'NONE')[0];

    // Positive resonance (lead with hope when available)
    const positiveResonance = topPositive
      ? `✅ Positive parallel: "${topPositive.eraName}" (${topPositive.period}) — ${topPositive.keyLesson}`
      : undefined;

    // Historical anchor
    const historicalAnchor = topNegative
      ? `This resembles "${topNegative.eraName}" (${topNegative.period}) early phase → ${topNegative.phase.replace(/_/g, ' ').toLowerCase()}`
      : 'No significant negative historical pattern detected.';

    // Causal chain from library
    const relevantChain = this.causalChains.find(
      c => c.eraId === topNegative?.eraId || c.patternType === risk.dominantPattern
    );
    const causalChain = relevantChain?.steps ?? (topNegative
      ? [`${signalTitle} → rapid adoption → ${topNegative.predictedTrajectory}`]
      : []);

    // Headline
    const headline = this.buildHeadline(risk, topNegative, topPositive, signalTitle);

    // Body
    const body = this.buildBody(risk, topNegative, topPositive, relevantChain ?? null);

    // Safe alternative
    const safeAlternative = topNegative?.safePath
      ?? topPositive?.keyLesson
      ?? risk.positiveEraMatches.length > 0
        ? `Draw from "${risk.positiveEraMatches[0]}" pattern for a regenerative path.`
        : undefined;

    // Recommended action
    const recommendedAction: HistoricalWarning['recommendedAction'] =
      risk.overallRisk === 'CRITICAL' ? 'HALT_AND_REVIEW' :
      risk.overallRisk === 'HIGH' ? 'REROUTE' :
      risk.overallRisk === 'MODERATE' ? 'PROCEED_WITH_CAUTION' : 'PROCEED';

    return {
      warningId, level: risk.overallRisk, headline, body,
      historicalAnchor, causalChain, safeAlternative,
      positiveResonance, recommendedAction, timestamp,
    };
  }

  // ── Extended Method: enrichCausalChain (IC integration) ───
  /*
    WHAT:  When IC opens a case, HistoryReasoner extends its causal chain
           with the historical continuation steps from CAUSAL_FAILURE_CHAINS.
    WHY:   IC's chains are built from current evidence. Historical chains
           provide the "what happened next" that current data can't yet show.
    HOW:   Find the best matching failure chain for the case domain + title.
           Append historical steps after IC's current chain endpoint.
           Mark the pivot point where intervention changes the outcome.
    HOW TO CHANGE: Add new CausalFailureChain entries to CAUSAL_FAILURE_CHAINS.
    DEBUG EXAMPLE: An IC case about "energy inequality" should get the
                   ENERGY_INEQUALITY_CHAIN steps appended.
  */
  enrichCausalChain(
    currentChain: string[],
    signalTitle: string,
    domain: CuriosityDomain
  ): {
    enrichedChain: string[];
    pivotPoint: number;
    pivotDescription: string;
    chainSourceEra: string;
  } {
    const titleLower = signalTitle.toLowerCase();

    // Find best matching causal chain
    let bestChain: CausalFailureChain | null = null;
    let bestScore = 0;

    for (const chain of this.causalChains) {
      let score = 0;
      const chainEra = ERA_RECORDS.find(e => e.eraId === chain.eraId);

      // Domain match
      if (chain.domain === domain || (chainEra && ERA_DOMAIN_MAP[domain]?.includes(chain.eraId))) {
        score += 0.4;
      }

      // Keyword match against chain steps
      const chainText = chain.steps.join(' ').toLowerCase();
      const kwMatches = Object.keys(KEYWORD_ERA_MAP).filter(kw =>
        titleLower.includes(kw) && chainText.includes(kw)
      ).length;
      if (kwMatches > 0) score += kwMatches * 0.15;

      // Pattern type match from era records
      if (chainEra) {
        const keywordMatches = chainEra.triggerScaleKeywords.filter(kw =>
          titleLower.includes(kw.toLowerCase())
        ).length;
        score += keywordMatches * 0.10;
      }

      if (score > bestScore) { bestScore = score; bestChain = chain; }
    }

    if (!bestChain || bestScore < 0.20) {
      return {
        enrichedChain: currentChain,
        pivotPoint: -1,
        pivotDescription: 'No matching historical chain found.',
        chainSourceEra: 'NONE',
      };
    }

    // Merge: current chain + historical continuation (avoid duplicates)
    const historicalContinuation = bestChain.steps.filter(step =>
      !currentChain.some(cs => cs.toLowerCase().includes(step.toLowerCase().slice(0, 20)))
    );

    const enrichedChain = [
      ...currentChain,
      `[Historical Pattern: ${bestChain.eraId}]`,
      ...historicalContinuation,
    ];

    return {
      enrichedChain,
      pivotPoint: currentChain.length + bestChain.pivotPoint + 1,
      pivotDescription: bestChain.pivotDescription,
      chainSourceEra: bestChain.eraId,
    };
  }

  // ── Extended Method: detectRepeatCycle ────────────────────
  /*
    WHAT:  Checks if the current signal's pattern has failed repeatedly
           across multiple historical eras — the most dangerous signals.
    WHY:   Single-era matches are warnings. Cross-era repeat failures are
           evidence of structural human cognitive patterns — harder to correct.
    HOW:   Find all matches sharing the same PatternType. If ≥2 eras share
           the pattern AND it's in KNOWN_FAILURE_CYCLES, flag it.
    DEBUG EXAMPLE: POWER_CONCENTRATION across INDUSTRIAL_REVOLUTION + SILICON_RUSH
                   should return repeatCycleCount: 3 with breakingMechanism.
  */
  detectRepeatCycle(matches: HistoricalMatch[]): RepeatFailureCycle | null {
    const patternGroups = new Map<PatternType, HistoricalMatch[]>();
    for (const m of matches) {
      if (!patternGroups.has(m.patternType)) patternGroups.set(m.patternType, []);
      patternGroups.get(m.patternType)!.push(m);
    }

    for (const [pattern, group] of patternGroups.entries()) {
      if (group.length >= 2) {
        const knownCycle = this.failureCycles.find(fc => fc.patternType === pattern);
        if (knownCycle) return knownCycle;
      }
    }
    return null;
  }

  // ── Extended Method: recommendSafePath ────────────────────
  /*
    WHAT:  Given a set of matches, finds the best historical success model
           to recommend as the corrected path.
    WHY:   Warning without alternative is incomplete. HistoryReasoner should
           always answer: "here's what worked instead."
    HOW:   Prefer positive matches (NONE risk) first. Fall back to
           alternativePathTaken fields from negative matches.
    DEBUG EXAMPLE: For a fusion signal, should return PROTEIN_FERMENTATION_SUCCESS
                   as the enzymatic abundance template, plus FUSION_HORIZON's
                   corrected material science path.
  */
  recommendSafePath(matches: HistoricalMatch[], riskScore: RiskScore): {
    recommendation: string;
    sourceEra: string;
    confidence: string;
  } {
    // Prefer positive era template
    const positiveMatch = matches.find(m => m.riskLevel === 'NONE');
    if (positiveMatch) {
      return {
        recommendation: positiveMatch.safePath ?? positiveMatch.keyLesson,
        sourceEra: positiveMatch.eraName,
        confidence: 'HIGH',
      };
    }

    // Use corrected path from highest-match negative
    const topNegative = matches.filter(m => m.riskLevel !== 'NONE')[0];
    if (topNegative?.safePath) {
      return {
        recommendation: topNegative.safePath,
        sourceEra: topNegative.eraName,
        confidence: 'MEDIUM',
      };
    }

    // Find from known failure cycles
    const cycle = this.failureCycles.find(fc => fc.patternType === riskScore.dominantPattern);
    if (cycle?.breakingMechanism) {
      return {
        recommendation: cycle.breakingMechanism,
        sourceEra: cycle.eraNames.join(' + '),
        confidence: 'MEDIUM',
      };
    }

    return {
      recommendation: 'No direct historical safe path found — proceed with extreme caution.',
      sourceEra: 'NONE',
      confidence: 'LOW',
    };
  }

  // ── Private helpers ───────────────────────────────────────
  private buildHeadline(
    risk: RiskScore,
    top: HistoricalMatch | undefined,
    positive: HistoricalMatch | undefined,
    signal: string
  ): string {
    if (positive && risk.overallRisk === 'NONE') {
      return `"${signal}" aligns with a historically successful pattern — ${positive.eraName}.`;
    }
    if (risk.overallRisk === 'CRITICAL') {
      return `⛔ Critical historical parallel detected for "${signal}" — ${top?.eraName ?? 'multiple eras'} pattern.`;
    }
    if (risk.repeatFailureCycle) {
      return `⚠ Repeat failure cycle detected in "${signal}" — this pattern has failed ${risk.repeatCycleCount} times in history.`;
    }
    if (risk.overallRisk === 'HIGH') {
      return `⚠ Strong historical parallel for "${signal}" — resembles ${top?.eraName ?? ''} trajectory.`;
    }
    if (risk.overallRisk === 'MODERATE') {
      return `⚡ Moderate historical parallel for "${signal}" — monitor for ${top?.eraName ?? 'known'} pattern escalation.`;
    }
    return `"${signal}" — no significant negative historical pattern. ${positive ? 'Positive resonance with ' + positive.eraName + '.' : ''}`;
  }

  private buildBody(
    risk: RiskScore,
    top: HistoricalMatch | undefined,
    positive: HistoricalMatch | undefined,
    chain: CausalFailureChain | null
  ): string {
    const parts: string[] = [];

    if (top) {
      parts.push(`**Pattern:** ${top.patternType.replace(/_/g, ' ')} — ${top.keyLesson}`);
      parts.push(`**Historical trajectory if pattern holds:** ${top.predictedTrajectory}`);
      if (top.timeHorizonYears) {
        parts.push(`**Time horizon:** Historically, this pattern manifests consequences within ${top.timeHorizonYears} years.`);
      }
    }

    if (risk.repeatFailureCycle) {
      parts.push(`**Repeat failure cycle:** ${risk.repeatCycleNote}`);
    }

    if (chain?.pivotPoint !== undefined && chain.pivotPoint >= 0) {
      parts.push(`**Intervention point:** Step ${chain.pivotPoint + 1}: "${chain.steps[chain.pivotPoint]}" — ${chain.pivotDescription}`);
    }

    if (positive) {
      parts.push(`**Positive parallel:** "${positive.eraName}" demonstrates this can be done without ruin. ${positive.keyLesson}`);
    }

    return parts.join('\n');
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: EC × HISTORY REASONER INTEGRATION
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  ECHistoryBridge wires ExploratoryCoriosityEngine's signal output
         directly into HistoryReasoner on every tick for high-novelty signals.
         The enriched result is a new field: signal.historicalContext.
  WHY:   EC currently asks "what is interesting?" HistoryReasoner adds:
         "have we seen something like this before — and how did it end?"
  HOW:   ECHistoryBridge.process(ecSignals) runs matchEraPattern() on
         each signal above a noveltyThreshold, attaches the warning,
         and returns enriched envelopes for CG.
  HOW TO CHANGE: Adjust historyEnrichmentThreshold (default 0.4 novelty)
                 to control how many EC signals get historical analysis.
  DEBUG EXAMPLE: A signal titled "fusion breakthroughs trending" with
                 noveltyScore 0.8 should get FUSION_HORIZON + ATOMIC_AGE matches.
*/

export interface ECEnrichedSignal {
  originalSignal: {
    signalId: string;
    domain: CuriosityDomain;
    title: string;
    summary: string;
    noveltyScore: number;
    humanImpactScore: number;
    compositeScore: number;
  };
  historicalMatches: HistoricalMatch[];
  historicalRisk: RiskScore;
  historicalWarning: HistoricalWarning | null;
  repeatCycle: RepeatFailureCycle | null;
  safePath: { recommendation: string; sourceEra: string; confidence: string } | null;
  enrichedAt: number;
}

export class ECHistoryBridge {
  /*
    Wire: EC → ECHistoryBridge → CG
    "EC asks: what is interesting? HistoryReasoner asks: have we been here before?"
  */
  private reasoner: HistoryReasoner;
  private historyEnrichmentThreshold: number = 0.40; // min noveltyScore to trigger enrichment

  constructor(reasoner: HistoryReasoner) {
    this.reasoner = reasoner;
  }

  process(
    ecSignals: Array<{
      signalId: string;
      domain: CuriosityDomain;
      title: string;
      summary: string;
      noveltyScore: number;
      humanImpactScore: number;
      compositeScore: number;
      materials?: string[];
      energyCostKwh?: number;
    }>
  ): ECEnrichedSignal[] {
    const enriched: ECEnrichedSignal[] = [];

    for (const signal of ecSignals) {
      // Only enrich signals above threshold — avoids noise processing
      if (signal.noveltyScore < this.historyEnrichmentThreshold) {
        continue;
      }

      const matches = this.reasoner.matchEraPattern({
        domain: signal.domain,
        title: signal.title,
        summary: signal.summary,
        materials: signal.materials,
        energyCostKwh: signal.energyCostKwh,
      });

      if (matches.length === 0) continue;

      const risk = this.reasoner.calculateRiskFromHistory(matches);
      const warning = risk.overallRisk !== 'NONE'
        ? this.reasoner.generateHistoricalWarning(matches, risk, signal.title)
        : null;
      const repeatCycle = this.reasoner.detectRepeatCycle(matches);
      const safePath = matches.length > 0
        ? this.reasoner.recommendSafePath(matches, risk)
        : null;

      enriched.push({
        originalSignal: signal,
        historicalMatches: matches,
        historicalRisk: risk,
        historicalWarning: warning,
        repeatCycle,
        safePath,
        enrichedAt: Date.now(),
      });
    }

    return enriched;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: IC × HISTORY REASONER INTEGRATION
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  ICHistoryBridge wires InvestigativeCuriosityEngine's case opening
         into HistoryReasoner to enrich causal chains with historical
         failure patterns and build "innovation → consequence" maps.
  WHY:   IC asks: "what went wrong last time, and can we prevent it?"
         Without this bridge, IC builds chains from current evidence only.
         With it, IC gets the historical continuation — what happened next
         in every era that started with this same pattern.
  HOW:   ICHistoryBridge.enrichCase() runs matchEraPattern() + enrichCausalChain()
         when a new IC case is opened. Returns an ICEnrichedCase with the
         full historical causal map attached.
  HOW TO CHANGE: Adjust caseEnrichmentMinImpact (default 0.3) to control
                 which IC cases get full historical analysis.
  DEBUG EXAMPLE: An IC case on "energy inequality" should get
                 ENERGY_INEQUALITY_CHAIN steps appended with pivotPoint at
                 step 2: "distributed ownership models."
*/

export interface ICEnrichedCase {
  caseId: string;
  originalHypothesis: string;
  enrichedCausalChain: string[];
  pivotPoint: number;
  pivotDescription: string;
  chainSourceEra: string;
  historicalMatches: HistoricalMatch[];
  historicalRisk: RiskScore;
  historicalWarning: HistoricalWarning | null;
  repeatCycle: RepeatFailureCycle | null;
  safePath: { recommendation: string; sourceEra: string; confidence: string } | null;
  investigationQuestions: string[];  // what IC should now look for given history
  enrichedAt: number;
}

export class ICHistoryBridge {
  /*
    Wire: IC → ICHistoryBridge → CG
    "IC asks: what went wrong last time, and can we prevent it?"
  */
  private reasoner: HistoryReasoner;
  private caseEnrichmentMinImpact: number = 0.30; // min humanImpactScore to trigger enrichment

  constructor(reasoner: HistoryReasoner) {
    this.reasoner = reasoner;
  }

  enrichCase(icCase: {
    caseId: string;
    title: string;
    domain: CuriosityDomain;
    hypothesis: string;
    causalChain: string[];
    humanImpactScore: number;
    materials?: string[];
  }): ICEnrichedCase | null {
    if (icCase.humanImpactScore < this.caseEnrichmentMinImpact) return null;

    // Match eras
    const matches = this.reasoner.matchEraPattern({
      domain: icCase.domain,
      title: icCase.title,
      summary: icCase.hypothesis,
      materials: icCase.materials,
    });

    // Enrich causal chain
    const chainEnrichment = this.reasoner.enrichCausalChain(
      icCase.causalChain,
      icCase.title,
      icCase.domain
    );

    const risk = this.reasoner.calculateRiskFromHistory(matches);
    const warning = risk.overallRisk !== 'NONE'
      ? this.reasoner.generateHistoricalWarning(matches, risk, icCase.title)
      : null;
    const repeatCycle = this.reasoner.detectRepeatCycle(matches);
    const safePath = matches.length > 0
      ? this.reasoner.recommendSafePath(matches, risk)
      : null;

    // Generate investigation questions based on historical patterns
    const investigationQuestions = this.generateInvestigationQuestions(matches, risk, icCase.domain);

    return {
      caseId: icCase.caseId,
      originalHypothesis: icCase.hypothesis,
      enrichedCausalChain: chainEnrichment.enrichedChain,
      pivotPoint: chainEnrichment.pivotPoint,
      pivotDescription: chainEnrichment.pivotDescription,
      chainSourceEra: chainEnrichment.chainSourceEra,
      historicalMatches: matches,
      historicalRisk: risk,
      historicalWarning: warning,
      repeatCycle,
      safePath,
      investigationQuestions,
      enrichedAt: Date.now(),
    };
  }

  private generateInvestigationQuestions(
    matches: HistoricalMatch[],
    risk: RiskScore,
    domain: CuriosityDomain
  ): string[] {
    const questions: string[] = [];

    if (risk.powerConcentrationRisk > 0.4) {
      questions.push('Who currently controls the primary infrastructure for this technology?');
      questions.push('Are there structural barriers to distributed access?');
    }
    if (risk.inequalityRisk > 0.4) {
      questions.push('How are the benefits of this development distributed across income levels?');
      questions.push('What historical precedent exists for redistribution mechanisms in similar transitions?');
    }
    if (risk.technologyMisuseRisk > 0.4) {
      questions.push('What dual-use potential exists in this capability?');
      questions.push('Is there an existing governance framework, or is there a vacuum?');
    }
    if (risk.resourceDepletionRisk > 0.4) {
      questions.push('What is the end-of-life recovery plan for materials involved?');
      questions.push('What is the substitution timeline for scarce inputs?');
    }
    if (risk.repeatFailureCycle) {
      questions.push(`This matches a repeat failure cycle (${risk.repeatCycleCount} precedents). What is different this time that could break the cycle?`);
    }
    for (const match of matches.filter(m => m.riskLevel === 'NONE')) {
      questions.push(`The "${match.eraName}" pattern succeeded here. What specific elements of that model can be transferred?`);
    }

    return questions;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 7: HISTORY REASONER → CG INTEGRATION
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  HistoricalRiskEnvelope wraps ECEnrichedSignal or ICEnrichedCase
         into a format CG can natively consume. CG's priority formula
         gets a 4th input: historical risk weight.
  WHY:   CG currently decides based on: novelty, relevance, humanImpact,
         urgency. Without historicalRisk, CG is blind to whether humanity
         has already messed this up before. This adds that 4th dimension.
  HOW:   The HistoricalRiskModifier is computed from RiskScore and added
         to the CG priority calculation as an amplifier (risk escalates
         priority) or dampener (no history = reduce urgency slightly).
  HOW TO CHANGE: Adjust modifier weights below. High historical risk
                 should increase priority so CG routes to THINK_LOOP
                 even if novelty is low.
  DEBUG EXAMPLE: A CRITICAL historical risk signal should have
                 historicalRiskModifier: 0.25 added to CG priority,
                 potentially pushing it above ACTION_CORE threshold.
*/

export interface HistoricalRiskModifier {
  addedPriority: number;              // positive = escalate, negative = dampen
  overrideToThinkLoop: boolean;       // force THINK_LOOP routing regardless of other scores
  blockToSuppression: boolean;        // force SUPPRESS for CRITICAL with no safe path
  warningAttached: boolean;
  warningLevel: LegacyRiskLevel;
  repeatCycleFlag: boolean;
}

export function computeHistoricalRiskModifier(risk: RiskScore): HistoricalRiskModifier {
  const MODIFIER_MAP: Record<LegacyRiskLevel, number> = {
    NONE: -0.02,    // slight dampener — no history risk, lower urgency
    LOW: 0.03,
    MODERATE: 0.10,
    HIGH: 0.18,
    CRITICAL: 0.28,
  };

  return {
    addedPriority: MODIFIER_MAP[risk.overallRisk],
    overrideToThinkLoop: risk.overallRisk === 'HIGH' || risk.overallRisk === 'CRITICAL',
    blockToSuppression: risk.overallRisk === 'CRITICAL' && !risk.mitigationAvailable,
    warningAttached: risk.overallRisk !== 'NONE',
    warningLevel: risk.overallRisk,
    repeatCycleFlag: risk.repeatFailureCycle,
  };
}

// ─────────────────────────────────────────────────────────────
// SECTION 8: NODE REGISTRY — LL366–LL370
// ─────────────────────────────────────────────────────────────

export const LUCY_NODE_REGISTRY_HISTORY_REASONER: Record<string, {
  id: string; name: string; layer: string; function: string; wiredTo: string[];
}> = {
  LL366: {
    id: 'LL366', name: 'HISTORY_REASONER',
    layer: 'Predictive Intelligence Layer',
    function: 'Core bridge between EC/IC signals and HistoryRAG. matchEraPattern() + calculateRiskFromHistory() + generateHistoricalWarning(). The missing fusion layer.',
    wiredTo: ['LL352', 'LL353', 'LL354', 'LL362', 'LL367', 'LL368'],
  },
  LL367: {
    id: 'LL367', name: 'EC_HISTORY_BRIDGE',
    layer: 'Predictive Intelligence Layer',
    function: 'Wires EC signals into HistoryReasoner on every tick for high-novelty signals. Attaches historicalContext to enriched envelopes before CG.',
    wiredTo: ['LL352', 'LL366', 'LL354'],
  },
  LL368: {
    id: 'LL368', name: 'IC_HISTORY_BRIDGE',
    layer: 'Predictive Intelligence Layer',
    function: 'Wires IC case opening into HistoryReasoner. Enriches causal chains with historical failure patterns. Generates investigation questions from era matches.',
    wiredTo: ['LL353', 'LL366', 'LL354'],
  },
  LL369: {
    id: 'LL369', name: 'REPEAT_CYCLE_DETECTOR',
    layer: 'Predictive Intelligence Layer',
    function: 'Identifies when a current signal matches a pattern that has failed 2+ times across different historical eras. Flags as highest-priority warning.',
    wiredTo: ['LL366', 'LL354', 'LL365'],
  },
  LL370: {
    id: 'LL370', name: 'SAFE_PATH_RECOMMENDER',
    layer: 'Predictive Intelligence Layer',
    function: 'For every identified risk pattern, surfaces the historically-corrected alternative path. Draws from positive era templates (esp. PROTEIN_FERMENTATION_SUCCESS).',
    wiredTo: ['LL366', 'LL354', 'LL365', 'L59'],
  },
};

// ─────────────────────────────────────────────────────────────
// SECTION 9: UPDATED EVENT BUS TYPES
// ─────────────────────────────────────────────────────────────

export type HistoryReasonerEventType =
  | 'history.era.matched'             // HistoryReasoner matched a signal to a historical era
  | 'history.risk.computed'           // RiskScore assembled from all matches
  | 'history.warning.emitted'         // HistoricalWarning sent to CG + chat formatter
  | 'history.repeat.cycle.detected'   // Same pattern has failed 2+ times in history
  | 'history.safe.path.recommended'   // HistoryReasoner surfaced a corrected path
  | 'history.causal.chain.enriched'   // IC case chain extended with historical steps
  | 'history.investigation.questions' // New questions generated for IC from era matches
  | 'history.positive.resonance';     // Signal matches a successful historical pattern

// ─────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────

export default HistoryReasoner;