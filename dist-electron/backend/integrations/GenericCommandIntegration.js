"use strict";
/**
 * GenericCommandIntegration.ts
 * Fallback adapter for any tool/application that can be launched via command line.
 * Used when no specialized adapter exists for an integration.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericCommandIntegration = void 0;
const IIntegration_1 = require("../core/integration/IIntegration");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const glob = __importStar(require("glob"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GenericCommandIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
        this.runningProcesses = new Map();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log(`[GenericCommandIntegration] Initializing ${this.name}...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to find the executable
                this.executablePath = this.findExecutable();
                if (this.executablePath && fs.existsSync(this.executablePath)) {
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    this.version = 'unknown'; // Generic tools may not have detectable versions
                    console.log(`[GenericCommandIntegration] ✓ Found ${this.name} at ${this.executablePath}`);
                }
                else if ((_a = this.config.api) === null || _a === void 0 ? void 0 : _a.available) {
                    // API-only integration (no executable needed)
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    console.log(`[GenericCommandIntegration] ✓ ${this.name} configured as API-only integration`);
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.NOT_INSTALLED;
                    console.log(`[GenericCommandIntegration] ${this.name} not found on system`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[GenericCommandIntegration] Initialization error:`, error);
            }
        });
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const startTime = Date.now();
            try {
                switch (action.action) {
                    case 'launch':
                        return yield this.launch(action.params);
                    case 'run-command':
                        return yield this.runCommand((_a = action.params) === null || _a === void 0 ? void 0 : _a.command, (_b = action.params) === null || _b === void 0 ? void 0 : _b.args);
                    case 'start-process':
                        return yield this.startProcess((_c = action.params) === null || _c === void 0 ? void 0 : _c.command, (_d = action.params) === null || _d === void 0 ? void 0 : _d.args, (_e = action.params) === null || _e === void 0 ? void 0 : _e.processId);
                    case 'stop-process':
                        return yield this.stopProcess((_f = action.params) === null || _f === void 0 ? void 0 : _f.processId);
                    case 'check-status':
                        return yield this.checkStatus();
                    case 'api-call':
                        return yield this.makeAPICall(action.params);
                    default:
                        return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
                }
            }
            catch (error) {
                return this.createError(String(error), Date.now() - startTime);
            }
        });
    }
    getAvailableActions() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const actions = [
                { name: 'check-status', description: 'Check if integration is available', params: [] },
            ];
            if (this.executablePath) {
                actions.push({ name: 'launch', description: `Launch ${this.name}`, params: ['args'] }, { name: 'run-command', description: 'Run a command and wait for completion', params: ['command', 'args'] }, { name: 'start-process', description: 'Start a background process', params: ['command', 'args', 'processId'] }, { name: 'stop-process', description: 'Stop a background process', params: ['processId'] });
            }
            if ((_a = this.config.api) === null || _a === void 0 ? void 0 : _a.available) {
                actions.push({ name: 'api-call', description: `Make API call to ${this.name}`, params: ['method', 'endpoint', 'body'] });
            }
            return actions;
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[GenericCommandIntegration] Shutting down ${this.name}...`);
            // Stop all running processes
            for (const [processId, process] of this.runningProcesses) {
                try {
                    process.kill();
                    console.log(`[GenericCommandIntegration] Stopped process: ${processId}`);
                }
                catch (error) {
                    console.error(`[GenericCommandIntegration] Failed to stop process ${processId}:`, error);
                }
            }
            this.runningProcesses.clear();
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // Generic Actions
    // ----------------------------
    launch(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executablePath) {
                return this.createError(`${this.name} not available on this system`);
            }
            const args = (params === null || params === void 0 ? void 0 : params.args) || [];
            const command = Array.isArray(args)
                ? `"${this.executablePath}" ${args.join(' ')}`
                : `"${this.executablePath}" ${args}`;
            console.log(`[GenericCommandIntegration] Launching ${this.name}: ${command}`);
            try {
                // Launch as background process
                (0, child_process_1.exec)(command);
                this.status = IIntegration_1.IntegrationStatus.RUNNING;
                return this.createSuccess({
                    launched: true,
                    executable: this.executablePath,
                    args,
                }, `${this.name} launched`);
            }
            catch (error) {
                return this.createError(`Failed to launch ${this.name}: ${error}`);
            }
        });
    }
    runCommand(command, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!command) {
                command = this.executablePath;
            }
            if (!command) {
                return this.createError('No command specified and no executable path available');
            }
            const fullCommand = args && args.length > 0
                ? `"${command}" ${args.join(' ')}`
                : `"${command}"`;
            console.log(`[GenericCommandIntegration] Running command: ${fullCommand}`);
            try {
                const { stdout, stderr } = yield execAsync(fullCommand, { timeout: 30000 });
                return this.createSuccess({
                    stdout,
                    stderr,
                    command: fullCommand,
                }, 'Command executed successfully');
            }
            catch (error) {
                return this.createError(`Command failed: ${error.message}`);
            }
        });
    }
    startProcess(command, args, processId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!command) {
                command = this.executablePath;
            }
            if (!command) {
                return this.createError('No command specified and no executable path available');
            }
            const id = processId || `${this.id}-${Date.now()}`;
            if (this.runningProcesses.has(id)) {
                return this.createError(`Process already running with ID: ${id}`);
            }
            console.log(`[GenericCommandIntegration] Starting process ${id}: ${command} ${(args === null || args === void 0 ? void 0 : args.join(' ')) || ''}`);
            try {
                const process = (0, child_process_1.spawn)(command, args || [], {
                    stdio: ['ignore', 'pipe', 'pipe'],
                    detached: true,
                });
                (_a = process.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                    console.log(`[${id}] ${data.toString()}`);
                });
                (_b = process.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                    console.error(`[${id} Error] ${data.toString()}`);
                });
                process.on('exit', (code) => {
                    console.log(`[${id}] Process exited with code ${code}`);
                    this.runningProcesses.delete(id);
                });
                this.runningProcesses.set(id, process);
                return this.createSuccess({
                    processId: id,
                    pid: process.pid,
                    command,
                    args,
                }, `Process started: ${id}`);
            }
            catch (error) {
                return this.createError(`Failed to start process: ${error}`);
            }
        });
    }
    stopProcess(processId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!processId) {
                return this.createError('processId is required');
            }
            const process = this.runningProcesses.get(processId);
            if (!process) {
                return this.createError(`No process found with ID: ${processId}`);
            }
            try {
                process.kill();
                this.runningProcesses.delete(processId);
                return this.createSuccess({
                    processId,
                    stopped: true,
                }, `Process stopped: ${processId}`);
            }
            catch (error) {
                return this.createError(`Failed to stop process: ${error}`);
            }
        });
    }
    checkStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const status = yield this.getStatus();
            return this.createSuccess(Object.assign(Object.assign({}, status), { runningProcesses: Array.from(this.runningProcesses.keys()) }), `Status: ${status.status}`);
        });
    }
    makeAPICall(params) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!((_a = this.config.api) === null || _a === void 0 ? void 0 : _a.available)) {
                return this.createError('API not configured for this integration');
            }
            const method = (params === null || params === void 0 ? void 0 : params.method) || 'GET';
            const endpoint = params === null || params === void 0 ? void 0 : params.endpoint;
            const body = params === null || params === void 0 ? void 0 : params.body;
            if (!endpoint) {
                return this.createError('endpoint is required for API calls');
            }
            // TODO: Implement generic HTTP client for API calls
            // For now, return placeholder
            return this.createSuccess({
                method,
                endpoint,
                status: 'pending',
            }, `API call queued: ${method} ${endpoint} (full implementation pending)`);
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    findExecutable() {
        var _a;
        // Try to resolve executable path from config
        const resolved = this.resolveExecutablePath();
        if (resolved) {
            // Handle wildcards in path
            if (resolved.includes('*')) {
                const matches = glob.sync(resolved);
                if (matches.length > 0) {
                    return matches.sort().pop(); // Return latest version
                }
            }
            else if (fs.existsSync(resolved)) {
                return resolved;
            }
        }
        // Try PATH
        try {
            const platform = process.platform;
            const cmd = platform === 'win32' ? 'where' : 'which';
            const commandName = ((_a = this.config.executable) === null || _a === void 0 ? void 0 : _a.default) || this.id;
            const { stdout } = require('child_process').execSync(`${cmd} ${commandName}`, {
                encoding: 'utf-8',
                stdio: ['ignore', 'pipe', 'ignore'],
                timeout: 2000,
            });
            const path = stdout.trim().split('\n')[0];
            if (path)
                return path;
        }
        catch (_b) { }
        return undefined;
    }
}
exports.GenericCommandIntegration = GenericCommandIntegration;
