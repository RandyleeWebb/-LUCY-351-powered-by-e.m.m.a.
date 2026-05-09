import { useMemo, useState } from 'react';
import type {
  EarthResponse,
  LiveEarthResponse,
  TwinEarthResponse,
  EarthCatalogEntry,
  Earth2Status,
  DeltaVaultEntry,
  DeltaVaultIntegrity,
  ReviewResponse,
  SentinelResponse,
  EagleEyeResponse,
  TrustResponse,
  RewardResponse,
  HumanApprovalResponse,
  HumanApprovalDecision,
  ExecutionGateResponse,
  ExecutionSimulationPreview,
  ExecutionSimulationRunResponse,
  UpgradeProposal,
  LucySessionMessage, BuilderConfig, BuildPipeline, ToolbeltPack, ToolbeltActive,
} from '../state/lucyStore';

type LucyShellProps = {
  earth: EarthResponse | null;
  liveEarth: LiveEarthResponse | null;
  twinEarth: TwinEarthResponse | null;
  earthCatalog: EarthCatalogEntry[];
  earth2Status: Earth2Status | null;
  sentinel: SentinelResponse | null;
  eagleEye: EagleEyeResponse | null;
  trust: TrustResponse | null;
  reward: RewardResponse | null;
  humanApproval: HumanApprovalResponse | null;
  humanApprovalDecisions: HumanApprovalDecision[];
  executionGate: ExecutionGateResponse | null;
  simulationPreview: ExecutionSimulationPreview | null;
  lastSimulationResult: ExecutionSimulationRunResponse | null;
  upgradeProposals: UpgradeProposal[];
  lucyMessages: LucySessionMessage[];
  builderConfig: BuilderConfig | null;
  toolbeltPacks: ToolbeltPack[];
  activeToolbelt: ToolbeltActive | null;
  pipelines: BuildPipeline[];
  ledger: DeltaVaultEntry[];
  ledgerIntegrity: DeltaVaultIntegrity | null;
  lastReview: ReviewResponse | null;
  loading: boolean;
  submitting: boolean;
  decisionSubmittingId: string | null;
  simulationSubmitting: boolean;
  proposalSubmitting: boolean;
  proposalDecisionSubmittingId: string | null;
  lucySubmitting: boolean;
  error: string | null;
  onRunApprovalTest: () => void;
  onHumanDecision: (itemId: string, decision: 'approved' | 'rejected') => void;
  onRunSimulation: () => void;
  onCreateProposal: (proposal: { title: string; summary: string; proposedBy: string; category: string }) => void;
  onProposalDecision: (proposalId: string, decision: 'approved' | 'rejected') => void;
  onSendLucyMessage: (text: string) => void;
  onRefreshLiveEarth: () => void;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: '#9aa4c7', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={{ background: '#0a0e27', border: '1px solid rgba(0,217,255,.15)', borderRadius: 16, padding: 20, display: 'grid', gap: 14 }}>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{title}</div>
        {subtitle ? <div style={{ color: '#9aa4c7', marginTop: 4 }}>{subtitle}</div> : null}
      </div>
      {children}
    </section>
  );
}


function percent(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Unavailable';
  return `${Math.round(value * 100)}%`;
}

function healthTone(status: string | undefined) {
  return status === 'ok' ? '#16a34a' : '#dc2626';
}

