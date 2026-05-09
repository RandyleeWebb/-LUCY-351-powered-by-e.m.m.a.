import { useCallback, useEffect, useState } from 'react';

export type EarthDataset = {
  source: string;
  timestamp: string;
  freshness: 'fresh' | 'stale' | 'missing';
  data: Record<string, unknown> | null;
  error?: string;
};
export type EarthResponse = {
  timestamp: number;
  normalizedAt: string;
  datasets: Record<string, EarthDataset>;
  sourceHealth: { freshCount: number; staleCount: number; missingCount: number; isStale: boolean; isMissing: boolean };
  sources: Record<string, { status: 'fresh' | 'stale' | 'missing'; summary: string }>;
  earth: { stability: number; climatePressure: number; seismicPressure: number; resourceStrain: number };
};

export type LiveEarthItem = Record<string, unknown> & { type: string };
export type LiveEarthResponse = {
  timestamp: string;
  totalEvents: number;
  sources: string[];
  sourceHealth: Record<string, 'ok' | 'fail'>;
  sourceCounts: Record<string, number>;
  sourceSummaries?: Record<string, string>;
  sourceErrors?: Record<string, string>;
  hazardSummary?: Record<string, number>;
  staleCount: number;
  missingCount: number;
  data: LiveEarthItem[];
};

export type TwinEarthResponse = { timestamp: number; simA: { mode: 'current-baseline'; earth: EarthResponse['earth']; livePressure?: number }; simB: { mode: 'accelerated-projection'; earth: EarthResponse['earth']; sources?: Record<string, number> }; earth2?: { enabled: boolean; configured: boolean; summary: string; forecast: unknown | null; lastRun: string | null } };
export type DeltaVaultEntry = { id: string; timestamp: number; actionType: string; decision: 'approved'; payload: unknown; reason: string; previousHash: string | null; entryHash: string };
export type DeltaVaultIntegrity = { ok: boolean; checked: number; brokenAt: string | null };
export type ReviewResponse = { ok: boolean; approval: { decision: 'approved' | 'rejected'; level: 'low' | 'medium' | 'high'; reason: string; approvedAt: number }; ledgerEntry?: DeltaVaultEntry; executed: boolean };
export type SentinelSignal = { key: string; level: 'normal' | 'watch' | 'warning'; value: number; summary: string };
export type SentinelTrendPoint = { timestamp: number; driftIndex: number; stabilityDelta: number; climateDelta: number; seismicDelta: number; resourceDelta: number };
export type SentinelResponse = {
  timestamp: number; driftIndex: number; stabilityDelta: number; climateDelta: number; seismicDelta: number; resourceDelta: number;
  signals: SentinelSignal[];
  trend: { points: SentinelTrendPoint[]; direction: 'stable' | 'rising' | 'falling'; averageDrift: number; latestDrift: number };
  governance: { totalEntries: number; recentEntries: number; approvalCount: number; rejectionCount: number; reviewSpike: boolean; ledgerBurst: boolean };
  dataQuality: { freshCount: number; staleCount: number; missingCount: number; isStale: boolean; isMissing: boolean };
};
export type EagleEyeResponse = { timestamp: number; overall: 'stable' | 'watch' | 'warning'; pressureIndex: number; confidence: number; trusted: boolean; contradictionCount: number; validationIssues: string[]; contradictionIssues: string[] };
export type TrustResponse = { timestamp: number; score: number; level: 'low' | 'guarded' | 'stable' | 'strong' };
export type RewardResponse = { timestamp: number; score: number; level: 'low' | 'building' | 'stable' | 'strong'; eligible: boolean };
export type HumanApprovalItem = { id: string; level: 'medium' | 'high'; reason: string; createdAt: number; status: 'pending-human-visibility' };
export type HumanApprovalDecision = { id: string; itemId: string; decision: 'approved' | 'rejected'; decidedBy: string; reason: string; decidedAt: number };
export type HumanApprovalResponse = { timestamp: number; pendingCount: number; visible: boolean; items: HumanApprovalItem[] };
export type ExecutionGateResponse = { timestamp: number; ready: boolean; blocked: boolean; reasons: string[]; approvedDecisionCount: number };
export type ExecutionSimulationPreview = { timestamp: number; simulationOnly: true; readyForSimulation: boolean; blocked: boolean; reasons: string[]; packetPreview: { sourceHumanDecisionId: string; sourceItemId: string; decidedBy: string; decidedAt: number; latestLedgerEntryId: string | null; latestLedgerActionType: string | null; mode: 'dry-run' } | null };
export type ExecutionSimulationRunResponse = { ok: boolean; simulated: boolean; blocked: boolean; reasons?: string[]; packet?: ExecutionSimulationPreview; ledgerEntry?: DeltaVaultEntry };
export type UpgradeProposal = { id: string; title: string; summary: string; proposedBy: string; category: string; status: 'pending' | 'approved' | 'rejected'; createdAt: number; decidedAt: number | null; decidedBy: string | null; decisionReason: string };
export type LucySessionMessage = { id: string; role: 'user' | 'assistant'; text: string; createdAt: number };
export type EarthCatalogEntry = { source: string; label: string; kind: string; pollMinutes: number };
export type Earth2Status = { configured: boolean; enabled: boolean; bridge: string; localOnly: boolean; lastRun: string | null; hasForecast: boolean; summary: string; forecast: unknown | null };

