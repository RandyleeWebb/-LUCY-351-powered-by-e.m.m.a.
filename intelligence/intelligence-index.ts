/**
 * ============================================================
 * LUCY SOVEREIGN 137 — PHASE 15: CURIOSITY STACK V2
 * Human-First Architecture Entry Point
 * ============================================================
 *
 * INSTALL ORDER:  [Lucy v7 Base] → [Phase 15 ← YOU ARE HERE]
 *
 * This index wires every Phase 15 module into a single
 * bootable stack. Import this file from your Lucy v7 root
 * bootstrap (typically lucy-core/src/boot.ts) and call
 * bootPhase15(bus, actionEngine).
 *
 * Nodes registered by this phase:
 *   LL352 — ExploratoryCoriosityEngine  (EC)
 *   LL353 — InvestigativeCuriosityEngine (IC)
 *   LL354 — CuriosityGovernor           (CG)
 *   LL355 — EthicalCuriousBoundary      (ECB)
 *   LL356 — CuriosityFeedbackLoop       (CFL)
 *   LL357 — StateOfHumanPulse           (SoH)
 *   LL358 — HumanFirstMemory            (HFM)
 *   LL359 — GuardianProtocol            (GP)
 *   LL360 — CuriosityPulseRouter        (CPR)
 * ============================================================
 */

// ── Core module re-exports ────────────────────────────────────
export * from './LUCY_CURIOSITY_STACK_V2_MODULES';

// ── Convenience named re-exports for tree-shaking ────────────
export {
  // Trust layer
  TrustController,
  TRUST_PROFILES,

  // Curiosity engines
  ExploratoryCoriosityEngine,
  InvestigativeCuriosityEngine,
  CuriosityGovernor,
  EthicalCuriousBoundary,
  CuriosityFeedbackLoop,

  // Human pulse & memory
  StateOfHumanPulse,
  HumanFirstMemory,

  // Safety
  GuardianProtocol,

  // Router (top-level orchestrator for this phase)
  CuriosityPulseRouter,

  // Output formatter
  OutputFormatter,

  // Node registry
  LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION,
} from './LUCY_CURIOSITY_STACK_V2_MODULES';

// ── Phase 15 boot function ────────────────────────────────────
/**
 * bootPhase15()
 *
 * Call this once from your Lucy v7 root bootstrap AFTER
 * the base EventBus and ActionEngine are online.
 *
 * @param bus        - Your LucyEventBus instance (v7 compatible)
 * @param actionEngine - Your ActionEngine instance
 * @param options    - Optional config overrides
 * @returns          BootedPhase15 handle with all live instances
 *
 * Example:
 * ```ts
 * import { bootPhase15 } from '@lucy-sovereign/phase15-curiosity-stack';
 * import { bus, actionEngine } from '../lucy-v7-base/boot';
 *
 * const phase15 = await bootPhase15(bus, actionEngine);
 * console.log('Phase 15 online:', phase15.router.getState());
 * ```
 */

import {
  CuriosityPulseRouter,
  TrustController,
  StateOfHumanPulse,
  HumanFirstMemory,
  GuardianProtocol,
  CuriosityGovernor,
  ExploratoryCoriosityEngine,
  InvestigativeCuriosityEngine,
  EthicalCuriousBoundary,
  CuriosityFeedbackLoop,
  OutputFormatter,
  LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION,
  type TrustLevel,
  type HumanDriveMetadata,
  type CuriositySignalEnvelope,
  type FeedbackEvent,
  type InteractionEvent,
} from './LUCY_CURIOSITY_STACK_V2_MODULES';

// ── Minimal interface stubs for v7 base types ─────────────────
// Replace with actual imports from your lucy-v7-base package
export interface LucyEventBus {
  emit(event: string, payload: unknown): void;
  on(event: string, handler: (payload: unknown) => void): void;
  off(event: string, handler: (payload: unknown) => void): void;
}

export interface ActionEngine {
  execute(action: string, payload: unknown): Promise<unknown>;
  canExecute(action: string): boolean;
}