function sourceTitle(source: string) {
  return source.replace(/(^|[-_])(\w)/g, (_m, _a, c) => ` ${c.toUpperCase()}`).trim();
}
export function LucyShell(props: LucyShellProps) {
  const {
    earth, liveEarth, twinEarth, earthCatalog, earth2Status, sentinel, eagleEye, trust, reward, humanApproval, humanApprovalDecisions,
    executionGate, simulationPreview, lastSimulationResult, upgradeProposals, lucyMessages, builderConfig, pipelines,
    toolbeltPacks, activeToolbelt,
    ledger, ledgerIntegrity, lastReview, loading, submitting, decisionSubmittingId,
    simulationSubmitting, proposalSubmitting, proposalDecisionSubmittingId, lucySubmitting,
    error, onRunApprovalTest, onHumanDecision, onRunSimulation, onCreateProposal,
    onProposalDecision, onSendLucyMessage, onRefreshLiveEarth,
  } = props;

  const [lucyInput, setLucyInput] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalSummary, setProposalSummary] = useState('');
  const [proposalCategory, setProposalCategory] = useState('architecture');

  const pendingProposalCount = useMemo(
    () => upgradeProposals.filter((entry) => entry.status === 'pending').length,
    [upgradeProposals],
  );

  return (
    <div style={{ minHeight: '100vh', background: '#050714', color: '#e8ecff', fontFamily: 'Inter, system-ui, sans-serif', padding: 24 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gap: 20 }}>
        <header style={{ background: 'linear-gradient(180deg, rgba(14,165,233,0.16), rgba(10,14,39,1))', border: '1px solid rgba(0,217,255,.15)', borderRadius: 18, padding: 24, display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 30, fontWeight: 800 }}>Lucy Powered by Emma</div>
          <div style={{ color: '#9aa4c7', fontSize: 16 }}>Lucy is the operator-facing persona inside Emma’s governed system, with live Earth ingest and governed audit state.</div>
        </header>

        {loading ? <Section title="Loading" subtitle="Emma is assembling local state."><div>Loading Lucy workspace, Earth state, governance, simulation, and audit layers…</div></Section> : null}
        {error ? <Section title="Error"><div style={{ color: '#ff9ab4' }}>{error}</div></Section> : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <StatCard label="Earth Stability" value={percent(earth?.earth.stability)} />
          <StatCard label="Sentinel Drift" value={percent(sentinel?.driftIndex)} />
          <StatCard label="Eagle Trusted" value={eagleEye ? String(eagleEye.trusted) : '—'} />
          <StatCard label="Execution Blocked" value={executionGate ? String(executionGate.blocked) : '—'} />
          <StatCard label="Pending Proposals" value={pendingProposalCount} />
          <StatCard label="Pending Human Approvals" value={humanApproval?.pendingCount ?? 0} />
          <StatCard label="Live Earth Events" value={liveEarth?.totalEvents ?? 'Unavailable'} />
          <StatCard label="Build Pipelines" value={pipelines.length} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 0.8fr)', gap: 20, alignItems: 'start' }}>
          <Section title="Lucy Workspace" subtitle="Ask Lucy about the current system state, governance, drift, trust, or proposals.">
            <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16, display: 'grid', gap: 12, maxHeight: 420, overflowY: 'auto' }}>
              {lucyMessages.length === 0 ? <div style={{ color: '#9aa4c7' }}>Lucy session is empty.</div> : lucyMessages.map((message) => (
                <div key={message.id} style={{ background: message.role === 'assistant' ? '#0d1830' : '#12172a', border: '1px solid rgba(0,217,255,.1)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, color: '#7f8aac', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 }}>{message.role}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{message.text}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <textarea value={lucyInput} onChange={(e) => setLucyInput(e.target.value)} placeholder="Ask Lucy about Earth, Sentinel, Eagle Eye, execution gate, or proposals..." rows={4}
                style={{ background: '#050714', color: '#e8ecff', border: '1px solid rgba(0,217,255,.18)', borderRadius: 10, padding: 12, resize: 'vertical' }} />
              <div>
                <button disabled={lucySubmitting || lucyInput.trim().length === 0} onClick={() => { onSendLucyMessage(lucyInput.trim()); setLucyInput(''); }}
                  style={{ background: lucySubmitting || lucyInput.trim().length === 0 ? '#334155' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: lucySubmitting || lucyInput.trim().length === 0 ? 'not-allowed' : 'pointer' }}>
                  {lucySubmitting ? 'Lucy is responding…' : 'Send to Lucy'}
                </button>
              </div>
            </div>
          </Section>

          <Section title="Builder Control Spine" subtitle="Persistent user paths, governed pipeline plans, and approved execution results.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Current Paths</div>
                <div style={{ fontSize: 13, color: '#c8d2ff', display: 'grid', gap: 6 }}>
                  <div>UE5: {builderConfig?.current.ue5Path || 'Unset'}</div>
                  <div>Unity: {builderConfig?.current.unityPath || 'Unset'}</div>
                  <div>Project: {builderConfig?.current.projectPath || 'Unset'}</div>
                  <div>FiveM: {builderConfig?.current.fivemRoot || 'Unset'}</div>
                  <div>Blender: {builderConfig?.current.blenderPath || 'Unset'}</div>
                  <div>Godot: {builderConfig?.current.godotPath || 'Unset'}</div>
                  <div>FiveM Handbook: {builderConfig?.current.handbookUrls?.fivemPrimary || 'Unset'}</div>
                </div>
              </div>
              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Active Toolbelt</div>
                <div style={{ fontSize: 13, color: '#c8d2ff', display: 'grid', gap: 6 }}>
                  <div>Mode: {activeToolbelt?.mode || 'unset'}</div>
                  <div>Active packs: {activeToolbelt?.activePackIds?.length ? activeToolbelt.activePackIds.join(', ') : 'none'}</div>
                  <div>Last resolved from: {activeToolbelt?.lastResolvedFrom || 'unset'}</div>
                </div>
                <div style={{ marginTop: 10, color: '#9aa4c7', fontSize: 12 }}>Toolbelt is planning context only. Lucy can read from it, but not execute from docs blindly.</div>
              </div>
              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>How to use debug chat</div>
                <div style={{ fontSize: 13, color: '#c8d2ff', display: 'grid', gap: 6 }}>
                  <div>Set paths: <code>set ue5 path C:\...\UnrealEditor.exe</code></div>
                  <div>Set project: <code>set project path D:\Projects\MyGame</code></div>
                  <div>Request build: <code>build a standalone fivem framework</code></div>
                  <div>Approve: <code>approve all</code> or <code>approve step 1</code></div>
                  <div>Set handbook: <code>set fivem handbook url https://docs.fivem.net/docs/scripting-manual/</code></div>
                  <div>Set toolbelt: <code>set fivem toolbelt</code> or <code>use ue5 handbook</code></div>
                  <div>Build custom toolbelt: <code>build toolbelt for blender + godot</code></div>
                  <div>Read toolbelt: <code>show active toolbelt</code> or <code>list toolbelts</code></div>
                </div>
              </div>
            <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Available Toolbelt Packs</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {toolbeltPacks.length > 0 ? toolbeltPacks.map((pack) => (
                  <div key={pack.id} style={{ background: '#0d1830', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700 }}>{pack.label}</div>
                    <div style={{ color: '#9aa4c7', fontSize: 12, marginTop: 4 }}>{pack.id} · {pack.type}</div>
                    <div style={{ color: '#c8d2ff', fontSize: 12, marginTop: 8 }}>{pack.tags.slice(0, 5).join(', ') || 'no tags'}</div>
                  </div>
                )) : <div style={{ color: '#9aa4c7' }}>No toolbelt packs loaded.</div>}
              </div>
            </div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              {(pipelines.length === 0 ? [null] : pipelines.slice(0, 3)).map((pipeline, idx) => pipeline ? (
                <div key={pipeline.id} style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16, display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div><strong>{pipeline.engine}</strong> · {pipeline.request}</div>
                    <div style={{ color: '#9aa4c7' }}>{pipeline.status}</div>
                  </div>
                  {pipeline.missingConfig.length > 0 ? <div style={{ color: '#fbbf24' }}>Missing config: {pipeline.missingConfig.join(', ')}</div> : null}
                  <div style={{ display: 'grid', gap: 6 }}>
                    {pipeline.steps.map((step) => (
                      <div key={step.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
                        <span>{step.id}. {step.action}</span>
                        <span style={{ color: step.status === 'completed' ? '#22c55e' : step.status === 'failed' || step.status === 'blocked' ? '#f87171' : '#9aa4c7' }}>{step.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div key={`empty-${idx}`} style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16, color: '#9aa4c7' }}>No build pipelines yet. Ask Lucy to build something in the chat window.</div>
              ))}
            </div>
          </Section>

          <Section title="Operator Snapshot" subtitle="Quick view of the most important governed state.">
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Earth Source Health</div>
                <div>Fresh: {earth?.sourceHealth.freshCount ?? 0}</div>
                <div>Stale: {earth?.sourceHealth.staleCount ?? 0}</div>
                <div>Missing: {earth?.sourceHealth.missingCount ?? 0}</div>
              </div>
              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Execution Gate</div>
                <div>Ready: {executionGate ? String(executionGate.ready) : '—'}</div>
                <div>Blocked: {executionGate ? String(executionGate.blocked) : '—'}</div>
                <div>Approved Human Decisions: {executionGate?.approvedDecisionCount ?? 0}</div>
              </div>
              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Upgrade Governance</div>
                <div>Total Proposals: {upgradeProposals.length}</div>
                <div>Pending: {pendingProposalCount}</div>
                <div>Resolved Human Decisions: {humanApprovalDecisions.length}</div>
              </div>
            </div>

          </Section>
        </div>

        <Section title="Earth Control Room" subtitle="Live Earth ground truth, Twin Earth projection, Earth-2 slot, and imagery lanes. Emma keeps the raw numbers; Lucy shows the final operator view.">
          {liveEarth ? (
            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={onRefreshLiveEarth} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700 }}>Refresh Live Earth</button>
                <div style={{ color: '#9aa4c7', alignSelf: 'center' }}>Last refresh {new Date(liveEarth.timestamp).toLocaleString()}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <StatCard label="Total Live Events" value={liveEarth.totalEvents} />
                <StatCard label="Earth Sources Online" value={`${liveEarth.sources.length - liveEarth.missingCount}/${liveEarth.sources.length}`} />
                <StatCard label="Earth Stability" value={percent(earth?.earth.stability)} />
                <StatCard label="Twin Earth Drift" value={percent(twinEarth ? Math.max(0, (twinEarth.simA.earth.stability ?? 0) - (twinEarth.simB.earth.stability ?? 0)) : undefined)} />
                <StatCard label="Earth-2 Slot" value={earth2Status?.configured ? 'Connected Slot' : 'Standby'} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
                <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Live Source Grid</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                    {liveEarth.sources.map((source) => (
                      <div key={source} style={{ background: '#0d1830', borderRadius: 12, padding: 14, border: `1px solid ${healthTone(liveEarth.sourceHealth[source])}44` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                          <div style={{ fontWeight: 700 }}>{sourceTitle(source)}</div>
                          <div style={{ color: healthTone(liveEarth.sourceHealth[source]), fontWeight: 700 }}>{liveEarth.sourceHealth[source] === 'ok' ? 'LIVE' : 'DOWN'}</div>
                        </div>
                        <div style={{ color: '#9aa4c7', marginBottom: 6 }}>{liveEarth.sourceSummaries?.[source] ?? 'Unavailable'}</div>
                        <div>Events: {liveEarth.sourceCounts[source] ?? 0}</div>
                        {liveEarth.sourceErrors?.[source] ? <div style={{ color: '#ff9ab4', marginTop: 6 }}>Error: {liveEarth.sourceErrors[source]}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Twin Earth</div>
                    <div>Sim A Stability: {percent(twinEarth?.simA?.earth?.stability)}</div>
                    <div>Sim B Stability: {percent(twinEarth?.simB?.earth?.stability)}</div>
                    <div style={{ color: '#9aa4c7', marginTop: 8 }}>Live pressure {(twinEarth?.simB as any)?.sources?.livePressure ?? 0}</div>
                  </div>
                  <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Earth-2 Forecast Slot</div>
                    <div>Status: {earth2Status?.configured ? 'Configured' : 'Standby'}</div>
                    <div>Bridge: {earth2Status?.bridge ?? 'earth2studio'}</div>
                    <div style={{ color: '#9aa4c7', marginTop: 8 }}>{earth2Status?.summary ?? 'No Earth-2 slot status yet.'}</div>
                  </div>
                  <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Imagery & Feed Catalog</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {earthCatalog.map((entry) => <div key={entry.source} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span>{entry.label}</span><span style={{ color: '#9aa4c7' }}>{entry.kind} · {entry.pollMinutes}m</span></div>)}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Latest Earth Snapshot</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                  {liveEarth.data.slice(0, 8).map((item, index) => (
                    <div key={`${item.type}-${index}`} style={{ background: '#0d1830', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.1, color: '#7f8aac', marginBottom: 6 }}>{item.type}</div>
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(item, null, 2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : <div style={{ color: '#9aa4c7' }}>Live Earth ingest unavailable.</div>}
        </Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20, alignItems: 'start' }}>
          <Section title="Governance and Approvals" subtitle="Visible approval chain and governed decision flow.">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Human Approval Visibility</div>
                {humanApproval && humanApproval.items.length > 0 ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {humanApproval.items.map((item) => (
                      <div key={item.id} style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.level} · {item.status}</div>
                        <div style={{ color: '#9aa4c7', marginBottom: 12 }}>{item.reason}</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => onHumanDecision(item.id, 'approved')} disabled={decisionSubmittingId === item.id}
                            style={{ background: decisionSubmittingId === item.id ? '#334155' : '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700 }}>Approve</button>
                          <button onClick={() => onHumanDecision(item.id, 'rejected')} disabled={decisionSubmittingId === item.id}
                            style={{ background: decisionSubmittingId === item.id ? '#334155' : '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700 }}>Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div style={{ color: '#9aa4c7' }}>No pending human-visible approvals right now.</div>}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>Emma Approval Test</div>
                <button onClick={onRunApprovalTest} disabled={submitting}
                  style={{ background: submitting ? '#334155' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700 }}>
                  {submitting ? 'Submitting…' : 'Submit Approval Test'}
                </button>
                {lastReview ? <div style={{ marginTop: 12, background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Last Emma Review</div>
                  <div><strong>Decision:</strong> {lastReview.approval.decision}</div>
                  <div><strong>Level:</strong> {lastReview.approval.level}</div>
                  <div><strong>Reason:</strong> {lastReview.approval.reason}</div>
                </div> : null}
              </div>
            </div>
          </Section>

          <Section title="Simulation and Readiness" subtitle="Dry-run execution only. Real execution remains closed.">
            {simulationPreview ? (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  <StatCard label="Simulation Only" value={String(simulationPreview.simulationOnly)} />
                  <StatCard label="Ready" value={String(simulationPreview.readyForSimulation)} />
                  <StatCard label="Blocked" value={String(simulationPreview.blocked)} />
                </div>
                {simulationPreview.packetPreview ? <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Packet Preview</div>
                  <div>Human Decision ID: {simulationPreview.packetPreview.sourceHumanDecisionId}</div>
                  <div>Human Item ID: {simulationPreview.packetPreview.sourceItemId}</div>
                  <div>Decided By: {simulationPreview.packetPreview.decidedBy}</div>
                  <div>Mode: {simulationPreview.packetPreview.mode}</div>
                </div> : null}
                {executionGate?.reasons?.length ? <div style={{ display: 'grid', gap: 10 }}>{executionGate.reasons.map((reason, index) => <div key={`${reason}-${index}`} style={{ background: '#190b15', border: '1px solid rgba(255,70,120,.3)', borderRadius: 12, padding: 14, color: '#ff9ab4' }}>{reason}</div>)}</div> : null}
                <div>
                  <button onClick={onRunSimulation} disabled={!simulationPreview.readyForSimulation || simulationSubmitting}
                    style={{ background: !simulationPreview.readyForSimulation || simulationSubmitting ? '#334155' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700 }}>
                    {simulationSubmitting ? 'Running Dry-Run…' : 'Run Dry-Run Simulation'}
                  </button>
                </div>
                {lastSimulationResult ? <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Last Simulation Result</div>
                  <div><strong>OK:</strong> {String(lastSimulationResult.ok)}</div>
                  <div><strong>Simulated:</strong> {String(lastSimulationResult.simulated)}</div>
                  <div><strong>Blocked:</strong> {String(lastSimulationResult.blocked)}</div>
                </div> : null}
              </div>
            ) : <div style={{ color: '#9aa4c7' }}>Simulation preview unavailable.</div>}
          </Section>
        </div>

        <Section title="Upgrade Governance" subtitle="Create and decide system-change proposals with visible audit.">
          <div style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16, display: 'grid', gap: 12 }}>
            <input value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} placeholder="Proposal title"
              style={{ background: '#050714', color: '#e8ecff', border: '1px solid rgba(0,217,255,.18)', borderRadius: 10, padding: 12 }} />
            <textarea value={proposalSummary} onChange={(e) => setProposalSummary(e.target.value)} placeholder="Proposal summary" rows={4}
              style={{ background: '#050714', color: '#e8ecff', border: '1px solid rgba(0,217,255,.18)', borderRadius: 10, padding: 12, resize: 'vertical' }} />
            <select value={proposalCategory} onChange={(e) => setProposalCategory(e.target.value)}
              style={{ background: '#050714', color: '#e8ecff', border: '1px solid rgba(0,217,255,.18)', borderRadius: 10, padding: 12 }}>
              <option value="architecture">architecture</option>
              <option value="governance">governance</option>
              <option value="ui">ui</option>
              <option value="simulation">simulation</option>
              <option value="connector">connector</option>
            </select>
            <div>
              <button disabled={proposalSubmitting || proposalTitle.trim().length === 0 || proposalSummary.trim().length === 0} onClick={() => { onCreateProposal({ title: proposalTitle.trim(), summary: proposalSummary.trim(), proposedBy: 'local-operator', category: proposalCategory }); setProposalTitle(''); setProposalSummary(''); }}
                style={{ background: proposalSubmitting || proposalTitle.trim().length === 0 || proposalSummary.trim().length === 0 ? '#334155' : '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700 }}>
                {proposalSubmitting ? 'Creating Proposal…' : 'Create Proposal'}
              </button>
            </div>
          </div>
          {upgradeProposals.length === 0 ? <div style={{ color: '#9aa4c7' }}>No upgrade proposals yet.</div> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {upgradeProposals.map((proposal) => (
                <div key={proposal.id} style={{ background: '#071021', border: '1px solid rgba(0,217,255,.12)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>{proposal.title}</div>
                  <div style={{ color: '#9aa4c7', marginBottom: 6 }}>{proposal.summary}</div>
                  <div style={{ fontSize: 12, color: '#7f8aac', marginBottom: 4 }}>Category: {proposal.category}</div>
                  <div style={{ fontSize: 12, color: '#7f8aac', marginBottom: 8 }}>Status: {proposal.status}</div>
                  {proposal.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => onProposalDecision(proposal.id, 'approved')} disabled={proposalDecisionSubmittingId === proposal.id}
                        style={{ background: proposalDecisionSubmittingId === proposal.id ? '#334155' : '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700 }}>Approve Proposal</button>
                      <button onClick={() => onProposalDecision(proposal.id, 'rejected')} disabled={proposalDecisionSubmittingId === proposal.id}
                        style={{ background: proposalDecisionSubmittingId === proposal.id ? '#334155' : '#dc2626', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', fontWeight: 700 }}>Reject Proposal</button>
                    </div>
                  ) : <div style={{ fontSize: 12, color: '#7f8aac' }}>Decided By: {proposal.decidedBy ?? 'n/a'} · Reason: {proposal.decisionReason || 'none'}</div>}
                </div>
              ))}
            </div>
          )}
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'start' }}>
          <Section title="System State">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <StatCard label="Reward Score" value={reward?.score ?? '—'} />
              <StatCard label="Trust Score" value={trust?.score ?? '—'} />
              <StatCard label="Eagle Confidence" value={eagleEye?.confidence ?? '—'} />
              <StatCard label="Sentinel Drift" value={percent(sentinel?.driftIndex)} />
            </div>
          </Section>
          <Section title="Earth and Twin Earth">
            <div>Earth Stability: {earth?.earth.stability ?? '—'}</div>
            <div>Twin Sim B Stability: {twinEarth?.simB.earth.stability ?? '—'}</div>
            <div>Fresh Sources: {earth?.sourceHealth.freshCount ?? 0}</div>
            <div>Stale Sources: {earth?.sourceHealth.staleCount ?? 0}</div>
            <div>Missing Sources: {earth?.sourceHealth.missingCount ?? 0}</div>
          </Section>
          <Section title="DeltaVault Audit">
            <div>Integrity OK: {ledgerIntegrity ? String(ledgerIntegrity.ok) : '—'}</div>
            <div>Total Entries: {ledger.length}</div>
            <div>Checked: {ledgerIntegrity?.checked ?? '—'}</div>
          </Section>
        </div>
      </div>
    </div>
  );
}
