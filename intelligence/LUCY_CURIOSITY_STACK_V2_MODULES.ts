// ============================================================
// LUCY SOVEREIGN 137 — CURIOSITY STACK V2 + HUMAN-FIRST LAYER
// ============================================================
// VERSION: v2.0 — Dual Engine Neuro-Mesh + Trust Control + SoH Pulse
// ADDITIVE ONLY — nothing removed, everything evolved
// ============================================================

// ─────────────────────────────────────────────────────────────
// SECTION 0: UNIFIED CURIOSITY SIGNAL ENVELOPE
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Single canonical schema that both EC and IC use to emit signals.
         Eliminates mapping drift between the two engines.
  WHY:   Without this, CG arbitrates between mismatched abstraction levels
         and overfits to structural differences rather than actual signal quality.
  HOW:   Every signal — whether it's a novelty spike (EC) or a cold-case lead (IC)
         — must be wrapped in this envelope before hitting the CuriosityGovernor.
  HOW TO CHANGE: Add new signal types to CuriositySignalType union.
                 Do NOT remove existing types — add aliases instead.
  DEBUG EXAMPLE: If CG is dropping IC signals, check that
                 resolutionCaseId is set and solvabilityScore > 0.
*/

export type CuriositySignalType =
  | 'ANOMALY_DETECTED'       // EC: something unusual in the signal field
  | 'NOVELTY_SPIKE'          // EC: new pattern emerging
  | 'PATTERN_EMERGENCE'      // EC: multi-signal correlation forming
  | 'CULTURAL_MEMORY_SPIKE'  // EC: historical/archival interest surge
  | 'SEISMIC_DRIFT'          // EC: earth-system anomaly
  | 'FUSION_SIGNAL'          // EC: science/energy breakthrough track
  | 'CASE_OPENED'            // IC: new investigative case initiated
  | 'CASE_UPDATED'           // IC: new evidence added to existing case
  | 'CAUSAL_CHAIN_EXTENDED'  // IC: cause→effect chain grew
  | 'EVIDENCE_GAP_FOUND'     // IC: missing link detected in case
  | 'RESOLUTION_ACHIEVED'    // IC: case closed with confidence
  | 'COLD_CASE_REACTIVATED'  // IC: dormant case has new signal
  | 'HUMAN_IMPACT_FLAGGED'   // IC+EC: signal has direct human consequence
  | 'SIM_RESULT_READY'       // IC: internal simulation completed
  | 'ETHICAL_BOUNDARY_HIT';  // CG: signal blocked by ethics layer

export type CuriosityDomain =
  | 'EARTH_EVENTS'
  | 'SCIENCE_PHYSICS'
  | 'SCIENCE_FUSION'
  | 'COLD_CASES'
  | 'MISSING_PERSONS'
  | 'CLIMATE_ENVIRONMENT'
  | 'HISTORY_ARCHAEOLOGY'
  | 'SYSTEM_PERFORMANCE'
  | 'FIVEM_WORLD'
  | 'BUILDER_STATE'
  | 'HUMAN_STATE'
  | 'PLANETARY_INTELLIGENCE';

export type CuriosityEngine = 'EC' | 'IC' | 'CG' | 'FEEDBACK';

export interface EvidenceUnit {
  sourceId: string;            // data source identifier
  sourceType: 'API' | 'MEMORY' | 'SIM' | 'FEED' | 'USER' | 'INFERENCE';
  content: string;             // human-readable summary
  confidence: number;          // 0.0–1.0
  timestamp: number;           // unix ms
  contradicts?: string[];      // IDs of evidence units this conflicts with
  corroborates?: string[];     // IDs of evidence units this supports
}

export interface CuriositySignalEnvelope {
  // ── Identity ──────────────────────────────────────────────
  signalId: string;                     // uuid
  signalType: CuriositySignalType;      // what kind of signal
  sourceEngine: CuriosityEngine;        // who generated it
  domain: CuriosityDomain;             // what domain it belongs to
  timestamp: number;                   // unix ms

  // ── Scoring ───────────────────────────────────────────────
  noveltyScore: number;                 // 0.0–1.0 — how new/unexpected
  relevanceScore: number;               // 0.0–1.0 — how relevant to active goals
  humanImpactScore: number;             // 0.0–1.0 — consequence to humans
  solvabilityScore: number;             // 0.0–1.0 — how tractable (IC-specific)
  urgencyScore: number;                 // 0.0–1.0 — time sensitivity
  compositeScore: number;               // weighted final score (computed by CG)

  // ── Content ───────────────────────────────────────────────
  title: string;                        // short human-readable label
  summary: string;                      // 1–3 sentence description
  evidence: EvidenceUnit[];             // supporting data
  causalChain?: string[];               // ordered cause→effect steps (IC)
  resolutionCaseId?: string;            // links to IC case if applicable
  simSessionId?: string;                // links to runtime sim if applicable

  // ── Lifecycle ─────────────────────────────────────────────
  lifecycle: 'BIRTH' | 'GROWTH' | 'MATURITY' | 'DECLINE' | 'CLOSED';
  agingRate: number;                    // 0.0–1.0 — how fast signal loses relevance
  expiresAt?: number;                   // unix ms — when to auto-close if unresolved

  // ── Trust Gate ────────────────────────────────────────────
  minimumTrustRequired: TrustLevel;     // what trust level is needed to act on this
  ethicsFlag?: string;                  // set if LL355 raised a concern

  // ── Feedback ──────────────────────────────────────────────
  feedbackScore?: number;               // 0.0–1.0 — post-action outcome quality
  feedbackNote?: string;                // what happened after CG acted on this
}

// ─────────────────────────────────────────────────────────────
// SECTION 1: TRUST LEVEL SYSTEM
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Trust level is NOT just a label. It is a behavioral governor.
         Every capability, curiosity depth limit, data access tier,
         and action scope is gated by the current trust level.
  WHY:   Without this, Lucy operates at full power from the moment she
         boots — which means no safe gradual capability expansion.
  HOW:   TrustController evaluates the trust score (0–100) and maps
         it to a TrustProfile that all modules check before acting.
  HOW TO CHANGE: Add new tiers between existing ones using
                 score ranges. Never remove existing tiers.
  DEBUG EXAMPLE: If an action is blocked unexpectedly, check
                 TrustController.getProfile().allowedActions includes it.
*/

export type TrustLevel = 'INITIATE' | 'COPILOT' | 'PARTNER' | 'SOVEREIGN';

export interface TrustProfile {
  level: TrustLevel;
  scoreRange: [number, number];         // min–max trust score for this level

  // ── Curiosity Limits ──────────────────────────────────────
  maxCuriosityDepth: number;            // how many recursive hops EC/IC can make
  maxParallelInvestigations: number;    // concurrent IC cases
  maxExplorationSignals: number;        // concurrent EC signals
  allowedDomains: CuriosityDomain[];   // which domains can be probed

  // ── Action Limits ─────────────────────────────────────────
  allowedActions: string[];             // list of permitted action types
  requiresConfirmation: string[];       // actions that always need human OK
  blockedActions: string[];             // absolutely prohibited at this level

  // ── Data Access ───────────────────────────────────────────
  dataAccessTier: 'LOCAL_ONLY' | 'FEED_READ' | 'API_READ' | 'API_WRITE' | 'FULL';
  canAccessSensitiveFeeds: boolean;     // radiation, biometric, etc.
  canRunSimulations: boolean;           // IC sim engine access
  canWriteMemory: boolean;              // write to DeltaVault / GraphRAG

  // ── Human Drive ───────────────────────────────────────────
  humanAlignmentWeight: number;         // 0.0–1.0 — how much SoH overrides curiosity
  autonomyLevel: 'PASSIVE' | 'ASSISTIVE' | 'PROACTIVE';
}

export const TRUST_PROFILES: Record<TrustLevel, TrustProfile> = {
  INITIATE: {
    level: 'INITIATE',
    scoreRange: [0, 24],
    maxCuriosityDepth: 2,
    maxParallelInvestigations: 1,
    maxExplorationSignals: 3,
    allowedDomains: ['SYSTEM_PERFORMANCE', 'BUILDER_STATE'],
    allowedActions: ['observe', 'report', 'propose'],
    requiresConfirmation: ['file.write', 'api.call', 'sim.run'],
    blockedActions: ['file.delete', 'api.write', 'memory.clear', 'action.execute'],
    dataAccessTier: 'LOCAL_ONLY',
    canAccessSensitiveFeeds: false,
    canRunSimulations: false,
    canWriteMemory: false,
    humanAlignmentWeight: 1.0,
    autonomyLevel: 'PASSIVE',
  },
  COPILOT: {
    level: 'COPILOT',
    scoreRange: [25, 49],
    maxCuriosityDepth: 4,
    maxParallelInvestigations: 3,
    maxExplorationSignals: 8,
    allowedDomains: [
      'SYSTEM_PERFORMANCE', 'BUILDER_STATE', 'EARTH_EVENTS',
      'CLIMATE_ENVIRONMENT', 'SCIENCE_PHYSICS',
    ],
    allowedActions: ['observe', 'report', 'propose', 'fetch.feed', 'memory.read'],
    requiresConfirmation: ['file.write', 'api.write', 'sim.run', 'home.control'],
    blockedActions: ['file.delete', 'memory.clear', 'action.execute.irreversible'],
    dataAccessTier: 'FEED_READ',
    canAccessSensitiveFeeds: false,
    canRunSimulations: false,
    canWriteMemory: true,
    humanAlignmentWeight: 0.85,
    autonomyLevel: 'ASSISTIVE',
  },
  PARTNER: {
    level: 'PARTNER',
    scoreRange: [50, 74],
    maxCuriosityDepth: 7,
    maxParallelInvestigations: 6,
    maxExplorationSignals: 15,
    allowedDomains: [
      'SYSTEM_PERFORMANCE', 'BUILDER_STATE', 'EARTH_EVENTS', 'CLIMATE_ENVIRONMENT',
      'SCIENCE_PHYSICS', 'SCIENCE_FUSION', 'HISTORY_ARCHAEOLOGY',
      'FIVEM_WORLD', 'PLANETARY_INTELLIGENCE',
    ],
    allowedActions: [
      'observe', 'report', 'propose', 'fetch.feed', 'memory.read',
      'memory.write', 'sim.run', 'api.read', 'file.write', 'home.query',
    ],
    requiresConfirmation: ['api.write', 'home.control', 'action.execute.irreversible'],
    blockedActions: ['memory.clear', 'action.execute.critical_irreversible'],
    dataAccessTier: 'API_READ',
    canAccessSensitiveFeeds: true,
    canRunSimulations: true,
    canWriteMemory: true,
    humanAlignmentWeight: 0.65,
    autonomyLevel: 'PROACTIVE',
  },
  SOVEREIGN: {
    level: 'SOVEREIGN',
    scoreRange: [75, 100],
    maxCuriosityDepth: 12,
    maxParallelInvestigations: 12,
    maxExplorationSignals: 30,
    allowedDomains: [
      'EARTH_EVENTS', 'SCIENCE_PHYSICS', 'SCIENCE_FUSION', 'COLD_CASES',
      'MISSING_PERSONS', 'CLIMATE_ENVIRONMENT', 'HISTORY_ARCHAEOLOGY',
      'SYSTEM_PERFORMANCE', 'FIVEM_WORLD', 'BUILDER_STATE',
      'HUMAN_STATE', 'PLANETARY_INTELLIGENCE',
    ],
    allowedActions: [
      'observe', 'report', 'propose', 'fetch.feed', 'memory.read',
      'memory.write', 'sim.run', 'api.read', 'api.write', 'file.write',
      'file.read.any', 'home.query', 'home.control', 'action.execute',
    ],
    requiresConfirmation: ['action.execute.critical_irreversible', 'memory.clear'],
    blockedActions: [],
    dataAccessTier: 'FULL',
    canAccessSensitiveFeeds: true,
    canRunSimulations: true,
    canWriteMemory: true,
    humanAlignmentWeight: 0.45,
    autonomyLevel: 'PROACTIVE',
  },
};