export type ToolbeltPack = { id: string; label: string; type: string; primary: string; refs: string[]; tags: string[]; active: boolean; sourceMode: string; planningOnly: boolean; version: string | null; createdAt: number; updatedAt: number };
export type ToolbeltActive = { userId: string; activePackIds: string[]; mode: string; timestamp: number | null; lastResolvedFrom: string | null };

export type BuilderConfig = { current: { ue5Path: string; unityPath: string; blenderPath: string; godotPath: string; projectPath: string; fivemRoot: string; handbookUrls: { fivemPrimary: string; fivemFirstScript: string; fivemFxmanifest: string; fivemNatives: string; fivemCommunity: string } }; updatedAt: string | null };
export type BuildPipelineStep = { id: number; action: string; desc: string; command: string; status: string; output: string; error: string; approvedAt: string | null; startedAt: string | null; finishedAt: string | null };
export type BuildPipeline = { id: string; request: string; engine: string; status: string; createdAt: string; updatedAt: string; proposedBy: string; estimatedSize: string; missingConfig: string[]; steps: BuildPipelineStep[]; eventLog: { at: string; type: string; message: string }[] };

export function useLucyStore() {
  const [earth, setEarth] = useState<EarthResponse | null>(null);
  const [liveEarth, setLiveEarth] = useState<LiveEarthResponse | null>(null);
  const [twinEarth, setTwinEarth] = useState<TwinEarthResponse | null>(null);
  const [earthCatalog, setEarthCatalog] = useState<EarthCatalogEntry[]>([]);
  const [earth2Status, setEarth2Status] = useState<Earth2Status | null>(null);
  const [sentinel, setSentinel] = useState<SentinelResponse | null>(null);
  const [eagleEye, setEagleEye] = useState<EagleEyeResponse | null>(null);
  const [trust, setTrust] = useState<TrustResponse | null>(null);
  const [reward, setReward] = useState<RewardResponse | null>(null);
  const [humanApproval, setHumanApproval] = useState<HumanApprovalResponse | null>(null);
  const [humanApprovalDecisions, setHumanApprovalDecisions] = useState<HumanApprovalDecision[]>([]);
  const [executionGate, setExecutionGate] = useState<ExecutionGateResponse | null>(null);
  const [simulationPreview, setSimulationPreview] = useState<ExecutionSimulationPreview | null>(null);
  const [lastSimulationResult, setLastSimulationResult] = useState<ExecutionSimulationRunResponse | null>(null);
  const [upgradeProposals, setUpgradeProposals] = useState<UpgradeProposal[]>([]);
  const [lucyMessages, setLucyMessages] = useState<LucySessionMessage[]>([]);
  const [builderConfig, setBuilderConfig] = useState<BuilderConfig | null>(null);
  const [toolbeltPacks, setToolbeltPacks] = useState<ToolbeltPack[]>([]);
  const [activeToolbelt, setActiveToolbelt] = useState<ToolbeltActive | null>(null);
  const [pipelines, setPipelines] = useState<BuildPipeline[]>([]);
  const [ledger, setLedger] = useState<DeltaVaultEntry[]>([]);
  const [ledgerIntegrity, setLedgerIntegrity] = useState<DeltaVaultIntegrity | null>(null);
  const [lastReview, setLastReview] = useState<ReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decisionSubmittingId, setDecisionSubmittingId] = useState<string | null>(null);
  const [simulationSubmitting, setSimulationSubmitting] = useState(false);
  const [proposalSubmitting, setProposalSubmitting] = useState(false);
  const [proposalDecisionSubmittingId, setProposalDecisionSubmittingId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [nodeLayerCounts, setNodeLayerCounts] = useState<Record<string, number>>({});
  const [systemState, setSystemState] = useState<any>(null);
  const [lucySubmitting, setLucySubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [stateRes, nodesRes, bridgeRes, deltaRes] = await Promise.all([
      fetch('/api/state'),
      fetch('/api/nodes'),
      fetch('/api/bridges/status'),
      fetch('/api/deltavault/events'),
    ]);

    if (!stateRes.ok || !nodesRes.ok || !bridgeRes.ok || !deltaRes.ok) {
      throw new Error('Failed to fetch system state from Lucy backend.');
    }

    const state = await stateRes.json();
    const nodesData = await nodesRes.json();
    const bridges = await bridgeRes.json();
    const delta = await deltaRes.json();

    // Map backend data to store state
    setSystemState(state);
    setNodes(nodesData.nodes || []);
    setNodeLayerCounts(nodesData.layerCounts || {});
    setLedger(delta.events || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await load();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown Emma error.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [load]);

  const submitApprovedAction = useCallback(async (type: string, payload: unknown) => {
    try {
      setSubmitting(true); setError(null);
      const res = await fetch('http://localhost:3000/actions/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, payload }) });
      const data = await res.json() as ReviewResponse;
      setLastReview(data);
      if (!res.ok || !data.ok) throw new Error(data.approval?.reason || 'Emma rejected action.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action review failed.');
    } finally { setSubmitting(false); }
  }, [load]);

  const submitHumanApprovalDecision = useCallback(async (itemId: string, decision: 'approved' | 'rejected') => {
    try {
      setDecisionSubmittingId(itemId); setError(null);
      const res = await fetch('http://localhost:3000/humanapproval/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemId, decision, decidedBy: 'local-operator', reason: `UI human decision: ${decision}` }) });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Human approval decision failed.');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Human approval decision failed.'); }
    finally { setDecisionSubmittingId(null); }
  }, [load]);

  const runSimulation = useCallback(async () => {
    try {
      setSimulationSubmitting(true); setError(null);
      const res = await fetch('http://localhost:3000/execution-simulate', { method: 'POST' });
      const data = await res.json() as ExecutionSimulationRunResponse;
      setLastSimulationResult(data);
      if (!res.ok || !data.ok) throw new Error(data.reasons?.join(' ') || 'Simulation failed.');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Simulation failed.'); }
    finally { setSimulationSubmitting(false); }
  }, [load]);

  const submitUpgradeProposal = useCallback(async (proposal: { title: string; summary: string; proposedBy: string; category: string }) => {
    try {
      setProposalSubmitting(true); setError(null);
      const res = await fetch('http://localhost:3000/upgrades/proposals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proposal) });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Upgrade proposal failed.');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Upgrade proposal failed.'); }
    finally { setProposalSubmitting(false); }
  }, [load]);

  const submitUpgradeProposalDecision = useCallback(async (proposalId: string, decision: 'approved' | 'rejected') => {
    try {
      setProposalDecisionSubmittingId(proposalId); setError(null);
      const res = await fetch('http://localhost:3000/upgrades/proposals/decision', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalId, decision, decidedBy: 'local-operator', reason: `UI proposal decision: ${decision}` }) });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || 'Upgrade proposal decision failed.');
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Upgrade proposal decision failed.'); }
    finally { setProposalDecisionSubmittingId(null); }
  }, [load]);

  const sendLucyMessage = useCallback(async (text: string) => {
    try {
      setLucySubmitting(true); setError(null);
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
      const data = await res.json() as { reply?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error || 'Lucy message failed.');
      
      const assistantMsg: LucySessionMessage = { id: `lucy_${Date.now()}`, role: 'assistant', text: data.reply || '', createdAt: Date.now() };
      setLucyMessages(prev => [...prev, assistantMsg]);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Lucy message failed.'); }
    finally { setLucySubmitting(false); }
  }, [load]);

  const refreshLiveEarth = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('http://localhost:3000/earth/refresh', { method: 'POST' });
      if (!res.ok) throw new Error('Live Earth refresh failed.');
      setLiveEarth(await res.json());
      const twinRes = await fetch('http://localhost:3000/twinearth');
      if (twinRes.ok) setTwinEarth(await twinRes.json());
    } catch (err) { setError(err instanceof Error ? err.message : 'Live Earth refresh failed.'); }
  }, []);

  const runBuildTask = useCallback(async (task: any) => {
    try {
      setLucySubmitting(true); setError(null);
      const res = await fetch('/api/builder/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(task) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Builder task failed.');
      return data.result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Builder task failed.');
      throw err;
    } finally { setLucySubmitting(false); }
  }, []);

  return {
    nodes, nodeLayerCounts, systemState,
    earth, liveEarth, twinEarth, earthCatalog, earth2Status, sentinel, eagleEye, trust, reward, humanApproval, humanApprovalDecisions,
    executionGate, simulationPreview, lastSimulationResult, upgradeProposals, lucyMessages, builderConfig, toolbeltPacks, activeToolbelt, pipelines, ledger, ledgerIntegrity,
    lastReview, loading, submitting, decisionSubmittingId, simulationSubmitting, proposalSubmitting,
    proposalDecisionSubmittingId, lucySubmitting, error, submitApprovedAction, submitHumanApprovalDecision,
    runSimulation, submitUpgradeProposal, submitUpgradeProposalDecision, sendLucyMessage, refreshLiveEarth, runBuildTask,
  };
}
