/**
 * BlenderIntegration.ts
 * Adapter for Blender 3D modeling and animation.
 * Supports launching Blender, Python API access, and MCP-based mesh/material generation.
 */

import { BaseIntegration, IntegrationAction, IntegrationActionResult, IntegrationStatus, IntegrationConfig } from '../../core/integration/IIntegration';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const execAsync = promisify(exec);

export class BlenderIntegration extends BaseIntegration {
  private mcpProcess?: ChildProcess;
  private apiServerProcess?: ChildProcess;
  private blendFile?: string;

  constructor(config: IntegrationConfig) {
	super(config);
  }

  async initialize(): Promise<void> {
	console.log(`[BlenderIntegration] Initializing...`);
	this.status = IntegrationStatus.INITIALIZING;

	try {
	  // Try to find Blender installation
	  this.executablePath = await this.findBlenderExecutable();

	  if (this.executablePath) {
		this.status = IntegrationStatus.AVAILABLE;
		this.version = await this.detectBlenderVersion();
		console.log(`[BlenderIntegration] ✓ Found Blender at ${this.executablePath} (version: ${this.version})`);
	  } else {
		this.status = IntegrationStatus.NOT_INSTALLED;
		console.log(`[BlenderIntegration] Blender not found on system`);
	  }

	  this.lastStatusCheck = new Date();
	} catch (error) {
	  this.status = IntegrationStatus.ERROR;
	  console.error(`[BlenderIntegration] Initialization error:`, error);
	}
  }

  async execute(action: IntegrationAction): Promise<IntegrationActionResult> {
	const startTime = Date.now();

	try {
	  switch (action.action) {
		case 'launch':
		  return await this.launchBlender(action.params);
		case 'open-file':
		  return await this.openFile(action.params?.filePath);
		case 'run-script':
		  return await this.runPythonScript(action.params?.script);
		case 'create-mesh':
		  return await this.createMesh(action.params?.meshType, action.params?.params);
		case 'generate-model':
		  return await this.generateModel(action.params?.prompt);
		case 'export-model':
		  return await this.exportModel(action.params?.outputPath, action.params?.format);
		case 'start-mcp':
		  return await this.startMCPServer();
		case 'stop-mcp':
		  return await this.stopMCPServer();
		case 'start-api':
		  return await this.startAPIServer();
		case 'stop-api':
		  return await this.stopAPIServer();
		default:
		  return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
	  }
	} catch (error) {
	  return this.createError(String(error), Date.now() - startTime);
	}
  }

  async getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>> {
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
  }

  async shutdown(): Promise<void> {
	console.log('[BlenderIntegration] Shutting down...');
	await this.stopMCPServer();
	await this.stopAPIServer();
	this.status = IntegrationStatus.STOPPED;
  }

  // ----------------------------
  // Blender-specific Actions
  // ----------------------------

  private async launchBlender(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError('Blender not available on this system');
	}

	const filePath = params?.filePath;
	const command = filePath
	  ? `"${this.executablePath}" "${filePath}"`
	  : `"${this.executablePath}"`;

	console.log(`[BlenderIntegration] Launching Blender: ${command}`);

