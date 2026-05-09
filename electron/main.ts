/**
 * LUCY SOVEREIGN 351 - MAIN PROCESS (SOVEREIGN KERNEL)
 * 
 * This is Lucy's TRUE brain - runs with full OS privileges outside the browser sandbox.
 * Has direct access to:
 * - Windows PowerShell/CMD
 * - Hardware sensors (GPU, RAM, CPU)
 * - File system
 * - Alpha Delta Vault (SQLite)
 * - Network interfaces
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import si from 'systeminformation';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

let mainWindow: BrowserWindow | null = null;
let vaultPath: string = '';

interface VaultData {
  stateHistory: Array<{ timestamp: number; key: string; value: string; source: string }>;
  hardwareScans: Array<any>;
  commandLog: Array<any>;
  chatHistory: Array<any>;
}

let vault: VaultData = {
  stateHistory: [],
  hardwareScans: [],
  commandLog: [],
  chatHistory: []
};

// ============================================================================
// ALPHA DELTA VAULT - PERSISTENT MEMORY (JSON-based)
// ============================================================================

function initializeAlphaDeltaVault() {
  const userDataPath = app.getPath('userData');
  vaultPath = join(userDataPath, 'sovereign-vault.json');

  console.log('[SOVEREIGN KERNEL] Initializing Alpha Delta Vault:', vaultPath);

  // Load existing vault if it exists
  if (existsSync(vaultPath)) {
	try {
	  const data = readFileSync(vaultPath, 'utf-8');
	  vault = JSON.parse(data);
	  console.log('[SOVEREIGN KERNEL] Loaded existing vault with', vault.stateHistory.length, 'state entries');
	} catch (error) {
	  console.error('[SOVEREIGN KERNEL] Error loading vault, creating new:', error);
	}
  }

  console.log('[SOVEREIGN KERNEL] Alpha Delta Vault initialized');
  recordStateChange('kernel_status', 'online', 'main_process');
  saveVault();
}

function saveVault() {
  try {
	writeFileSync(vaultPath, JSON.stringify(vault, null, 2), 'utf-8');
  } catch (error) {
	console.error('[SOVEREIGN KERNEL] Error saving vault:', error);
  }
}

function recordStateChange(key: string, value: string, source: string) {
  vault.stateHistory.push({
	timestamp: Date.now(),
	key,
	value,
	source
  });
  saveVault();
}

function recordHardwareScan(data: any) {
  vault.hardwareScans.push({
	timestamp: Date.now(),
	...data
  });
  // Keep only last 1000 scans
  if (vault.hardwareScans.length > 1000) {
	vault.hardwareScans = vault.hardwareScans.slice(-1000);
  }
  saveVault();
}

function rehydrateState(): any {
  const state: Record<string, any> = {};

  // Get latest value for each key
  const keyMap = new Map<string, any>();
  for (const entry of vault.stateHistory) {
	keyMap.set(entry.key, entry.value);
  }

  for (const [key, value] of keyMap.entries()) {
	state[key] = value;
  }

  console.log('[SOVEREIGN KERNEL] Rehydrated state:', state);
  return state;
}

// ============================================================================
// HARDWARE TRUTH - NO MORE BROWSER LIES
// ============================================================================

async function getSovereignHardware() {
  console.log('[SOVEREIGN KERNEL] 🔍 Scanning REAL hardware...');

  const [mem, cpu, graphics, osInfo, cpuSpeed] = await Promise.all([
	si.mem(),
	si.currentLoad(),
	si.graphics(),
	si.osInfo(),
	si.cpu()
  ]);

  const gpuController = graphics.controllers[0];

  const hardwareTruth = {
	ram: {
	  total_gb: (mem.total / 1024 / 1024 / 1024).toFixed(2),
	  used_gb: (mem.used / 1024 / 1024 / 1024).toFixed(2),
	  available_gb: (mem.available / 1024 / 1024 / 1024).toFixed(2),
	  percent: ((mem.used / mem.total) * 100).toFixed(1)
	},
	cpu: {
	  usage_percent: cpu.currentLoad.toFixed(1),
	  cores: cpu.cpus.length,
	  speed_ghz: ((cpuSpeed.speed || 0) / 1000).toFixed(2) // Convert MHz to GHz
	},
	gpu: {
	  name: gpuController?.model || 'Unknown GPU',
	  vram_mb: gpuController?.vram || 0,
	  vendor: gpuController?.vendor || 'Unknown',
	  temperature_c: gpuController?.temperatureGpu || null
	},
	os: {
	  platform: osInfo.platform,
	  distro: osInfo.distro,
	  kernel: osInfo.kernel,
	  arch: osInfo.arch
	},
	timestamp: Date.now()
  };

  console.log('[SOVEREIGN KERNEL] ✅ Hardware Truth:', hardwareTruth);

  // Record to Alpha Delta Vault
  recordHardwareScan({
	ram_total_gb: parseFloat(hardwareTruth.ram.total_gb),
	ram_used_gb: parseFloat(hardwareTruth.ram.used_gb),
	gpu_name: hardwareTruth.gpu.name,
	gpu_vram_mb: hardwareTruth.gpu.vram_mb,
	gpu_temp_c: hardwareTruth.gpu.temperature_c,
	cpu_usage_percent: parseFloat(hardwareTruth.cpu.usage_percent),
	cpu_cores: hardwareTruth.cpu.cores
  });

  return hardwareTruth;
}

// ============================================================================
// SOVEREIGN COMMAND EXECUTION - REAL OS POWER
// ============================================================================

async function executeSovereignCommand(command: string, args: string[]): Promise<any> {
  console.log('[SOVEREIGN KERNEL] 🎯 EXECUTING COMMAND');
  console.log(`  Command: ${command}`);
  console.log(`  Args: ${JSON.stringify(args)}`);

  const fullCommand = `${command} ${args.join(' ')}`;

  try {
	const { stdout, stderr } = await execAsync(fullCommand, {
	  shell: 'powershell.exe',
	  timeout: 30000
	});

	const result = {
	  success: true,
	  command: fullCommand,
	  stdout: stdout.trim(),
	  stderr: stderr.trim(),
	  timestamp: Date.now()
	};

	console.log('[SOVEREIGN KERNEL] ✅ Command succeeded');

	// Log to vault
	vault.commandLog.push({
	  timestamp: Date.now(),
	  command,
	  args: JSON.stringify(args),
	  success: true,
	  stdout: result.stdout,
	  stderr: result.stderr
	});
	saveVault();

	return result;

  } catch (error: any) {
	console.error('[SOVEREIGN KERNEL] ❌ Command failed:', error.message);

	const result = {
	  success: false,
	  command: fullCommand,
	  error: error.message,
	  stdout: error.stdout?.trim() || '',
	  stderr: error.stderr?.trim() || '',
	  timestamp: Date.now()
	};

	// Log failure to vault
	vault.commandLog.push({
	  timestamp: Date.now(),
	  command,
	  args: JSON.stringify(args),
	  success: false,
	  stdout: result.stdout,
	  stderr: result.stderr
	});
	saveVault();

	return result;
  }
}

// ============================================================================
// IPC BRIDGE - DASHBOARD ↔ KERNEL
// ============================================================================

function setupIPCBridge() {
  console.log('[SOVEREIGN KERNEL] Setting up IPC bridge...');

  // Hardware scan
  ipcMain.handle('sovereign:hardware-scan', async () => {
	return await getSovereignHardware();
  });

  // Execute command
  ipcMain.handle('sovereign:execute-command', async (event, command: string, args: string[]) => {
	return await executeSovereignCommand(command, args);
  });

  // State persistence
  ipcMain.handle('sovereign:record-state', async (event, key: string, value: string) => {
	recordStateChange(key, value, 'renderer');
	return { success: true };
  });

  ipcMain.handle('sovereign:rehydrate-state', async () => {
	return rehydrateState();
  });

  // Get vault history
  ipcMain.handle('sovereign:get-history', async (event, table: string, limit: number = 100) => {
	const key = table as keyof VaultData;
	if (!vault[key]) return [];
	const history = vault[key] as any[];
	return history.slice(-limit).reverse();
  });

  // Integration Manager - Initialize
  ipcMain.handle('integration:initialize', async () => {
	try {
	  const { getIntegrationManager } = await import('../backend/core/integration/IntegrationManager');
	  const manager = getIntegrationManager();
	  await manager.initialize();
	  return { success: true };
	} catch (error: any) {
	  console.error('[SOVEREIGN KERNEL] Integration manager init failed:', error);
	  return { success: false, error: error.message };
	}
  });

  // Integration Manager - List all integrations
  ipcMain.handle('integration:list', async () => {
	try {
	  const { getIntegrationManager } = await import('../backend/core/integration/IntegrationManager');
	  const manager = getIntegrationManager();
	  return await manager.getAllIntegrations();
	} catch (error: any) {
	  console.error('[SOVEREIGN KERNEL] Integration list failed:', error);
	  return [];
	}
  });

  // Integration Manager - Get available integrations
  ipcMain.handle('integration:available', async () => {
	try {
	  const { getIntegrationManager } = await import('../backend/core/integration/IntegrationManager');
	  const manager = getIntegrationManager();
	  return await manager.getAvailableIntegrations();
	} catch (error: any) {
	  console.error('[SOVEREIGN KERNEL] Integration available failed:', error);
	  return [];
	}
  });

  // Integration Manager - Execute action
  ipcMain.handle('integration:execute', async (event, integrationId: string, action: string, params?: any) => {
	try {
	  const { getIntegrationManager } = await import('../backend/core/integration/IntegrationManager');
	  const manager = getIntegrationManager();
	  const result = await manager.executeAction(integrationId, action, params);

	  // Log to vault
	  vault.commandLog.push({
		timestamp: Date.now(),
		command: `integration:${integrationId}:${action}`,
		args: JSON.stringify(params || {}),
		success: result.success,
		stdout: result.output || JSON.stringify(result.data || {}),
		stderr: result.error || ''
	  });
	  saveVault();

	  return result;
	} catch (error: any) {
	  console.error('[SOVEREIGN KERNEL] Integration execute failed:', error);
	  return { success: false, error: error.message };
	}
  });

  // Integration Manager - Get status
  ipcMain.handle('integration:status', async (event, integrationId: string) => {
	try {
	  const { getIntegrationManager } = await import('../backend/core/integration/IntegrationManager');
	  const manager = getIntegrationManager();
	  return await manager.getIntegrationStatus(integrationId);
	} catch (error: any) {
	  console.error('[SOVEREIGN KERNEL] Integration status failed:', error);
	  return null;
	}
  });

  // Integration Manager - Get registry
  ipcMain.handle('integration:registry', async () => {
	try {
	  const { getIntegrationManager } = await import('../backend/core/integration/IntegrationManager');
	  const manager = getIntegrationManager();
	  return manager.getRegistry();
	} catch (error: any) {
	  console.error('[SOVEREIGN KERNEL] Integration registry failed:', error);
	  return null;
	}
  });

  console.log('[SOVEREIGN KERNEL] IPC bridge ready');
}

// ============================================================================
// WINDOW CREATION
// ============================================================================

async function createMainWindow() {
  mainWindow = new BrowserWindow({
	width: 1920,
	height: 1080,
	backgroundColor: '#050714',
	title: 'Lucy Sovereign 351 - AGI OS',
	webPreferences: {
	  preload: join(__dirname, 'preload.cjs'),
	  nodeIntegration: false,
	  contextIsolation: true,
	  sandbox: false
	}
  });

  // Load Vite dev server in development, built files in production
  // Try to connect to Vite dev server (try common ports)
  const devPorts = [5173, 5174, 5175];
  let devServerUrl: string | null = null;

  // Simple check: try to fetch from each port
  for (const port of devPorts) {
	try {
	  const response = await fetch(`http://localhost:${port}`);
	  if (response.ok || response.status === 404) {
		// Server is responding (404 is fine, means server is up but route doesn't exist)
		devServerUrl = `http://localhost:${port}`;
		console.log(`[SOVEREIGN KERNEL] ✅ Vite dev server detected on port ${port}`);
		break;
	  }
	} catch (err) {
	  // Port not available, try next
	}
  }

  if (devServerUrl) {
	mainWindow.loadURL(devServerUrl);
	mainWindow.webContents.openDevTools();
  } else {
	// No dev server, load built files
	console.log('[SOVEREIGN KERNEL] Loading production build...');
	mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
	mainWindow = null;
  });
}

// ============================================================================
// APP LIFECYCLE
// ============================================================================

app.whenReady().then(async () => {
  console.log('\n🚀 ============================================');
  console.log('   LUCY SOVEREIGN 351 - KERNEL BOOT');
  console.log('   Breaking browser sandbox...');
  console.log('============================================\n');

  initializeAlphaDeltaVault();
  setupIPCBridge();
  await createMainWindow();

  console.log('[SOVEREIGN KERNEL] ✅ Kernel online');
  console.log('[SOVEREIGN KERNEL] ✅ Browser sandbox bypassed');
  console.log('[SOVEREIGN KERNEL] ✅ Full OS privileges active\n');
});

app.on('window-all-closed', () => {
  recordStateChange('kernel_status', 'shutdown', 'main_process');
  saveVault();

  if (process.platform !== 'darwin') {
	app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
	await createMainWindow();
  }
});
