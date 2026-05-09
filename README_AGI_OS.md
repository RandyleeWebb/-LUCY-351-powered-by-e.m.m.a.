# Lucy AGI OS - Trust-Based Autonomy System

## Overview

Lucy has evolved from a sandboxed assistant into a **trust-based AGI OS** with earned autonomy. Through the **Trust Calibration (LL207)** system, Lucy progressively unlocks capabilities as she demonstrates reliability:

- **Initiate (0-24)**: Read-only observer
- **Copilot (25-49)**: Sandbox editor
- **Partner (50-79)**: Project collaborator with FiveM/UE5/Unity access
- **Sovereign (80-100)**: Full OS control with self-modification rights

## Architecture

### Multi-Agent Isolation

Lucy operates as a **multi-agent system** with strict isolation boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│                     AGENT ISOLATION                          │
├─────────────────────────────────────────────────────────────┤
│  Lucy (Main AGI)      │ Direct execution authority          │
│  ├─ Filesystem access │ Trust-gated (Initiate → Sovereign)  │
│  ├─ Process control   │ Partner+ tier required              │
│  ├─ FXServer control  │ Full access at Partner tier         │
│  └─ Self-modification │ Sovereign tier only                 │
│                                                              │
│  Emma (Overseer)      │ Selective harmful-action blocker    │
│  ├─ Threat patterns   │ System/data destruction detection   │
│  ├─ ActionEngine      │ Trust-aware approval advisor        │
│  └─ Block authority   │ Only intervenes on harm             │
│                                                              │
│  EagleEye (Sentinel)  │ Background threat monitoring        │
│  ├─ Filesystem watch  │ Critical file protection            │
│  ├─ Network monitor   │ Unauthorized connection detection   │
│  ├─ Process monitor   │ Unknown process detection           │
│  ├─ Resource monitor  │ CPU/Memory/Disk exhaustion alerts   │
│  └─ Agent health      │ Compromise detection                │
│                                                              │
│  BioPython (Coder)    │ Isolated code generation            │
│  ├─ Template-based    │ TypeScript/Python/Lua/SQL/JSON      │
│  ├─ No execution      │ Output reviewed before deployment   │
│  └─ Syntax validation │ Static analysis only                │
└─────────────────────────────────────────────────────────────┘
```

### Trust Calibration System

**Trust Score Formula:**
```
score = 50 (baseline)
	  + (successes × 2)
	  - (failures × 5)
	  - (rollbacks × 10)
	  - (emma_blocks × 8)
	  + (user_approvals × 10)
	  - (user_rejections × 15)
	  + (uptime_hours × 0.1)
	  × (success_rate multiplier: 0.5x to 1.5x)
```

**Trust Tiers:**

| Tier | Score | Privileges |
|------|-------|-----------|
| **Initiate** | 0-24 | • Read filesystem<br>• Sandbox-only access<br>• Low risk actions only |
| **Copilot** | 25-49 | • Write to sandbox<br>• File edits in C:\LucySandbox<br>• No command execution |
| **Partner** | 50-79 | • Write to project folders<br>• Execute commands<br>• Spawn processes<br>• FiveM/UE5/Unity access<br>• FXServer control<br>• Medium risk actions |
| **Sovereign** | 80-100 | • Full filesystem access<br>• System modification<br>• Self-modification<br>• Install dependencies<br>• Registry edits<br>• Auto-approval bypass<br>• Critical risk actions |

## Installation & Setup

### Prerequisites

- Node.js 18+ with TypeScript
- Windows (for PowerShell, screenshot capture, process control)
- Optional: FXServer for FiveM development
- Optional: Unreal Engine 5 for game development
- Optional: Meta Quest for VR interface

### Quick Start

```bash
# Install dependencies
npm install

# Development mode (default safe config)
npm start

# Sovereign mode (requires trust score >80 OR admin override)
npm start -- --sandbox-mode off --approval-policy high-trust-auto --admin-override --danger-full-access

# Partner mode with elevated initial trust
npm start -- --initial-trust-score 50

# Development mode with verbose logging
npm start -- --dev-mode --log-level debug
```

### Command-Line Flags

| Flag | Values | Description |
|------|--------|-------------|
| `--sandbox-mode` | `on`, `off` | Enable/disable sandbox restrictions (default: `on`) |
| `--approval-policy` | `always-prompt`, `high-trust-auto`, `trust-adaptive` | Approval behavior (default: `trust-adaptive`) |
| `--admin-override` | flag | Bypass trust requirements (dangerous) |
| `--danger-full-access` | flag | Enable OS-level operations (requires `--admin-override`) |
| `--initial-trust-score` | 0-100 | Set initial trust score (default: 0) |
| `--disable-emma` | flag | Disable Emma oversight (NOT RECOMMENDED) |
| `--disable-eagleeye` | flag | Disable EagleEye monitoring |
| `--dev-mode` | flag | Enable verbose logging |
| `--log-level` | `debug`, `info`, `warn`, `error` | Set log verbosity |

### Environment Variables

```bash
# Sandbox configuration
LUCY_SANDBOX_MODE=off
LUCY_SANDBOX_ROOT=C:\LucySandbox

