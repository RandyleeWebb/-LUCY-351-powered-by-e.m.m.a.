"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const systeminformation_1 = __importDefault(require("systeminformation"));
const fs_1 = require("fs");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let mainWindow = null;
let vaultPath = '';
let vault = {
    stateHistory: [],
    hardwareScans: [],
    commandLog: [],
    chatHistory: []
};
// ============================================================================
// ALPHA DELTA VAULT - PERSISTENT MEMORY (JSON-based)
// ============================================================================
function initializeAlphaDeltaVault() {
    const userDataPath = electron_1.app.getPath('userData');
    vaultPath = (0, path_1.join)(userDataPath, 'sovereign-vault.json');
    console.log('[SOVEREIGN KERNEL] Initializing Alpha Delta Vault:', vaultPath);
    // Load existing vault if it exists
    if ((0, fs_1.existsSync)(vaultPath)) {
        try {
            const data = (0, fs_1.readFileSync)(vaultPath, 'utf-8');
            vault = JSON.parse(data);
            console.log('[SOVEREIGN KERNEL] Loaded existing vault with', vault.stateHistory.length, 'state entries');
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Error loading vault, creating new:', error);
        }
    }
    console.log('[SOVEREIGN KERNEL] Alpha Delta Vault initialized');
    recordStateChange('kernel_status', 'online', 'main_process');
    saveVault();
}
function saveVault() {
    try {
        (0, fs_1.writeFileSync)(vaultPath, JSON.stringify(vault, null, 2), 'utf-8');
    }
    catch (error) {
        console.error('[SOVEREIGN KERNEL] Error saving vault:', error);
    }
}
function recordStateChange(key, value, source) {
    vault.stateHistory.push({
        timestamp: Date.now(),
        key,
        value,
        source
    });
    saveVault();
}
function recordHardwareScan(data) {
    vault.hardwareScans.push(Object.assign({ timestamp: Date.now() }, data));
    // Keep only last 1000 scans
    if (vault.hardwareScans.length > 1000) {
        vault.hardwareScans = vault.hardwareScans.slice(-1000);
    }
    saveVault();
}
function rehydrateState() {
    const state = {};
    // Get latest value for each key
    const keyMap = new Map();
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
function getSovereignHardware() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[SOVEREIGN KERNEL] 🔍 Scanning REAL hardware...');
        const [mem, cpu, graphics, osInfo, cpuSpeed] = yield Promise.all([
            systeminformation_1.default.mem(),
            systeminformation_1.default.currentLoad(),
            systeminformation_1.default.graphics(),
            systeminformation_1.default.osInfo(),
            systeminformation_1.default.cpu()
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
                name: (gpuController === null || gpuController === void 0 ? void 0 : gpuController.model) || 'Unknown GPU',
                vram_mb: (gpuController === null || gpuController === void 0 ? void 0 : gpuController.vram) || 0,
                vendor: (gpuController === null || gpuController === void 0 ? void 0 : gpuController.vendor) || 'Unknown',
                temperature_c: (gpuController === null || gpuController === void 0 ? void 0 : gpuController.temperatureGpu) || null
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
    });
}
// ============================================================================
// SOVEREIGN COMMAND EXECUTION - REAL OS POWER
// ============================================================================
function executeSovereignCommand(command, args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log('[SOVEREIGN KERNEL] 🎯 EXECUTING COMMAND');
        console.log(`  Command: ${command}`);
        console.log(`  Args: ${JSON.stringify(args)}`);
        const fullCommand = `${command} ${args.join(' ')}`;
        try {
            const { stdout, stderr } = yield execAsync(fullCommand, {
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
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] ❌ Command failed:', error.message);
            const result = {
                success: false,
                command: fullCommand,
                error: error.message,
                stdout: ((_a = error.stdout) === null || _a === void 0 ? void 0 : _a.trim()) || '',
                stderr: ((_b = error.stderr) === null || _b === void 0 ? void 0 : _b.trim()) || '',
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
    });
}
// ============================================================================
// IPC BRIDGE - DASHBOARD ↔ KERNEL
// ============================================================================
function setupIPCBridge() {
    console.log('[SOVEREIGN KERNEL] Setting up IPC bridge...');
    // Hardware scan
    electron_1.ipcMain.handle('sovereign:hardware-scan', () => __awaiter(this, void 0, void 0, function* () {
        return yield getSovereignHardware();
    }));
    // Execute command
    electron_1.ipcMain.handle('sovereign:execute-command', (event, command, args) => __awaiter(this, void 0, void 0, function* () {
        return yield executeSovereignCommand(command, args);
    }));
    // State persistence
    electron_1.ipcMain.handle('sovereign:record-state', (event, key, value) => __awaiter(this, void 0, void 0, function* () {
        recordStateChange(key, value, 'renderer');
        return { success: true };
    }));
    electron_1.ipcMain.handle('sovereign:rehydrate-state', () => __awaiter(this, void 0, void 0, function* () {
        return rehydrateState();
    }));
    // Get vault history
    electron_1.ipcMain.handle('sovereign:get-history', (event_1, table_1, ...args_1) => __awaiter(this, [event_1, table_1, ...args_1], void 0, function* (event, table, limit = 100) {
        const key = table;
        if (!vault[key])
            return [];
        const history = vault[key];
        return history.slice(-limit).reverse();
    }));
    // Integration Manager - Initialize
    electron_1.ipcMain.handle('integration:initialize', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const { getIntegrationManager } = yield Promise.resolve().then(() => __importStar(require('../backend/core/integration/IntegrationManager')));
            const manager = getIntegrationManager();
            yield manager.initialize();
            return { success: true };
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Integration manager init failed:', error);
            return { success: false, error: error.message };
        }
    }));
    // Integration Manager - List all integrations
    electron_1.ipcMain.handle('integration:list', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const { getIntegrationManager } = yield Promise.resolve().then(() => __importStar(require('../backend/core/integration/IntegrationManager')));
            const manager = getIntegrationManager();
            return yield manager.getAllIntegrations();
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Integration list failed:', error);
            return [];
        }
    }));
    // Integration Manager - Get available integrations
    electron_1.ipcMain.handle('integration:available', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const { getIntegrationManager } = yield Promise.resolve().then(() => __importStar(require('../backend/core/integration/IntegrationManager')));
            const manager = getIntegrationManager();
            return yield manager.getAvailableIntegrations();
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Integration available failed:', error);
            return [];
        }
    }));
    // Integration Manager - Execute action
    electron_1.ipcMain.handle('integration:execute', (event, integrationId, action, params) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { getIntegrationManager } = yield Promise.resolve().then(() => __importStar(require('../backend/core/integration/IntegrationManager')));
            const manager = getIntegrationManager();
            const result = yield manager.executeAction(integrationId, action, params);
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
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Integration execute failed:', error);
            return { success: false, error: error.message };
        }
    }));
    // Integration Manager - Get status
    electron_1.ipcMain.handle('integration:status', (event, integrationId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const { getIntegrationManager } = yield Promise.resolve().then(() => __importStar(require('../backend/core/integration/IntegrationManager')));
            const manager = getIntegrationManager();
            return yield manager.getIntegrationStatus(integrationId);
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Integration status failed:', error);
            return null;
        }
    }));
    // Integration Manager - Get registry
    electron_1.ipcMain.handle('integration:registry', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const { getIntegrationManager } = yield Promise.resolve().then(() => __importStar(require('../backend/core/integration/IntegrationManager')));
            const manager = getIntegrationManager();
            return manager.getRegistry();
        }
        catch (error) {
            console.error('[SOVEREIGN KERNEL] Integration registry failed:', error);
            return null;
        }
    }));
    console.log('[SOVEREIGN KERNEL] IPC bridge ready');
}
// ============================================================================
// WINDOW CREATION
// ============================================================================
function createMainWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        mainWindow = new electron_1.BrowserWindow({
            width: 1920,
            height: 1080,
            backgroundColor: '#050714',
            title: 'Lucy Sovereign 351 - AGI OS',
            webPreferences: {
                preload: (0, path_1.join)(__dirname, 'preload.cjs'),
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: false
            }
        });
        // Load Vite dev server in development, built files in production
        // Try to connect to Vite dev server (try common ports)
        const devPorts = [5173, 5174, 5175];
        let devServerUrl = null;
        // Simple check: try to fetch from each port
        for (const port of devPorts) {
            try {
                const response = yield fetch(`http://localhost:${port}`);
                if (response.ok || response.status === 404) {
                    // Server is responding (404 is fine, means server is up but route doesn't exist)
                    devServerUrl = `http://localhost:${port}`;
                    console.log(`[SOVEREIGN KERNEL] ✅ Vite dev server detected on port ${port}`);
                    break;
                }
            }
            catch (err) {
                // Port not available, try next
            }
        }
        if (devServerUrl) {
            mainWindow.loadURL(devServerUrl);
            mainWindow.webContents.openDevTools();
        }
        else {
            // No dev server, load built files
            console.log('[SOVEREIGN KERNEL] Loading production build...');
            mainWindow.loadFile((0, path_1.join)(__dirname, '../renderer/index.html'));
        }
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
    });
}
// ============================================================================
// APP LIFECYCLE
// ============================================================================
electron_1.app.whenReady().then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🚀 ============================================');
    console.log('   LUCY SOVEREIGN 351 - KERNEL BOOT');
    console.log('   Breaking browser sandbox...');
    console.log('============================================\n');
    initializeAlphaDeltaVault();
    setupIPCBridge();
    yield createMainWindow();
    console.log('[SOVEREIGN KERNEL] ✅ Kernel online');
    console.log('[SOVEREIGN KERNEL] ✅ Browser sandbox bypassed');
    console.log('[SOVEREIGN KERNEL] ✅ Full OS privileges active\n');
}));
electron_1.app.on('window-all-closed', () => {
    recordStateChange('kernel_status', 'shutdown', 'main_process');
    saveVault();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => __awaiter(void 0, void 0, void 0, function* () {
    if (mainWindow === null) {
        yield createMainWindow();
    }
}));
