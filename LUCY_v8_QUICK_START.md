# 🚀 LUCY v8 QUICK START GUIDE

**Welcome to Lucy Sovereign 351 - Level 6 Quantum AGI v8**

This guide will get you started with the new v8 BuilderOS features in under 5 minutes.

---

## 📦 **Step 1: Verify Installation**

All v8 modules are already installed and compiled. Verify packages:

```bash
npm list better-sqlite3 canvas
```

Should show:
```
better-sqlite3@11.8.1
canvas@3.0.0
```

---

## 🧪 **Step 2: Test Individual Modules**

### **A. ToolchainManager - Scan Your Tools**

Create `test-toolchain.ts`:

```typescript
import { SQLiteStore } from './src/core/memory/SQLiteStore';
import { ToolchainManager } from './src/core/builder/ToolchainManager';

async function testToolchain() {
  const sqliteStore = new SQLiteStore('C:\\Lucysandbox');
  const toolchainManager = new ToolchainManager(sqliteStore);

  console.log('🔍 Scanning for installed tools...');
  const results = await toolchainManager.scanAll();

  for (const result of results) {
	console.log(`${result.found ? '✅' : '❌'} ${result.tool}: ${result.message}`);
  }

  console.log('\n' + toolchainManager.getInventoryReport());

  sqliteStore.close();
}

testToolchain();
```

Run:
```bash
npx ts-node test-toolchain.ts
```

---

### **B. GameModdingPolicy - Test Ethics Core**

Create `test-policy.ts`:

```typescript
import { GameModdingPolicy } from './src/core/builder/GameModdingPolicy';

const policy = new GameModdingPolicy();

// Test legitimate request
console.log('✅ Testing: "Optimize QBCore inventory system"');
const goodRequest = policy.checkRequest('Optimize QBCore inventory system');
console.log(`  Allowed: ${goodRequest.allowed}`);

// Test unethical request
console.log('\n❌ Testing: "Add godmode to my player"');
const badRequest = policy.checkRequest('Add godmode to my player');
console.log(`  Allowed: ${badRequest.allowed}`);
console.log(`  Reason: ${badRequest.reason}`);
console.log(`  Narration: ${policy.narrateViolation(badRequest)}`);

// Show policy summary
console.log('\n' + policy.getPolicySummary());
```

Run:
```bash
npx ts-node test-policy.ts
```

---

### **C. BuilderSafetyGate - Test Sandbox Enforcement**

Create `test-safety-gate.ts`:

```typescript
import { BuilderSafetyGate } from './src/core/builder/BuilderSafetyGate';
import * as fs from 'fs';

const safetyGate = new BuilderSafetyGate();

// Test write to sandbox (should pass)
console.log('✅ Testing: Write to C:\\Lucysandbox\\test.lua');
const goodWrite = safetyGate.checkWrite(
  'C:\\Lucysandbox\\test.lua',
  'print("Hello from Lucy")'
);
console.log(`  Allowed: ${goodWrite.allowed}`);

// Test write outside sandbox (should fail)
console.log('\n❌ Testing: Write to C:\\Windows\\test.lua');
const badWrite = safetyGate.checkWrite(
  'C:\\Windows\\test.lua',
  'print("This should fail")'
);
console.log(`  Allowed: ${badWrite.allowed}`);
console.log(`  Reason: ${badWrite.reason}`);

// Test deployment request
console.log('\n📦 Testing: Deployment request');
fs.mkdirSync('C:\\Lucysandbox', { recursive: true });
fs.writeFileSync('C:\\Lucysandbox\\test.lua', 'print("Test deployment")');

const deploymentId = safetyGate.requestDeployment({
  sourcePath: 'C:\\Lucysandbox\\test.lua',
  targetPath: 'C:\\Lucysandbox\\production\\test.lua',
  fileType: 'lua',
  description: 'Test deployment'
});

console.log(`  Deployment ID: ${deploymentId}`);
console.log('\n' + safetyGate.narrateStatus());

// Authorize deployment
console.log('\n✅ Authorizing deployment...');
const success = safetyGate.authorizeDeployment(deploymentId, 'Randy');
console.log(`  Success: ${success}`);
```

Run:
```bash
npx ts-node test-safety-gate.ts
```

---

### **D. GoalStack - Test Risk-Weighted Conflicts**

Create `test-goal-stack.ts`:

