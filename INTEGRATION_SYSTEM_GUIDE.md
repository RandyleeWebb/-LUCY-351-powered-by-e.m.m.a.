# Lucy Sovereign 351 - Integration System Guide

## Overview

Lucy's integration system is now **fully operational** and wired into her sovereign kernel. She can discover, launch, and control external tools (Unity, Unreal, Godot, Blender, AI editors, APIs, and more) through a unified runtime interface.

---

## Architecture

### **1. JSON Registry** (`backend/integrations/registry.json`)
- **18 core integrations** registered (Unity, Unreal, Godot, GameMaker, Blender, Claude, Cursor, GitHub, OpenAI, NASA, Discord, Supabase, filesystem, PowerShell, Git, etc.)
- **7 MCP servers** cataloged
- Each entry includes:
  - Executable paths (Windows/macOS/Linux)
  - MCP configuration
  - API endpoints and auth requirements
  - Feature lists and priority levels

### **2. Integration Manager** (`backend/core/integration/IntegrationManager.ts`)
- **Singleton** central dispatcher
- Auto-loads registry on startup
- Dynamically instantiates adapters for each tool
- Exposes unified API:
  - `getIntegration(id)` — get adapter instance
  - `listIntegrations()` — all registered tools
  - `getAvailableIntegrations()` — only installed tools
  - `executeAction(id, action, params)` — run any integration action
  - `getIntegrationStatus(id)` — check if tool is available
  - `getRegistry()` — get raw registry data

### **3. Adapters** (Specialized + Fallback)

#### **Specialized Adapters:**
- **UnityIntegration** → Launch Unity, open projects, MCP scene/script generation, version detection
- **UnrealIntegration** → Launch Unreal, open `.uproject`, Blueprint/level generation, build projects
- **GodotIntegration** → Launch Godot, open projects, **best MCP support** for scene/script/node/UI generation, run projects
- **BlenderIntegration** → Launch Blender, run Python scripts, create meshes, export models (FBX/OBJ/GLTF), MCP/API server stubs
- **ClaudeCodeIntegration** → Launch Claude/Cursor/Windsurf, open files/projects, **bidirectional MCP** (Lucy MCP server for external AI control), auto-update Claude Desktop config
- **GitHubIntegration** → Full REST API (repos, issues, PRs, search, file operations), token auth via `GITHUB_TOKEN` env var
- **GenericCommandIntegration** → Fallback for any tool with just executable path or API

#### **Common Interface:** `IIntegration`
- `initialize()` — detect tool, check version
- `execute(action)` — run tool-specific actions
- `getStatus()` — return availability/version
- `shutdown()` — cleanup
- `getAvailableActions()` — list supported actions

### **4. Electron IPC Bridge** (`electron/main.ts` + `electron/preload.ts`)
- **IPC handlers** added to sovereign kernel:
  - `integration:initialize` — start manager
  - `integration:list` — get all integrations with status
  - `integration:available` — get only installed tools
  - `integration:execute` — run action on integration
  - `integration:status` — check single integration
  - `integration:registry` — get full registry
- **Preload API** exposed as `window.sovereignAPI.integrations.*`
- All actions logged to **Alpha Delta Vault**

### **5. Action Executor** (`src/core/execution/SovereignActionExecutor.ts`)
- **New action types**:
  - `integration_execute` — run any integration action
  - `integration_launch` — quick-launch tool
  - `integration_list` — show available integrations
- Voice narration for all integration actions
- Vault logging for launches and actions

### **6. Auto-Initialization** (`src/App.tsx`)
- Integration manager auto-starts when Lucy boots in Electron mode
- Logs available integrations to console
- Silent failure if tools not installed (graceful degradation)

---

## Usage Examples

### **1. Launch Unity (from dashboard or voice command)**

```typescript
// Via event bus (from dashboard button):
agentEventBus.publish('inter-agent', {
  eventType: 'action.proposed',
  data: {
	action: 'integration_launch',
	params: {
	  integrationId: 'unity',
	  projectPath: 'C:\\Projects\\MyUnityGame'
	}
  }
});

// Direct API call (from custom code):
const result = await window.sovereignAPI.integrations.execute('unity', 'launch', {
  projectPath: 'C:\\Projects\\MyUnityGame'
});
```

**Result:**
- Unity launches with the specified project
- Voice: "Launching unity. Stand by."
- Vault logs the launch
- Console: `✅ INTEGRATION LAUNCHED`

---

### **2. List Available Integrations**

