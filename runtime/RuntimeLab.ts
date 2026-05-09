/**
 * WHAT THIS DOES:
 * Provides Lucy-core-AI's RuntimeLab scaffold for replayable test sessions across
 * FiveM, NUI, UE5, Blender, GTA map validation, and general app/runtime checks.
 *
 * WHY THIS EXISTS:
 * Lucy must test like a real user/player when possible. Build success is not enough;
 * replayable sessions let Lucy reproduce bugs, compare fixes, and prove stability.
 *
 * HOW THIS WORKS:
 * RuntimeLab records ReplayableRuntimeSession objects with steps, logs, environment
 * snapshots, timestamps, and replay ids. This scaffold records sessions in memory and
 * does not launch real runtimes yet.
 *
 * HOW TO CHANGE IT:
 * Add runtime adapters for FiveM dev server, NUI browser preview, UE5 test maps, and
 * Blender batch scripts. Keep server restarts and risky commands routed through
 * ActionEngine.
 *
 * DEBUG EXAMPLE:
 * If a FiveM NUI menu crashes only after a specific click sequence, store those steps
 * in RuntimeLab and replay them after the fix to verify the crash is gone.
 */

export interface RuntimeStep {
  index: number;
  action: string;
  target?: string;
  expected?: string;
}

export interface RuntimeLog {
  timestamp: number;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
}

export interface ReplayableRuntimeSession {
  replayId: string;
  environmentSnapshot: string;
  steps: RuntimeStep[];
  logs: RuntimeLog[];
  startedAt: number;
  completedAt?: number;
}

export class RuntimeLab {
  private readonly sessions = new Map<string, ReplayableRuntimeSession>();

  startSession(environmentSnapshot: string, steps: RuntimeStep[] = []): ReplayableRuntimeSession {
    const session: ReplayableRuntimeSession = {
      replayId: this.makeId('replay'),
      environmentSnapshot,
      steps,
      logs: [],
      startedAt: Date.now()
    };
    this.sessions.set(session.replayId, session);
    return session;
  }

  addLog(replayId: string, log: Omit<RuntimeLog, 'timestamp'> & Partial<Pick<RuntimeLog, 'timestamp'>>): void {
    const session = this.requireSession(replayId);
    session.logs.push({ ...log, timestamp: log.timestamp ?? Date.now() });
  }

  completeSession(replayId: string): ReplayableRuntimeSession {
    const session = this.requireSession(replayId);
    session.completedAt = Date.now();
    return session;
  }

  getSession(replayId: string): ReplayableRuntimeSession | undefined {
    return this.sessions.get(replayId);
  }

  private requireSession(replayId: string): ReplayableRuntimeSession {
    const session = this.sessions.get(replayId);
    if (!session) throw new Error(`Unknown runtime replay session: ${replayId}`);
    return session;
  }

  private makeId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}
