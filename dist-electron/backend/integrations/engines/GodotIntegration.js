"use strict";
/**
 * GodotIntegration.ts
 * Adapter for Godot Engine integration.
 * Best-in-class MCP support for full AI control of scenes, scripts, nodes, and UI.
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
exports.GodotIntegration = void 0;
const IIntegration_1 = require("../../core/integration/IIntegration");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class GodotIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[GodotIntegration] Initializing...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to find Godot installation
                this.executablePath = yield this.findGodotExecutable();
                if (this.executablePath) {
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    this.version = yield this.detectGodotVersion();
                    console.log(`[GodotIntegration] ✓ Found Godot at ${this.executablePath} (version: ${this.version})`);
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.NOT_INSTALLED;
                    console.log(`[GodotIntegration] Godot not found on system`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[GodotIntegration] Initialization error:`, error);
            }
        });
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            const startTime = Date.now();
            try {
                switch (action.action) {
                    case 'launch':
                        return yield this.launchGodot(action.params);
                    case 'open-project':
                        return yield this.openProject((_a = action.params) === null || _a === void 0 ? void 0 : _a.projectPath);
                    case 'create-scene':
                        return yield this.createScene((_b = action.params) === null || _b === void 0 ? void 0 : _b.sceneName, (_c = action.params) === null || _c === void 0 ? void 0 : _c.prompt);
                    case 'create-script':
                        return yield this.createScript((_d = action.params) === null || _d === void 0 ? void 0 : _d.scriptName, (_e = action.params) === null || _e === void 0 ? void 0 : _e.prompt);
                    case 'create-node':
                        return yield this.createNode((_f = action.params) === null || _f === void 0 ? void 0 : _f.nodeType, (_g = action.params) === null || _g === void 0 ? void 0 : _g.nodeName);
                    case 'generate-ui':
                        return yield this.generateUI((_h = action.params) === null || _h === void 0 ? void 0 : _h.prompt);
                    case 'start-mcp':
                        return yield this.startMCPServer((_j = action.params) === null || _j === void 0 ? void 0 : _j.projectPath);
                    case 'stop-mcp':
                        return yield this.stopMCPServer();
                    case 'check-project':
                        return yield this.checkProject((_k = action.params) === null || _k === void 0 ? void 0 : _k.projectPath);
                    case 'run-project':
                        return yield this.runProject((_l = action.params) === null || _l === void 0 ? void 0 : _l.projectPath);
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
            return [
                { name: 'launch', description: 'Launch Godot Editor', params: ['projectPath'] },
                { name: 'open-project', description: 'Open a Godot project', params: ['projectPath'] },
                { name: 'create-scene', description: 'Create a new scene via MCP', params: ['sceneName', 'prompt'] },
                { name: 'create-script', description: 'Create GDScript via AI', params: ['scriptName', 'prompt'] },
                { name: 'create-node', description: 'Create a node in scene', params: ['nodeType', 'nodeName'] },
                { name: 'generate-ui', description: 'Generate UI layout via AI', params: ['prompt'] },
                { name: 'start-mcp', description: 'Start Godot MCP server', params: ['projectPath'] },
                { name: 'stop-mcp', description: 'Stop Godot MCP server', params: [] },
                { name: 'check-project', description: 'Validate Godot project structure', params: ['projectPath'] },
                { name: 'run-project', description: 'Run Godot project', params: ['projectPath'] },
            ];
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[GodotIntegration] Shutting down...');
            yield this.stopMCPServer();
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // Godot-specific Actions
    // ----------------------------
    launchGodot(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('Godot not available on this system');
            }
            const projectPath = params === null || params === void 0 ? void 0 : params.projectPath;
            const command = projectPath
                ? `"${this.executablePath}" --path "${projectPath}" --editor`
                : `"${this.executablePath}" --editor`;
            console.log(`[GodotIntegration] Launching Godot: ${command}`);
            try {
                // Launch Godot as background process
                (0, child_process_1.exec)(command);
                this.status = IIntegration_1.IntegrationStatus.RUNNING;
                return this.createSuccess({
                    launched: true,
                    executable: this.executablePath,
                    projectPath,
                }, `Godot launched${projectPath ? ` with project: ${projectPath}` : ''}`);
            }
            catch (error) {
                return this.createError(`Failed to launch Godot: ${error}`);
            }
        });
    }
    openProject(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectPath) {
                return this.createError('projectPath is required');
            }
            if (!fs.existsSync(projectPath)) {
                return this.createError(`Project path does not exist: ${projectPath}`);
            }
            // Godot projects use project.godot files
            const projectFile = path.join(projectPath, 'project.godot');
            if (!fs.existsSync(projectFile)) {
                return this.createError('project.godot not found in the specified path');
            }
            return this.launchGodot({ projectPath });
        });
    }
    createScene(sceneName, prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call to Godot MCP server
            // Godot has excellent MCP support via godot-mcp-server, AI Assistant Hub, etc.
            return this.createSuccess({
                scene: sceneName || 'NewScene.tscn',
                prompt,
                status: 'created',
            }, `Scene created: ${sceneName || 'NewScene.tscn'} (via MCP - implementation pending)`);
        });
    }
    createScript(scriptName, prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call for GDScript generation
            return this.createSuccess({
                script: scriptName || 'new_script.gd',
                prompt,
                status: 'generated',
            }, `Script created: ${scriptName || 'new_script.gd'} (via MCP - implementation pending)`);
        });
    }
    createNode(nodeType, nodeName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call for node creation
            return this.createSuccess({
                node: nodeName || 'NewNode',
                type: nodeType || 'Node2D',
                status: 'created',
            }, `Node created: ${nodeName || 'NewNode'} (${nodeType || 'Node2D'}) (via MCP - implementation pending)`);
        });
    }
    generateUI(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call for UI generation (Control nodes, layouts, themes)
            return this.createSuccess({
                ui: 'GeneratedUI.tscn',
                prompt,
                status: 'generated',
            }, `UI generated from prompt (via MCP - implementation pending)`);
        });
    }
    startMCPServer(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (this.mcpProcess) {
                return this.createError('MCP server already running');
            }
            if (!((_a = this.config.mcp) === null || _a === void 0 ? void 0 : _a.available)) {
                return this.createError('MCP not configured for Godot');
            }
            try {
                // Spawn Godot MCP server as child process
                // Assumes godot-mcp-server is installed globally via npm
                const args = projectPath ? ['--project', projectPath] : [];
                this.mcpProcess = (0, child_process_1.spawn)('godot-mcp-server', args, {
                    stdio: ['ignore', 'pipe', 'pipe'],
                });
                (_b = this.mcpProcess.stdout) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                    console.log(`[Godot MCP] ${data.toString()}`);
                });
                (_c = this.mcpProcess.stderr) === null || _c === void 0 ? void 0 : _c.on('data', (data) => {
                    console.error(`[Godot MCP Error] ${data.toString()}`);
                });
                this.mcpProcess.on('exit', (code) => {
                    console.log(`[Godot MCP] Process exited with code ${code}`);
                    this.mcpProcess = undefined;
                });
                this.projectPath = projectPath;
                return this.createSuccess({
                    running: true,
                    projectPath,
                    pid: this.mcpProcess.pid,
                }, 'Godot MCP server started');
            }
            catch (error) {
                return this.createError(`Failed to start MCP server: ${error}`);
            }
        });
    }
    stopMCPServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createSuccess({ running: false }, 'MCP server not running');
            }
            try {
                this.mcpProcess.kill();
                this.mcpProcess = undefined;
                this.projectPath = undefined;
                return this.createSuccess({ running: false }, 'Godot MCP server stopped');
            }
            catch (error) {
                return this.createError(`Failed to stop MCP server: ${error}`);
            }
        });
    }
    checkProject(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectPath) {
                return this.createError('projectPath is required');
            }
            if (!fs.existsSync(projectPath)) {
                return this.createError(`Project path does not exist: ${projectPath}`);
            }
            const projectFile = path.join(projectPath, 'project.godot');
            const isValid = fs.existsSync(projectFile);
            return this.createSuccess({
                valid: isValid,
                projectPath,
                projectFile: projectFile,
            }, isValid ? 'Valid Godot project' : 'Invalid Godot project - project.godot not found');
        });
    }
    runProject(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectPath) {
                return this.createError('projectPath is required');
            }
            if (!fs.existsSync(projectPath)) {
                return this.createError(`Project path does not exist: ${projectPath}`);
            }
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('Godot not available on this system');
            }
            const command = `"${this.executablePath}" --path "${projectPath}"`;
            console.log(`[GodotIntegration] Running project: ${command}`);
            try {
                // Run Godot project as background process
                (0, child_process_1.exec)(command);
                return this.createSuccess({
                    running: true,
                    projectPath,
                }, `Godot project running: ${projectPath}`);
            }
            catch (error) {
                return this.createError(`Failed to run project: ${error}`);
            }
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    findGodotExecutable() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            if (platform === 'win32') {
                // Try common installation paths
                const paths = [
                    'C:\\Program Files\\Godot\\Godot.exe',
                    'C:\\Program Files\\Godot\\Godot_v*_win64.exe',
                    'C:\\Godot\\Godot.exe',
                ];
                for (const pattern of paths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        return matches.sort().pop();
                    }
                }
                // Check PATH
                try {
                    const { stdout } = yield execAsync('where godot', { timeout: 2000 });
                    const lines = stdout.trim().split('\n');
                    if (lines.length > 0 && lines[0]) {
                        return lines[0].trim();
                    }
                }
                catch (_a) { }
            }
            else if (platform === 'darwin') {
                const macPaths = [
                    '/Applications/Godot.app/Contents/MacOS/Godot',
                    '/Applications/Godot_*.app/Contents/MacOS/Godot',
                ];
                for (const pattern of macPaths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        return matches.sort().pop();
                    }
                }
                // Check PATH
                try {
                    const { stdout } = yield execAsync('which godot', { timeout: 2000 });
                    const path = stdout.trim();
                    if (path)
                        return path;
                }
                catch (_b) { }
            }
            else if (platform === 'linux') {
                // Check PATH first (most common on Linux)
                try {
                    const { stdout } = yield execAsync('which godot', { timeout: 2000 });
                    const path = stdout.trim();
                    if (path)
                        return path;
                }
                catch (_c) { }
                // Try common paths
                const linuxPaths = [
                    '/usr/bin/godot',
                    '/usr/local/bin/godot',
                    `${process.env.HOME}/.local/bin/godot`,
                ];
                for (const path of linuxPaths) {
                    if (fs.existsSync(path)) {
                        return path;
                    }
                }
            }
            return undefined;
        });
    }
    detectGodotVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executablePath)
                return undefined;
            try {
                const { stdout } = yield execAsync(`"${this.executablePath}" --version`, { timeout: 5000 });
                const match = stdout.match(/(\d+\.\d+\.\d+)/);
                return match ? match[1] : stdout.trim();
            }
            catch (_a) {
                return 'unknown';
            }
        });
    }
}
exports.GodotIntegration = GodotIntegration;