export interface Phase15Options {
  initialTrustScore?: number;
  initialTrustLevel?: TrustLevel;
  tickIntervalMs?: number;
  enableDebugLogging?: boolean;
  feedAdapters?: FeedAdapter[];
}

export interface FeedAdapter {
  id: string;
  fetch(): Promise<Array<{ id: string; title: string; summary: string; domain?: string; novelty?: number }>>;
}

export interface BootedPhase15 {
  // Live instances — access these from Phase 16/17 for wiring
  router:        CuriosityPulseRouter;
  trustCtrl:     TrustController;
  soh:           StateOfHumanPulse;
  hfm:           HumanFirstMemory;
  guardian:      GuardianProtocol;
  governor:      CuriosityGovernor;
  ec:            ExploratoryCoriosityEngine;
  ic:            InvestigativeCuriosityEngine;
  ecb:           EthicalCuriousBoundary;
  feedbackLoop:  CuriosityFeedbackLoop;
  formatter:     OutputFormatter;

  // Utility methods
  reportOutcome(event: FeedbackEvent): void;
  reportHumanInteraction(event: InteractionEvent): void;
  getHumanDriveMetadata(): HumanDriveMetadata;

  // Lifecycle
  stop(): void;
  getNodeRegistry(): typeof LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION;
}

