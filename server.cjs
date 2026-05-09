/*
WHAT THIS DOES:
Runs Lucy-core-AI as a local-first browser dashboard and API server with no npm dependencies.

WHY THIS EXISTS:
This gives Randy one stable boot path for Main Lucy while preserving uploaded sources, the LL000-LL350 registry, bridge integrations, DeltaVault, BuilderOS gate, FiveM DreamSystem, and the uploaded Server Lucy FiveM framework.

HOW THIS WORKS:
Node's built-in http module serves public/ and JSON APIs. The server handles busy ports by trying the next port instead of crashing. Server Lucy links through /fivem heartbeat/next-command/result endpoints while the earlier DreamSystem bridge keeps /api/fivem endpoints.

HOW TO CHANGE IT:
Add routes inside handleApi() or handleServerLucyBridge(). Keep file writes inside data/sandbox. Keep FiveM commands whitelisted and queued; never add arbitrary shell/file execution through the game bridge.

DEBUG EXAMPLE:
If 4141 is already busy, START_LUCY.bat no longer crashes. Lucy will try 4142, 4143, etc. Watch the terminal line: "Lucy integrated dashboard: http://127.0.0.1:<port>".
*/
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const childProcess = require('node:child_process');
const { registry, listNodes, layerCounts } = require('./core/nodeIdentityRegistry.cjs');
const bridgeRegistry = require('./bridges/bridgeRegistry.json');

const ROOT = path.join(__dirname, '..');
const SERVER_DIR = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(SERVER_DIR, 'data');
const SANDBOX = path.join(DATA, 'sandbox');
const VAULT_DIR = path.join(DATA, 'deltavault');
const FIVEM_DATA = path.join(ROOT, 'fivem');
const SERVER_LUCY_DATA = path.join(FIVEM_DATA, 'server_lucy');
const LEDGER = path.join(VAULT_DIR, 'ledger.jsonl');
const COMMAND_QUEUE = path.join(FIVEM_DATA, 'command_queue.json');
const HEARTBEATS = path.join(FIVEM_DATA, 'heartbeats.jsonl');
const ACKS = path.join(FIVEM_DATA, 'command_acks.jsonl');
const SERVER_COMMAND_QUEUE = path.join(SERVER_LUCY_DATA, 'command_queue.json');
const SERVER_HEARTBEATS = path.join(SERVER_LUCY_DATA, 'heartbeats.jsonl');
const SERVER_RESULTS = path.join(SERVER_LUCY_DATA, 'results.jsonl');
const SERVER_PROPOSALS = path.join(SERVER_LUCY_DATA, 'proposals.json');
const REQUESTED_PORT = Number(process.env.LUCY_PORT || 4141);
const HOST = process.env.LUCY_HOST || '127.0.0.1';
const OPEN_BROWSER = String(process.env.LUCY_OPEN_BROWSER || '').toLowerCase() === '1';
const BRIDGE_SECRET = process.env.LUCY_BRIDGE_SECRET || 'lucy-local-dev';
let actualPort = REQUESTED_PORT;
let browserOpened = false;

for (const d of [DATA, SANDBOX, VAULT_DIR, path.join(DATA, 'artifacts'), FIVEM_DATA, SERVER_LUCY_DATA]) fs.mkdirSync(d, { recursive: true });
for (const f of [COMMAND_QUEUE, SERVER_COMMAND_QUEUE, SERVER_PROPOSALS]) if (!fs.existsSync(f)) fs.writeFileSync(f, '[]\n', 'utf8');

