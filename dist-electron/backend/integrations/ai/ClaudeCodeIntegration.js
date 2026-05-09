"use strict";
/**
 * ClaudeCodeIntegration.ts
 * Adapter for Claude Code, Cursor, Windsurf, and other AI-first editors.
 * Supports launching editors and MCP-based bidirectional AI communication.
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
exports.ClaudeCodeIntegration = void 0;
const IIntegration_1 = require("../../core/integration/IIntegration");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ClaudeCodeIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[ClaudeCodeIntegration] Initializing ${this.name}...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to find the editor executable
                this.executablePath = yield this.findExecutable();
                if (this.executablePath) {
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    this.version = yield this.detectVersion();
                    console.log(`[ClaudeCodeIntegration] ✓ Found ${this.name} at ${this.executablePath} (version: ${this.version})`);
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.NOT_INSTALLED;
                    console.log(`[ClaudeCodeIntegration] ${this.name} not found on system`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[ClaudeCodeIntegration] Initialization error:`, error);
            }
        });
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const startTime = Date.now();
            try {
                switch (action.action) {
                    case 'launch':
                        return yield this.launchEditor(action.params);
                    case 'open-project':
                        return yield this.openProject((_a = action.params) === null || _a === void 0 ? void 0 : _a.projectPath);
                    case 'open-file':
                        return yield this.openFile((_b = action.params) === null || _b === void 0 ? void 0 : _b.filePath);
                    case 'start-mcp-server':
                        return yield this.startMCPServer();
                    case 'stop-mcp-server':
                        return yield this.stopMCPServer();
                    case 'send-prompt':
                        return yield this.sendPrompt((_c = action.params) === null || _c === void 0 ? void 0 : _c.prompt);
                    case 'get-context':
                        return yield this.getProjectContext((_d = action.params) === null || _d === void 0 ? void 0 : _d.projectPath);
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
                { name: 'launch', description: `Launch ${this.name}`, params: ['projectPath'] },
                { name: 'open-project', description: 'Open a project', params: ['projectPath'] },
                { name: 'open-file', description: 'Open a specific file', params: ['filePath'] },
                { name: 'start-mcp-server', description: 'Start Lucy MCP server for bidirectional AI', params: [] },
                { name: 'stop-mcp-server', description: 'Stop Lucy MCP server', params: [] },
                { name: 'send-prompt', description: 'Send AI prompt to editor', params: ['prompt'] },
                { name: 'get-context', description: 'Get project context for AI', params: ['projectPath'] },
            ];
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[ClaudeCodeIntegration] Shutting down ${this.name}...`);
            yield this.stopMCPServer();
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // AI Editor Actions
    // ----------------------------
    launchEditor(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError(`${this.name} not available on this system`);
            }
            const projectPath = params === null || params === void 0 ? void 0 : params.projectPath;
            const command = projectPath
                ? `"${this.executablePath}" "${projectPath}"`
                : `"${this.executablePath}"`;
            console.log(`[ClaudeCodeIntegration] Launching ${this.name}: ${command}`);
            try {
                // Launch editor as background process
                (0, child_process_1.exec)(command);
                this.status = IIntegration_1.IntegrationStatus.RUNNING;
                return this.createSuccess({
                    launched: true,
                    executable: this.executablePath,
                    projectPath,
                }, `${this.name} launched${projectPath ? ` with project: ${projectPath}` : ''}`);
            }
            catch (error) {
                return this.createError(`Failed to launch ${this.name}: ${error}`);
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
            return this.launchEditor({ projectPath });
        });
    }
    openFile(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!filePath) {
                return this.createError('filePath is required');
            }
            if (!fs.existsSync(filePath)) {
                return this.createError(`File does not exist: ${filePath}`);
            }
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError(`${this.name} not available on this system`);
            }
            const command = `"${this.executablePath}" "${filePath}"`;
            try {
                (0, child_process_1.exec)(command);
                return this.createSuccess({
                    opened: true,
                    filePath,
                }, `File opened in ${this.name}: ${filePath}`);
            }
            catch (error) {
                return this.createError(`Failed to open file: ${error}`);
            }
        });
    }
    startMCPServer() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.mcpServerProcess) {
                return this.createError('MCP server already running');
            }
            try {
                // Start Lucy's MCP server so Claude/Cursor/Windsurf can connect to Lucy
                // This allows external AI editors to read Lucy's state and trigger actions
                const serverScript = path.join(process.cwd(), 'backend', 'mcp', 'lucy-server.js');
                if (!fs.existsSync(serverScript)) {
                    return this.createError(`Lucy MCP server not found at ${serverScript}`);
                }
                this.mcpServerProcess = (0, child_process_1.spawn)('node', [serverScript], {
                    stdio: ['ignore', 'pipe', 'pipe'],
                });
                (_a = this.mcpServerProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', (data) => {
                    console.log(`[Lucy MCP] ${data.toString()}`);
                });
                (_b = this.mcpServerProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                    console.error(`[Lucy MCP Error] ${data.toString()}`);
                });
                this.mcpServerProcess.on('exit', (code) => {
                    console.log(`[Lucy MCP] Process exited with code ${code}`);
                    this.mcpServerProcess = undefined;
                });
                // Create or update Claude Desktop config
                yield this.updateClaudeConfig();
                return this.createSuccess({
                    running: true,
                    pid: this.mcpServerProcess.pid,
                    config: 'Claude Desktop config updated',
                }, `Lucy MCP server started - ${this.name} can now connect to Lucy`);
            }
            catch (error) {
                return this.createError(`Failed to start MCP server: ${error}`);
            }
        });
    }
    stopMCPServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpServerProcess) {
                return this.createSuccess({ running: false }, 'MCP server not running');
            }
            try {
                this.mcpServerProcess.kill();
                this.mcpServerProcess = undefined;
                return this.createSuccess({ running: false }, 'Lucy MCP server stopped');
            }
            catch (error) {
                return this.createError(`Failed to stop MCP server: ${error}`);
            }
        });
    }
    sendPrompt(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!prompt) {
                return this.createError('prompt is required');
            }
            if (!this.mcpServerProcess) {
                return this.createError('MCP server not running. Start with "start-mcp-server".');
            }
            // TODO: Implement MCP client call to send prompt to running editor
            // This would use the Model Context Protocol to inject prompts into Claude/Cursor/Windsurf
            return this.createSuccess({
                prompt,
                status: 'sent',
            }, `Prompt sent to ${this.name} (via MCP - full implementation pending)`);
        });
    }
    getProjectContext(projectPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!projectPath) {
                return this.createError('projectPath is required');
            }
            if (!fs.existsSync(projectPath)) {
                return this.createError(`Project path does not exist: ${projectPath}`);
            }
            try {
                // Build project context summary for AI
                const files = this.scanProjectFiles(projectPath, 0, 3); // Max depth 3
                const fileCount = files.length;
                const extensions = [...new Set(files.map(f => path.extname(f)))];
                return this.createSuccess({
                    projectPath,
                    fileCount,
                    extensions,
                    files: files.slice(0, 100), // Return first 100 files
                }, `Project context retrieved: ${fileCount} files`);
            }
            catch (error) {
                return this.createError(`Failed to get project context: ${error}`);
            }
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    findExecutable() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            const username = process.env.USERNAME || process.env.USER || '';
            // Define search paths based on integration ID
            let searchPaths = [];
            if (this.id === 'claude-code') {
                if (platform === 'win32') {
                    searchPaths = [
                        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Claude\\Claude.exe`,
                    ];
                }
                else if (platform === 'darwin') {
                    searchPaths = [
                        '/Applications/Claude.app/Contents/MacOS/Claude',
                    ];
                }
            }
            else if (this.id === 'cursor') {
                if (platform === 'win32') {
                    searchPaths = [
                        `C:\\Users\\${username}\\AppData\\Local\\Programs\\cursor\\Cursor.exe`,
                    ];
                }
                else if (platform === 'darwin') {
                    searchPaths = [
                        '/Applications/Cursor.app/Contents/MacOS/Cursor',
                    ];
                }
            }
            else if (this.id === 'windsurf') {
                if (platform === 'win32') {
                    searchPaths = [
                        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Windsurf\\Windsurf.exe`,
                    ];
                }
                else if (platform === 'darwin') {
                    searchPaths = [
                        '/Applications/Windsurf.app/Contents/MacOS/Windsurf',
                    ];
                }
            }
            // Check search paths
            for (const path of searchPaths) {
                if (fs.existsSync(path)) {
                    return path;
                }
            }
            // Try PATH
            try {
                const cmd = platform === 'win32' ? 'where' : 'which';
                const { stdout } = yield execAsync(`${cmd} ${this.id}`, { timeout: 2000 });
                const path = stdout.trim().split('\n')[0];
                if (path)
                    return path;
            }
            catch (_a) { }
            return undefined;
        });
    }
    detectVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executablePath)
                return undefined;
            try {
                const { stdout } = yield execAsync(`"${this.executablePath}" --version`, { timeout: 5000 });
                const match = stdout.match(/(\d+\.\d+\.\d+)/);
                return match ? match[1] : 'unknown';
            }
            catch (_a) {
                return 'unknown';
            }
        });
    }
    updateClaudeConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            const username = process.env.USERNAME || process.env.USER || '';
            let configPath = '';
            if (platform === 'win32') {
                configPath = path.join(`C:\\Users\\${username}\\AppData\\Roaming\\Claude`, 'claude_desktop_config.json');
            }
            else if (platform === 'darwin') {
                configPath = path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
            }
            else {
                configPath = path.join(process.env.HOME || '', '.config', 'Claude', 'claude_desktop_config.json');
            }
            const configDir = path.dirname(configPath);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            // Load existing config or create new
            let config = { mcpServers: {} };
            if (fs.existsSync(configPath)) {
                try {
                    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                }
                catch (_a) { }
            }
            // Add Lucy MCP server
            config.mcpServers = config.mcpServers || {};
            config.mcpServers['lucy-sovereign'] = {
                command: 'node',
                args: [path.join(process.cwd(), 'backend', 'mcp', 'lucy-server.js')],
            };
            // Write config
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            console.log(`[ClaudeCodeIntegration] Updated Claude Desktop config at ${configPath}`);
        });
    }
    scanProjectFiles(dirPath, currentDepth, maxDepth) {
        if (currentDepth > maxDepth)
            return [];
        const files = [];
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                // Skip common ignored directories
                if (entry.isDirectory()) {
                    if (['node_modules', '.git', 'dist', 'build', '.next', '__pycache__'].includes(entry.name)) {
                        continue;
                    }
                    files.push(...this.scanProjectFiles(fullPath, currentDepth + 1, maxDepth));
                }
                else {
                    files.push(fullPath);
                }
            }
        }
        catch (_a) { }
        return files;
    }
}
exports.ClaudeCodeIntegration = ClaudeCodeIntegration;