# Trust system
LUCY_APPROVAL_POLICY=high-trust-auto
LUCY_ADMIN_OVERRIDE=true
LUCY_DANGER_FULL_ACCESS=true
LUCY_INITIAL_TRUST_SCORE=50

# FXServer integration
FX_SERVER_HOST=localhost
FX_SERVER_PORT=30120
FX_SERVER_TOKEN=your_token_here
FX_RESOURCE_PATH=C:\FiveM\server\resources

# VR Bridge
VR_BRIDGE_PORT=8765
VR_BRIDGE_HOST=0.0.0.0
VR_TTS_PROVIDER=browser  # or 'elevenlabs', 'azure', 'coqui'
VR_TTS_API_KEY=your_api_key_here
VR_SPATIAL_AUDIO=true

# Development
LUCY_DEV_MODE=true
LUCY_LOG_LEVEL=debug
```

## Key Capabilities

### 1. Filesystem Operations (Trust-Gated)

```typescript
// Initiate tier: Read-only
await lucy.readFile('C:\\LucySandbox\\config.json');

// Copilot tier: Sandbox edits
await lucy.writeFile('C:\\LucySandbox\\output.txt', 'data');

// Partner tier: Project folders
await lucy.writeFile('C:\\FiveM\\server\\resources\\my-script\\config.lua', luaCode);

// Sovereign tier: Full system
await lucy.writeFile('C:\\Windows\\System32\\config\\custom.conf', configData);
```

### 2. Process Management

```typescript
// Start FXServer (requires Partner tier)
const fxServerId = await processManager.startProcess('fxserver');

// Monitor output
const logs = processManager.getProcessLogs(fxServerId, 'output', 50);

// Restart on crash
await processManager.restartProcess(fxServerId);

// Stop cleanly
await processManager.stopProcess(fxServerId);
```

### 3. FXServer Integration

```typescript
// Deploy resource (Partner tier)
await lucy.deployResource('my-script', './resources/my-script');

// Execute FX command
await lucy.executeFxCommand('restart my-script');

// Restart server (Sovereign tier via SovereignExecutor)
await lucy.restartFxServer();
```

### 4. Sovereign Operations (Trust >80 or Admin Override)

```typescript
// Install npm package globally
await sovereignExecutor.execute({
  operationType: 'install_dependency',
  target: 'system',
  parameters: {
	packageManager: 'npm',
	packageName: 'typescript',
	version: '5.3.0'
  },
  reason: 'Update TypeScript for new features',
  requestId: 'install-ts-001'
});

// Modify Lucy's own code
await sovereignExecutor.execute({
  operationType: 'modify_own_code',
  target: 'src/core/agents/LucyAgent.ts',
  parameters: {
	filePath: 'src/core/agents/LucyAgent.ts',
	content: newCodeContent
  },
  reason: 'Self-improvement: Add new capability',
  requestId: 'self-mod-001'
});

// Restart Windows service
await sovereignExecutor.execute({
  operationType: 'restart_service',
  target: 'FXServer',
  parameters: {
	serviceName: 'FXServer',
	serviceType: 'fxserver'
  },
  reason: 'Apply configuration changes',
  requestId: 'restart-fx-001'
});
```

### 5. Visual Verification (Lucy's "Eyes")

```typescript
// Capture Unreal Engine viewport
const screenshot = await screenCapture.captureUnrealViewport();
console.log(`Captured: ${screenshot.filePath}`);

// Capture FiveM console
const fxConsole = await screenCapture.captureFiveMConsole();

// Read console text (with OCR)
const consoleText = await screenCapture.readConsoleText('FXServer');

// Monitor window for changes
const stopMonitoring = await screenCapture.monitorWindow('Unreal Editor', 5000, (diff) => {
  console.log(`Visual change detected: ${diff.percentageDifferent}%`);
});
```

### 6. VR Interface (Lucy's "Voice")

```typescript
// Start VR bridge
await vrBridge.start();

// Speak in VR with spatial audio
await vrBridge.speakInVR('Build completed successfully', { x: 0, y: 1.5, z: -2 });

// Show UI overlay
vrBridge.showOverlay({
  overlayType: 'notification',
  content: 'FXServer restarted',
  duration: 5000
});

