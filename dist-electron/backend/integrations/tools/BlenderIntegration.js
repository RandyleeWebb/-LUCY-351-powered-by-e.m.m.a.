"use strict";
/**
 * BlenderIntegration.ts
 * Adapter for Blender 3D modeling and animation.
 * Supports launching Blender, Python API access, and MCP-based mesh/material generation.
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
exports.BlenderIntegration = void 0;
const IIntegration_1 = require("../../core/integration/IIntegration");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class BlenderIntegration extends IIntegration_1.BaseIntegration {
    constructor(config) {
        super(config);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[BlenderIntegration] Initializing...`);
            this.status = IIntegration_1.IntegrationStatus.INITIALIZING;
            try {
                // Try to find Blender installation
                this.executablePath = yield this.findBlenderExecutable();
                if (this.executablePath) {
                    this.status = IIntegration_1.IntegrationStatus.AVAILABLE;
                    this.version = yield this.detectBlenderVersion();
                    console.log(`[BlenderIntegration] ✓ Found Blender at ${this.executablePath} (version: ${this.version})`);
                }
                else {
                    this.status = IIntegration_1.IntegrationStatus.NOT_INSTALLED;
                    console.log(`[BlenderIntegration] Blender not found on system`);
                }
                this.lastStatusCheck = new Date();
            }
            catch (error) {
                this.status = IIntegration_1.IntegrationStatus.ERROR;
                console.error(`[BlenderIntegration] Initialization error:`, error);
            }
        });
    }
    execute(action) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const startTime = Date.now();
            try {
                switch (action.action) {
                    case 'launch':
                        return yield this.launchBlender(action.params);
                    case 'open-file':
                        return yield this.openFile((_a = action.params) === null || _a === void 0 ? void 0 : _a.filePath);
                    case 'run-script':
                        return yield this.runPythonScript((_b = action.params) === null || _b === void 0 ? void 0 : _b.script);
                    case 'create-mesh':
                        return yield this.createMesh((_c = action.params) === null || _c === void 0 ? void 0 : _c.meshType, (_d = action.params) === null || _d === void 0 ? void 0 : _d.params);
                    case 'generate-model':
                        return yield this.generateModel((_e = action.params) === null || _e === void 0 ? void 0 : _e.prompt);
                    case 'export-model':
                        return yield this.exportModel((_f = action.params) === null || _f === void 0 ? void 0 : _f.outputPath, (_g = action.params) === null || _g === void 0 ? void 0 : _g.format);
                    case 'start-mcp':
                        return yield this.startMCPServer();
                    case 'stop-mcp':
                        return yield this.stopMCPServer();
                    case 'start-api':
                        return yield this.startAPIServer();
                    case 'stop-api':
                        return yield this.stopAPIServer();
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
                { name: 'launch', description: 'Launch Blender', params: ['filePath'] },
                { name: 'open-file', description: 'Open a .blend file', params: ['filePath'] },
                { name: 'run-script', description: 'Run Python script in Blender', params: ['script'] },
                { name: 'create-mesh', description: 'Create mesh object', params: ['meshType', 'params'] },
                { name: 'generate-model', description: 'Generate 3D model via AI', params: ['prompt'] },
                { name: 'export-model', description: 'Export model to file', params: ['outputPath', 'format'] },
                { name: 'start-mcp', description: 'Start Blender MCP server', params: [] },
                { name: 'stop-mcp', description: 'Stop Blender MCP server', params: [] },
                { name: 'start-api', description: 'Start Blender Python API server', params: [] },
                { name: 'stop-api', description: 'Stop Blender Python API server', params: [] },
            ];
        });
    }
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[BlenderIntegration] Shutting down...');
            yield this.stopMCPServer();
            yield this.stopAPIServer();
            this.status = IIntegration_1.IntegrationStatus.STOPPED;
        });
    }
    // ----------------------------
    // Blender-specific Actions
    // ----------------------------
    launchBlender(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('Blender not available on this system');
            }
            const filePath = params === null || params === void 0 ? void 0 : params.filePath;
            const command = filePath
                ? `"${this.executablePath}" "${filePath}"`
                : `"${this.executablePath}"`;
            console.log(`[BlenderIntegration] Launching Blender: ${command}`);
            try {
                // Launch Blender as background process
                (0, child_process_1.exec)(command);
                this.status = IIntegration_1.IntegrationStatus.RUNNING;
                this.blendFile = filePath;
                return this.createSuccess({
                    launched: true,
                    executable: this.executablePath,
                    filePath,
                }, `Blender launched${filePath ? ` with file: ${filePath}` : ''}`);
            }
            catch (error) {
                return this.createError(`Failed to launch Blender: ${error}`);
            }
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
            if (!filePath.endsWith('.blend')) {
                return this.createError('File must be a .blend file');
            }
            return this.launchBlender({ filePath });
        });
    }
    runPythonScript(script) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!script) {
                return this.createError('script is required');
            }
            if (this.status !== IIntegration_1.IntegrationStatus.AVAILABLE) {
                return this.createError('Blender not available on this system');
            }
            try {
                // Create temporary script file
                const tempScriptPath = path.join(process.cwd(), 'temp_blender_script.py');
                fs.writeFileSync(tempScriptPath, script);
                // Run Blender in background mode with script
                const command = `"${this.executablePath}" --background --python "${tempScriptPath}"`;
                console.log(`[BlenderIntegration] Running script in Blender: ${command}`);
                const { stdout, stderr } = yield execAsync(command, { timeout: 30000 });
                // Clean up temp file
                fs.unlinkSync(tempScriptPath);
                return this.createSuccess({
                    executed: true,
                    stdout,
                    stderr,
                }, 'Python script executed in Blender');
            }
            catch (error) {
                return this.createError(`Failed to run script: ${error}`);
            }
        });
    }
    createMesh(meshType, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const type = meshType || 'cube';
            // Generate Python script to create mesh
            const script = `
import bpy
import sys

# Clear existing objects
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# Create ${type}
if '${type}' == 'cube':
	bpy.ops.mesh.primitive_cube_add()
elif '${type}' == 'sphere':
	bpy.ops.mesh.primitive_uv_sphere_add()
elif '${type}' == 'cylinder':
	bpy.ops.mesh.primitive_cylinder_add()
elif '${type}' == 'plane':
	bpy.ops.mesh.primitive_plane_add()
else:
	print(f"Unknown mesh type: ${type}", file=sys.stderr)
	sys.exit(1)

print("Mesh created: ${type}")
`;
            return this.runPythonScript(script);
        });
    }
    generateModel(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.mcpProcess && !this.apiServerProcess) {
                return this.createError('MCP or API server not running. Start with "start-mcp" or "start-api".');
            }
            // TODO: Implement AI-based model generation via MCP or API
            return this.createSuccess({
                model: 'GeneratedModel',
                prompt,
                status: 'generated',
            }, `Model generation requested (prompt: "${prompt}") - full implementation pending`);
        });
    }
    exportModel(outputPath, format) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!outputPath) {
                return this.createError('outputPath is required');
            }
            const exportFormat = format || 'fbx';
            // Generate Python script to export model
            const script = `
import bpy
import sys

output_path = r"${outputPath}"
export_format = "${exportFormat}"

try:
	if export_format == 'fbx':
		bpy.ops.export_scene.fbx(filepath=output_path)
	elif export_format == 'obj':
		bpy.ops.export_scene.obj(filepath=output_path)
	elif export_format == 'gltf':
		bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLTF_SEPARATE')
	elif export_format == 'glb':
		bpy.ops.export_scene.gltf(filepath=output_path, export_format='GLB')
	else:
		print(f"Unknown export format: {export_format}", file=sys.stderr)
		sys.exit(1)

	print(f"Model exported to {output_path} as {export_format}")
except Exception as e:
	print(f"Export failed: {e}", file=sys.stderr)
	sys.exit(1)
`;
            return this.runPythonScript(script);
        });
    }
    startMCPServer() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (this.mcpProcess) {
                return this.createError('MCP server already running');
            }
            if (!((_a = this.config.mcp) === null || _a === void 0 ? void 0 : _a.available)) {
                return this.createError('MCP not configured for Blender');
            }
            try {
                // Spawn Blender MCP server
                this.mcpProcess = (0, child_process_1.spawn)('blender-mcp-server', ['--blender-path', this.executablePath || 'blender'], {
                    stdio: ['ignore', 'pipe', 'pipe'],
                });
                (_b = this.mcpProcess.stdout) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
                    console.log(`[Blender MCP] ${data.toString()}`);
                });
                (_c = this.mcpProcess.stderr) === null || _c === void 0 ? void 0 : _c.on('data', (data) => {
                    console.error(`[Blender MCP Error] ${data.toString()}`);
                });
                this.mcpProcess.on('exit', (code) => {
                    console.log(`[Blender MCP] Process exited with code ${code}`);
                    this.mcpProcess = undefined;
                });
                return this.createSuccess({
                    running: true,
                    pid: this.mcpProcess.pid,
                }, 'Blender MCP server started');
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
                return this.createSuccess({ running: false }, 'Blender MCP server stopped');
            }
            catch (error) {
                return this.createError(`Failed to stop MCP server: ${error}`);
            }
        });
    }
    startAPIServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.apiServerProcess) {
                return this.createError('API server already running');
            }
            // TODO: Implement Blender Python API HTTP server
            // This would allow HTTP REST API access to Blender operations
            return this.createSuccess({
                running: true,
                endpoint: 'http://localhost:8080/api/v1',
            }, 'Blender API server started (simulated - full implementation pending)');
        });
    }
    stopAPIServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.apiServerProcess) {
                return this.createSuccess({ running: false }, 'API server not running');
            }
            try {
                this.apiServerProcess.kill();
                this.apiServerProcess = undefined;
                return this.createSuccess({ running: false }, 'Blender API server stopped');
            }
            catch (error) {
                return this.createError(`Failed to stop API server: ${error}`);
            }
        });
    }
    // ----------------------------
    // Helper Methods
    // ----------------------------
    findBlenderExecutable() {
        return __awaiter(this, void 0, void 0, function* () {
            const platform = process.platform;
            if (platform === 'win32') {
                // Try common installation paths
                const paths = [
                    'C:\\Program Files\\Blender Foundation\\Blender *\\blender.exe',
                    'C:\\Program Files (x86)\\Blender Foundation\\Blender *\\blender.exe',
                ];
                for (const pattern of paths) {
                    const matches = glob.sync(pattern);
                    if (matches.length > 0) {
                        return matches.sort().pop();
                    }
                }
                // Check PATH
                try {
                    const { stdout } = yield execAsync('where blender', { timeout: 2000 });
                    const lines = stdout.trim().split('\n');
                    if (lines.length > 0 && lines[0]) {
                        return lines[0].trim();
                    }
                }
                catch (_a) { }
            }
            else if (platform === 'darwin') {
                const macPaths = [
                    '/Applications/Blender.app/Contents/MacOS/Blender',
                ];
                for (const path of macPaths) {
                    if (fs.existsSync(path)) {
                        return path;
                    }
                }
                // Check PATH
                try {
                    const { stdout } = yield execAsync('which blender', { timeout: 2000 });
                    const path = stdout.trim();
                    if (path)
                        return path;
                }
                catch (_b) { }
            }
            else if (platform === 'linux') {
                // Check PATH first
                try {
                    const { stdout } = yield execAsync('which blender', { timeout: 2000 });
                    const path = stdout.trim();
                    if (path)
                        return path;
                }
                catch (_c) { }
                // Try common paths
                const linuxPaths = [
                    '/usr/bin/blender',
                    '/usr/local/bin/blender',
                    '/snap/bin/blender',
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
    detectBlenderVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.executablePath)
                return undefined;
            try {
                const { stdout } = yield execAsync(`"${this.executablePath}" --version`, { timeout: 5000 });
                const match = stdout.match(/Blender (\d+\.\d+\.\d+)/);
                return match ? match[1] : 'unknown';
            }
            catch (_a) {
                return 'unknown';
            }
        });
    }
}
exports.BlenderIntegration = BlenderIntegration;