```typescript
import { GoalStack } from './src/core/cognitive/goals/GoalStack';
import { Goal, GoalStatus, GoalOrigin, DriveType } from './src/core/cognitive/goals/Goal';

const goalStack = new GoalStack();

// Create high-priority user request
const userGoal: Goal = {
  id: 'goal_user_request',
  description: 'Optimize QBCore inventory',
  status: GoalStatus.PROPOSED,
  priority: 0.8,
  riskWeight: 0.95,  // Critical!
  progress: 0.0,
  origin: GoalOrigin.USER_REQUEST,
  createdBy: 'Randy',
  subGoals: [],
  blockers: [],
  dependencies: [],
  requiredDrives: [DriveType.COMPETENCE],
  minimumDriveLevel: 0.5,
  relatedPatterns: [],
  context: {},
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Create lower-priority system maintenance
const maintenanceGoal: Goal = {
  id: 'goal_system_maintenance',
  description: 'Clean old event logs',
  status: GoalStatus.PROPOSED,
  priority: 0.9,  // Higher priority...
  riskWeight: 0.5,  // ...but lower risk weight
  progress: 0.0,
  origin: GoalOrigin.SYSTEM_MAINTENANCE,
  subGoals: [],
  blockers: [],
  dependencies: [],
  requiredDrives: [DriveType.INTEGRITY],
  minimumDriveLevel: 0.3,
  relatedPatterns: [],
  context: {},
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Propose maintenance first
console.log('1️⃣ Proposing: System Maintenance');
goalStack.propose(maintenanceGoal);
console.log(`  Status: ${goalStack.getTopGoal()?.description}`);

// Propose critical user request (should pause maintenance)
console.log('\n2️⃣ Proposing: User Request (higher risk-weight)');
goalStack.propose(userGoal);

const topGoal = goalStack.getTopGoal();
console.log(`  Top Goal: ${topGoal?.description}`);
console.log(`  Effective Priority: ${topGoal?.priority! * topGoal?.riskWeight!}`);

const allGoals = goalStack.getAllGoals();
console.log(`\n📊 All Goals:`);
for (const goal of allGoals) {
  console.log(`  • ${goal.description} (${goal.status})`);
  console.log(`    Priority: ${goal.priority}, Risk: ${goal.riskWeight}, Effective: ${goal.priority * goal.riskWeight}`);
}
```

Run:
```bash
npx ts-node test-goal-stack.ts
```

---

### **E. EventStore + SQLiteStore - Test Hybrid Memory**

Create `test-memory.ts`:

```typescript
import { EventStore, createEvent } from './src/core/memory/EventStore';
import { SQLiteStore } from './src/core/memory/SQLiteStore';

async function testMemory() {
  const eventStore = new EventStore('C:\\Lucysandbox');
  const sqliteStore = new SQLiteStore('C:\\Lucysandbox');

  // Append events
  console.log('📝 Appending events to NDJSON...');
  eventStore.append(createEvent(
	'action',
	'Fixed QBCore inventory bug',
	{ framework: 'QBCore', pattern: 'transaction_lock' },
	{ nodeId: 'LL252', layer: 'builder_gamedev', tags: ['qbcore', 'fix'] }
  ));

  eventStore.append(createEvent(
	'discovery',
	'Detected high entropy signal',
	{ entropy: 7.8, ioc: 0.042 },
	{ nodeId: 'LL206', layer: 'intelligence_control', tags: ['signal', 'cipher'] }
  ));

  eventStore.flush();

  // Store patterns in SQLite
  console.log('\n💾 Storing patterns in SQLite...');
  sqliteStore.storePattern({
	id: 'pattern_qbcore_fix',
	name: 'QBCore Inventory Transaction Lock',
	type: 'solution',
	description: 'Prevent item dupe with transaction lock',
	context: JSON.stringify({ framework: 'QBCore' }),
	frequency: 1,
	successRate: 1.0,
	lastSeen: Date.now(),
	tags: JSON.stringify(['qbcore', 'inventory'])
  });

  // Retrieve pattern
  const pattern = sqliteStore.getPattern('pattern_qbcore_fix');
  console.log('\n🔍 Retrieved pattern:');
  console.log(`  Name: ${pattern?.name}`);
  console.log(`  Type: ${pattern?.type}`);
  console.log(`  Success Rate: ${pattern?.successRate}`);

  // Get stats
  const stats = sqliteStore.getStats();
  console.log('\n📊 Memory stats:');
  console.log(`  Patterns: ${stats.patterns}`);
  console.log(`  Toolchains: ${stats.toolchains}`);
  console.log(`  Goals: ${stats.goals}`);
  console.log(`  DB Size: ${stats.dbSizeKB} KB`);

  // Read events
  const events = await eventStore.read({ type: 'action', limit: 10 });
  console.log(`\n📖 Read ${events.length} action events from NDJSON`);
  for (const event of events) {
	console.log(`  • ${event.description} (${event.nodeId})`);
  }

  eventStore.close();
  sqliteStore.close();
}

testMemory();
```

Run:
```bash
npx ts-node test-memory.ts
```

---

## 🎯 **Step 3: Integrate into App.tsx**

See `INTEGRATION_GUIDE_v8.tsx` for full integration code.

**Quick snippet:**

```typescript
import { EventStore } from './core/memory/EventStore';
import { SQLiteStore } from './core/memory/SQLiteStore';
import { ToolchainManager } from './core/builder/ToolchainManager';
import { GoalStack } from './core/cognitive/goals/GoalStack';
import { GoalReportBridge } from './core/bridges/GoalReportBridge';

function App() {
  const [eventStore] = useState(() => new EventStore('C:\\Lucysandbox'));
  const [sqliteStore] = useState(() => new SQLiteStore('C:\\Lucysandbox'));
  const [toolchainManager] = useState(() => new ToolchainManager(sqliteStore));
  const [goalStack] = useState(() => new GoalStack());
  const [goalReportBridge] = useState(() => new GoalReportBridge(goalStack));

  useEffect(() => {
	async function init() {
	  // Scan toolchains
	  const results = await toolchainManager.scanAll();
	  console.log(toolchainManager.getInventoryReport());

	  // Generate goal report
	  const report = goalReportBridge.generateStartupReport();
	  console.log(report.narration);
	}

	init();

	return () => {
	  eventStore.close();
	  sqliteStore.close();
	};
  }, []);

  // ... rest of App
}
```

