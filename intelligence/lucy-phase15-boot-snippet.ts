// ─────────────────────────────────────────────────────────────
// LUCY PHASE 15 — Curiosity Stack V2 (auto-injected by installer)
// ─────────────────────────────────────────────────────────────
import { bootPhase15 } from './intelligence-index.js';
import { lucyEventBus as bus } from '../core/events/LucyEventBus.js';
import { actionEngine } from '../core/action/ActionEngine.js';

export const phase15 = await bootPhase15(bus, actionEngine, {
  initialTrustScore: 30,
  tickIntervalMs: 5000,
  enableDebugLogging: process.env.NODE_ENV !== 'production',
});
// Pass phase15 handle to Phase 16 when installing the next stack.