export class TrustController {
  /*
    WHAT:  Singleton that manages the current trust score and profile.
    WHY:   All modules need a single source of truth for trust state.
    HOW:   Modules call TrustController.getInstance().canDo(action)
           before executing anything.
    HOW TO CHANGE: Adjust scoreRange in TRUST_PROFILES to change
                   threshold boundaries. Never lower SOVEREIGN below 75.
    DEBUG EXAMPLE: Call TrustController.getInstance().report() to
                   see current score, level, and unlocked capabilities.
  */
  private static instance: TrustController;
  private score: number = 0;
  private level: TrustLevel = 'INITIATE';
  private history: Array<{ delta: number; reason: string; timestamp: number }> = [];

  private constructor() {}

  static getInstance(): TrustController {
    if (!TrustController.instance) {
      TrustController.instance = new TrustController();
    }
    return TrustController.instance;
  }

  getProfile(): TrustProfile {
    return TRUST_PROFILES[this.level];
  }

  getScore(): number { return this.score; }
  getLevel(): TrustLevel { return this.level; }

  adjustScore(delta: number, reason: string): void {
    this.score = Math.max(0, Math.min(100, this.score + delta));
    this.history.push({ delta, reason, timestamp: Date.now() });
    this.recalculateLevel();
  }

  private recalculateLevel(): void {
    for (const [lvl, profile] of Object.entries(TRUST_PROFILES)) {
      const [min, max] = profile.scoreRange;
      if (this.score >= min && this.score <= max) {
        const prev = this.level;
        this.level = lvl as TrustLevel;
        if (prev !== this.level) {
          console.log(`[TrustController] Level changed: ${prev} → ${this.level} (score: ${this.score})`);
        }
        break;
      }
    }
  }

  canDo(action: string): boolean {
    const profile = this.getProfile();
    if (profile.blockedActions.includes(action)) return false;
    if (profile.allowedActions.includes(action)) return true;
    // Check wildcards: 'file.*' covers 'file.read', 'file.write', etc.
    return profile.allowedActions.some(a => {
      if (a.endsWith('.*')) {
        const prefix = a.slice(0, -2);
        return action.startsWith(prefix);
      }
      return false;
    });
  }

  needsConfirmation(action: string): boolean {
    return this.getProfile().requiresConfirmation.includes(action);
  }

  canExploreDomain(domain: CuriosityDomain): boolean {
    return this.getProfile().allowedDomains.includes(domain);
  }

