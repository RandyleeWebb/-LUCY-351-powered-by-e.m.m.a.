/**
 * LUCY PHASE 16 — Executable Trust Layer Smoke Tests
 * Verifies core scaffold behaviors across all modules.
 */

import { test, assert, assertEqual, run } from './harness.js';
import { 
  lucyEventBus, 
  actionEngine, 
  DeltaVault, 
  ArtifactVault, 
  RepoManager, 
  ProjectGraphBuilder, 
  FiveMResourceBuilder, 
  FiveMValidator, 
  RuntimeLab, 
  VisualVerificationEngine,
  PersistentArtifactVault,
  PersistentDeltaVault
} from '../src/core/index.js';
import fs from 'node:fs';
import path from 'node:path';

const TEST_DATA_DIR = './server/data/test';
if (!fs.existsSync(TEST_DATA_DIR)) {
  fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
}

test('EventBus publishes, dispatches, and replays events', async () => {
  let received = false;
  lucyEventBus.on('system.test', () => {
    received = true;
  });

  await lucyEventBus.publish({
    type: 'system.test',
    sourceEngine: 'SmokeTest',
    priority: 'low',
    confidence: 1,
    payload: { hello: 'world' }
  });

  assert(received, 'Event was not received by subscriber');
  const recent = lucyEventBus.getRecent(1);
  assertEqual(recent[0].type, 'system.test', 'Recent event type mismatch');
});

test('ActionEngine approves low-risk proposals and rejects critical proposals', async () => {
  // Low risk
  const lowDecision = await actionEngine.handleProposal({
    id: 'test_low',
    type: 'action.proposed',
    sourceEngine: 'SmokeTest',
    priority: 'normal',
    confidence: 1,
    traceId: 'trace_low',
    createdAt: new Date().toISOString(),
    payload: {
      actionType: 'TEST_LOW',
      requestedBy: 'SmokeTest',
      risk: 'safe',
      because: 'Low risk test',
      input: { summary: 'Low risk test' },
      requiresApproval: false
    }
  });
  assert(lowDecision.decision === 'approved', 'Low risk action should be allowed');

  // Critical risk
  const critDecision = await actionEngine.handleProposal({
    id: 'test_crit',
    type: 'action.proposed',
    sourceEngine: 'SmokeTest',
    priority: 'critical',
    confidence: 1,
    traceId: 'trace_crit',
    createdAt: new Date().toISOString(),
    payload: {
      actionType: 'TEST_CRITICAL',
      requestedBy: 'SmokeTest',
      risk: 'critical',
      because: 'Critical risk test',
      input: { summary: 'Critical risk test' },
      requiresApproval: false
    }
  });
  assert(critDecision.decision !== 'approved', 'Critical risk action should be rejected');
});

test('DeltaVault and ArtifactVault store traceable evidence', async () => {
  const dv = new DeltaVault();
  const av = new ArtifactVault();

  const traceId = 'trace_vault_test';
  dv.addRecord({
    traceId,
    source: 'SmokeTest',
    decisionType: 'action_proposed',
    summary: 'Testing vault storage',
    rationale: ['smoke test'],
    outcome: 'pending',
    relatedArtifacts: []
  });

  const record = dv.findByTrace(traceId)[0];
  assert(!!record, 'DeltaRecord not found in DeltaVault');
  assertEqual(record?.summary, 'Testing vault storage', 'DeltaRecord summary mismatch');

  const art = av.addArtifact({
    projectId: 'test_project',
    type: 'log',
    path: 'test.log',
    relatedArtifacts: [],
    checksum: 'stub',
    summary: 'Test artifact'
  });
  const artifact = av.getArtifact(art.id);
  assert(!!artifact, 'Artifact not found in ArtifactVault');
  assertEqual(artifact?.projectId, 'test_project', 'Artifact projectId mismatch');
});

