"use strict";
/**
 * UnrealIntegration.ts
 * Adapter for Unreal Engine integration.
 * Supports launching Unreal Editor, project management, and MCP-based Blueprint/level generation.
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
exports.UnrealIntegration = void 0;
const IIntegration_1 = require("../../core/integration/IIntegration");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class UnrealIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[UnrealIntegration] Initializing...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to find Unreal Engine installation
                this.executablePath = yield this.findUnrealExecutable();
                if (this.executablePath) {
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    this.version = yield this.detectUnrealVersion();
                    console.log(`[UnrealIntegration] ✓ Found Unreal Engine at ${this.executablePath} (version: ${this.version})`);
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.NOT_INSTALLED;
                    console.log(`[UnrealIntegration] Unreal Engine not found on system`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[UnrealIntegration] Initialization error:`, error);
            }
        });
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const startTime = Date.now();
            try {
                switch (action.action) {
                    case 'launch':
                        return yield this.launchUnreal(action.params);
                    case 'open-project':
                        return yield this.openProject((_a = action.params) === null || _a === void 0 ? void 0 : _a.projectPath);
                    case 'create-blueprint':
                        return yield this.createBlueprint((_b = action.params) === null || _b === void 0 ? void 0 : _b.blueprintName);
                    case 'generate-level':
                        return yield this.generateLevel((_c = action.params) === null || _c === void 0 ? void 0 : _c.levelName, (_d = action.params) === null || _d === void 0 ? void 0 : _d.prompt);
                    case 'start-mcp':
                        return yield this.startMCPServer((_e = action.params) === null || _e === void 0 ? void 0 : _e.projectPath);
                    case 'stop-mcp':
                        return yield this.stopMCPServer();
                    case 'check-project':
                        return yield this.checkProject((_f = action.params) === null || _f === void 0 ? void 0 : _f.projectPath);
                    case 'build-project':
                        return yield this.buildProject((_g = action.params) === null || _g === void 0 ? void 0 : _g.projectPath, (_h = action.params) === null || _h === void 0 ? void 0 : _h.config);
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
                { name: 'launch', description: 'Launch Unreal Editor', params: ['projectPath'] },
                { name: 'open-project', description: 'Open an Unreal project', params: ['projectPath'] },
                { name: 'create-blueprint', description: 'Create a new Blueprint via MCP', params: ['blueprintName'] },
                { name: 'generate-level', description: 'Generate a level via AI', params: ['levelName', 'prompt'] },
                { name: 'start-mcp', description: 'Start Unreal MCP server', params: ['projectPath'] },
                { name: 'stop-mcp', description: 'Stop Unreal MCP server', params: [] },
                { name: 'check-project', description: 'Validate Unreal project structure', params: ['projectPath'] },
                { name: 'build-project', description: 'Build Unreal project', params: ['projectPath', 'config'] },
            ];
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[UnrealIntegration] Shutting down...');
            yield this.stopMCPServer();
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // Unreal-specific Actions
    // ----------------------------
    launchUnreal(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('Unreal Engine not available on this system');
            }
            const projectPath = params === null || params === void 0 ? void 0 : params.projectPath;
            const command = projectPath
                ? `"${this.executablePath}" "${projectPath}"`
                : `"${this.executablePath}"`;
            console.log(`[UnrealIntegration] Launching Unreal: ${command}`);
            try {
                // Launch Unreal as background process
                (0, child_process_1.exec)(command);
                this.status = IIntegration_1.IntegrationStatus.RUNNING;
                return this.createSuccess({
                    launched: true,
                    executable: this.executablePath,
                    projectPath,
                }, `Unreal Engine launched${projectPath ? ` with project: ${projectPath}` : ''}`);
            }
            catch (error) {
                return this.createError(`Failed to launch Unreal: ${error}`);
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
            // Unreal projects use .uproject files
            if (!projectPath.endsWith('.uproject')) {
                return this.createError('projectPath must be a .uproject file');
            }
            return this.launchUnreal({ projectPath });
        });
    }
    createBlueprint(blueprintName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call to Unreal MCP server (NeoStack AI or similar)
            return this.createSuccess({
                blueprint: blueprintName || 'NewBlueprint',
                status: 'created',
            }, `Blueprint created: ${blueprintName || 'NewBlueprint'} (via MCP - implementation pending)`);
        });
    }
    generateLevel(levelName, prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess) {
                return this.createError('MCP server not running. Start it with "start-mcp" action.');
            }
            // TODO: Implement MCP client call for AI-based level generation
            return this.createSuccess({
                level: levelName || 'NewLevel',
                prompt,
                status: 'generated',
            }, `Level generated: ${levelName || 'NewLevel'} (via MCP - implementation pending)`);
        });
    }
    startMCPServer(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.mcpProcess) {
                return this.createError('MCP server already running');
            }
            if (!((_a = this.config.mcp) === null || _a === void 0 ? void 0 : _a.available)) {
                return this.createError('MCP not configured for Unreal Engine');
            }
            try {
                // TODO: Spawn Unreal MCP server as child process
                // For now, simulate success
                this.mcpProcess = { pid: 'simulated' };
                this.projectPath = projectPath;
                return this.createSuccess({
                    running: true,
                    projectPath,
                }, 'Unreal MCP server started (simulated - full implementation pending)');
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
                return this.createSuccess({ running: false }, 'Unreal MCP server stopped');
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
            if (!projectPath.endsWith('.uproject')) {
                return this.createError('projectPath must be a .uproject file');
            }
            const projectDir = path.dirname(projectPath);
            const contentPath = path.join(projectDir, 'Content');
            const configPath = path.join(projectDir, 'Config');
            const sourcePath = path.join(projectDir, 'Source');
            const isValid = fs.existsSync(contentPath) && fs.existsSync(configPath);
            return this.createSuccess({
                valid: isValid,
                projectPath,
                structure: {
                    content: fs.existsSync(contentPath),
                    config: fs.existsSync(configPath),
                    source: fs.existsSync(sourcePath),
                },
            }, isValid ? 'Valid Unreal project' : 'Invalid Unreal project structure');
        });
    }
    buildProject(projectPath, config) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectPath) {
                return this.createError('projectPath is required');
            }
            if (!fs.existsSync(projectPath)) {
                return this.createError(`Project path does not exist: ${projectPath}`);
            }
            const buildConfig = config || 'Development';
            // TODO: Implement actual build via UnrealBuildTool
            // For now, return placeholder
            return this.createSuccess({
                project: projectPath,
                config: buildConfig,
                status: 'build_initiated',
            }, `Build initiated for ${path.basename(projectPath)} (${buildConfig}) - full implementation pending`);
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    findUnrealExecutable() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            if (platform === 'win32') {
                // Try common Epic Games Launcher paths
                const epicPaths = [
                    'C:\\Program Files\\Epic Games\\UE_*\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
                    'C:\\Program Files (x86)\\Epic Games\\UE_*\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
                ];
                for (const pattern of epicPaths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        // Return the latest version
                        return matches.sort().pop();
                    }
                }
                // Try older UE4 naming
                const ue4Paths = [
                    'C:\\Program Files\\Epic Games\\UE_*\\Engine\\Binaries\\Win64\\UE4Editor.exe',
                ];
                for (const pattern of ue4Paths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        return matches.sort().pop();
                    }
                }
            }
            else if (platform === 'darwin') {
                const macPaths = [
                    '/Users/Shared/Epic Games/UE_*/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor',
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
    detectUnrealVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executablePath)
                return undefined;
            try {
                // Extract version from path (e.g., UE_5.3)
                const match = this.executablePath.match(/UE_(\d+\.\d+)/);
                if (match) {
                    return match[1];
                }
                // Try reading Engine/Build/Build.version
                const engineDir = path.dirname(path.dirname(path.dirname(path.dirname(this.executablePath))));
                const buildVersionPath = path.join(engineDir, 'Build', 'Build.version');
                if (fs.existsSync(buildVersionPath)) {
                    const versionData = JSON.parse(fs.readFileSync(buildVersionPath, 'utf-8'));
                    return `${versionData.MajorVersion}.${versionData.MinorVersion}.${versionData.PatchVersion}`;
                }
                return 'unknown';
            }
            catch (_a) {
                return 'unknown';
            }
        });
    }
}
exports.UnrealIntegration = UnrealIntegration;