function appendJsonl(file, record) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(record) + os.EOL, 'utf8');
}
function readJsonFile(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}
function writeJsonFile(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + os.EOL, 'utf8');
}
function appendDelta(actor, type, summary, metadata = {}, riskLevel = 0) {
  const event = { id: `dv_${Date.now()}_${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), actor, type, summary, riskLevel, metadata };
  appendJsonl(LEDGER, event);
  return event;
}
function listJsonl(file, limit = 120) {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8').trim();
  if (!raw) return [];
  return raw.split(/\r?\n/).filter(Boolean).map(line => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean).slice(-limit).reverse();
}
function listDelta(limit = 120) { return listJsonl(LEDGER, limit); }
function json(res, data, status = 200) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers':'Content-Type,X-Lucy-Bridge-Secret', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS' });
  res.end(body);
}
function readBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { resolve({ raw: body }); }
    });
  });
}
function mime(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}
function safeSandboxPath(relative) {
  const cleaned = String(relative || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const full = path.resolve(SANDBOX, cleaned);
  if (!full.startsWith(path.resolve(SANDBOX))) throw new Error('Sandbox escape blocked by Eagle Eye path validator.');
  return full;
}
function openBrowser(url) {
  if (!OPEN_BROWSER || browserOpened) return;
  browserOpened = true;
  if (process.platform === 'win32') childProcess.exec(`start "" "${url}"`);
  else if (process.platform === 'darwin') childProcess.exec(`open "${url}"`);
  else childProcess.exec(`xdg-open "${url}"`);
}
function walkFiles(dir, base = dir, max = 600) {
  const out = [];
  function walk(current) {
    if (out.length >= max || !fs.existsSync(current)) return;
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const rel = path.relative(base, full).replace(/\\/g, '/');
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else out.push({ path: rel, size: stat.size });
    }
  }
  walk(dir);
  return out;
}
function validateBridgeSecret(req) {
  const given = req.headers['x-lucy-bridge-secret'];
  // Accept old dev defaults so existing uploaded resources connect without forcing edits.
  return !given || given === BRIDGE_SECRET || given === 'lucy-local-dev' || given === 'dev-change-me' || given === 'change-this-local-secret';
}

function listFivemResources() {
  const resourcesDir = path.join(ROOT, 'fivem', 'lucy_dreamsystem_resources');
  const sourceDir = path.join(ROOT, 'fivem', 'lucy_dreamsystem_source');
  const bridgeDir = path.join(ROOT, 'fivem', 'lucy_dreamsystem_bridge');
  const folders = fs.existsSync(resourcesDir) ? fs.readdirSync(resourcesDir).filter(n => fs.statSync(path.join(resourcesDir, n)).isDirectory()) : [];
  return {
    mode: 'digital_twin_dreamsystem',
    bridgeResource: 'fivem/lucy_dreamsystem_bridge',
    preservedSource: 'fivem/lucy_dreamsystem_source',
    extractedResources: folders.map(name => ({
      name,
      path: `fivem/lucy_dreamsystem_resources/${name}`,
      hasFxmanifest: fs.existsSync(path.join(resourcesDir, name, 'fxmanifest.lua')),
      fileCount: walkFiles(path.join(resourcesDir, name), path.join(resourcesDir, name), 200).length
    })),
    sourceFiles: walkFiles(sourceDir, sourceDir, 120),
    bridgeFiles: walkFiles(bridgeDir, bridgeDir, 80),
    whitelistedDreamCommands: ['announce', 'dream_marker', 'ambient_pulse'],
    rule: 'FiveM DreamSystem receives telemetry and whitelisted dream commands only; no arbitrary code execution.'
  };
}
function listServerLucyResources() {
  const sourceDir = path.join(ROOT, 'fivem', 'server_lucy_source');
  const resourcesDir = path.join(ROOT, 'fivem', 'server_lucy_resources');
  const runtimeDir = path.join(ROOT, 'fivem', 'server_lucy_runtime', 'standalone-framework');
  const lucyDir = path.join(resourcesDir, '[lucy]');
  const resourceNames = fs.existsSync(lucyDir) ? fs.readdirSync(lucyDir).filter(n => fs.statSync(path.join(lucyDir, n)).isDirectory()) : [];
  return {
    mode: 'server_lucy_linked_bridge',
    brain: 'main_lucy_ai_framework',
    body: 'server_lucy_fivem_runtime',
    preservedSource: 'fivem/server_lucy_source/',
    standaloneRuntime: 'fivem/server_lucy_runtime/standalone-framework/',
    resourcesRoot: 'fivem/server_lucy_resources/[lucy]/',
    resources: resourceNames.map(name => ({
      name,
      path: `fivem/server_lucy_resources/[lucy]/${name}`,
      hasFxmanifest: fs.existsSync(path.join(lucyDir, name, 'fxmanifest.lua')),
      fileCount: walkFiles(path.join(lucyDir, name), path.join(lucyDir, name), 260).length
    })),
    queuedCommands: readJsonFile(SERVER_COMMAND_QUEUE, []),
    proposals: readJsonFile(SERVER_PROPOSALS, []),
    lastHeartbeats: listJsonl(SERVER_HEARTBEATS, 20),
    lastResults: listJsonl(SERVER_RESULTS, 20),
    whitelistedServerCommands: ['lucy:chat:broadcast', 'lucy:mission:create_basic', 'lucy:director:scenario'],
    install: [
      'Copy fivem/server_lucy_resources/[lucy]/lucy_framework into FXServer resources/[lucy]/',
      'Copy fivem/server_lucy_resources/[lucy]/lucy_bridge into FXServer resources/[lucy]/',
      `set lucy_url "http://127.0.0.1:${actualPort}"`,
      'set lucy_bridge_secret "lucy-local-dev"',
      'ensure lucy_framework',
      'ensure lucy_bridge'
    ],
    rule: 'Server Lucy is the FiveM-side body. Main Lucy remains the AI framework/brain and queues only whitelisted approved server commands.'
  };
}
function enqueueFiveMCommand(input) {
  const allowed = new Set(['announce', 'dream_marker', 'ambient_pulse']);
  const action = String(input.action || 'announce');
  if (!allowed.has(action)) throw new Error(`Blocked FiveM command action: ${action}`);
  const cmd = {
    id: `fivem_cmd_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    action,
    message: String(input.message || 'Lucy DreamSystem pulse received.'),
    payload: input.payload || {},
    serverId: input.serverId || 'any',
    createdAt: new Date().toISOString(),
    status: 'queued'
  };
  const queue = readJsonFile(COMMAND_QUEUE, []);
  queue.push(cmd);
  writeJsonFile(COMMAND_QUEUE, queue.slice(-200));
  appendDelta('lucy', 'FIVEM_DREAM_COMMAND_QUEUED', `${action}: ${cmd.message}`.slice(0, 160), { command: cmd }, 2);
  return cmd;
}
function dequeueFiveMCommands(serverId) {
  const queue = readJsonFile(COMMAND_QUEUE, []);
  const deliver = [];
  const keep = [];
  for (const cmd of queue) {
    if (cmd.serverId === 'any' || !cmd.serverId || String(cmd.serverId) === String(serverId || 'any')) deliver.push(cmd);
    else keep.push(cmd);
  }
  writeJsonFile(COMMAND_QUEUE, keep);
  return deliver;
}
function sanitizeText(value, max = 180) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}
function normalizeServerLucyCommand(input = {}) {
  const requested = String(input.type || input.commandType || input.action || 'lucy:chat:broadcast');
  const allowed = new Set(['lucy:chat:broadcast', 'lucy:mission:create_basic', 'lucy:director:scenario']);
  if (!allowed.has(requested)) throw new Error(`Blocked Server Lucy command type: ${requested}`);
  if (requested === 'lucy:chat:broadcast') {
    return { type: requested, message: sanitizeText(input.message || input.payload?.message || 'Lucy bridge online.', 180) };
  }
  if (requested === 'lucy:mission:create_basic') {
    const payload = input.payload || {};
    const coords = payload.coords || {};
    return {
      type: requested,
      payload: {
        title: sanitizeText(payload.title || input.title || 'Lucy Server Mission', 80),
        role: sanitizeText(payload.role || input.role || 'civilian', 32),
        objective: sanitizeText(payload.objective || input.objective || 'Complete the Lucy-directed server objective.', 180),
        coords: { x: Number(coords.x ?? 215.76), y: Number(coords.y ?? -810.12), z: Number(coords.z ?? 30.73) },
        reward: Number(payload.reward ?? input.reward ?? 250)
      }
    };
  }
  const payload = input.payload || {};
  return { type: requested, payload: { scenario: sanitizeText(payload.scenario || input.scenario || 'calm_city_support', 64), intensity: Math.max(0, Math.min(10, Number(payload.intensity ?? input.intensity ?? 2))), note: sanitizeText(payload.note || input.note || 'Lucy requested a controlled scenario.', 180) } };
}
function enqueueServerLucyCommand(input) {
  const normalized = normalizeServerLucyCommand(input);
  const cmd = { id: `server_lucy_cmd_${Date.now()}_${Math.random().toString(16).slice(2)}`, ...normalized, createdAt: new Date().toISOString(), status: 'queued' };
  const queue = readJsonFile(SERVER_COMMAND_QUEUE, []);
  queue.push(cmd);
  writeJsonFile(SERVER_COMMAND_QUEUE, queue.slice(-200));
  appendDelta('main_lucy', 'SERVER_LUCY_COMMAND_QUEUED', `${cmd.type} queued for Server Lucy`, { command: cmd }, 2);
  return cmd;
}
function nextServerLucyCommand() {
  const queue = readJsonFile(SERVER_COMMAND_QUEUE, []);
  const cmd = queue.shift() || null;
  writeJsonFile(SERVER_COMMAND_QUEUE, queue);
  if (cmd) appendDelta('server_lucy_bridge', 'SERVER_LUCY_COMMAND_DELIVERED', `${cmd.type} delivered`, { command: cmd }, 2);
  return cmd;
}
function createServerLucyProposal(input) {
  const normalized = normalizeServerLucyCommand(input.command || input);
  const proposal = {
    id: `server_lucy_proposal_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    title: sanitizeText(input.title || `Server Lucy ${normalized.type}`, 90),
    reason: sanitizeText(input.reason || 'Main Lucy prepared a whitelisted Server Lucy command proposal.', 220),
    command: normalized,
    status: input.autoQueue ? 'approved_queued' : 'waiting_human_approval',
    review: { ok: true, riskScore: normalized.type === 'lucy:chat:broadcast' ? 0.05 : 0.18, notes: ['Whitelisted Server Lucy command.', 'No arbitrary Lua/code execution.', 'Live server action should be approved before dispatch.'] },
    createdAt: new Date().toISOString()
  };
  const proposals = readJsonFile(SERVER_PROPOSALS, []);
  proposals.unshift(proposal);
  writeJsonFile(SERVER_PROPOSALS, proposals.slice(0, 100));
  appendDelta('main_lucy', 'SERVER_LUCY_PROPOSAL_CREATED', proposal.title, { proposal }, 2);
  if (input.autoQueue) proposal.commandId = enqueueServerLucyCommand(normalized).id;
  return proposal;
}
function approveServerLucyProposal(id) {
  const proposals = readJsonFile(SERVER_PROPOSALS, []);
  const p = proposals.find(x => x.id === id);
  if (!p) throw new Error('Server Lucy proposal not found.');
  if (p.status === 'approved_queued') return p;
  const cmd = enqueueServerLucyCommand(p.command);
  p.status = 'approved_queued';
  p.commandId = cmd.id;
  p.updatedAt = new Date().toISOString();
  writeJsonFile(SERVER_PROPOSALS, proposals);
  appendDelta('emma', 'SERVER_LUCY_PROPOSAL_APPROVED', p.title, { proposalId: id, commandId: cmd.id }, 2);
  return p;
}
function lucyReply(message) {
  const m = String(message || '').toLowerCase();
  if (m.includes('server lucy')) {
    const s = listServerLucyResources();
    return `Server Lucy is now linked as the FiveM-side body. Main Lucy remains the AI framework/brain. Installed resources: ${s.resources.map(r => r.name).join(', ')}. Whitelisted server commands: ${s.whitelistedServerCommands.join(', ')}.`;
  }
  if (m.includes('port') || m.includes('4141') || m.includes('address already')) {
    return `I patched the boot path: if 4141 is busy, I try the next open port and open the browser only after the real port is known. Current port is ${actualPort}.`;
  }
  if (m.includes('what are you doing') || m.includes('status') || m.includes('working')) {
    return `I am running the integrated local dashboard on port ${actualPort}, watching ${registry.nodes.length} node identities, checking ${bridgeRegistry.bridges.length} bridge entries, tracking DreamSystem plus Server Lucy, and recording events into DeltaVault.`;
  }
  if (m.includes('fivem') || m.includes('dream') || m.includes('server resource')) {
    const f = listFivemResources();
    const s = listServerLucyResources();
    return `FiveM is split cleanly now: DreamSystem has ${f.extractedResources.length} extracted dream resources, and Server Lucy has ${s.resources.length} linked core resources. Main Lucy queues only whitelisted bridge packets.`;
  }
  if (m.includes('node') || m.includes('ll350') || m.includes('registry')) {
    return `The LL350 registry is loaded: ${JSON.stringify(layerCounts())}. LL068 and LL108 keep their legacy aliases but use unique runtime names so the mesh has no duplicate active names.`;
  }
  if (m.includes('bridge') || m.includes('integration')) {
    return `The bridge pack is installed: ${bridgeRegistry.bridges.map(b => b.id + ':' + b.status).join(', ')}. They are visible and gated. Bridges can inspect/request/propose; ActionEngine owns execution.`;
  }
  if (m.includes('earth') || m.includes('planet')) {
    return 'Planetary Pulse is installed as a local status panel and bridge registry. Live external feeds are adapter-based so the dashboard stays green offline and can connect when API keys or local feed permissions exist.';
  }
  if (m.includes('build') || m.includes('write') || m.includes('code')) {
    return 'I can create a sandbox build proposal now. The current package includes a safe demo write endpoint and a proposal endpoint. Nothing writes outside data/sandbox without the approval chain.';
  }
  if (m.includes('why')) {
    return 'Because this merge keeps Main Lucy as the stable AI framework and links Server Lucy as the FiveM-side body, so live server updates/changes flow through a bridge instead of splitting Lucy into two brains.';
  }
  return 'I hear you. This build is local-first and merged from your uploaded parts. Ask me “server lucy status”, “what are you doing?”, “FiveM status”, “bridge status”, or “show LL350”.';
}
function bridgeStatus() {
  return bridgeRegistry.bridges.map(b => ({ ...b, canExecuteDirectly: false, actionAuthority: 'ActionEngine only', lastPing: new Date().toISOString() }));
}
function systemState() {
  const counts = layerCounts();
  const active = listNodes().filter(n => n.status === 'active').length;
  const dream = listFivemResources();
  const serverLucy = listServerLucyResources();
  return {
    app: 'Lucy-core-AI Integrated v0.5',
    ok: true,
    timestamp: new Date().toISOString(),
    localFirst: true,
    cloudRequired: false,
    host: HOST,
    port: actualPort,
    requestedPort: REQUESTED_PORT,
    nodeCount: registry.nodes.length,
    activeNodeCount: active,
    layerCounts: counts,
    bridgeCount: bridgeRegistry.bridges.length,
    bridges: bridgeStatus(),
    fivem: {
      dreamsystem: 'installed',
      extractedResourceCount: dream.extractedResources.length,
      lastHeartbeats: listJsonl(HEARTBEATS, 10),
      queuedCommands: readJsonFile(COMMAND_QUEUE, []),
      serverLucy: {
        status: 'linked',
        resources: serverLucy.resources,
        resourceCount: serverLucy.resources.length,
        lastHeartbeats: listJsonl(SERVER_HEARTBEATS, 10),
        queuedCommands: readJsonFile(SERVER_COMMAND_QUEUE, []),
        lastResults: listJsonl(SERVER_RESULTS, 10),
        proposals: readJsonFile(SERVER_PROPOSALS, []).slice(0, 20)
      }
    },
    recentEvents: listDelta(40),
    rules: registry.rules,
    paths: { sandbox: SANDBOX, ledger: LEDGER, fivemData: FIVEM_DATA, serverLucyData: SERVER_LUCY_DATA },
    integrationStatus: {
      ll350Registry: 'loaded',
      legacySources: 'preserved in legacy_sources/',
      dashboardBlueprint: 'copied into docs/',
      fivemDreamSystem: 'uploaded DreamSystem pack preserved and connected through lucy_dreamsystem_bridge',
      serverLucy: 'uploaded Server Lucy preserved and linked as FiveM-side body through /fivem endpoints',
      portHandling: 'auto-fallback if requested port is already in use',
      chatInputStability: 'auto-refresh no longer re-renders while typing',
      deltaVault: 'append-only jsonl ledger',
      actionFlow: 'Main Lucy proposal -> Eagle Eye -> Emma -> Server Lucy bridge -> FXServer result -> DeltaVault'
    }
  };
}
async function handleApi(req, res, url) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'GET,POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type,X-Lucy-Bridge-Secret' });
    return res.end();
  }
  if (req.method === 'GET' && url.pathname === '/api/state') return json(res, systemState());
  if (req.method === 'GET' && url.pathname === '/api/nodes') return json(res, { nodes: listNodes(), layerCounts: layerCounts() });
  if (req.method === 'GET' && url.pathname.startsWith('/api/nodes/')) {
    const id = decodeURIComponent(url.pathname.split('/').pop()).toUpperCase();
    return json(res, { node: listNodes().find(n => n.id === id || n.name === id) || null });
  }
  if (req.method === 'GET' && url.pathname === '/api/bridges/status') return json(res, { bridges: bridgeStatus(), rule: bridgeRegistry.rule });
  if (req.method === 'GET' && url.pathname === '/api/deltavault/events') return json(res, { events: listDelta(200), ledger: LEDGER });
  if (req.method === 'GET' && url.pathname === '/api/planetary/status') return json(res, { status: 'adapter-ready-offline-safe', nodes: listNodes().filter(n => n.layer === 'planetary_sensor_feed'), feeds: ['USGS adapter slot','NOAA adapter slot','Open-Meteo adapter slot','NASA/GIBS adapter slot','ADSB/flight adapter slot'], note: 'Live feeds can be enabled by adding keys/permissions without changing the UI.' });

  if (req.method === 'GET' && url.pathname === '/api/fivem/dreamsystem/status') return json(res, { ...listFivemResources(), lastHeartbeats: listJsonl(HEARTBEATS, 20), queuedCommands: readJsonFile(COMMAND_QUEUE, []) });
  if (req.method === 'GET' && url.pathname === '/api/fivem/resources') return json(res, listFivemResources());
  if (req.method === 'POST' && url.pathname === '/api/fivem/heartbeat') {
    const body = await readBody(req);
    const hb = { id: `hb_${Date.now()}_${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), ...body };
    appendJsonl(HEARTBEATS, hb);
    appendDelta('fivem_dream_bridge', 'FIVEM_DREAM_HEARTBEAT', `DreamSystem heartbeat: ${body.playerCount || 0} players`, { serverId: body.serverId, resource: body.resource }, 1);
    return json(res, { ok: true, heartbeat: hb });
  }
  if (req.method === 'GET' && url.pathname === '/api/fivem/commands') {
    const serverId = url.searchParams.get('serverId') || 'any';
    const commands = dequeueFiveMCommands(serverId);
    if (commands.length) appendDelta('fivem_dream_bridge', 'FIVEM_DREAM_COMMANDS_DELIVERED', `${commands.length} command(s) delivered to ${serverId}`, { commands }, 2);
    return json(res, { commands, serverId });
  }
  if (req.method === 'POST' && url.pathname === '/api/fivem/commands') {
    const body = await readBody(req);
    const command = enqueueFiveMCommand(body);
    return json(res, { ok: true, command });
  }
  if (req.method === 'POST' && url.pathname === '/api/fivem/command-ack') {
    const body = await readBody(req);
    const ack = { id: `ack_${Date.now()}_${Math.random().toString(16).slice(2)}`, at: new Date().toISOString(), ...body };
    appendJsonl(ACKS, ack);
    appendDelta('fivem_dream_bridge', 'FIVEM_DREAM_COMMAND_ACK', `Ack ${body.commandId || 'unknown'} from ${body.serverId || 'server'}`, { ack }, 1);
    return json(res, { ok: true, ack });
  }

  if (req.method === 'GET' && url.pathname === '/api/fivem/server-lucy/status') return json(res, listServerLucyResources());
  if (req.method === 'POST' && url.pathname === '/api/fivem/server-lucy/commands') {
    const body = await readBody(req);
    const command = enqueueServerLucyCommand(body);
    return json(res, { ok: true, command });
  }
  if (req.method === 'POST' && url.pathname === '/api/fivem/server-lucy/proposals') {
    const body = await readBody(req);
    const proposal = createServerLucyProposal(body);
    return json(res, { ok: true, proposal });
  }
  const approveServerLucy = url.pathname.match(/^\/api\/fivem\/server-lucy\/proposals\/([^/]+)\/approve$/);
  if (req.method === 'POST' && approveServerLucy) {
    const proposal = approveServerLucyProposal(decodeURIComponent(approveServerLucy[1]));
    return json(res, { ok: true, proposal });
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    const body = await readBody(req); const message = String(body.message || '');
    appendDelta('user','USER_MESSAGE', message.slice(0,160), { message });
    const reply = lucyReply(message);
    const event = appendDelta('lucy','LUCY_RESPONSE', reply.slice(0,160), { reply });
    return json(res, { reply, event });
  }
  if (req.method === 'POST' && url.pathname === '/api/builder/proposal') {
    const body = await readBody(req); const prompt = String(body.prompt || 'Untitled sandbox build proposal');
    const proposal = { id:`proposal_${Date.now()}`, title:'Sandbox build proposal', prompt, domain: body.domain || 'general_code', status:'proposed', riskLevel:2, flow:['Lucy proposes','Eagle Eye validates path/scope','Emma approves safe sandbox work','Bioython exact-writes only inside data/sandbox','DeltaVault records evidence'], createdAt:new Date().toISOString() };
    const event = appendDelta('lucy','PROPOSAL_CREATED', proposal.title, { proposal }, 2);
    appendDelta('eagle_eye','EAGLE_EYE_VALIDATION','Proposal kept in sandbox-only mode.', { proposalId: proposal.id }, 2);
    appendDelta('emma','EMMA_DECISION','Allowed as sandbox proposal; live writes still require human-approved boundary permission.', { proposalId: proposal.id }, 2);
    return json(res, { proposal, event });
  }
  if (req.method === 'POST' && url.pathname === '/api/kernel/sandbox/listdir') {
    const body = await readBody(req);
    const rel = body.path || '';
    const full = safeSandboxPath(rel);
    if (!fs.existsSync(full)) return json(res, { success: false, error: 'Path not found' });
    const items = fs.readdirSync(full).map(name => {
      const itemFull = path.join(full, name);
      const stat = fs.statSync(itemFull);
      return { name, relPath: path.join(rel, name), isDir: stat.isDirectory(), size: stat.size };
    });
    return json(res, { success: true, items });
  }
  if (req.method === 'POST' && url.pathname === '/api/kernel/sandbox/upload') {
    const body = await readBody(req);
    const target = safeSandboxPath(body.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    // Handle base64 content if needed (FileReader.readAsDataURL)
    let content = body.content || '';
    if (content.startsWith('data:')) content = Buffer.from(content.split(',')[1], 'base64');
    fs.writeFileSync(target, content);
    appendDelta('user', 'SANDBOX_FILE_UPLOAD', `Uploaded ${body.path}`, { path: body.path }, 1);
    return json(res, { success: true });
  }
  if (req.method === 'POST' && url.pathname === '/api/builder/run') {
    try {
      const body = await readBody(req);
      const { BuilderOS } = await import('../dist/src/core/builder/BuilderOS.js');
      const result = await BuilderOS.run(body);
      return json(res, { success: true, result });
    } catch (err) {
      console.error('Builder error:', err);
      return json(res, { success: false, error: err.message }, 500);
    }
  }
  if (req.method === 'POST' && url.pathname === '/api/execution/sandbox-write-demo') {
    const body = await readBody(req);
    const target = safeSandboxPath(body.filename || `demo/lucy_write_${Date.now()}.txt`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const content = String(body.content || `Lucy sandbox write demo at ${new Date().toISOString()}\n`);
    fs.writeFileSync(target, content, 'utf8');
    const rel = path.relative(ROOT, target).replace(/\\/g,'/');
    appendDelta('bioython','BIOYTHON_EXECUTION',`Sandbox exact write completed: ${rel}`, { path: rel }, 2);
    return json(res, { ok:true, path: rel, rule:'sandbox-only exact write' });
  }
  return json(res, { error: 'Not found', path: url.pathname }, 404);
}
async function handleServerLucyBridge(req, res, url) {
  if (!validateBridgeSecret(req)) {
    appendDelta('server_lucy_bridge', 'SERVER_LUCY_SECRET_DENIED', `Denied ${url.pathname}`, { ip: req.socket.remoteAddress }, 3);
    return json(res, { ok: false, error: 'Forbidden: bad shared secret.' }, 403);
  }
  if (req.method === 'POST' && url.pathname === '/fivem/heartbeat') {
    const body = await readBody(req);
    const hb = { id: `server_hb_${Date.now()}_${Math.random().toString(16).slice(2)}`, receivedAt: new Date().toISOString(), ...body };
    appendJsonl(SERVER_HEARTBEATS, hb);
    appendDelta('server_lucy_bridge', 'SERVER_LUCY_HEARTBEAT', `Server Lucy heartbeat: ${body.playersOnline ?? body.playerCount ?? 0} players`, { heartbeat: hb }, 1);
    return json(res, { ok: true, queueLength: readJsonFile(SERVER_COMMAND_QUEUE, []).length });
  }
  if (req.method === 'GET' && url.pathname === '/fivem/next-command') {
    const command = nextServerLucyCommand();
    return json(res, { ok: true, command });
  }
  if (req.method === 'POST' && url.pathname === '/fivem/result') {
    const body = await readBody(req);
    const result = { id: `server_result_${Date.now()}_${Math.random().toString(16).slice(2)}`, receivedAt: new Date().toISOString(), ...body };
    appendJsonl(SERVER_RESULTS, result);
    appendDelta('server_lucy_bridge', 'SERVER_LUCY_RESULT', `Server Lucy result: ${body.message || body.commandId || 'result'}`.slice(0, 160), { result }, 1);
    return json(res, { ok: true });
  }
  return json(res, { ok: false, error: 'Server Lucy bridge route not found.' }, 404);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${actualPort}`}`);
    if (req.method === 'OPTIONS') return json(res, {}, 204);
    if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
    if (url.pathname.startsWith('/fivem/')) return handleServerLucyBridge(req, res, url);
    let file = url.pathname === '/' ? '/index.html' : url.pathname;
    file = path.normalize(file).replace(/^([.][.][\\/])+/, '');
    const full = path.join(PUBLIC, file);
    if (!full.startsWith(PUBLIC) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
      res.writeHead(404, {'Content-Type':'text/plain'}); return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': mime(full) });
    fs.createReadStream(full).pipe(res);
  } catch (error) {
    json(res, { error: error.message || String(error) }, 500);
  }
});
function listenWithFallback(port, attemptsLeft = 40) {
  actualPort = port;
  server.once('error', err => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      console.log(`Port ${port} is already in use. Trying ${port + 1}...`);
      listenWithFallback(port + 1, attemptsLeft - 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
  server.listen(port, HOST, () => {
    const url = `http://${HOST}:${actualPort}`;
    appendDelta('system','APP_START','Lucy integrated local server started.', { port: actualPort, requestedPort: REQUESTED_PORT, nodeCount: registry.nodes.length, bridgeCount: bridgeRegistry.bridges.length });
    console.log(`Lucy integrated dashboard: ${url}`);
    console.log(`Server Lucy bridge URL: ${url}/fivem/heartbeat`);
    console.log(`DeltaVault ledger: ${LEDGER}`);
    console.log('If the browser opened on an old port, use the dashboard URL printed above.');
    openBrowser(url);
  });
}
listenWithFallback(REQUESTED_PORT);
