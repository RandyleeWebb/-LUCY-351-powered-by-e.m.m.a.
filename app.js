const $ = (q, root=document) => root.querySelector(q);
const app = $('#app');
let state = null;
let tab = localStorage.getItem('lucyTab') || 'overview';
let chat = JSON.parse(localStorage.getItem('lucyChat') || '[{"role":"lucy","text":"Lucy integrated v0.5 online. Server Lucy linked bridge is active. Ask me about Server Lucy, FiveM, bridge status, or LL350."}]');
let chatDraft = localStorage.getItem('lucyChatDraft') || '';

async function api(path, opts){ const r = await fetch(path, opts); if(!r.ok) throw new Error(await r.text()); return r.json(); }
function isEditing(){ const a=document.activeElement; return a && ['INPUT','TEXTAREA','SELECT'].includes(a.tagName); }
async function refresh(options={}){
  state = await api('/api/state');
  if(!options.silent || !isEditing()) render();
}
function setTab(id){ tab=id; localStorage.setItem('lucyTab', id); render(); }
function saveChat(){ localStorage.setItem('lucyChat', JSON.stringify(chat.slice(-120))); }
function setDraft(value){ chatDraft=value; localStorage.setItem('lucyChatDraft', value); }
function layerLabel(k){ return ({refiner:'Refiner',classical_core:'Classical Core',oracle_quantum:'Oracle Gates',stem_cell:'Stem Cells',planetary_sensor_feed:'Planetary / Sensor',intelligence_control:'v7 Control',builder_gamedev:'v8 Builder',reserved_evolution:'Evolution Pool'}[k]||k); }
function navButton(id,label){ return `<button class="secondary ${tab===id?'active':''}" onclick="setTab('${id}')">${label}</button>` }
function escapeHtml(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }
function layout(content){
  const s = state || {nodeCount:'...',activeNodeCount:'...',bridgeCount:'...',port:'...',layerCounts:{},recentEvents:[],fivem:{extractedResourceCount:'...'}};
  app.innerHTML = `<header class="top"><div class="brand"><div class="orb"></div><div><h1>LUCY CORE AI — INTEGRATED</h1><small>local-first • LL350 registry • Server Lucy bridge • FiveM DreamSystem • DeltaVault</small></div></div><div><span class="pill good">SOVEREIGN GUARD</span><span class="pill">v0.5</span><span class="pill good">:${s.port}</span></div></header><div class="wrap"><aside class="side">${navButton('overview','🧠 Overview')}${navButton('chat','💬 Front Chat')}${navButton('nodes','🕸 LL350 Node Mesh')}${navButton('bridges','🌉 Bridges')}${navButton('fivem','🎮 FiveM DreamSystem')}${navButton('serverlucy','🛰 Server Lucy')}${navButton('planet','🌍 Planetary Pulse')}${navButton('builder','🛠 BuilderOS Gate')}${navButton('vault','🧾 DeltaVault')}<div class="card"><b>Runtime</b><p class="muted">Port: ${s.port}<br>Nodes: ${s.nodeCount}<br>Active: ${s.activeNodeCount}<br>Bridges: ${s.bridgeCount}<br>Dream resources: ${s.fivem?.extractedResourceCount ?? '...'}<br>Server Lucy resources: ${s.fivem?.serverLucy?.resourceCount ?? '...'}</p></div></aside><main>${content}</main></div>${tab==='chat'?'':frontChat(false)}`;
}
function overview(){
  const s=state; const metrics = Object.entries(s.layerCounts).map(([k,v])=>`<div class="metric"><span>${layerLabel(k)}</span><b>${v}</b></div>`).join('');
  layout(`<section class="hero"><h2>Lucy is merged, local, and ready to extend.</h2><p>The old zip parts are preserved under <b>legacy_sources/</b>. The live runnable spine is one local Node server with port fallback, browser dashboard, LL000–LL350 identity registry, bridge registry, FiveM DreamSystem resource, ActionEngine rule, sandbox write demo, and DeltaVault event log.</p><span class="pill good">No Gemini dependency</span><span class="pill good">No cloud required</span><span class="pill good">Port fallback active</span><span class="pill">ActionEngine gated</span></section><section class="grid3">${metrics}</section><section class="grid2"><div class="card"><h3>Current Integration Status</h3>${Object.entries(s.integrationStatus).map(([k,v])=>`<p><b>${k}</b><br><span class="muted">${v}</span></p>`).join('')}</div><div class="card"><h3>Important Fix</h3><p>If 4141 is already used, Lucy no longer crashes. She tries the next open port and prints the real URL in the boot window.</p><pre>${s.rules.join('\n')}</pre></div></section>`);
}
function nodes(){
  const s=state; const filters = ['all',...Object.keys(s.layerCounts)];
  const selected = window.nodeFilter || 'all';
  const ns = selected==='all'?s.nodes||[]:s.nodes.filter(n=>n.layer===selected);
  layout(`<section class="hero"><h2>LL350 Node Identity Mesh</h2><p>Runtime active names are unique. Legacy duplicates are preserved as aliases: LL068 keeps IRON_PULSE as legacyAlias and LL108 keeps PULSE_MATRIX as legacyAlias.</p><select onchange="window.nodeFilter=this.value;render()">${filters.map(f=>`<option value="${f}" ${f===selected?'selected':''}>${f==='all'?'All nodes':layerLabel(f)}</option>`).join('')}</select></section><section class="nodes">${ns.map(n=>`<div class="node ${n.status}"><strong>${n.id} ${n.name}</strong><small>${n.domain}</small><span class="pill ${n.status==='active'?'good':n.status==='reserved'?'warn':''}">${n.status}</span>${n.legacyAlias?`<small>legacy alias: ${n.legacyAlias}</small>`:''}<small>${n.purpose}</small><small>trust ${Math.round(n.trustScore*100)} • reward ${Math.round(n.rewardScore*100)} • execute ${n.canExecute}</small></div>`).join('')}</section>`);
}
function bridges(){
  const s=state; layout(`<section class="hero"><h2>Bridge Integrations Added</h2><p>The uploaded bridges pack and FiveM DreamSystem bridge are surfaced here. Bridge actions stay gated: inspect/request/propose only; ActionEngine handles execution.</p></section><section class="grid2">${s.bridges.map(b=>`<div class="bridge"><h3>${b.id}</h3><span class="pill ${b.status.includes('installed')?'good':'warn'}">${b.status}</span><p class="muted">${b.name} • ${b.type}<br>Authority: ${b.actionAuthority}<br>Direct execution: ${b.canExecuteDirectly}</p>${b.notes?`<p>${b.notes}</p>`:''}<ul>${(b.files||[]).slice(0,9).map(f=>`<li>${f}</li>`).join('')}${(b.files||[]).length>9?'<li>...</li>':''}</ul></div>`).join('')}</section>`);
}
function fivem(){
  const f = state.fivem || {};
  layout(`<section class="hero"><h2>FiveM DreamSystem</h2><p>Lucy now owns the uploaded FiveM resource pack as a digital-twin / dream runtime. The original upload is preserved, nested resources are extracted, and a new <b>lucy_dreamsystem_bridge</b> resource can heartbeat into Lucy and poll safe dream commands.</p><span class="pill good">installed</span><span class="pill">${f.extractedResourceCount || 0} extracted resources</span><span class="pill">whitelisted commands only</span></section><section class="grid2"><div class="card"><h3>Dream Command Queue</h3><p class="muted">Queue a safe command. FXServer receives it when lucy_dreamsystem_bridge polls Lucy.</p><select id="fivemAction"><option value="announce">announce</option><option value="dream_marker">dream_marker</option><option value="ambient_pulse">ambient_pulse</option></select><textarea id="fivemMessage" placeholder="Message or dream event label...">Lucy DreamSystem pulse online.</textarea><button onclick="queueFivemCommand()">Queue Dream Command</button><pre id="fivemCommandOut">Queued commands: ${(f.queuedCommands||[]).length}</pre></div><div class="card"><h3>Install Steps</h3><pre>1. Copy fivem/lucy_dreamsystem_bridge to your FXServer resources/[lucy]/ folder.
2. Add to server.cfg:
   set lucy_url "http://127.0.0.1:${state.port}"
   set lucy_bridge_secret "change-this-local-secret"
   ensure lucy_dreamsystem_bridge
3. Start Lucy first, then FXServer.
4. In console/game chat run: /lucybridge</pre><button onclick="loadFivemStatus()">Load Resource Manifest</button></div></section><section id="fivemOut" class="card"><p class="muted">Click Load Resource Manifest to inspect uploaded/extracted resources.</p></section>`);
}
async function loadFivemStatus(){
  const j=await api('/api/fivem/dreamsystem/status');
  $('#fivemOut').innerHTML=`<h3>Lucy DreamSystem Manifest</h3><p>${escapeHtml(j.rule)}</p><div>${j.whitelistedDreamCommands.map(c=>`<span class="pill good">${c}</span>`).join('')}</div><h3>Extracted Resources</h3><div class="nodes">${j.extractedResources.map(r=>`<div class="node active"><strong>${r.name}</strong><small>${r.path}</small><span class="pill ${r.hasFxmanifest?'good':'warn'}">fxmanifest ${r.hasFxmanifest?'yes':'no'}</span><small>${r.fileCount} files</small></div>`).join('')}</div><h3>Last Heartbeats</h3><pre>${escapeHtml(JSON.stringify(j.lastHeartbeats.slice(0,5),null,2))}</pre>`;
}
async function queueFivemCommand(){
  const action=$('#fivemAction').value;
  const message=$('#fivemMessage').value;
  const payload = action==='dream_marker' ? { label: message, coords:{x:215.0,y:-810.0,z:30.0}, durationMs:30000 } : { message };
  const j=await api('/api/fivem/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,message,payload,serverId:'any'})});
  $('#fivemCommandOut').textContent=JSON.stringify(j,null,2);
  await refresh({silent:true});
}

function serverLucy(){
  const s = state.fivem?.serverLucy || {resourceCount:0,queuedCommands:[],lastHeartbeats:[],lastResults:[],proposals:[]};
  layout(`<section class="hero"><h2>Server Lucy — Linked FiveM Body</h2><p>This is the uploaded server-side Lucy. Main Lucy stays the AI framework/brain. Server Lucy links to updates and changes through the bridge while running inside FXServer as <b>lucy_bridge</b> + <b>lucy_framework</b>.</p><span class="pill good">linked body</span><span class="pill">${s.resourceCount || 0} core resources</span><span class="pill">${(s.queuedCommands||[]).length} queued</span></section><section class="grid2"><div class="card"><h3>Queue Server Lucy Command</h3><p class="muted">These match the uploaded Server Lucy resource whitelist.</p><select id="serverLucyType"><option value="lucy:chat:broadcast">lucy:chat:broadcast</option><option value="lucy:mission:create_basic">lucy:mission:create_basic</option><option value="lucy:director:scenario">lucy:director:scenario</option></select><textarea id="serverLucyMessage" placeholder="Broadcast, mission objective, or scenario note...">Server Lucy bridge online.</textarea><div class="row"><select id="serverLucyRole"><option>civilian</option><option>police</option><option>ems</option><option>trucker</option><option>gang</option></select><button onclick="queueServerLucyCommand()">Queue To Server Lucy</button></div><pre id="serverLucyOut">Queued commands: ${(s.queuedCommands||[]).length}</pre></div><div class="card"><h3>Install Server Lucy</h3><pre>Copy both folders into FXServer resources/[lucy]/:

fivem/server_lucy_resources/[lucy]/lucy_framework
fivem/server_lucy_resources/[lucy]/lucy_bridge

server.cfg:
set lucy_url "http://127.0.0.1:${state.port}"
set lucy_bridge_secret "lucy-local-dev"
ensure lucy_framework
ensure lucy_bridge</pre><button onclick="loadServerLucyStatus()">Load Server Lucy Manifest</button></div></section><section id="serverLucyManifest" class="card"><h3>Live Bridge Snapshot</h3><pre>${escapeHtml(JSON.stringify({lastHeartbeats:s.lastHeartbeats?.slice(0,3)||[], lastResults:s.lastResults?.slice(0,3)||[], proposals:s.proposals?.slice(0,3)||[]}, null, 2))}</pre></section>`);
}
async function loadServerLucyStatus(){
  const j=await api('/api/fivem/server-lucy/status');
  $('#serverLucyManifest').innerHTML=`<h3>Server Lucy Manifest</h3><p>${escapeHtml(j.rule)}</p><div>${j.whitelistedServerCommands.map(c=>`<span class="pill good">${c}</span>`).join('')}</div><h3>Resources</h3><div class="nodes">${j.resources.map(r=>`<div class="node active"><strong>${r.name}</strong><small>${r.path}</small><span class="pill ${r.hasFxmanifest?'good':'warn'}">fxmanifest ${r.hasFxmanifest?'yes':'no'}</span><small>${r.fileCount} files</small></div>`).join('')}</div><h3>Install</h3><pre>${escapeHtml(j.install.join('\n'))}</pre><h3>Heartbeats / Results</h3><pre>${escapeHtml(JSON.stringify({heartbeats:j.lastHeartbeats.slice(0,5), results:j.lastResults.slice(0,5), queued:j.queuedCommands},null,2))}</pre>`;
}
async function queueServerLucyCommand(){
  const type=$('#serverLucyType').value;
  const message=$('#serverLucyMessage').value;
  const role=$('#serverLucyRole').value;
  let body={type,message};
  if(type==='lucy:mission:create_basic') body={type,payload:{title:`Lucy ${role} Mission`,role,objective:message || 'Complete the Lucy-directed server objective.',coords:{x:215.76,y:-810.12,z:30.73},reward:250}};
  if(type==='lucy:director:scenario') body={type,payload:{scenario:'lucy_controlled_scenario',intensity:2,note:message || 'Lucy controlled scenario.'}};
  const j=await api('/api/fivem/server-lucy/commands',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  $('#serverLucyOut').textContent=JSON.stringify(j,null,2);
  await refresh({silent:true});
}

function planet(){
  layout(`<section class="hero"><h2>Planetary Pulse / Twin Earth Integration</h2><p>Planetary nodes LL151–LL200 are now in the registry. Live feeds are adapter-ready while the dashboard remains green offline.</p><button onclick="loadPlanet()">Check Planetary Adapter Status</button></section><section id="planetOut" class="card"><p class="muted">Click check to load feed slots and planetary node list.</p></section>`);
}
async function loadPlanet(){ const p=await api('/api/planetary/status'); $('#planetOut').innerHTML=`<h3>${p.status}</h3><p>${p.note}</p><div>${p.feeds.map(f=>`<span class="pill">${f}</span>`).join('')}</div><h3>Planetary Nodes</h3><div class="nodes">${p.nodes.map(n=>`<div class="node ${n.status}"><strong>${n.id} ${n.name}</strong><small>${n.purpose}</small></div>`).join('')}</div>`; }
function builder(){
  layout(`<section class="hero"><h2>BuilderOS Gate</h2><p>Create safe sandbox proposals. This demonstrates Lucy → Eagle Eye → Emma → Bioython → DeltaVault without touching live folders.</p></section><section class="grid2"><div class="card"><h3>Sandbox Build Proposal</h3><textarea id="proposalText" placeholder="Paste a build goal or integration prompt..." oninput="localStorage.setItem('lucyProposalDraft',this.value)">${escapeHtml(localStorage.getItem('lucyProposalDraft')||'')}</textarea><div class="row"><select id="domain"><option>general_code</option><option>fivem</option><option>ue5</option><option>planetary_pulse</option></select><button onclick="createProposal()">Create Proposal</button></div><pre id="proposalOut">No proposal yet.</pre></div><div class="card"><h3>Bioython Sandbox Write Demo</h3><p class="muted">Writes only inside data/sandbox.</p><textarea id="writeText">Lucy sandbox write demo.</textarea><button onclick="sandboxWrite()">Run Safe Write</button><pre id="writeOut">No write yet.</pre></div></section>`);
}
async function createProposal(){ const j=await api('/api/builder/proposal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:$('#proposalText').value,domain:$('#domain').value})}); $('#proposalOut').textContent=JSON.stringify(j,null,2); await refresh({silent:true}); }
async function sandboxWrite(){ const j=await api('/api/execution/sandbox-write-demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:$('#writeText').value})}); $('#writeOut').textContent=JSON.stringify(j,null,2); await refresh({silent:true}); }
function vault(){ const s=state; layout(`<section class="hero"><h2>DeltaVault Ledger</h2><p>Append-only JSONL events are written to <b>${s.paths.ledger}</b>.</p></section><section class="timeline">${s.recentEvents.map(e=>`<div class="event"><b>${e.actor}</b> <span class="pill risk${e.riskLevel}">${e.type}</span><p>${escapeHtml(e.summary)}</p><small>${e.at}</small></div>`).join('')||'<p>No events yet.</p>'}</section>`); }
function chatTab(){ layout(`<section class="hero"><h2>Front Chat Window</h2><p>Ask Lucy what she is doing while the build runs. The input is now protected from auto-refresh resets.</p></section>${frontChat(true)}`); }
function frontChat(full){ return `<section class="${full?'card':'footerChat'}"><h3>Lucy Front Chat</h3><div class="chatlog" id="chatlog">${chat.map(m=>`<div class="line ${m.role==='user'?'you':'lucy'}"><b>${m.role==='user'?'You':'Lucy'}</b><br>${escapeHtml(m.text)}</div>`).join('')}</div><div class="row"><input id="chatInput" placeholder="Ask: what are you doing?" value="${escapeAttr(chatDraft)}" oninput="setDraft(this.value)" onkeydown="if(event.key==='Enter')sendChat()"><button onclick="sendChat()">Send</button></div><div class="row"><button class="secondary" onclick="quick('what are you doing?')">Status</button><button class="secondary" onclick="quick('FiveM DreamSystem status')">FiveM</button><button class="secondary" onclick="quick('bridge status')">Bridges</button><button class="secondary" onclick="quick('show LL350 registry')">LL350</button></div></section>` }
async function quick(t){ setDraft(t); render(); await sendChat(); }
async function sendChat(){ const text=chatDraft.trim(); if(!text) return; chat.push({role:'user',text}); saveChat(); setDraft(''); render(); const j=await api('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})}); chat.push({role:'lucy',text:j.reply}); saveChat(); await refresh({silent:false}); setTimeout(()=>{ const log=$('#chatlog'); if(log) log.scrollTop=log.scrollHeight; },0); }
function render(){ if(!state){ app.innerHTML='<div class="hero"><h2>Booting Lucy...</h2></div>'; return; } if(tab==='overview') return overview(); if(tab==='nodes') return nodes(); if(tab==='bridges') return bridges(); if(tab==='fivem') return fivem(); if(tab==='serverlucy') return serverLucy(); if(tab==='planet') return planet(); if(tab==='builder') return builder(); if(tab==='vault') return vault(); if(tab==='chat') return chatTab(); }
refresh();
setInterval(()=>refresh({silent:true}).catch(()=>{}), 5000);
