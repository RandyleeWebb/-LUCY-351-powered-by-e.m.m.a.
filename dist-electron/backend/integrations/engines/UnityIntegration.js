"use strict";
/**
 * UnityIntegration.ts
 * Adapter for Unity game engine integration.
 * Supports launching Unity, MCP-based scene/script generation, and project management.
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
exports.UnityIntegration = void 0;
const IIntegration_1 = require("../../core/integration/IIntegration");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class UnityIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[UnityIntegration] Initializing...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to find Unity installation
                this.executablePath = yield this.findUnityExecutable();
                if (this.executablePath) {
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    this.version = yield this.detectUnityVersion();
                    console.log(`[UnityIntegration] ✓ Found Unity at ${this.executablePath} (version: ${this.version})`);
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.NOT_INSTALLED;
                    console.log(`[UnityIntegration] Unity not found on system`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[UnityIntegration] Initialization error:`, error);
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
                        return yield this.launchUnity(action.params);
                    case 'open-project':
                        return yield this.openProject((_a = action.params) === null || _a === void 0 ? void 0 : _a.projectPath);
                    case 'create-scene':
                        return yield this.createScene((_b = action.params) === null || _b === void 0 ? void 0 : _b.sceneName);
                    case 'generate-script':
                        return yield this.generateScript((_c = action.params) === null || _c === void 0 ? void 0 : _c.prompt, (_d = action.params) === null || _d === void 0 ? void 0 : _d.scriptName);
                    case 'start-mcp':
                        return yield this.startMCPServer((_e = action.params) === null || _e === void 0 ? void 0 : _e.projectPath);
                    case 'stop-mcp':
                        return yield this.stopMCPServer();
                    case 'check-project':
                        return yield this.checkProject((_f = action.params) === null || _f === void 0 ? void 0 : _f.projectPath);
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
                { name: 'launch', description: 'Launch Unity Editor', params: ['projectPath'] },
                { name: 'open-project', description: 'Open a Unity project', params: ['projectPath'] },
                { name: 'create-scene', description: 'Create a new scene via MCP', params: ['sceneName'] },
                { name: 'generate-script', description: 'Generate C# script via AI', params: ['prompt', 'scriptName'] },
                { name: 'start-mcp', description: 'Start Unity MCP server', params: ['projectPath'] },
                { name: 'stop-mcp', description: 'Stop Unity MCP server', params: [] },
                { name: 'check-project', description: 'Validate Unity project structure', params: ['projectPath'] },
            ];
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[UnityIntegration] Shutting down...');
            yield this.stopMCPServer();
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // Unity-specific Actions
    // ----------------------------
    launchUnity(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('Unity not available on this system');
            }
            const projectPath = params === null || params === void 0 ? void 0 : params.projectPath;
            const command = projectPath
                ? `"${this.executablePath}" -projectPath "${projectPath}"`
                : `"${this.executablePath}"`;
            console.log(`[UnityIntegration] Launching Unity: ${command}`);
            try {
                // Launch Unity as background process
                (0, child_process_1.exec)(command);
                this.status = IIntegration_1.IntegrationStatus.RUNNING;
                return this.createSuccess({
                    launched: true,
                    executable: this.executablePath,
                    projectPath,
                }, `Unity launched${projectPath ? ` with project: ${projectPath}` : ''}`);
            }
            catch (error) {
                return this.createError(`Failed to launch Unity: ${error}`);
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
            return this.launchUnity({ projectPath });
        });
    }
    createScene(sceneName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call to Unity MCP server
            // This would use the Model Context Protocol to create a scene
            return this.createSuccess({
                scene: sceneName || 'NewScene',
                status: 'created',
            }, `Scene created: ${sceneName || 'NewScene'} (via MCP - implementation pending)`);
        });
    }
    generateScript(prompt, scriptName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call to Unity MCP server for AI script generation
            return this.createSuccess({
                script: scriptName || 'GeneratedScript.cs',
                prompt,
                status: 'generated',
            }, `Script generated: ${scriptName || 'GeneratedScript.cs'} (via MCP - implementation pending)`);
        });
    }
    startMCPServer(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.mcpProcess) {
                return this.createError('MCP server already running');
            }
            if (!((_a = this.config.mcp) === null || _a === void 0 ? void 0 : _a.available)) {
                return this.createError('MCP not configured for Unity');
            }
            try {
                // TODO: Spawn Unity MCP server as child process
                // For now, simulate success
                this.mcpProcess = { pid: 'simulated' };
                this.projectPath = projectPath;
                return this.createSuccess({
                    running: true,
                    projectPath,
                }, 'Unity MCP server started (simulated - full implementation pending)');
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
                // TODO: Terminate MCP server process
                this.mcpProcess = undefined;
                this.projectPath = undefined;
                return this.createSuccess({ running: false }, 'Unity MCP server stopped');
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
            const assetsPath = path.join(projectPath, 'Assets');
            const projectSettingsPath = path.join(projectPath, 'ProjectSettings');
            const packagesPath = path.join(projectPath, 'Packages');
            const isValid = fs.existsSync(assetsPath) && fs.existsSync(projectSettingsPath);
            return this.createSuccess({
                valid: isValid,
                projectPath,
                structure: {
                    assets: fs.existsSync(assetsPath),
                    projectSettings: fs.existsSync(projectSettingsPath),
                    packages: fs.existsSync(packagesPath),
                },
            }, isValid ? 'Valid Unity project' : 'Invalid Unity project structure');
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    findUnityExecutable() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            if (platform === 'win32') {
                // Try common Unity Hub paths
                const hubPaths = [
                    'C:\\Program Files\\Unity\\Hub\\Editor\\**\\Editor\\Unity.exe',
                    'C:\\Program Files (x86)\\Unity\\Hub\\Editor\\**\\Editor\\Unity.exe',
                ];
                for (const pattern of hubPaths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        // Return the latest version (last in sorted list)
                        return matches.sort().pop();
                    }
                }
                // Try standalone installation
                const standalonePaths = [
                    'C:\\Program Files\\Unity\\Editor\\Unity.exe',
                ];
                for (const path of standalonePaths) {
                    if (fs.existsSync(path)) {
                        return path;
                    }
                }
            }
            else if (platform === 'darwin') {
                const macPaths = [
                    '/Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity',
                    '/Applications/Unity/Unity.app/Contents/MacOS/Unity',
                ];
                for (const pattern of macPaths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        return matches.sort().pop();
                    }
                }
            }
            return undefined;
        });
    }
    detectUnityVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executablePath)
                return undefined;
            try {
                const { stdout } = yield execAsync(`"${this.executablePath}" -version`, { timeout: 5000 });
                const match = stdout.match(/(\d+\.\d+\.\d+)/);
                return match ? match[1] : 'unknown';
            }
            catch (_a) {
                return 'unknown';
            }
        });
    }
}
exports.UnityIntegration = UnityIntegration;