	try {
	  // Launch Blender as background process
	  exec(command);
	  this.status = IntegrationStatus.RUNNING;
	  this.blendFile = filePath;

	  return this.createSuccess({
		launched: true,
		executable: this.executablePath,
		filePath,
	  }, `Blender launched${filePath ? ` with file: ${filePath}` : ''}`);
	} catch (error) {
	  return this.createError(`Failed to launch Blender: ${error}`);
	}
  }

  private async openFile(filePath?: string): Promise<IntegrationActionResult> {
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
  }

  private async runPythonScript(script?: string): Promise<IntegrationActionResult> {
	if (!script) {
	  return this.createError('script is required');
	}

	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError('Blender not available on this system');
	}

	try {
	  // Create temporary script file
	  const tempScriptPath = path.join(process.cwd(), 'temp_blender_script.py');
	  fs.writeFileSync(tempScriptPath, script);

	  // Run Blender in background mode with script
	  const command = `"${this.executablePath}" --background --python "${tempScriptPath}"`;
	  console.log(`[BlenderIntegration] Running script in Blender: ${command}`);

	  const { stdout, stderr } = await execAsync(command, { timeout: 30000 });

	  // Clean up temp file
	  fs.unlinkSync(tempScriptPath);

	  return this.createSuccess({
		executed: true,
		stdout,
		stderr,
	  }, 'Python script executed in Blender');
	} catch (error) {
	  return this.createError(`Failed to run script: ${error}`);
	}
  }

  private async createMesh(meshType?: string, params?: any): Promise<IntegrationActionResult> {
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
  }

  private async generateModel(prompt?: string): Promise<IntegrationActionResult> {
	if (!this.mcpProcess && !this.apiServerProcess) {
	  return this.createError('MCP or API server not running. Start with "start-mcp" or "start-api".');
	}

	// TODO: Implement AI-based model generation via MCP or API
	return this.createSuccess({
	  model: 'GeneratedModel',
	  prompt,
	  status: 'generated',
	}, `Model generation requested (prompt: "${prompt}") - full implementation pending`);
  }

  private async exportModel(outputPath?: string, format?: string): Promise<IntegrationActionResult> {
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
  }

  private async startMCPServer(): Promise<IntegrationActionResult> {
	if (this.mcpProcess) {
	  return this.createError('MCP server already running');
	}

	if (!this.config.mcp?.available) {
	  return this.createError('MCP not configured for Blender');
	}

	try {
	  // Spawn Blender MCP server
	  this.mcpProcess = spawn('blender-mcp-server', ['--blender-path', this.executablePath || 'blender'], {
		stdio: ['ignore', 'pipe', 'pipe'],
	  });

	  this.mcpProcess.stdout?.on('data', (data) => {
		console.log(`[Blender MCP] ${data.toString()}`);
	  });

	  this.mcpProcess.stderr?.on('data', (data) => {
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
	} catch (error) {
	  return this.createError(`Failed to start MCP server: ${error}`);
	}
  }

  private async stopMCPServer(): Promise<IntegrationActionResult> {
	if (!this.mcpProcess) {
	  return this.createSuccess({ running: false }, 'MCP server not running');
	}

	try {
	  this.mcpProcess.kill();
	  this.mcpProcess = undefined;

	  return this.createSuccess({ running: false }, 'Blender MCP server stopped');
	} catch (error) {
	  return this.createError(`Failed to stop MCP server: ${error}`);
	}
  }

  private async startAPIServer(): Promise<IntegrationActionResult> {
	if (this.apiServerProcess) {
	  return this.createError('API server already running');
	}

	// TODO: Implement Blender Python API HTTP server
	// This would allow HTTP REST API access to Blender operations
	return this.createSuccess({
	  running: true,
	  endpoint: 'http://localhost:8080/api/v1',
	}, 'Blender API server started (simulated - full implementation pending)');
  }

  private async stopAPIServer(): Promise<IntegrationActionResult> {
	if (!this.apiServerProcess) {
	  return this.createSuccess({ running: false }, 'API server not running');
	}

	try {
	  this.apiServerProcess.kill();
	  this.apiServerProcess = undefined;

	  return this.createSuccess({ running: false }, 'Blender API server stopped');
	} catch (error) {
	  return this.createError(`Failed to stop API server: ${error}`);
	}
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private async findBlenderExecutable(): Promise<string | undefined> {
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
		const { stdout } = await execAsync('where blender', { timeout: 2000 });
		const lines = stdout.trim().split('\n');
		if (lines.length > 0 && lines[0]) {
		  return lines[0].trim();
		}
	  } catch {}
	} else if (platform === 'darwin') {
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
		const { stdout } = await execAsync('which blender', { timeout: 2000 });
		const path = stdout.trim();
		if (path) return path;
	  } catch {}
	} else if (platform === 'linux') {
	  // Check PATH first
	  try {
		const { stdout } = await execAsync('which blender', { timeout: 2000 });
		const path = stdout.trim();
		if (path) return path;
	  } catch {}

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
  }

  private async detectBlenderVersion(): Promise<string | undefined> {
	if (!this.executablePath) return undefined;

	try {
	  const { stdout } = await execAsync(`"${this.executablePath}" --version`, { timeout: 5000 });
	  const match = stdout.match(/Blender (\d+\.\d+\.\d+)/);
	  return match ? match[1] : 'unknown';
	} catch {
	  return 'unknown';
	}
  }
}