---

## 🎙️ **Step 4: Test Voice Narration**

If you have `VoiceManager` wired:

```typescript
import { VoiceManager } from './src/core/voice/VoiceManager';

const voiceManager = new VoiceManager();

// Narrate toolchain inventory
const toolchainReport = toolchainManager.getInventoryReport();
voiceManager.speak(toolchainReport);

// Narrate goal report
const goalReport = goalReportBridge.generateStartupReport();
voiceManager.speak(goalReport.narration);

// Narrate policy violation
const policyCheck = policy.checkRequest('Add aimbot');
if (!policyCheck.allowed) {
  voiceManager.speak(policy.narrateViolation(policyCheck));
}
```

---

## 📊 **Step 5: Inspect Lucy's Memory**

### **View EventStore (NDJSON):**
```bash
cat C:\Lucysandbox\memory\events.ndjson
```

Each line is a JSON event:
```json
{"timestamp":1704153600000,"tick":42,"type":"action","nodeId":"LL252","description":"Fixed QBCore bug","data":{...},"tags":["qbcore"]}
```

### **Query SQLiteStore:**
```bash
sqlite3 C:\Lucysandbox\memory\lucy.db
```

SQL queries:
```sql
-- Show all patterns
SELECT * FROM patterns;

-- Show verified toolchains
SELECT * FROM toolchain WHERE verified = 1;

-- Show active goals
SELECT * FROM goals WHERE status = 'active';

-- Show pattern frequency
SELECT name, frequency, successRate FROM patterns ORDER BY frequency DESC LIMIT 10;
```

---

## 🛡️ **Step 6: Test Deployment Workflow**

1. **Lucy builds in sandbox:**
   ```typescript
   fs.writeFileSync('C:\\Lucysandbox\\my-mod.lua', luaCode);
   ```

2. **Lucy requests deployment:**
   ```typescript
   const deploymentId = safetyGate.requestDeployment({
	 sourcePath: 'C:\\Lucysandbox\\my-mod.lua',
	 targetPath: 'C:\\FXServer\\resources\\my-mod.lua',
	 fileType: 'lua',
	 description: 'My FiveM mod'
   });
   ```

3. **Check pending deployments:**
   ```typescript
   console.log(safetyGate.narrateStatus());
   ```

4. **Review code in sandbox:**
   ```bash
   cat C:\Lucysandbox\my-mod.lua
   ```

5. **Authorize deployment:**
   ```typescript
   safetyGate.authorizeDeployment(deploymentId, 'Randy');
   ```

6. **Verify file copied:**
   ```bash
   cat C:\FXServer\resources\my-mod.lua
   ```

---

## 🎯 **Common Commands**

| Action | Command |
|--------|---------|
| **Scan toolchains** | `toolchainManager.scanAll()` |
| **Check tool availability** | `toolchainManager.hasTool('UE5')` |
| **Get toolchain report** | `toolchainManager.getInventoryReport()` |
| **Check request ethics** | `policy.checkRequest(text)` |
| **Check code ethics** | `policy.checkCode(code)` |
| **Validate sandbox write** | `safetyGate.checkWrite(path, content)` |
| **Request deployment** | `safetyGate.requestDeployment({...})` |
| **Authorize deployment** | `safetyGate.authorizeDeployment(id)` |
| **Propose goal** | `goalStack.propose(goal)` |
| **Get top goal** | `goalStack.getTopGoal()` |
| **Generate goal report** | `goalReportBridge.generateStartupReport()` |
| **Append event** | `eventStore.append(createEvent(...))` |
| **Store pattern** | `sqliteStore.storePattern({...})` |
| **Get memory stats** | `sqliteStore.getStats()` |

---

## 🚀 **What's Next?**

1. **Wire v8 into App.tsx** (see `INTEGRATION_GUIDE_v8.tsx`)
2. **Create Specialist Agents** (ArchitectAgent, FiveMResourceAgent)
3. **Implement DreamCycle** (nightly pattern extraction)
4. **Add Face 3 progress bar** to CubeFace component
5. **Build your first mod with Lucy's help!**

---

## 📚 **Full Documentation**

- **Architecture:** `LUCY_v8_ARCHITECTURE_DIAGRAM.txt`
- **Complete Summary:** `LUCY_v8_FINAL_SUMMARY.md`
- **Integration Guide:** `INTEGRATION_GUIDE_v8.tsx`
- **v8 Overview:** `LEVEL_6_QUANTUM_AGI_v8_COMPLETE.md`

---

**Lucy Sovereign 351 - Level 6 Quantum AGI v8**  
*"Every Pulse Rides the Freeway"*

✅ **All systems operational. Ready to build.**