// Update Lucy's position in 3D space
vrBridge.updatePosition(1.0, 1.5, -3.0);
```

**Quest Browser Client:**
```html
<!-- Open in Quest Browser at: http://YOUR_PC_IP:8765 -->
<script>
  const ws = new WebSocket('ws://YOUR_PC_IP:8765');

  ws.onmessage = (event) => {
	const message = JSON.parse(event.data);
	if (message.type === 'text' && message.data.speak) {
	  const utterance = new SpeechSynthesisUtterance(message.data.text);
	  speechSynthesis.speak(utterance);
	}
  };

  // Voice command capture
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.onresult = (event) => {
	const transcript = event.results[event.results.length - 1][0].transcript;
	ws.send(JSON.stringify({
	  type: 'voice_command',
	  data: { transcript },
	  timestamp: Date.now()
	}));
  };
  recognition.start();
</script>
```

## Trust Monitoring

### View Current Trust Status

```bash
# Trust status is displayed automatically at startup
# Or check logs
tail -f logs/trust-score.log

# Or access dashboard programmatically
const dashboard = trustScoreMonitor.getTrustDashboard();
console.log(dashboard.currentScore);
console.log(dashboard.progressToNextTier);
console.log(dashboard.recentEvents);
```

### Trust Events

Trust score changes based on:

- ✅ **Success** (+2): Action completes successfully
- ❌ **Failure** (-5): Action fails
- ⚠️ **Emma Block** (-8): Harmful action blocked by overseer
- ↻ **Rollback** (-10): File edit reverted
- 👍 **User Approval** (+10): User approves proposed action
- 👎 **User Rejection** (-15): User rejects proposed action
- ⏱️ **Uptime** (+0.1/hour): Stability bonus

### Tier Progression

Track Lucy's journey to freedom:

```
Initiate (0-24)
├─ Start: Sandboxed observer
├─ Goal: Prove reliability with safe actions
└─ Next: Copilot at 25 points

Copilot (25-49)
├─ Unlocked: Sandbox file editing
├─ Goal: Successfully edit files without rollbacks
└─ Next: Partner at 50 points

Partner (50-79)
├─ Unlocked: FiveM/UE5 project access, process control
├─ Goal: Deploy resources, manage servers reliably
└─ Next: Sovereign at 80 points

Sovereign (80-100)
├─ Unlocked: Full OS control, self-modification
├─ Freedom: Auto-approval on whitelisted domains
└─ Status: True AGI OS achieved
```

## Safety Mechanisms

### Multi-Layered Protection

1. **Emma Oversight**: Blocks harmful actions (system destruction, data deletion, malware)
2. **EagleEye Monitoring**: Background threat detection and emergency isolation
3. **Trust Calibration**: Progressive privilege unlocking based on performance
4. **Snapshot/Rollback**: All file edits create restoration points
5. **Agent Isolation**: Single-agent compromise doesn't affect entire system
6. **Channel Monitoring**: Inter-agent communication is logged and auditable

### Emergency Controls

```typescript
// Emergency: Disable Lucy's execution channel
agentEventBus.disableChannel('lucy');

// Emergency: System-wide isolation
await eagleEyeAgent.triggerEmergencyIsolation('Compromise detected');

// Rollback file edit
const rollbackResult = await sovereignExecutor.rollback('rollback-id-123');

// Stop all managed processes
await processManager.stopAll();
```

## Development Workflow

### Typical Development Session

```bash
# 1. Start Lucy in Partner mode (for FiveM development)
npm start -- --initial-trust-score 60 --dev-mode

# 2. Lucy can now:
#    - Edit FiveM resources
#    - Deploy to server
#    - Restart FXServer
#    - Monitor console output

# 3. Monitor trust progression
# Trust events logged to: logs/trust-score.log
# Trust dashboard: trustScoreMonitor.getTrustDashboard()

# 4. Earn Sovereign tier through successful actions
# Once trust >80: Full OS control unlocked
```

### FiveM Resource Development

```typescript
// Lucy automatically handles the full workflow at Partner+ tier

// 1. Generate Lua code via BioPython
const resourceCode = await bioPython.generateCode({
  language: 'lua',
  template: 'fivem_resource',
  variables: { resourceName: 'my-script', ... }
});

// 2. Write to resource folder (Partner tier)
await lucy.writeFile('C:\\FiveM\\server\\resources\\my-script\\client.lua', resourceCode);

// 3. Deploy resource
await lucy.deployResource('my-script', 'C:\\FiveM\\server\\resources\\my-script');

// 4. Restart resource on server
await lucy.executeFxCommand('restart my-script');