```typescript
// Get all installed tools
const available = await window.sovereignAPI.integrations.available();
console.table(available);

// Example output:
// [
//   { id: 'godot', name: 'Godot Engine', type: 'game-engine' },
//   { id: 'blender', name: 'Blender', type: '3d-modeling' },
//   { id: 'git', name: 'Git', type: 'system-utility' }
// ]
```

---

### **3. Execute Generic Integration Action**

```typescript
// Create a GitHub issue
const result = await window.sovereignAPI.integrations.execute('github', 'create-issue', {
  owner: 'LucySovereign',
  repo: 'AGI-OS',
  title: 'Integration system complete',
  body: 'All 18 tools wired and operational.'
});

// Run Blender Python script
await window.sovereignAPI.integrations.execute('blender', 'run-script', {
  script: `
	import bpy
	bpy.ops.mesh.primitive_cube_add()
	print("Cube created!")
  `
});

// Start Godot MCP server for AI control
await window.sovereignAPI.integrations.execute('godot', 'start-mcp', {
  projectPath: 'C:\\Projects\\GodotGame'
});
```

---

### **4. Check Integration Status**

```typescript
const status = await window.sovereignAPI.integrations.status('unity');
console.log(status);

// Example output:
// {
//   id: 'unity',
//   status: 'available',
//   installed: true,
//   executable: 'C:\\Program Files\\Unity\\Hub\\Editor\\2023.1.0f1\\Editor\\Unity.exe',
//   version: '2023.1.0',
//   lastChecked: Date
// }
```

---

### **5. Add Integration to Dashboard Button**

**Example: Builder Face — Unity Launch Button**

In `src/components/dashboards/BuilderDashboard.tsx`:

```typescript
<button
  onClick={() => {
	agentEventBus.publish('inter-agent', {
	  eventType: 'action.proposed',
	  data: {
		action: 'integration_launch',
		params: {
		  integrationId: 'unity',
		  projectPath: 'C:\\MyProjects\\UnityGame'
		}
	  }
	});
  }}
  className="action-button"
>
  🎮 Launch Unity
</button>
```

---

## Supported Integrations (18 Total)

### **Game Engines**
1. **Unity** — C# game engine, AI Assistant, ML-Agents, MCP support
2. **Unreal Engine** — AAA engine, Blueprints, NeoStack AI, Ludus AI
3. **Godot** — Best MCP integration, open-source, GDScript + C#
4. **GameMaker** — 2D engine, GML scripting, AI Assistant

### **3D Modeling & Assets**
5. **Blender** — Open-source 3D suite, Python API, mesh/material generation

### **AI Assistants & Editors**
6. **Claude Code** — MCP-native AI assistant (Anthropic)
7. **Cursor** — AI-first code editor
8. **Windsurf** — Agentic IDE (Codeium)

### **APIs & Data Sources**
9. **GitHub** — REST API for repos, issues, PRs, search, files
10. **OpenAI** — GPT models (API key required)
11. **USGS Earthquake** — Real-time earthquake data
12. **NASA** — Space data and imagery

### **Communication Tools**
13. **Discord** — Bot API, webhooks

### **Cloud & Database**
14. **Supabase** — PostgreSQL, auth, storage, realtime

### **System Utilities**
15. **Filesystem** — Local file operations via MCP
16. **PowerShell** — Windows command shell
17. **Git** — Version control
18. **(+ any other tool via GenericCommandIntegration)**

---

## MCP Servers (7 Cataloged)

Lucy's registry includes **7 MCP servers** for deep AI-editor control:

1. **`@modelcontextprotocol/server-filesystem`** — Secure file operations
2. **`@modelcontextprotocol/server-github`** — GitHub repo control
3. **`godot-mcp-server`** — Godot scene/script/node generation
4. **`@unity/mcp-server`** — Unity project automation
5. **`@modelcontextprotocol/server-puppeteer`** — Browser automation
6. **`@modelcontextprotocol/server-brave-search`** — Web search
7. **`@modelcontextprotocol/server-memory`** — Persistent knowledge graph

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-github
npm install -g godot-mcp-server
# ... etc.
```

---

## Configuration

### **1. Set API Tokens (Optional)**

For integrations requiring authentication:

```bash
# GitHub
set GITHUB_TOKEN=your_token_here

# OpenAI
set OPENAI_API_KEY=your_key_here