test('ProjectGraph and RepoManager preserve safe-edit workflow', async () => {
  const builder = new ProjectGraphBuilder();
  const repo = new RepoManager();

  // Graph build
  const graph = builder.buildFromFiles('test_id', '.', ['src/App.tsx'], 'typescript');
  assertEqual(graph.files[0].path, 'src/App.tsx', 'ProjectGraph file path mismatch');

  // RepoManager enforce snapshot-first
  const snapshot = repo.createSnapshot('test_project', '.', 'smoke test');
  const edit = repo.proposeEdit({
    snapshotId: snapshot.id,
    path: 'src/App.tsx',
    operation: 'update',
    reason: 'smoke test',
    newContent: 'new content'
  });
  assertEqual(edit.path, 'src/App.tsx', 'RepoManager edit path mismatch');
});

test('FiveM builder and validator plan resources conservatively', async () => {
  const builder = new FiveMResourceBuilder();
  const validator = new FiveMValidator();

  const plan = builder.planResource({
    name: 'lucy_test',
    framework: 'standalone',
    language: 'lua',
    hasNui: false,
    dependencies: [],
    serverEvents: [],
    clientEvents: [],
    exports: [],
    commands: [],
    sqlMigrations: [],
    permissions: []
  });
  assert(plan.files.length > 0, 'Resource plan should have files');
  
  const validation = validator.validatePlan(plan);
  // Our scaffold has no server main, so it should fail (as specified in FiveMValidator.ts:65)
  // Wait, FiveMResourceBuilder:90 adds server/main.lua.
  assert(validation.passed, 'Conservative plan should be valid');
});

test('RuntimeLab records replayable sessions and logs', async () => {
  const lab = new RuntimeLab();
  const session = lab.startSession('smoke-test-snapshot');
  
  lab.addLog(session.replayId, {
    level: 'info',
    message: 'Test log message'
  });
  const updated = lab.getSession(session.replayId);
  
  assert(!!updated, 'Session not found in RuntimeLab');
  assertEqual(updated?.logs[0].message, 'Test log message', 'Log message mismatch');
});

test('VisualVerificationEngine fails safely without real visual adapters', async () => {
  const visual = new VisualVerificationEngine();
  const result = visual.inspect({
    domain: 'dashboard',
    screenshotPath: 'test.png',
    expectedDescription: 'App Layout'
  });
  
  assert(!result.passed, 'Visual verification should fail without adapters');
  assertEqual(result.visualConfidence, 0.35, 'Visual confidence should be conservative');
});

test('Persistent vault adapters preserve records across fresh instances', async () => {
  const artifactPath = path.join(TEST_DATA_DIR, 'artifacts.json');
  const deltaPath = path.join(TEST_DATA_DIR, 'delta.json');

  // Clean old test files
  if (fs.existsSync(artifactPath)) fs.unlinkSync(artifactPath);
  if (fs.existsSync(deltaPath)) fs.unlinkSync(deltaPath);

  // Instance 1: Store data
  const pav1 = new PersistentArtifactVault(artifactPath);
  const pdv1 = new PersistentDeltaVault(deltaPath);

  const art = await pav1.addArtifact({
    projectId: 'pers_test',
    type: 'report',
    path: 'pers.pdf',
    relatedArtifacts: [],
    checksum: 'abc',
    summary: 'Persistent artifact'
  });

  await pdv1.addRecord({
    traceId: 'pers_trace',
    source: 'PersTest',
    decisionType: 'action_approved',
    summary: 'Persistent decision',
    rationale: ['pers test'],
    outcome: 'success',
    relatedArtifacts: [art.id]
  });

  // Instance 2: Load data
  const pav2 = new PersistentArtifactVault(artifactPath);
  const pdv2 = new PersistentDeltaVault(deltaPath);

  const loadedArt = await pav2.getArtifact(art.id);
  assert(!!loadedArt, 'Artifact not reloaded from persistent store');
  assertEqual(loadedArt?.projectId, 'pers_test', 'Reloaded artifact projectId mismatch');

  const loadedDelta = (await pdv2.findByTrace('pers_trace'))[0];
  assert(!!loadedDelta, 'DeltaRecord not reloaded from persistent store');
  assertEqual(loadedDelta?.summary, 'Persistent decision', 'Reloaded delta summary mismatch');
});

// Run all tests
run();