export async function bootPhase15(
  bus: LucyEventBus,
  actionEngine: ActionEngine,
  options: Phase15Options = {}
): Promise<BootedPhase15> {
  const {
    initialTrustScore  = 30,
    initialTrustLevel  = 'COPILOT',
    tickIntervalMs     = 5000,
    enableDebugLogging = false,
    feedAdapters       = [],
  } = options;

  if (enableDebugLogging) {
    console.log('[Phase15] Booting Curiosity Stack V2...');
  }

  // ── 1. Instantiate all nodes ──────────────────────────────
  const trustCtrl    = TrustController.getInstance();
  trustCtrl.adjustScore(initialTrustScore - trustCtrl.getScore(), 'phase15-boot-init');

  const soh          = new StateOfHumanPulse();
  const hfm          = new HumanFirstMemory();
  const guardian     = new GuardianProtocol();
  const ec           = new ExploratoryCoriosityEngine();
  const ic           = new InvestigativeCuriosityEngine();
  const ecb          = new EthicalCuriousBoundary();
  const governor     = new CuriosityGovernor();
  const feedbackLoop = new CuriosityFeedbackLoop(governor);
  const formatter    = new OutputFormatter();

  // ── 2. Build router (CPR — LL360) ────────────────────────
  const router = new CuriosityPulseRouter();

  // Register any custom feed adapters
  for (const adapter of feedAdapters) {
    router.registerFeedAdapter(() => {
      // Call fetch but do not block, as adapter is expected to be sync. In a real system, feed reading may be async and should push to the router.
      adapter.fetch().catch(console.error);
      return [];
    });
  }

  // ── 3. Wire EventBus → Phase 15 events ───────────────────
  bus.on('curiosity.feedback', (payload) => {
    router.reportActionOutcome(payload as FeedbackEvent);
  });

  bus.on('human.interaction', (payload) => {
    router.reportHumanInteraction(payload as InteractionEvent);
  });

  bus.on('trust.adjust', (payload) => {
    const p = payload as { delta: number; reason: string };
    trustCtrl.adjustScore(p.delta, p.reason);
    bus.emit('trust.updated', {
      score: trustCtrl.getScore(),
      level: trustCtrl.getLevel(),
    });
  });

  // ── 4. Wire Phase 15 → EventBus (outbound) ───────────────
  // The router's tick() emits decisions — forward to ActionEngine
  const tickLoop = async () => {
    try {
      const state = await router.tick();

      // Broadcast pulse state
      bus.emit('curiosity.pulse', state);

      // Forward each decision to ActionEngine
      if (state.curiosityDecisions && state.curiosityDecisions.length > 0) {
        for (const decision of state.curiosityDecisions) {
          if (decision.action === 'ROUTE_TO_ACTION' && actionEngine.canExecute('ROUTE_TO_ACTION')) {
            bus.emit('curiosity.action.dispatched', { decision });
            await actionEngine.execute('ROUTE_TO_ACTION', decision);
          } else if (decision.action === 'ROUTE_TO_THINK') {
            bus.emit('curiosity.think.dispatched', { decision });
          } else if (decision.action === 'QUEUE' || decision.action === 'SUPPRESS') {
            bus.emit('curiosity.hold', { decision, reason: decision.reason });
          }
        }
      }

      if (enableDebugLogging) {
        console.log(`[Phase15] tick complete — ${state.curiosityDecisions?.length ?? 0} decisions`);
      }
    } catch (err) {
      console.error('[Phase15] tick error:', err);
      bus.emit('phase15.error', { error: String(err), ts: Date.now() });
    }
  };

  // ── 5. Start tick loop ────────────────────────────────────
  const intervalHandle = setInterval(tickLoop, tickIntervalMs);

  if (enableDebugLogging) {
    console.log(`[Phase15] ✓ Online — tick every ${tickIntervalMs}ms`);
    console.log('[Phase15] Nodes registered:', Object.values(LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION).map(n => n.id));
  }

  // ── 6. Announce to bus ────────────────────────────────────
  bus.emit('phase.booted', {
    phase: 15,
    stackName: 'CURIOSITY_STACK_V2',
    nodes: Object.values(LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION).map(n => n.id),
    ts: Date.now(),
  });

  // ── 7. Return handle ──────────────────────────────────────
  return {
    router, trustCtrl, soh, hfm, guardian,
    governor, ec, ic, ecb, feedbackLoop, formatter,

    reportOutcome: (event: FeedbackEvent) => router.reportActionOutcome(event),
    reportHumanInteraction: (event: InteractionEvent) => router.reportHumanInteraction(event),

    getHumanDriveMetadata(): HumanDriveMetadata {
      const cohLoad = soh.tick();
      const filter  = hfm.buildOutputFilter();
      return {
        alignmentScore:      0.7,
        autonomyLevel:       trustCtrl.getLevel() === 'SOVEREIGN' ? 'PROACTIVE' :
                             trustCtrl.getLevel() === 'PARTNER'   ? 'ASSISTIVE'  : 'PASSIVE',
        frictionReduction:   `Trust:${trustCtrl.getLevel()} | Load:${cohLoad.level}`,
        outputStyle:         cohLoad.level === 'OVERLOADED' ? 'MINIMAL' :
                             cohLoad.level === 'FRUSTRATED' ? 'SUMMARIZED' :
                             (filter.suggestedTone === 'CONCISE' || filter.suggestedTone === 'EMPATHETIC' ? 'SUMMARIZED' : filter.suggestedTone),
        tldrAvailable:       cohLoad.level !== 'FLOW',
        humanStateAtTime:    cohLoad.level,
        filterApplied:       filter.suppressCategories.length > 0 || filter.boostCategories.length > 0,
        estimatedTimeSavedMs: cohLoad.level === 'STRAINED' ? 30000 : undefined,
      };
    },

    stop() {
      clearInterval(intervalHandle);
      bus.emit('phase.stopped', { phase: 15, ts: Date.now() });
      if (enableDebugLogging) console.log('[Phase15] Stopped.');
    },

    getNodeRegistry: () => LUCY_NODE_REGISTRY_CURIOSITY_EXTENSION,
  };
}

// ── Phase 15 version metadata ─────────────────────────────────
export const PHASE15_META = {
  phase:      15,
  version:    '15.0.0',
  stackName:  'CURIOSITY_STACK_V2',
  nodesAdded: ['LL352','LL353','LL354','LL355','LL356','LL357','LL358','LL359','LL360'],
  builtAt:    '2025-05-02',
  requiresBase: 'lucy-sovereign-v7',
  nextPhase:  16,
} as const;