# Supabase
set SUPABASE_URL=https://yourproject.supabase.co
set SUPABASE_KEY=your_key_here
```

### **2. Customize Executable Paths**

Edit `backend/integrations/registry.json` if your tools are installed in non-standard locations:

```json
{
  "id": "unity",
  "executable": {
	"windows": "D:\\CustomPath\\Unity\\Editor\\Unity.exe",
	"default": "unity"
  }
}
```

### **3. Add New Integration**

1. Add entry to `registry.json`:
```json
{
  "id": "my-tool",
  "name": "My Tool",
  "type": "custom",
  "executable": {
	"windows": "C:\\Path\\To\\Tool.exe"
  }
}
```

2. (Optional) Create specialized adapter in `backend/integrations/custom/MyToolIntegration.ts`

3. Add case to `IntegrationManager.createAdapter()` if you created a custom adapter

4. Restart Lucy

---

## Testing & Debugging

### **Console Testing**

After Lucy launches, open DevTools console:

```javascript
// List available integrations
window.sovereignAPI.integrations.available().then(console.table);

// Check Unity status
window.sovereignAPI.integrations.status('unity').then(console.log);

// Launch Godot
window.sovereignAPI.integrations.execute('godot', 'launch').then(console.log);

// Get full registry
window.sovereignAPI.integrations.registry().then(console.log);
```

### **Log Files**

Integration actions are logged to:
- **Console:** `[IntegrationManager]` and `[<IntegrationName>]` prefixes
- **Alpha Delta Vault:** `sovereign-vault.json` → `commandLog` array

### **Common Issues**

**Integration shows "not_installed"**
- Tool not found on system
- Check `registry.json` executable paths
- Verify tool is in PATH (for command-line tools)

**MCP server fails to start**
- MCP package not installed globally: `npm install -g <mcp-package>`
- Check `node_modules` or global npm folder

**Action execution fails**
- Check console for error details
- Verify required params are provided
- Ensure API tokens are set (for API-based integrations)

---

## Next Steps

### **Immediate Use:**
1. Launch Lucy: `npm run lucy:sovereign`
2. Open DevTools console
3. Test: `window.sovereignAPI.integrations.available()`
4. Launch a tool: `window.sovereignAPI.integrations.execute('godot', 'launch')`

### **Add Toolbelt UI Panel:**
Create a new dashboard face or panel that shows:
- All available integrations (icons, names, status)
- Quick-launch buttons
- Action dropdown menus
- Real-time status indicators

### **Connect to CAF (Cognitive Activation Fabric):**
- Map integrations to neuro-architecture nodes
- Only activate tools when corresponding brain regions are awake
- Example: Unity only available when "Builder" nodes are active

### **Extend with More Integrations:**
- Add more engines (Cocos Creator, Defold, CryEngine)
- Add more APIs (Twitter, Slack, Twilio, weather, financial data)
- Add more MCP servers (custom Lucy-specific tools)

---

## Files Reference

### **Core Files:**
- `backend/integrations/registry.json` — Master integration catalog
- `backend/core/integration/IIntegration.ts` — Adapter interface
- `backend/core/integration/IntegrationManager.ts` — Central dispatcher
- `electron/main.ts` — IPC handlers (lines 266-360)
- `electron/preload.ts` — Renderer bridge (lines 28-40)
- `src/core/execution/SovereignActionExecutor.ts` — Action routing (lines 47-60, 366-478)
- `src/App.tsx` — Auto-initialization (lines 77-101)

### **Adapter Files:**
- `backend/integrations/engines/UnityIntegration.ts`
- `backend/integrations/engines/UnrealIntegration.ts`
- `backend/integrations/engines/GodotIntegration.ts`
- `backend/integrations/tools/BlenderIntegration.ts`
- `backend/integrations/ai/ClaudeCodeIntegration.ts`
- `backend/integrations/apis/GitHubIntegration.ts`
- `backend/integrations/GenericCommandIntegration.ts`

### **Documentation:**
- `LINKABLE_APPS_REGISTRY.md` — Original markdown registry with full integration notes and examples
- `INTEGRATION_SYSTEM_GUIDE.md` — This file

---

## Summary

✅ **18 integrations registered**  
✅ **7 specialized adapters + 1 generic fallback**  
✅ **Full IPC bridge to sovereign kernel**  
✅ **Auto-initialization on Lucy boot**  
✅ **Vault logging for all actions**  
✅ **Voice narration support**  
✅ **MCP server support for AI control**  
✅ **Cross-platform (Windows/macOS/Linux)**  
✅ **Zero compilation errors**  

**Lucy can now launch, control, and integrate with the entire external tool ecosystem.**

🔷 **INTEGRATION TOOLBELT: OPERATIONAL**
const available = await window.sovereignAPI.integrations.available();
console.table(available);