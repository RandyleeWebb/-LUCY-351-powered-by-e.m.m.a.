# Lucy Sovereign 351 - Launch Guide

## Quick Start

**Double-click `START_LUCY.bat`** - That's it!

## What Happens When You Launch

1. **Cleanup**: Kills any stale Electron/Vite processes
2. **Dependency Check**: Ensures node_modules are installed
3. **TypeScript Compilation**: Compiles Electron kernel files
4. **Vite Dev Server**: Starts on port 5173 (or next available)
5. **Electron Kernel**: Launches native OS kernel with full privileges
6. **Auto-Detection**: Kernel automatically finds and connects to Vite
7. **Dashboard UI**: Opens in native window (not browser)

## System Architecture

```
START_LUCY.bat
	↓
npm run lucy:sovereign
	↓
npm run electron:dev
	↓
	├─→ [TypeScript Compile] electron/main.ts → dist-electron/main.cjs
	│                         electron/preload.ts → dist-electron/preload.cjs
	│
	├─→ [Vite Dev Server] http://localhost:5173 (renderer UI)
	│
	└─→ [Electron Kernel] dist-electron/main.cjs (native OS brain)
			├─ Alpha Delta Vault (persistent state)
			├─ IPC Bridge (secure renderer ↔ kernel channel)
			├─ Hardware Monitoring (systeminformation)
			└─ Command Execution (PowerShell/CMD)
```

## What Changed

### Before (Browser-Only)
- Loaded Vite dev server directly in browser
- No real OS access, just `alert()` stubs
- No persistent state
- Hardcoded ports causing failures

### After (Native Sovereign Kernel)
- Runs as native Electron app with full OS privileges
- Real hardware monitoring via `systeminformation`
- Secure IPC bridge between renderer and kernel
- Persistent Alpha Delta Vault for state/memory
- Auto-detection of Vite dev server (tries ports 5173, 5174, 5175)
- Clean one-click launcher

## Files You Care About

| File | Purpose |
|------|---------|
| `START_LUCY.bat` | One-click launcher (you use this) |
| `electron/main.ts` | Sovereign kernel source (the OS brain) |
| `electron/preload.ts` | Secure IPC bridge (renderer ↔ kernel) |
| `dist-electron/main.cjs` | Compiled kernel (auto-generated) |
| `package.json` | NPM scripts and dependencies |

## Sovereign Vault Location

**Windows**: `%APPDATA%\@lucy-sovereign\phase15-curiosity-stack\sovereign-vault.json`

Contains:
- State changes (system status, mode switches)
- Hardware scan history
- Command execution logs
- Rehydration data for persistence

## Dashboard Access

The dashboard UI is served by Vite and rendered in Electron's native window.

**Dashboard Faces:**
- **OMNIVERSE**: Central 3D interface
- **BUILDER**: System construction tools
- **SIGNAL**: Event monitoring
- **VAULT**: Memory/state browser
- **ECOSYSTEM**: Live hardware metrics

All buttons now execute real OS commands through the IPC bridge, not browser alerts.

## Troubleshooting

### "Vite files are still being loaded"
✅ **FIXED**: Electron now auto-detects Vite port and loads correctly

### "I don't have a launch file"
✅ **FIXED**: `START_LUCY.bat` is your launch file

### Blue/blank dashboard
✅ **FIXED**: Auto-detection ensures correct dev server connection

### Port conflicts
✅ **FIXED**: Kernel tries ports 5173, 5174, 5175 in order

## Development Mode vs Production

**Development** (what you're running):
- Vite hot-reload enabled
- DevTools open automatically
- Source maps available
- TypeScript compiled on each launch

**Production** (future):
- Run `npm run electron:build`
- Creates standalone executable
- No Vite dependency
- Packaged with `electron-builder`

## System Requirements

- **OS**: Windows 10/11 (current setup)
- **Node.js**: >= 18.x
- **PowerShell**: For command execution
- **Visual Studio Build Tools**: For native modules (if needed)

## Security Model

**Browser Sandbox**: BYPASSED ✅  
**Node Integration**: Disabled (security)  
**Context Isolation**: Enabled (security)  
**Preload Script**: Only approved IPC channel  
**Main Process**: Full OS privileges

The renderer (dashboard) cannot directly access OS resources.  
All privileged operations go through the secure IPC bridge in `preload.ts`.

---

**Lucy is now a true native OS kernel, not a browser app.**