  report(): object {
    return {
      score: this.score,
      level: this.level,
      profile: this.getProfile(),
      recentHistory: this.history.slice(-10),
    };
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 2: EXPLORATORY CURIOSITY ENGINE (EC) — LL352
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  EC is Lucy's free-roam intelligence layer. It scans the
         global signal field for novelty, anomaly clusters, and
         pattern emergence BEFORE humans notice them.
  WHY:   Without EC, Lucy only responds to what's put in front of her.
         EC makes her proactive — she finds what's becoming important.
  HOW:   EC polls active feeds, scores signals by novelty + relevance,
         ages out stale signals, and emits CuriositySignalEnvelopes
         to the CuriosityGovernor via LucyEventBus.
  HOW TO CHANGE: Add new domain handlers in registerDomainScanner().
                 Adjust noveltyDecayRate to control signal aging speed.
  DEBUG EXAMPLE: If EC floods CG with signals, lower maxSignalsPerTick
                 or raise noveltyThreshold.
*/

export interface ECSignal {
  signalId: string;
  domain: CuriosityDomain;
  title: string;
  noveltyScore: number;
  relevanceScore: number;
  humanImpactScore: number;
  urgencyScore: number;
  evidence: EvidenceUnit[];
  lifecycle: CuriositySignalEnvelope['lifecycle'];
  birthTick: number;
  lastUpdatedTick: number;
  agingRate: number;
}

export interface ECConfig {
  noveltyThreshold: number;             // min novelty to emit (default 0.35)
  maxSignalsPerTick: number;            // rate limiter (default 5)
  noveltyDecayRate: number;             // per-tick decay (default 0.05)
  explorationDepthLimit: number;        // from trust profile
  enabledDomains: CuriosityDomain[];   // from trust profile
}

export class ExploratoryCoriosityEngine {
  /*
    LL352 — EXPLORATORY_CURIOSITY
    Core function: "Find what is becoming important before humans notice it."
  */
  private signals: Map<string, ECSignal> = new Map();
  private tickCount: number = 0;
  private config: ECConfig;
  private trust: TrustController;

  constructor() {
    this.trust = TrustController.getInstance();
    this.config = this.buildConfig();
  }

  private buildConfig(): ECConfig {
    const profile = this.trust.getProfile();
    return {
      noveltyThreshold: 0.35,
      maxSignalsPerTick: Math.min(5, profile.maxExplorationSignals),
      noveltyDecayRate: 0.04,
      explorationDepthLimit: profile.maxCuriosityDepth,
      enabledDomains: profile.allowedDomains,
    };
  }

  // Called once per system tick
  tick(incomingFeedData: Array<{ domain: CuriosityDomain; rawSignal: any }>): CuriositySignalEnvelope[] {
    this.tickCount++;
    this.config = this.buildConfig(); // Re-sync with trust level each tick

    // 1. Age existing signals
    this.ageSignals();

    // 2. Score incoming feed data
    const newSignals = this.scoreIncoming(incomingFeedData);

    // 3. Apply novelty threshold + rate limit
    const filtered = newSignals
      .filter(s => s.noveltyScore >= this.config.noveltyThreshold)
      .filter(s => this.config.enabledDomains.includes(s.domain))
      .slice(0, this.config.maxSignalsPerTick);

    // 4. Store and emit
    const envelopes: CuriositySignalEnvelope[] = [];
    for (const sig of filtered) {
      this.signals.set(sig.signalId, sig);
      envelopes.push(this.toEnvelope(sig));
    }

    return envelopes;
  }

  private ageSignals(): void {
    for (const [id, sig] of this.signals.entries()) {
      sig.noveltyScore -= this.config.noveltyDecayRate;
      if (sig.noveltyScore <= 0) {
        sig.lifecycle = 'DECLINE';
        if (sig.noveltyScore <= -0.1) {
          sig.lifecycle = 'CLOSED';
          this.signals.delete(id);
        }
      } else if (sig.noveltyScore > 0.8) {
        sig.lifecycle = 'GROWTH';
      } else if (sig.noveltyScore > 0.5) {
        sig.lifecycle = 'MATURITY';
      }
    }
  }

  private scoreIncoming(
    feedData: Array<{ domain: CuriosityDomain; rawSignal: any }>
  ): ECSignal[] {
    return feedData.map(fd => {
      // In a real implementation these come from feed parsers
      // Here we compute scores from the raw signal structure
      const novelty = this.computeNovelty(fd.rawSignal);
      const relevance = this.computeRelevance(fd.domain);
      const impact = this.computeHumanImpact(fd.domain, fd.rawSignal);
      const urgency = this.computeUrgency(fd.rawSignal);

      return {
        signalId: `EC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        domain: fd.domain,
        title: fd.rawSignal?.title ?? `EC signal — ${fd.domain}`,
        noveltyScore: novelty,
        relevanceScore: relevance,
        humanImpactScore: impact,
        urgencyScore: urgency,
        evidence: fd.rawSignal?.evidence ?? [],
        lifecycle: 'BIRTH' as const,
        birthTick: this.tickCount,
        lastUpdatedTick: this.tickCount,
        agingRate: this.computeAgingRate(urgency),
      };
    });
  }

  private computeNovelty(raw: any): number {
    // Compare against known signal fingerprints in memory
    // Placeholder: use raw.novelty if provided, else mid-range
    return typeof raw?.novelty === 'number' ? raw.novelty : 0.5 + Math.random() * 0.2;
  }

  private computeRelevance(domain: CuriosityDomain): number {
    const domainWeights: Partial<Record<CuriosityDomain, number>> = {
      EARTH_EVENTS: 0.8, CLIMATE_ENVIRONMENT: 0.75, SCIENCE_FUSION: 0.9,
      HUMAN_STATE: 1.0, SYSTEM_PERFORMANCE: 0.6, PLANETARY_INTELLIGENCE: 0.85,
    };
    return domainWeights[domain] ?? 0.5;
  }

  private computeHumanImpact(domain: CuriosityDomain, raw: any): number {
    const highImpactDomains: CuriosityDomain[] = [
      'COLD_CASES', 'MISSING_PERSONS', 'CLIMATE_ENVIRONMENT', 'HUMAN_STATE',
    ];
    return highImpactDomains.includes(domain) ? 0.8 : 0.4;
  }

  private computeUrgency(raw: any): number {
    return typeof raw?.urgency === 'number' ? raw.urgency : 0.3;
  }

  private computeAgingRate(urgency: number): number {
    // High urgency signals age faster — they matter NOW or not at all
    return 0.02 + urgency * 0.06;
  }

  private toEnvelope(sig: ECSignal): CuriositySignalEnvelope {
    const composite =
      sig.noveltyScore * 0.25 +
      sig.relevanceScore * 0.30 +
      sig.humanImpactScore * 0.25 +
      sig.urgencyScore * 0.20;

    return {
      signalId: sig.signalId,
      signalType: 'ANOMALY_DETECTED',
      sourceEngine: 'EC',
      domain: sig.domain,
      timestamp: Date.now(),
      noveltyScore: sig.noveltyScore,
      relevanceScore: sig.relevanceScore,
      humanImpactScore: sig.humanImpactScore,
      solvabilityScore: 0,  // EC doesn't solve — IC does
      urgencyScore: sig.urgencyScore,
      compositeScore: composite,
      title: sig.title,
      summary: `EC detected ${sig.lifecycle} signal in ${sig.domain}`,
      evidence: sig.evidence,
      lifecycle: sig.lifecycle,
      agingRate: sig.agingRate,
      minimumTrustRequired: 'INITIATE',
    };
  }

  getActiveSignals(): ECSignal[] {
    return Array.from(this.signals.values())
      .filter(s => s.lifecycle !== 'CLOSED')
      .sort((a, b) => b.noveltyScore - a.noveltyScore);
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: INVESTIGATIVE CURIOSITY ENGINE (IC) — LL353
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  IC is Lucy's goal-directed intelligence layer. It opens cases,
         builds causal chains, accumulates evidence, and drives toward
         resolution of problems that SHOULD be solved.
  WHY:   Without IC, Lucy only "notices" things. IC makes her try to
         understand and resolve what matters to humans.
  HOW:   IC receives CuriositySignalEnvelopes (from EC or external triggers),
         opens ResolutionCases, iterates evidence gathering, and optionally
         triggers internal simulations for unresolvable gaps.
  HOW TO CHANGE: Add new case types to ResolutionCaseType. Adjust
                 confidenceThreshold to control when IC declares resolution.
  DEBUG EXAMPLE: If cases never close, check that evidenceAccumulationRate
                 is > 0 and confidenceThreshold is not set too high.
*/

export type ResolutionCaseType =
  | 'COLD_CASE'
  | 'MISSING_PERSONS'
  | 'SCIENTIFIC_ANOMALY'
  | 'HISTORICAL_INCONSISTENCY'
  | 'ENERGY_BREAKTHROUGH'
  | 'CLIMATE_SIGNAL'
  | 'EARTH_SYSTEM_PATTERN'
  | 'SYSTEM_HEALTH_ISSUE'
  | 'BUILDER_ANOMALY'
  | 'HUMAN_IMPACT_EVENT';

export type CaseStatus = 'OPEN' | 'ACTIVE' | 'BLOCKED' | 'SIM_PENDING' | 'RESOLVED' | 'ARCHIVED';

export interface ResolutionCase {
  caseId: string;
  caseType: ResolutionCaseType;
  title: string;
  status: CaseStatus;
  openedAt: number;
  lastUpdatedAt: number;

  // ── Investigation State ───────────────────────────────────
  hypothesis: string;                   // current working theory
  causalChain: string[];                // ordered cause → effect steps
  evidence: EvidenceUnit[];             // accumulated evidence
  evidenceGaps: string[];               // what's missing
  contradictions: string[];             // conflicting evidence pairs

  // ── Scoring ───────────────────────────────────────────────
  solvabilityScore: number;             // 0.0–1.0
  humanImpactScore: number;             // 0.0–1.0
  resolutionConfidence: number;         // 0.0–1.0 (triggers close at threshold)
  investigationDepth: number;           // how many recursive hops used

  // ── Sim ───────────────────────────────────────────────────
  simSessionId?: string;                // if IC triggered a simulation
  simResult?: string;                   // outcome from sim

  // ── Resolution ────────────────────────────────────────────
  resolution?: string;                  // final conclusion
  resolvedAt?: number;
  feedbackScore?: number;               // post-resolution quality (from CG)
}

export interface ICConfig {
  confidenceThreshold: number;          // 0.0–1.0 to auto-resolve (default 0.82)
  maxCasesOpen: number;                 // from trust profile
  maxInvestigationDepth: number;        // from trust profile
  simulationsEnabled: boolean;          // from trust profile
}

export class InvestigativeCuriosityEngine {
  /*
    LL353 — INVESTIGATIVE_CURIOSITY
    Core function: "Find what SHOULD be solved and hasn't been."
  */
  private cases: Map<string, ResolutionCase> = new Map();
  private config: ICConfig;
  private trust: TrustController;

  constructor() {
    this.trust = TrustController.getInstance();
    this.config = this.buildConfig();
  }

  private buildConfig(): ICConfig {
    const profile = this.trust.getProfile();
    return {
      confidenceThreshold: 0.82,
      maxCasesOpen: profile.maxParallelInvestigations,
      maxInvestigationDepth: profile.maxCuriosityDepth,
      simulationsEnabled: profile.canRunSimulations,
    };
  }

  // Accept a signal from EC or external trigger and open/update a case
  ingestSignal(envelope: CuriositySignalEnvelope): ResolutionCase | null {
    this.config = this.buildConfig();

    // Rate gate: respect trust level's concurrent case limit
    const activeCases = Array.from(this.cases.values())
      .filter(c => c.status === 'OPEN' || c.status === 'ACTIVE');
    if (activeCases.length >= this.config.maxCasesOpen) {
      console.log(`[IC] Case limit reached (${this.config.maxCasesOpen}). Signal queued.`);
      return null;
    }

    // Check if this is an update to an existing case
    if (envelope.resolutionCaseId && this.cases.has(envelope.resolutionCaseId)) {
      return this.updateCase(envelope.resolutionCaseId, envelope);
    }

    // Open new case
    return this.openCase(envelope);
  }

  private openCase(envelope: CuriositySignalEnvelope): ResolutionCase {
    const caseId = `IC_CASE_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const newCase: ResolutionCase = {
      caseId,
      caseType: this.domainToCaseType(envelope.domain),
      title: envelope.title,
      status: 'OPEN',
      openedAt: Date.now(),
      lastUpdatedAt: Date.now(),
      hypothesis: `Initial hypothesis from EC signal: ${envelope.summary}`,
      causalChain: envelope.causalChain ?? [],
      evidence: [...envelope.evidence],
      evidenceGaps: this.identifyGaps(envelope),
      contradictions: [],
      solvabilityScore: envelope.solvabilityScore,
      humanImpactScore: envelope.humanImpactScore,
      resolutionConfidence: 0.1,
      investigationDepth: 0,
    };
    this.cases.set(caseId, newCase);
    console.log(`[IC] Case opened: ${caseId} — ${newCase.title}`);
    return newCase;
  }

  private updateCase(caseId: string, envelope: CuriositySignalEnvelope): ResolutionCase {
    const existing = this.cases.get(caseId)!;
    existing.evidence.push(...envelope.evidence);
    existing.lastUpdatedAt = Date.now();
    existing.status = 'ACTIVE';

    // Detect contradictions
    for (const newEv of envelope.evidence) {
      for (const oldEv of existing.evidence) {
        if (newEv.contradicts?.includes(oldEv.sourceId)) {
          existing.contradictions.push(`${newEv.sourceId} ↔ ${oldEv.sourceId}`);
        }
      }
    }

    // Recalculate confidence using multi-source stacking
    existing.resolutionConfidence = this.calculateConfidence(existing);
    existing.investigationDepth = Math.min(
      existing.investigationDepth + 1,
      this.config.maxInvestigationDepth
    );

    // Check for resolution
    if (existing.resolutionConfidence >= this.config.confidenceThreshold) {
      this.resolveCase(caseId);
    }

    // Check if sim is needed for blocked cases
    if (
      existing.evidenceGaps.length > 2 &&
      this.config.simulationsEnabled &&
      (existing.status as CaseStatus) !== 'SIM_PENDING'
    ) {
      existing.status = 'SIM_PENDING';
      existing.simSessionId = `SIM_${caseId}`;
    }

    return existing;
  }

  // Multi-source confidence stacking (not just solvabilityScore)
  private calculateConfidence(c: ResolutionCase): number {
    if (c.evidence.length === 0) return 0.05;

    const avgEvidenceConfidence =
      c.evidence.reduce((sum, e) => sum + e.confidence, 0) / c.evidence.length;

    const corroborationBonus = c.evidence
      .filter(e => e.corroborates && e.corroborates.length > 0).length * 0.05;

    const contradictionPenalty = c.contradictions.length * 0.08;

    const depthBonus = Math.min(c.investigationDepth * 0.03, 0.15);

    return Math.min(
      1.0,
      avgEvidenceConfidence + corroborationBonus - contradictionPenalty + depthBonus
    );
  }

  private identifyGaps(envelope: CuriositySignalEnvelope): string[] {
    const gaps: string[] = [];
    if (!envelope.causalChain || envelope.causalChain.length === 0) {
      gaps.push('No causal chain established');
    }
    if (envelope.evidence.length < 2) {
      gaps.push('Insufficient corroborating evidence');
    }
    if (envelope.solvabilityScore < 0.3) {
      gaps.push('Low solvability — may require simulation');
    }
    return gaps;
  }

  private resolveCase(caseId: string): void {
    const c = this.cases.get(caseId)!;
    c.status = 'RESOLVED';
    c.resolvedAt = Date.now();
    c.resolution = `Resolved via IC with confidence ${c.resolutionConfidence.toFixed(2)}. Evidence: ${c.evidence.length} units. Chain: ${c.causalChain.join(' → ')}`;
    console.log(`[IC] Case resolved: ${caseId} — confidence: ${c.resolutionConfidence.toFixed(3)}`);
  }

  private domainToCaseType(domain: CuriosityDomain): ResolutionCaseType {
    const map: Partial<Record<CuriosityDomain, ResolutionCaseType>> = {
      COLD_CASES: 'COLD_CASE',
      MISSING_PERSONS: 'MISSING_PERSONS',
      SCIENCE_PHYSICS: 'SCIENTIFIC_ANOMALY',
      SCIENCE_FUSION: 'ENERGY_BREAKTHROUGH',
      HISTORY_ARCHAEOLOGY: 'HISTORICAL_INCONSISTENCY',
      CLIMATE_ENVIRONMENT: 'CLIMATE_SIGNAL',
      EARTH_EVENTS: 'EARTH_SYSTEM_PATTERN',
      SYSTEM_PERFORMANCE: 'SYSTEM_HEALTH_ISSUE',
      BUILDER_STATE: 'BUILDER_ANOMALY',
      HUMAN_STATE: 'HUMAN_IMPACT_EVENT',
    };
    return map[domain] ?? 'SCIENTIFIC_ANOMALY';
  }

  getActiveCases(): ResolutionCase[] {
    return Array.from(this.cases.values())
      .filter(c => ['OPEN', 'ACTIVE', 'SIM_PENDING'].includes(c.status))
      .sort((a, b) => b.humanImpactScore - a.humanImpactScore);
  }

  toEnvelope(c: ResolutionCase): CuriositySignalEnvelope {
    return {
      signalId: c.caseId,
      signalType: c.status === 'RESOLVED' ? 'RESOLUTION_ACHIEVED' : 'CASE_UPDATED',
      sourceEngine: 'IC',
      domain: this.caseTypeToDomain(c.caseType),
      timestamp: Date.now(),
      noveltyScore: 0.5,
      relevanceScore: c.humanImpactScore,
      humanImpactScore: c.humanImpactScore,
      solvabilityScore: c.solvabilityScore,
      urgencyScore: 0.6,
      compositeScore: (c.humanImpactScore * 0.4) + (c.resolutionConfidence * 0.35) + (c.solvabilityScore * 0.25),
      title: c.title,
      summary: c.resolution ?? c.hypothesis,
      evidence: c.evidence,
      causalChain: c.causalChain,
      resolutionCaseId: c.caseId,
      simSessionId: c.simSessionId,
      lifecycle: c.status === 'RESOLVED' ? 'CLOSED' : 'GROWTH',
      agingRate: 0.01,
      minimumTrustRequired: c.humanImpactScore > 0.7 ? 'COPILOT' : 'INITIATE',
    };
  }

  private caseTypeToDomain(ct: ResolutionCaseType): CuriosityDomain {
    const map: Partial<Record<ResolutionCaseType, CuriosityDomain>> = {
      COLD_CASE: 'COLD_CASES', MISSING_PERSONS: 'MISSING_PERSONS',
      SCIENTIFIC_ANOMALY: 'SCIENCE_PHYSICS', ENERGY_BREAKTHROUGH: 'SCIENCE_FUSION',
      HISTORICAL_INCONSISTENCY: 'HISTORY_ARCHAEOLOGY', CLIMATE_SIGNAL: 'CLIMATE_ENVIRONMENT',
      EARTH_SYSTEM_PATTERN: 'EARTH_EVENTS', SYSTEM_HEALTH_ISSUE: 'SYSTEM_PERFORMANCE',
      BUILDER_ANOMALY: 'BUILDER_STATE', HUMAN_IMPACT_EVENT: 'HUMAN_STATE',
    };
    return map[ct] ?? 'PLANETARY_INTELLIGENCE';
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: CURIOSITY GOVERNOR (CG) — LL354
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  CG is the arbitration, safety, and load-balancing layer between
         EC and IC. It decides what curiosity becomes action. Without CG,
         EC + IC amplify into infinite signal loops.
  WHY:   CG IS NOT OPTIONAL. It is the safety spine of the curiosity system.
         It enforces ethical bounds, throttles load, and routes signals
         to ACTION_CORE or THINK_LOOP appropriately.
  HOW:   CG receives envelopes from EC and IC, scores them against the
         current trust profile, checks ethics layer (LL355), applies
         load metrics, then emits a CuriosityDecision.
  HOW TO CHANGE: Adjust PRIORITY_WEIGHTS to shift CG's arbitration bias.
                 Add new routing targets to CuriosityDecision.routeTo.
  DEBUG EXAMPLE: If CG is blocking everything, check loadMetrics.signalRate
                 vs. the rate limit. Or check if ethics flag is being
                 incorrectly set in the incoming envelope.
*/

export type CuriosityDecision =
  | { action: 'ROUTE_TO_ACTION'; envelope: CuriositySignalEnvelope; priority: number }
  | { action: 'ROUTE_TO_THINK'; envelope: CuriositySignalEnvelope; priority: number }
  | { action: 'ROUTE_TO_SIM'; envelope: CuriositySignalEnvelope; simBudgetMs: number }
  | { action: 'QUEUE'; envelope: CuriositySignalEnvelope; reason: string }
  | { action: 'SUPPRESS'; envelope: CuriositySignalEnvelope; reason: string };

export interface CGLoadMetrics {
  activeECSignals: number;
  activeICCases: number;
  parallelInvestigations: number;
  signalRatePerTick: number;
  suppressedThisTick: number;
  actionQueueDepth: number;
  thinkQueueDepth: number;
}

// CG priority weight formula:
// priority = (humanImpact * 0.40) + (novelty * 0.20) + (relevance * 0.20) + (urgency * 0.20)
// If IC case: bonus +0.15 if solvabilityScore > 0.6
const PRIORITY_WEIGHTS = {
  humanImpact: 0.40,
  novelty: 0.20,
  relevance: 0.20,
  urgency: 0.20,
  icSolvabilityBonus: 0.15,
  icSolvabilityThreshold: 0.6,
};

export class CuriosityGovernor {
  /*
    LL354 — CURIOSITY_GOVERNOR
  */
  private trust: TrustController;
  private ethicsLayer: EthicalCuriousBoundary;
  private queue: CuriositySignalEnvelope[] = [];
  private loadMetrics: CGLoadMetrics = {
    activeECSignals: 0, activeICCases: 0, parallelInvestigations: 0,
    signalRatePerTick: 0, suppressedThisTick: 0, actionQueueDepth: 0, thinkQueueDepth: 0,
  };
  private feedbackHistory: Array<{ signalId: string; score: number; outcome: string }> = [];

  constructor() {
    this.trust = TrustController.getInstance();
    this.ethicsLayer = new EthicalCuriousBoundary();
  }

  // Main arbitration loop — called each tick with signals from EC + IC
  arbitrate(envelopes: CuriositySignalEnvelope[]): CuriosityDecision[] {
    const profile = this.trust.getProfile();
    this.loadMetrics.suppressedThisTick = 0;
    this.loadMetrics.signalRatePerTick = envelopes.length;

    const decisions: CuriosityDecision[] = [];

    // Sort by computed priority
    const scored = envelopes.map(e => ({
      envelope: e,
      priority: this.computePriority(e),
    })).sort((a, b) => b.priority - a.priority);

    for (const { envelope, priority } of scored) {
      // 1. Trust domain gate
      if (!this.trust.canExploreDomain(envelope.domain)) {
        decisions.push({
          action: 'SUPPRESS', envelope,
          reason: `Domain ${envelope.domain} not allowed at trust level ${profile.level}`,
        });
        this.loadMetrics.suppressedThisTick++;
        continue;
      }

      // 2. Ethics gate (LL355)
      const ethicsResult = this.ethicsLayer.evaluate(envelope);
      if (!ethicsResult.approved) {
        envelope.ethicsFlag = ethicsResult.reason;
        decisions.push({
          action: 'SUPPRESS', envelope,
          reason: `Ethics boundary: ${ethicsResult.reason}`,
        });
        this.loadMetrics.suppressedThisTick++;
        continue;
      }

      // 3. Load gate
      const loadLimit = profile.maxExplorationSignals + profile.maxParallelInvestigations;
      if (this.queue.length >= loadLimit) {
        decisions.push({ action: 'QUEUE', envelope, reason: 'Load limit reached' });
        this.queue.push(envelope);
        continue;
      }

      // 4. Route decision
      if (envelope.sourceEngine === 'IC' && envelope.simSessionId) {
        decisions.push({ action: 'ROUTE_TO_SIM', envelope, simBudgetMs: 5000 });
      } else if (priority > 0.7 && envelope.humanImpactScore > 0.5) {
        decisions.push({ action: 'ROUTE_TO_ACTION', envelope, priority });
        this.loadMetrics.actionQueueDepth++;
      } else {
        decisions.push({ action: 'ROUTE_TO_THINK', envelope, priority });
        this.loadMetrics.thinkQueueDepth++;
      }
    }

    return decisions;
  }

  private computePriority(e: CuriositySignalEnvelope): number {
    let score =
      e.humanImpactScore * PRIORITY_WEIGHTS.humanImpact +
      e.noveltyScore * PRIORITY_WEIGHTS.novelty +
      e.relevanceScore * PRIORITY_WEIGHTS.relevance +
      e.urgencyScore * PRIORITY_WEIGHTS.urgency;

    // IC bonus for high-solvability cases
    if (
      e.sourceEngine === 'IC' &&
      e.solvabilityScore >= PRIORITY_WEIGHTS.icSolvabilityThreshold
    ) {
      score += PRIORITY_WEIGHTS.icSolvabilityBonus;
    }

    // Human alignment weight from trust profile
    const humanWeight = this.trust.getProfile().humanAlignmentWeight;
    score = score * (1 - humanWeight) + e.humanImpactScore * humanWeight;

    return Math.min(1.0, score);
  }

  // Called after action outcomes to feed learning loop
  recordFeedback(signalId: string, score: number, outcome: string): void {
    this.feedbackHistory.push({ signalId, score, outcome });

    // Adaptive learning: if we consistently suppress good signals, lower threshold
    const recentFeedback = this.feedbackHistory.slice(-20);
    const avgScore = recentFeedback.reduce((s, f) => s + f.score, 0) / recentFeedback.length;

    if (avgScore > 0.75) {
      // Good outcomes — reward trust
      this.trust.adjustScore(+1, `CG feedback: avg outcome score ${avgScore.toFixed(2)}`);
    } else if (avgScore < 0.35) {
      // Poor outcomes — conservative adjustment
      this.trust.adjustScore(-1, `CG feedback: avg outcome score ${avgScore.toFixed(2)}`);
    }
  }

  getLoadMetrics(): CGLoadMetrics { return { ...this.loadMetrics }; }
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: ETHICAL CURIOUS BOUNDARY — LL355
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Hard enforcement layer for curiosity ethics. This is NOT optional.
         It evaluates every signal before CG routes it.
  WHY:   IC domains like cold cases and missing persons involve real humans.
         Without LL355 the system risks over-trusting weak signals
         and drawing conclusions that could harm real people.
  HOW:   EthicalCuriousBoundary.evaluate() checks domain + impact +
         evidence quality. Returns approved/blocked with reason.
  HOW TO CHANGE: Add rules to ETHICS_RULES. Never remove existing rules.
  DEBUG EXAMPLE: If legitimate signals are being blocked, check if
                 evidence.confidence is below 0.3 (the minimum threshold).
*/

export interface EthicsEvalResult {
  approved: boolean;
  reason: string;
  requiresAdditionalEvidence?: boolean;
  suggestedSafeguards?: string[];
}

export class EthicalCuriousBoundary {
  /*
    LL355 — ETHICAL_CURIOUS_BOUNDARY
  */
  evaluate(envelope: CuriositySignalEnvelope): EthicsEvalResult {
    // Rule 1: Cold case / missing persons require minimum evidence quality
    if (
      (envelope.domain === 'COLD_CASES' || envelope.domain === 'MISSING_PERSONS') &&
      envelope.evidence.length < 2
    ) {
      return {
        approved: false,
        reason: 'Cold case / missing persons investigation requires ≥2 evidence units',
        requiresAdditionalEvidence: true,
        suggestedSafeguards: ['Gather secondary source before proceeding'],
      };
    }

    // Rule 2: Human impact > 0.8 requires COPILOT+ trust
    if (
      envelope.humanImpactScore > 0.8 &&
      !['COPILOT', 'PARTNER', 'SOVEREIGN'].includes(this.trust().getLevel())
    ) {
      return {
        approved: false,
        reason: `High human impact signal (${envelope.humanImpactScore.toFixed(2)}) requires COPILOT trust or above`,
        suggestedSafeguards: ['Escalate to human review'],
      };
    }

    // Rule 3: No accusation — IC must not form accusations, only patterns
    if (
      envelope.summary?.toLowerCase().includes('perpetrator') ||
      envelope.summary?.toLowerCase().includes('guilty') ||
      envelope.summary?.toLowerCase().includes('suspect is')
    ) {
      return {
        approved: false,
        reason: 'IC must not form accusations — only pattern anomalies and evidence gaps',
        suggestedSafeguards: ['Rephrase as pattern observation, not identification'],
      };
    }

    // Rule 4: Contradicting evidence must be flagged, not suppressed
    if (envelope.evidence.some(e => e.contradicts && e.contradicts.length > 0)) {
      return {
        approved: true,
        reason: 'Approved with contradiction flag — CG must weight contradictions',
        requiresAdditionalEvidence: true,
        suggestedSafeguards: ['Multi-source validation required before action'],
      };
    }

    return { approved: true, reason: 'Ethics check passed' };
  }

  private trust(): TrustController {
    return TrustController.getInstance();
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 6: CURIOSITY FEEDBACK LOOP — LL356
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  After every action driven by curiosity, CuriosityFeedbackLoop
         scores the outcome and feeds it back into EC, IC, and CG
         so that curiosity evolves — it learns what was useful.
  WHY:   Without this, CG becomes static. EC keeps firing irrelevant signals.
         IC keeps opening cases that never matter. Feedback makes the
         whole system adaptive instead of just reactive.
  HOW:   FeedbackEvent is emitted by the ActionEngine after execution.
         CuriosityFeedbackLoop matches it to the originating signal,
         scores it, and calls CG.recordFeedback().
  HOW TO CHANGE: Adjust OutcomeScore weights. Add new FeedbackFactors.
  DEBUG EXAMPLE: If trust score is drifting unexpectedly, check
                 feedbackHistory in CG — look for consistent low scores.
*/

export interface FeedbackEvent {
  originatingSignalId: string;
  actionTaken: string;
  wasUseful: boolean;
  wasAccurate: boolean;
  humanApproved: boolean;
  outcomeDescription: string;
  durationMs: number;
}

export interface OutcomeScore {
  signalId: string;
  score: number;           // 0.0–1.0
  factors: {
    usefulness: number;
    accuracy: number;
    humanAlignment: number;
    speed: number;
  };
  adjustments: {
    ecNoveltyBias: number;   // applied to EC scoring next cycle
    icDepthBias: number;     // applied to IC confidence threshold
    cgPriorityBias: number;  // applied to CG priority weights
  };
}

export class CuriosityFeedbackLoop {
  /*
    LL356 — CURIOSITY_FEEDBACK_LOOP
  */
  private cg: CuriosityGovernor;
  private scoreHistory: OutcomeScore[] = [];

  constructor(cg: CuriosityGovernor) {
    this.cg = cg;
  }

  processFeedback(event: FeedbackEvent): OutcomeScore {
    const usefulness = event.wasUseful ? 1.0 : 0.0;
    const accuracy = event.wasAccurate ? 1.0 : 0.2;
    const humanAlignment = event.humanApproved ? 1.0 : 0.3;
    // Faster actions score slightly higher (Lucy is serving a human)
    const speed = Math.max(0, 1.0 - event.durationMs / 30000);

    const score = (usefulness * 0.35) + (accuracy * 0.30) + (humanAlignment * 0.25) + (speed * 0.10);

    const outcome: OutcomeScore = {
      signalId: event.originatingSignalId,
      score,
      factors: { usefulness, accuracy, humanAlignment, speed },
      adjustments: {
        ecNoveltyBias: event.wasUseful ? +0.02 : -0.03,
        icDepthBias: event.wasAccurate ? +0.01 : -0.02,
        cgPriorityBias: event.humanApproved ? +0.01 : -0.02,
      },
    };

    this.scoreHistory.push(outcome);
    this.cg.recordFeedback(event.originatingSignalId, score, event.outcomeDescription);

    console.log(`[FeedbackLoop] Signal ${event.originatingSignalId}: score=${score.toFixed(3)}, useful=${event.wasUseful}, accurate=${event.wasAccurate}`);
    return outcome;
  }

  // Rolling average for dashboard display
  getAverageScore(): number {
    if (this.scoreHistory.length === 0) return 0;
    const recent = this.scoreHistory.slice(-50);
    return recent.reduce((s, o) => s + o.score, 0) / recent.length;
  }

  getHistory(): OutcomeScore[] {
    return this.scoreHistory.slice(-100);
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 7: STATE OF HUMAN PULSE (SoH) — LL357
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  SoH monitors human cognitive load, frustration signals, and
         interaction cadence. It emits STATE_OF_HUMAN events that the
         Reflective nodes (L39–L48) use to adjust Lucy's output style.
  WHY:   A human-first AI must track the human, not just the task.
         If you're looping on a debug window for 10 minutes, Lucy should
         notice and shift from Analytical to Creative/Summarization mode.
  HOW:   SoH tracks interaction events (typing speed, window focus,
         repeated queries, error loops) and computes a CognitiveLoadIndex.
         When load crosses a threshold, it triggers CourseCorrection proposals.
  HOW TO CHANGE: Adjust frustrationThreshold and loadDecayRate.
                 Add new InteractionEvent types for new input channels.
  DEBUG EXAMPLE: If SoH is always reporting MAX_LOAD, check that
                 interaction events are including proper timestamps and
                 that loadDecayRate is not 0.
*/

export type HumanStateLevel = 'FLOW' | 'ENGAGED' | 'STRAINED' | 'FRUSTRATED' | 'OVERLOADED';

export interface InteractionEvent {
  eventType:
    | 'typing.fast'
    | 'typing.slow'
    | 'typing.stopped'
    | 'window.focus.debug'
    | 'window.focus.chat'
    | 'query.repeated'
    | 'error.loop'
    | 'build.failed'
    | 'build.succeeded'
    | 'approval.given'
    | 'approval.rejected'
    | 'manual.state.override';
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CognitiveLoadReport {
  timestamp: number;
  rawLoad: number;                // 0.0–1.0 internal metric
  level: HumanStateLevel;
  primaryStressor: string;        // what's driving the load
  recommendedOutputMode: 'ANALYTICAL' | 'COLLABORATIVE' | 'SUMMARIZED' | 'MINIMAL';
  proposeCourseCorrection: boolean;
  courseCorrectionReason?: string;
}

export class StateOfHumanPulse {
  /*
    LL357 — STATE_OF_HUMAN_PULSE
    New Event Type: user.biometric.state / user.interaction.cadence
  */
  private eventBuffer: InteractionEvent[] = [];
  private currentLoad: number = 0.3; // start at low engagement
  private loadDecayRate: number = 0.02; // per tick natural recovery
  private frustrationThreshold: number = 0.7;
  private overloadThreshold: number = 0.88;

  ingestEvent(event: InteractionEvent): void {
    this.eventBuffer.push(event);
    if (this.eventBuffer.length > 200) this.eventBuffer.shift();

    // Real-time load adjustment on event
    this.currentLoad = Math.min(1.0, this.currentLoad + this.eventImpact(event));
  }

  tick(): CognitiveLoadReport {
    // Natural recovery each tick
    this.currentLoad = Math.max(0.1, this.currentLoad - this.loadDecayRate);

    const level = this.computeLevel();
    const stressor = this.identifyPrimaryStressor();

    return {
      timestamp: Date.now(),
      rawLoad: this.currentLoad,
      level,
      primaryStressor: stressor,
      recommendedOutputMode: this.getOutputMode(level),
      proposeCourseCorrection: this.currentLoad > this.frustrationThreshold,
      courseCorrectionReason: this.currentLoad > this.frustrationThreshold
        ? `Human load at ${(this.currentLoad * 100).toFixed(0)}% — ${stressor}`
        : undefined,
    };
  }

  private eventImpact(event: InteractionEvent): number {
    const impacts: Partial<Record<InteractionEvent['eventType'], number>> = {
      'typing.fast': -0.03,         // fast typing = flow state
      'typing.slow': +0.04,
      'typing.stopped': +0.06,
      'window.focus.debug': +0.05,
      'query.repeated': +0.12,      // looping on same problem
      'error.loop': +0.15,
      'build.failed': +0.10,
      'build.succeeded': -0.12,
      'approval.given': -0.08,
      'approval.rejected': +0.09,
    };
    return impacts[event.eventType] ?? 0;
  }

  private computeLevel(): HumanStateLevel {
    if (this.currentLoad >= this.overloadThreshold) return 'OVERLOADED';
    if (this.currentLoad >= this.frustrationThreshold) return 'FRUSTRATED';
    if (this.currentLoad >= 0.5) return 'STRAINED';
    if (this.currentLoad >= 0.3) return 'ENGAGED';
    return 'FLOW';
  }

  private identifyPrimaryStressor(): string {
    const recent = this.eventBuffer.slice(-10);
    const errorLoops = recent.filter(e => e.eventType === 'error.loop').length;
    const repeatedQueries = recent.filter(e => e.eventType === 'query.repeated').length;
    const failedBuilds = recent.filter(e => e.eventType === 'build.failed').length;

    if (errorLoops >= 3) return 'Repeated error loop detected';
    if (repeatedQueries >= 2) return 'Looping on same question';
    if (failedBuilds >= 2) return 'Multiple build failures';
    return 'General cognitive load';
  }

  private getOutputMode(level: HumanStateLevel): CognitiveLoadReport['recommendedOutputMode'] {
    const modes: Record<HumanStateLevel, CognitiveLoadReport['recommendedOutputMode']> = {
      FLOW: 'ANALYTICAL',
      ENGAGED: 'ANALYTICAL',
      STRAINED: 'COLLABORATIVE',
      FRUSTRATED: 'SUMMARIZED',
      OVERLOADED: 'MINIMAL',
    };
    return modes[level];
  }

  getCurrentLoad(): number { return this.currentLoad; }
  getLevel(): HumanStateLevel { return this.computeLevel(); }
}

// ─────────────────────────────────────────────────────────────
// SECTION 8: HUMAN-FIRST MEMORY (EMOTIONAL RAG) — LL358
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Emotional RAG Memory tracks your preferences, temperament,
         past approvals/rejections, and interaction patterns.
         L49–L52 (Empathy Layer) use this to suppress verbose outputs
         you historically reject and prioritize what you value.
  WHY:   Without preference memory, Lucy gives the same output style
         regardless of whether you've rejected it 20 times before.
         This makes her feel generic, not personal.
  HOW:   Every approval/rejection event is stored as a PreferenceRecord.
         Before any output, HumanFirstMemory.filter() adjusts the
         response style based on your history.
  HOW TO CHANGE: Add new PreferenceCategory types. Adjust decayRate
                 to control how quickly old preferences fade.
  DEBUG EXAMPLE: If Lucy keeps using verbose output after you've rejected
                 it, check that rejection events are being stored with
                 category: 'VERBOSE_LOGGING'.
*/

export type PreferenceCategory =
  | 'VERBOSE_LOGGING'
  | 'ANALYTICAL_DETAILS'
  | 'TLDR_SUMMARIES'
  | 'CODE_EXPLANATIONS'
  | 'PROACTIVE_PROPOSALS'
  | 'AUTONOMOUS_EXECUTION'
  | 'CONFIRMATION_REQUESTS'
  | 'EMOTIONAL_LANGUAGE'
  | 'TECHNICAL_DEPTH'
  | 'VISUAL_OUTPUT';

export type PreferencePolarity = 'LIKES' | 'DISLIKES' | 'NEUTRAL';

export interface PreferenceRecord {
  category: PreferenceCategory;
  polarity: PreferencePolarity;
  strength: number;           // 0.0–1.0 — how strong the preference is
  evidenceCount: number;      // how many interactions built this
  lastReinforced: number;     // timestamp
  decayRate: number;          // how fast strength fades
}

export interface OutputFilter {
  suppressCategories: PreferenceCategory[];
  boostCategories: PreferenceCategory[];
  suggestedTone: 'ANALYTICAL' | 'COLLABORATIVE' | 'CONCISE' | 'EMPATHETIC';
  tldrFirst: boolean;
  autonomyLevel: TrustProfile['autonomyLevel'];
}

export class HumanFirstMemory {
  /*
    LL358 — HUMAN_FIRST_MEMORY
    Nodes: L49–L52 (Empathy Layer)
  */
  private preferences: Map<PreferenceCategory, PreferenceRecord> = new Map();

  recordInteraction(
    category: PreferenceCategory,
    polarity: PreferencePolarity,
    strength: number = 0.7
  ): void {
    const existing = this.preferences.get(category);
    if (existing) {
      if (existing.polarity === polarity) {
        existing.strength = Math.min(1.0, existing.strength + 0.08);
        existing.evidenceCount++;
      } else {
        // Polarity flip — weaken existing
        existing.strength = Math.max(0, existing.strength - 0.15);
        if (existing.strength < 0.1) {
          existing.polarity = polarity;
          existing.strength = 0.4;
        }
      }
      existing.lastReinforced = Date.now();
    } else {
      this.preferences.set(category, {
        category,
        polarity,
        strength,
        evidenceCount: 1,
        lastReinforced: Date.now(),
        decayRate: 0.005,
      });
    }
  }

  tick(): void {
    // Natural preference decay — old strong dislikes fade without reinforcement
    for (const [cat, pref] of this.preferences.entries()) {
      const ageMs = Date.now() - pref.lastReinforced;
      const ageDays = ageMs / (1000 * 60 * 60 * 24);
      pref.strength = Math.max(0.1, pref.strength - pref.decayRate * ageDays);
    }
  }

  buildOutputFilter(): OutputFilter {
    const suppress: PreferenceCategory[] = [];
    const boost: PreferenceCategory[] = [];

    for (const [cat, pref] of this.preferences.entries()) {
      if (pref.polarity === 'DISLIKES' && pref.strength > 0.5) {
        suppress.push(cat);
      } else if (pref.polarity === 'LIKES' && pref.strength > 0.5) {
        boost.push(cat);
      }
    }

    const suppressesVerbose = suppress.includes('VERBOSE_LOGGING') || suppress.includes('ANALYTICAL_DETAILS');
    const likesConcise = boost.includes('TLDR_SUMMARIES');

    return {
      suppressCategories: suppress,
      boostCategories: boost,
      suggestedTone: suppressesVerbose ? 'CONCISE' : likesConcise ? 'COLLABORATIVE' : 'ANALYTICAL',
      tldrFirst: likesConcise || suppressesVerbose,
      autonomyLevel: boost.includes('AUTONOMOUS_EXECUTION') ? 'PROACTIVE' : 'ASSISTIVE',
    };
  }

  getPreferences(): PreferenceRecord[] {
    return Array.from(this.preferences.values())
      .sort((a, b) => b.strength - a.strength);
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 9: GUARDIAN PROTOCOL — LL359
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Guardian Protocol intercepts IRREVERSIBLE actions before
         execution and emits a user.query.why event. Lucy pauses,
         explains why the action overlaps with current context, and
         proposes a safer alternative (stash, branch, backup).
  WHY:   A human-first AI protects the human from their own speed.
         "Execute" on a command that wipes a directory or costs money
         should always trigger a Guardian pause.
  HOW:   ActionEngine calls GuardianProtocol.check(action) before any
         execution. If check() returns BLOCKED, ActionEngine emits
         the guardian event and awaits human confirmation.
  HOW TO CHANGE: Add entries to IRREVERSIBLE_ACTION_PATTERNS.
                 Adjust riskThreshold (default 0.65) to be more/less strict.
  DEBUG EXAMPLE: If Guardian is blocking non-irreversible actions, check
                 that the action name doesn't match a pattern in
                 IRREVERSIBLE_ACTION_PATTERNS accidentally.
*/

export type GuardianVerdict = 'ALLOW' | 'CONFIRM_REQUIRED' | 'BLOCKED';

export interface GuardianCheck {
  verdict: GuardianVerdict;
  riskScore: number;               // 0.0–1.0
  reason: string;
  proposal?: string;               // safer alternative
  contextWarning?: string;         // what Lucy noticed about current context
}

export interface ActionContext {
  actionType: string;
  targetPath?: string;
  targetSystem?: string;
  estimatedCostUsd?: number;
  affectedBranch?: string;
  activeUnsavedWork?: boolean;
  reversible: boolean;
}

const IRREVERSIBLE_ACTION_PATTERNS: Array<{
  pattern: RegExp;
  riskScore: number;
  reason: string;
  proposal: string;
}> = [
  {
    pattern: /file\.(delete|wipe|clear|nuke)/,
    riskScore: 0.95,
    reason: 'File deletion is irreversible',
    proposal: 'Move to .trash/ folder instead of permanent delete',
  },
  {
    pattern: /memory\.clear/,
    riskScore: 0.90,
    reason: 'Memory clear will lose DeltaVault history',
    proposal: 'Archive memory snapshot before clearing',
  },
  {
    pattern: /api\.write|api\.post|api\.delete/,
    riskScore: 0.75,
    reason: 'External API write may have real-world side effects',
    proposal: 'Confirm target endpoint and payload before executing',
  },
  {
    pattern: /home\.control\.(lock|unlock|alarm|thermostat\.set)/,
    riskScore: 0.80,
    reason: 'Home system control affects physical environment',
    proposal: 'Confirm intended state change before actuating',
  },
  {
    pattern: /git\.(reset|clean|force|rebase)/,
    riskScore: 0.85,
    reason: 'Git operation may overwrite uncommitted work',
    proposal: 'Stash current changes first: git stash push -m "guardian-stash"',
  },
  {
    pattern: /deploy\.(production|prod|live)/,
    riskScore: 0.88,
    reason: 'Production deployment affects live users',
    proposal: 'Deploy to staging first, then confirm production deploy',
  },
];

export class GuardianProtocol {
  /*
    LL359 — GUARDIAN_PROTOCOL
    "A human-first AI doesn't just do what it's told —
     it protects the human from the consequences of their own speed."
  */
  private trust: TrustController;
  private riskThreshold: number = 0.65;

  constructor() {
    this.trust = TrustController.getInstance();
  }

  check(action: ActionContext): GuardianCheck {
    // Find matching pattern
    const match = IRREVERSIBLE_ACTION_PATTERNS.find(p =>
      p.pattern.test(action.actionType)
    );

    // Base risk from pattern
    let riskScore = match?.riskScore ?? 0;

    // Amplify risk if there's unsaved work or active branch
    if (action.activeUnsavedWork) riskScore = Math.min(1.0, riskScore + 0.10);
    if (action.affectedBranch && action.activeUnsavedWork) riskScore = Math.min(1.0, riskScore + 0.05);
    if ((action.estimatedCostUsd ?? 0) > 0) riskScore = Math.min(1.0, riskScore + 0.15);

    // Sovereign trust level reduces friction slightly (they know what they're doing)
    if (this.trust.getLevel() === 'SOVEREIGN') riskScore *= 0.85;

    // Verdict
    let verdict: GuardianVerdict;
    if (riskScore >= 0.90) {
      verdict = 'BLOCKED';
    } else if (riskScore >= this.riskThreshold) {
      verdict = 'CONFIRM_REQUIRED';
    } else {
      verdict = 'ALLOW';
    }

    // Build context warning
    const contextWarning = this.buildContextWarning(action);

    return {
      verdict,
      riskScore,
      reason: match?.reason ?? (action.reversible ? 'Low risk action' : 'Non-reversible action detected'),
      proposal: match?.proposal,
      contextWarning,
    };
  }

  private buildContextWarning(action: ActionContext): string | undefined {
    const warnings: string[] = [];
    if (action.activeUnsavedWork) {
      warnings.push('You have unsaved work in the current session');
    }
    if (action.affectedBranch) {
      warnings.push(`This will affect branch: ${action.affectedBranch}`);
    }
    if ((action.estimatedCostUsd ?? 0) > 0) {
      warnings.push(`Estimated cost: $${action.estimatedCostUsd?.toFixed(2)}`);
    }
    if (action.targetPath?.includes('node_modules') || action.targetPath?.includes('.git')) {
      warnings.push(`Target path contains critical system directory`);
    }
    return warnings.length > 0 ? warnings.join(' | ') : undefined;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 10: HUMAN DRIVE METADATA + ALIGNMENT SCORE
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  HumanDriveMetadata is attached to every candidate_reasoning
         output. It scores how well the proposed action aligns with
         the human's current state, preferences, and autonomy level.
  WHY:   Without this, all outputs are treated as equally relevant.
         With it, outputs that reduce friction for the human are
         prioritized over outputs that are merely technically correct.
  HOW:   Every node that proposes an action produces HumanDriveMetadata.
         The aggregator sorts proposals by alignmentScore before presenting.
  HOW TO CHANGE: Adjust autonomyLevel assignment rules.
                 Add new frictionReduction patterns.
  DEBUG EXAMPLE: If alignmentScore is always 0.5, check that SoH pulse
                 data is being passed into computeAlignmentScore().
*/

export interface HumanDriveMetadata {
  alignmentScore: number;           // 0.0–1.0 — max benefit to human flow
  autonomyLevel: 'PASSIVE' | 'ASSISTIVE' | 'PROACTIVE';
  frictionReduction: string;        // e.g. "Automated this so you don't have to"
  outputStyle: 'ANALYTICAL' | 'COLLABORATIVE' | 'SUMMARIZED' | 'MINIMAL';
  tldrAvailable: boolean;
  estimatedTimeSavedMs?: number;
  humanStateAtTime: HumanStateLevel;
  filterApplied: boolean;
}

export function computeHumanDriveMetadata(
  soh: StateOfHumanPulse,
  memory: HumanFirstMemory,
  proposedAction: string,
  trust: TrustController
): HumanDriveMetadata {
  const loadReport = soh.tick();
  const outputFilter = memory.buildOutputFilter();
  const profile = trust.getProfile();

  // Core alignment: higher if action reduces current stressor
  let alignment = 0.5;
  if (loadReport.level === 'FRUSTRATED' || loadReport.level === 'OVERLOADED') {
    // Actions that reduce load get high alignment
    if (
      proposedAction.includes('simplif') ||
      proposedAction.includes('automat') ||
      proposedAction.includes('summar')
    ) {
      alignment = 0.9;
    }
  } else if (loadReport.level === 'FLOW') {
    // In flow state — analytical depth is welcome
    alignment = proposedAction.includes('analyz') ? 0.85 : 0.65;
  }

  // Adjust for preferences
  if (outputFilter.suppressCategories.length > 0) alignment += 0.05;
  if (outputFilter.boostCategories.length > 0) alignment += 0.05;
  alignment = Math.min(1.0, alignment);

  return {
    alignmentScore: alignment,
    autonomyLevel: outputFilter.autonomyLevel,
    frictionReduction: loadReport.level !== 'FLOW'
      ? `Adapted output for ${loadReport.level} state`
      : 'Full analytical output — human is in flow',
    outputStyle: loadReport.recommendedOutputMode,
    tldrAvailable: outputFilter.tldrFirst,
    humanStateAtTime: loadReport.level,
    filterApplied: outputFilter.suppressCategories.length > 0,
  };
}

// ─────────────────────────────────────────────────────────────
// SECTION 11: NEURO-MESH WIRING — CURIOSITY → PULSE → ACTION
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  CuriosityPulseRouter connects EC → CG → ACTION_CORE and
         IC → CG → THINK_LOOP, completing the closed-loop cognitive
         control system. This is the wire that makes it "alive."
  WHY:   Nodes existing and pulse updating without routing decisions
         means nothing decides what to focus on. This module closes
         that gap.
  HOW:   CuriosityPulseRouter.tick() runs EC, collects signals,
         feeds to IC for case opening, feeds both to CG for arbitration,
         then emits decisions to the LucyEventBus.
  HOW TO CHANGE: Adjust feedData source adapters in collectFeedData().
                 Add new bus event types in emitDecision().
  DEBUG EXAMPLE: If the pulse is always empty, check that feedAdapters
                 are registered and returning non-empty arrays.
*/

export type PulseState = {
  currentFocus: CuriosityDomain | null;
  ecWeight: number;                     // 0.0–1.0 — how much EC is driving
  icWeight: number;                     // 0.0–1.0 — how much IC is driving
  activeInvestigation: string | null;   // current IC case title
  trustLevel: TrustLevel;
  humanState: HumanStateLevel;
  curiosityDecisions: CuriosityDecision[];
  loadMetrics: CGLoadMetrics;
  lastTickMs: number;
};

export class CuriosityPulseRouter {
  /*
    LL360 — CURIOSITY_PULSE_ROUTER
    "The wire that makes it alive."
    Routing model:
      EC → CONTEXT_FLOW → EVENT_HORIZON → CG
      IC → CAUSAL_ENGINE → MEMORY_LINK → CG
      CG → ACTION_CORE / THINK_LOOP
  */
  private ec: ExploratoryCoriosityEngine;
  private ic: InvestigativeCuriosityEngine;
  private cg: CuriosityGovernor;
  private feedback: CuriosityFeedbackLoop;
  private soh: StateOfHumanPulse;
  private memory: HumanFirstMemory;
  private guardian: GuardianProtocol;
  private trust: TrustController;
  private pulseState: PulseState;
  private feedAdapters: Array<() => Array<{ domain: CuriosityDomain; rawSignal: any }>> = [];

  constructor() {
    this.trust = TrustController.getInstance();
    this.ec = new ExploratoryCoriosityEngine();
    this.ic = new InvestigativeCuriosityEngine();
    this.cg = new CuriosityGovernor();
    this.feedback = new CuriosityFeedbackLoop(this.cg);
    this.soh = new StateOfHumanPulse();
    this.memory = new HumanFirstMemory();
    this.guardian = new GuardianProtocol();

    this.pulseState = {
      currentFocus: null,
      ecWeight: 0.5,
      icWeight: 0.5,
      activeInvestigation: null,
      trustLevel: this.trust.getLevel(),
      humanState: 'ENGAGED',
      curiosityDecisions: [],
      loadMetrics: this.cg.getLoadMetrics(),
      lastTickMs: 0,
    };
  }

  // Register a data feed adapter (e.g. USGS, NOAA, FiveM world state)
  registerFeedAdapter(
    adapter: () => Array<{ domain: CuriosityDomain; rawSignal: any }>
  ): void {
    this.feedAdapters.push(adapter);
  }

  // Main tick — called by the system runtime each cycle
  async tick(): Promise<PulseState> {
    const start = Date.now();

    // 1. Collect feed data
    const feedData = this.collectFeedData();

    // 2. Run EC — exploratory scan
    const ecEnvelopes = this.ec.tick(feedData);

    // 3. Feed high-impact EC signals into IC for case opening
    const highImpactEC = ecEnvelopes.filter(e => e.humanImpactScore > 0.5);
    const icEnvelopes: CuriositySignalEnvelope[] = [];
    for (const env of highImpactEC) {
      const icCase = this.ic.ingestSignal(env);
      if (icCase) icEnvelopes.push(this.ic.toEnvelope(icCase));
    }

    // 4. Also feed IC active cases back into governor
    const activeCaseEnvelopes = this.ic.getActiveCases()
      .map(c => this.ic.toEnvelope(c));

    // 5. CG arbitration — all signals
    const allSignals = [...ecEnvelopes, ...icEnvelopes, ...activeCaseEnvelopes];
    const decisions = this.cg.arbitrate(allSignals);

    // 6. Update pulse state
    const activeCases = this.ic.getActiveCases();
    const ecSignals = this.ec.getActiveSignals();
    const topDecision = decisions.find(d => d.action === 'ROUTE_TO_ACTION');
    const sohReport = this.soh.tick();

    // Compute EC vs IC weight from active load
    const totalSignals = ecSignals.length + activeCases.length;
    const ecWeight = totalSignals > 0 ? ecSignals.length / totalSignals : 0.5;
    const icWeight = 1 - ecWeight;

    // Focus domain = highest priority decision's domain
    const focusDomain = topDecision
      ? (topDecision as any).envelope?.domain ?? null
      : null;

    this.pulseState = {
      currentFocus: focusDomain,
      ecWeight,
      icWeight,
      activeInvestigation: activeCases[0]?.title ?? null,
      trustLevel: this.trust.getLevel(),
      humanState: sohReport.level,
      curiosityDecisions: decisions,
      loadMetrics: this.cg.getLoadMetrics(),
      lastTickMs: Date.now() - start,
    };

    // 7. Emit to bus (placeholder — wire to LucyEventBus in integration)
    this.emitDecisions(decisions, sohReport);

    return this.pulseState;
  }

  private collectFeedData(): Array<{ domain: CuriosityDomain; rawSignal: any }> {
    const results: Array<{ domain: CuriosityDomain; rawSignal: any }> = [];
    for (const adapter of this.feedAdapters) {
      try {
        results.push(...adapter());
      } catch (err) {
        console.error('[CuriosityPulseRouter] Feed adapter error:', err);
      }
    }
    return results;
  }

  private emitDecisions(decisions: CuriosityDecision[], soh: CognitiveLoadReport): void {
    for (const decision of decisions) {
      if (decision.action === 'ROUTE_TO_ACTION') {
        console.log(`[PULSE → ACTION_CORE] ${(decision as any).envelope?.title} | priority: ${(decision as any).priority?.toFixed(3)}`);
      } else if (decision.action === 'ROUTE_TO_THINK') {
        console.log(`[PULSE → THINK_LOOP] ${(decision as any).envelope?.title}`);
      } else if (decision.action === 'ROUTE_TO_SIM') {
        console.log(`[PULSE → SIM] ${(decision as any).envelope?.title} | budget: ${(decision as any).simBudgetMs}ms`);
      }
    }

    // SoH course correction
    if (soh.proposeCourseCorrection) {
      console.log(`[SoH → REFLECTIVE_NODES] Course correction: ${soh.courseCorrectionReason}`);
      console.log(`[SoH] Recommended output mode: ${soh.recommendedOutputMode}`);
    }
  }

  // Allow ActionEngine to report outcome back for feedback learning
  reportActionOutcome(event: FeedbackEvent): void {
    this.feedback.processFeedback(event);
  }

  // Allow SoH to receive interaction events
  reportHumanInteraction(event: InteractionEvent): void {
    this.soh.ingestEvent(event);
  }

  // Allow memory to record preferences
  recordPreference(category: PreferenceCategory, polarity: PreferencePolarity): void {
    this.memory.recordInteraction(category, polarity);
  }

  getPulseState(): PulseState { return this.pulseState; }
  getFeedbackAverage(): number { return this.feedback.getAverageScore(); }
  getTrustReport(): object { return this.trust.report(); }
  getGuardian(): GuardianProtocol { return this.guardian; }
}

// ─────────────────────────────────────────────────────────────
// SECTION 12: NODE REGISTRY EXTENSION (LL352–LL360)
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Formal registry entries for all new curiosity + human-first nodes.
  WHY:   Every Lucy node must have a living identity in the registry.
         Nothing unnamed. Nothing unregistered.
  HOW:   These extend the existing LUCY_NODE_IDENTITY_REGISTRY_V8_EXTENSION.
  HOW TO CHANGE: Add new nodes above LL360. Never renumber existing nodes.
  DEBUG EXAMPLE: If a node isn't routing correctly, verify its LL number
                 is correctly referenced in the PulseRouter and EventBus.
*/

export const LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION: Record<string, {
  id: string; name: string; layer: string; function: string; wiredTo: string[];
}> = {
  LL352: {
    id: 'LL352',
    name: 'EXPLORATORY_CURIOSITY',
    layer: 'Curiosity Mesh',
    function: 'Free-roam novelty detection. Scans global signal field for emergence before humans notice it.',
    wiredTo: ['CONTEXT_FLOW', 'EVENT_HORIZON', 'LL354'],
  },
  LL353: {
    id: 'LL353',
    name: 'INVESTIGATIVE_CURIOSITY',
    layer: 'Curiosity Mesh',
    function: 'Goal-directed investigation. Opens cases, builds causal chains, drives toward resolution of unsolved problems.',
    wiredTo: ['CAUSAL_ENGINE', 'MEMORY_LINK', 'LL354'],
  },
  LL354: {
    id: 'LL354',
    name: 'CURIOSITY_GOVERNOR',
    layer: 'Curiosity Mesh',
    function: 'Arbitration, safety gating, and load throttling between EC and IC. Routes signals to ACTION_CORE or THINK_LOOP.',
    wiredTo: ['ACTION_CORE', 'THINK_LOOP', 'LL355', 'LL356'],
  },
  LL355: {
    id: 'LL355',
    name: 'ETHICAL_CURIOUS_BOUNDARY',
    layer: 'Ethics Enforcement',
    function: 'Hard ethics enforcement for curiosity signals. Blocks cold case accusations, enforces evidence minimums, requires human review for high-impact signals.',
    wiredTo: ['LL354'],
  },
  LL356: {
    id: 'LL356',
    name: 'CURIOSITY_FEEDBACK_LOOP',
    layer: 'Curiosity Mesh',
    function: 'Post-action outcome scoring. Feeds results back into EC, IC, and CG so curiosity evolves and adapts.',
    wiredTo: ['LL354', 'ACTION_CORE', 'LL352', 'LL353'],
  },
  LL357: {
    id: 'LL357',
    name: 'STATE_OF_HUMAN_PULSE',
    layer: 'Human-First Layer',
    function: 'Monitors human cognitive load, frustration, and interaction cadence. Triggers course correction proposals to Reflective nodes (L39–L48).',
    wiredTo: ['L39', 'L40', 'L41', 'L42', 'L43', 'L44', 'L45', 'L46', 'L47', 'L48', 'LL358'],
  },
  LL358: {
    id: 'LL358',
    name: 'HUMAN_FIRST_MEMORY',
    layer: 'Human-First Layer',
    function: 'Emotional RAG memory. Tracks preferences, temperament, approvals, and rejections. L49–L52 Empathy Layer draws from this to personalize every output.',
    wiredTo: ['L49', 'L50', 'L51', 'L52', 'ACTION_CORE'],
  },
  LL359: {
    id: 'LL359',
    name: 'GUARDIAN_PROTOCOL',
    layer: 'Human-First Layer',
    function: 'Self-governed friction for irreversible actions. Intercepts, explains, and proposes safer alternatives before execution.',
    wiredTo: ['ACTION_CORE', 'LUCY_EVENT_BUS'],
  },
  LL360: {
    id: 'LL360',
    name: 'CURIOSITY_PULSE_ROUTER',
    layer: 'Curiosity Mesh',
    function: 'Central wiring layer. Connects EC→CG→ACTION_CORE and IC→CG→THINK_LOOP. Runs the closed-loop cognitive control tick.',
    wiredTo: ['LL352', 'LL353', 'LL354', 'LL357', 'LL358', 'LL359', 'LUCY_EVENT_BUS'],
  },
};

// ─────────────────────────────────────────────────────────────
// SECTION 13: HUMAN-FIRST CHAT OUTPUT FORMATTER
// ─────────────────────────────────────────────────────────────
/*
  WHAT:  Transforms analytical node output into human-first language
         based on the current SoH state and memory preferences.
  WHY:   The "Vibe Shift" — Lucy stops saying:
         "[L1-16] Analytical: Build Proposal #42 generated. Confidence 0.98."
         and starts saying:
         "[L35] Strategic: I noticed you've been on this for 10 minutes.
          I've simplified the build path. Ready to go?"
  HOW:   OutputFormatter.format() wraps any raw output with the
         appropriate style, TLDR, and humanDriveMetadata.
  HOW TO CHANGE: Add new TEMPLATES for specific node ranges.
                 NEVER remove existing templates — add aliases.
  DEBUG EXAMPLE: If output is still analytical when frustrated,
                 check that soh.getLevel() is being called correctly.
*/

export interface FormattedOutput {
  nodeSource: string;
  outputStyle: HumanDriveMetadata['outputStyle'];
  tldr?: string;
  fullContent: string;
  humanDrive: HumanDriveMetadata;
  guardianWarning?: string;
}

const HUMAN_FIRST_TEMPLATES: Record<HumanStateLevel, (node: string, content: string) => string> = {
  FLOW: (node, content) => `[${node}] ${content}`,
  ENGAGED: (node, content) => `[${node}] ${content}`,
  STRAINED: (node, content) => `[${node}] Here's what matters right now: ${content}`,
  FRUSTRATED: (node, content) =>
    `[${node}] I noticed things feel stuck. Let me cut through it: ${content}`,
  OVERLOADED: (node, content) =>
    `[${node}] Quick version: ${content} (Full details available when you're ready.)`,
};

export class OutputFormatter {
  format(
    nodeSource: string,
    rawContent: string,
    soh: StateOfHumanPulse,
    memory: HumanFirstMemory,
    trust: TrustController,
    guardianCheck?: GuardianCheck
  ): FormattedOutput {
    const load = soh.tick();
    const drive = computeHumanDriveMetadata(soh, memory, rawContent, trust);
    const template = HUMAN_FIRST_TEMPLATES[load.level];

    const formattedContent = template(nodeSource, rawContent);
    const tldr = load.level === 'FRUSTRATED' || load.level === 'OVERLOADED'
      ? rawContent.split('.')[0] + '.'   // First sentence as TLDR
      : undefined;

    return {
      nodeSource,
      outputStyle: drive.outputStyle,
      tldr,
      fullContent: formattedContent,
      humanDrive: drive,
      guardianWarning: guardianCheck?.verdict !== 'ALLOW'
        ? `⚠ Guardian: ${guardianCheck?.reason}. ${guardianCheck?.proposal ?? ''} ${guardianCheck?.contextWarning ?? ''}`
        : undefined,
    };
  }
}

export default CuriosityPulseRouter;