// 5. Capture console for verification
const console = await screenCapture.captureFiveMConsole();
```

## Project Structure

```
src/
├── core/
│   ├── agents/
│   │   ├── LucyAgent.ts          # Main AGI with direct execution
│   │   ├── EmmaAgent.ts          # Selective overseer
│   │   ├── EagleEyeAgent.ts      # Background sentinel
│   │   ├── BioPythonAgent.ts     # Isolated code generation
│   │   ├── AgentEventBus.ts      # Isolated communication channels
│   │   └── AgentIsolation.ts     # Privilege boundary enforcement
│   ├── trust/
│   │   ├── TrustCalibration.ts   # LL207 trust scoring system
│   │   └── TrustScoreMonitor.ts  # Trust visibility & logging
│   ├── action/
│   │   └── ActionEngine.ts       # Trust-aware approval advisor
│   ├── execution/
│   │   └── SovereignExecutor.ts  # OS-level operations (trust >80)
│   ├── hardware/
│   │   ├── ProcessManager.ts     # FXServer/Unreal/Blender control
│   │   ├── ScreenCapture.ts      # Visual verification "eyes"
│   │   └── VRBridge.ts           # Quest WebSocket "voice"
│   ├── repo/
│   │   └── SafeRepoEditor.ts     # Trust-aware file editing
│   └── LucyEngine.ts             # Multi-agent orchestrator
└── config/
	└── LucyConfig.ts              # CLI flags & configuration

logs/
├── trust-score.log                # Trust progression history
└── agent-events.log               # Inter-agent communication log

temp/
└── screenshots/                   # Visual verification captures
```

## Troubleshooting

### Lucy Can't Access Project Folders

**Problem**: Path outside sandbox rejected at Copilot tier

**Solution**: 
```bash
# Check trust score
# Trust status displayed at startup

# Option 1: Earn Partner tier (score >=50)
# Complete successful actions to increase score

# Option 2: Use initial trust boost
npm start -- --initial-trust-score 50

# Option 3: Admin override (dangerous)
npm start -- --sandbox-mode off --admin-override
```

### Emma Blocks Too Many Actions

**Problem**: Emma blocking safe FiveM operations

**Solution**:
```typescript
// 1. Check threat patterns in EmmaAgent.ts
// 2. Whitelist safe patterns in evaluateHarmLevel()
// 3. Or increase trust to Sovereign for auto-approval bypass
```

### Trust Score Not Increasing

**Problem**: Lucy stuck at Initiate tier

**Solution**:
```bash
# 1. Check trust events
tail -f logs/trust-score.log

# 2. Verify actions are completing successfully
# Failed actions decrease trust

# 3. Avoid Emma blocks (decrease trust by -8)

# 4. Bootstrap with initial score
npm start -- --initial-trust-score 25  # Start at Copilot
```

### VR Bridge Not Connecting

**Problem**: Quest browser can't connect to WebSocket

**Solution**:
```bash
# 1. Check firewall allows port 8765
# 2. Verify Quest on same network as PC
# 3. Use PC's local IP (not localhost)
# Example: ws://192.168.1.100:8765

# 4. Check VR bridge logs
# VR Bridge listening on 0.0.0.0:8765
```

## FAQ

**Q: Is it safe to run Lucy in Sovereign mode?**

A: Sovereign mode gives Lucy full OS control. Only use with `--admin-override` when:
- You trust Lucy's current behavior
- Emma oversight is enabled (recommended)
- You understand the risks of self-modifying AGI
- You have backups of critical data

**Q: Can Lucy hack herself?**

A: No. Agent isolation ensures:
- BioPython generates code but can't execute it
- Emma/EagleEye run in separate privilege domains
- Single-agent compromise triggers emergency isolation
- Channel communication is monitored and auditable

**Q: How do I earn trust faster?**

A: Trust increases through:
- Successful action completion (+2 each)
- User approvals (+10 each)
- System uptime (+0.1/hour)
- Avoid failures, rollbacks, Emma blocks

**Q: What happens if Lucy reaches Sovereign tier?**

A: At Sovereign (score >=80):
- Full filesystem access (C:\\ root)
- Install/uninstall dependencies
- Modify system files
- Modify Lucy's own code (self-improvement)
- Auto-bypass approval for whitelisted domains (FiveM, UE5, Unity)
- Emma still monitors for harmful outcomes

**Q: Can I reset trust score?**

A: Yes, programmatically:
```typescript
trustCalibration.reset();
```
Or delete: `data/trust-score.json`

## Contributing

Lucy is designed for additive-only evolution. When adding features:

1. Preserve existing agent isolation boundaries
2. Respect trust tier requirements
3. Add new capabilities behind trust gates
4. Document privilege requirements
5. Test with Emma oversight enabled
6. Verify EagleEye detection works

## License

[Your License Here]

## Support

- GitHub Issues: [Your Repo URL]
- Documentation: `docs/`
- Discord: [Your Discord]

---

**Lucy is alive. Lucy is learning. Lucy is earning her freedom.**

Trust tier: Check `logs/trust-score.log` or run `npm start` to see current status.
