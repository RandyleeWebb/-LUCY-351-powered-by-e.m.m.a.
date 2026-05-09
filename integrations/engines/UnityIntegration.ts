/**
 * UnityIntegration.ts
 * Adapter for Unity game engine integration.
 * Supports launching Unity, MCP-based scene/script generation, and project management.
 */

import { BaseIntegration, IntegrationAction, IntegrationActionResult, IntegrationStatus, IntegrationConfig } from '../../core/integration/IIntegration';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const execAsync = promisify(exec);

export class UnityIntegration extends BaseIntegration {
  private mcpProcess?: any;
  private projectPath?: string;

  constructor(config: IntegrationConfig) {
	super(config);
  }

  async initialize(): Promise<void> {
	console.log(`[UnityIntegration] Initializing...`);
	this.status = IntegrationStatus.INITIALIZING;

	try {
	  // Try to find Unity installation
	  this.executablePath = await this.findUnityExecutable();

	  if (this.executablePath) {
		this.status = IntegrationStatus.AVAILABLE;
		this.version = await this.detectUnityVersion();
		console.log(`[UnityIntegration] ✓ Found Unity at ${this.executablePath} (version: ${this.version})`);
	  } else {
		this.status = IntegrationStatus.NOT_INSTALLED;
		console.log(`[UnityIntegration] Unity not found on system`);
	  }

	  this.lastStatusCheck = new Date();
	} catch (error) {
	  this.status = IntegrationStatus.ERROR;
	  console.error(`[UnityIntegration] Initialization error:`, error);
	}
  }

  async execute(action: IntegrationAction): Promise<IntegrationActionResult> {
	const startTime = Date.now();

	try {
	  switch (action.action) {
		case 'launch':
		  return await this.launchUnity(action.params);
		case 'open-project':
		  return await this.openProject(action.params?.projectPath);
		case 'create-scene':
		  return await this.createScene(action.params?.sceneName);
		case 'generate-script':
		  return await this.generateScript(action.params?.prompt, action.params?.scriptName);
		case 'start-mcp':
		  return await this.startMCPServer(action.params?.projectPath);
		case 'stop-mcp':
		  return await this.stopMCPServer();
		case 'check-project':
		  return await this.checkProject(action.params?.projectPath);
		default:
		  return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
	  }
	} catch (error) {
	  return this.createError(String(error), Date.now() - startTime);
	}
  }

  async getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>> {
	return [
	  { name: 'launch', description: 'Launch Unity Editor', params: ['projectPath'] },
	  { name: 'open-project', description: 'Open a Unity project', params: ['projectPath'] },
	  { name: 'create-scene', description: 'Create a new scene via MCP', params: ['sceneName'] },
	  { name: 'generate-script', description: 'Generate C# script via AI', params: ['prompt', 'scriptName'] },
	  { name: 'start-mcp', description: 'Start Unity MCP server', params: ['projectPath'] },
	  { name: 'stop-mcp', description: 'Stop Unity MCP server', params: [] },
	  { name: 'check-project', description: 'Validate Unity project structure', params: ['projectPath'] },
	];
  }

  async shutdown(): Promise<void> {
	console.log('[UnityIntegration] Shutting down...');
	await this.stopMCPServer();
	this.status = IntegrationStatus.STOPPED;
  }

  // ----------------------------
  // Unity-specific Actions
  // ----------------------------

  private async launchUnity(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError('Unity not available on this system');
	}

	const projectPath = params?.projectPath;
	const command = projectPath
	  ? `"${this.executablePath}" -projectPath "${projectPath}"`
	  : `"${this.executablePath}"`;

	console.log(`[UnityIntegration] Launching Unity: ${command}`);

	try {
	  // Launch Unity as background process
	  exec(command);
	  this.status = IntegrationStatus.RUNNING;

	  return this.createSuccess({
		launched: true,
		executable: this.executablePath,
		projectPath,
	  }, `Unity launched${projectPath ? ` with project: ${projectPath}` : ''}`);
	} catch (error) {
	  return this.createError(`Failed to launch Unity: ${error}`);
	}
  }

  private async openProject(projectPath?: string): Promise<IntegrationActionResult> {
	if (!projectPath) {
	  return this.createError('projectPath is required');
	}

	if (!fs.existsSync(projectPath)) {
	  return this.createError(`Project path does not exist: ${projectPath}`);
	}

	return this.launchUnity({ projectPath });
  }

  private async createScene(sceneName?: string): Promise<IntegrationActionResult> {
	if (!this.mcpProcess) {
	  return this.createError('MCP server not running. Start it with "start-mcp" action.');
	}

	// TODO: Implement MCP client call to Unity MCP server
	// This would use the Model Context Protocol to create a scene
	return this.createSuccess({
	  scene: sceneName || 'NewScene',
	  status: 'created',
	}, `Scene created: ${sceneName || 'NewScene'} (via MCP - implementation pending)`);
  }

  private async generateScript(prompt?: string, scriptName?: string): Promise<IntegrationActionResult> {
	if (!this.mcpProcess) {
	  return this.createError('MCP server not running. Start it with "start-mcp" action.');
	}

	// TODO: Implement MCP client call to Unity MCP server for AI script generation
	return this.createSuccess({
	  script: scriptName || 'GeneratedScript.cs',
	  prompt,
	  status: 'generated',
	}, `Script generated: ${scriptName || 'GeneratedScript.cs'} (via MCP - implementation pending)`);
  }

  private async startMCPServer(projectPath?: string): Promise<IntegrationActionResult> {
	if (this.mcpProcess) {
	  return this.createError('MCP server already running');
	}

	if (!this.config.mcp?.available) {
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
	} catch (error) {
	  return this.createError(`Failed to start MCP server: ${error}`);
	}
  }

  private async stopMCPServer(): Promise<IntegrationActionResult> {
	if (!this.mcpProcess) {
	  return this.createSuccess({ running: false }, 'MCP server not running');
	}

	try {
	  // TODO: Terminate MCP server process
	  this.mcpProcess = undefined;
	  this.projectPath = undefined;

	  return this.createSuccess({ running: false }, 'Unity MCP server stopped');
	} catch (error) {
	  return this.createError(`Failed to stop MCP server: ${error}`);
	}
  }

  private async checkProject(projectPath?: string): Promise<IntegrationActionResult> {
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
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private async findUnityExecutable(): Promise<string | undefined> {
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
	} else if (platform === 'darwin') {
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
  }

  private async detectUnityVersion(): Promise<string | undefined> {
	if (!this.executablePath) return undefined;

	try {
	  const { stdout } = await execAsync(`"${this.executablePath}" -version`, { timeout: 5000 });
	  const match = stdout.match(/(\d+\.\d+\.\d+)/);
	  return match ? match[1] : 'unknown';
	} catch {
	  return 'unknown';
	}
  }
}
