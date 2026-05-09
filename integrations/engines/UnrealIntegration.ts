/**
 * UnrealIntegration.ts
 * Adapter for Unreal Engine integration.
 * Supports launching Unreal Editor, project management, and MCP-based Blueprint/level generation.
 */

import { BaseIntegration, IntegrationAction, IntegrationActionResult, IntegrationStatus, IntegrationConfig } from '../../core/integration/IIntegration';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

const execAsync = promisify(exec);

export class UnrealIntegration extends BaseIntegration {
  private mcpProcess?: any;
  private projectPath?: string;

  constructor(config: IntegrationConfig) {
	super(config);
  }

  async initialize(): Promise<void> {
	console.log(`[UnrealIntegration] Initializing...`);
	this.status = IntegrationStatus.INITIALIZING;

	try {
	  // Try to find Unreal Engine installation
	  this.executablePath = await this.findUnrealExecutable();

	  if (this.executablePath) {
		this.status = IntegrationStatus.AVAILABLE;
		this.version = await this.detectUnrealVersion();
		console.log(`[UnrealIntegration] ✓ Found Unreal Engine at ${this.executablePath} (version: ${this.version})`);
	  } else {
		this.status = IntegrationStatus.NOT_INSTALLED;
		console.log(`[UnrealIntegration] Unreal Engine not found on system`);
	  }

	  this.lastStatusCheck = new Date();
	} catch (error) {
	  this.status = IntegrationStatus.ERROR;
	  console.error(`[UnrealIntegration] Initialization error:`, error);
	}
  }

  async execute(action: IntegrationAction): Promise<IntegrationActionResult> {
	const startTime = Date.now();

	try {
	  switch (action.action) {
		case 'launch':
		  return await this.launchUnreal(action.params);
		case 'open-project':
		  return await this.openProject(action.params?.projectPath);
		case 'create-blueprint':
		  return await this.createBlueprint(action.params?.blueprintName);
		case 'generate-level':
		  return await this.generateLevel(action.params?.levelName, action.params?.prompt);
		case 'start-mcp':
		  return await this.startMCPServer(action.params?.projectPath);
		case 'stop-mcp':
		  return await this.stopMCPServer();
		case 'check-project':
		  return await this.checkProject(action.params?.projectPath);
		case 'build-project':
		  return await this.buildProject(action.params?.projectPath, action.params?.config);
		default:
		  return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
	  }
	} catch (error) {
	  return this.createError(String(error), Date.now() - startTime);
	}
  }

  async getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>> {
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
  }

  async shutdown(): Promise<void> {
	console.log('[UnrealIntegration] Shutting down...');
	await this.stopMCPServer();
	this.status = IntegrationStatus.STOPPED;
  }

  // ----------------------------
  // Unreal-specific Actions
  // ----------------------------

  private async launchUnreal(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError('Unreal Engine not available on this system');
	}

	const projectPath = params?.projectPath;
	const command = projectPath
	  ? `"${this.executablePath}" "${projectPath}"`
	  : `"${this.executablePath}"`;

	console.log(`[UnrealIntegration] Launching Unreal: ${command}`);

	try {
	  // Launch Unreal as background process
	  exec(command);
	  this.status = IntegrationStatus.RUNNING;

	  return this.createSuccess({
		launched: true,
		executable: this.executablePath,
		projectPath,
	  }, `Unreal Engine launched${projectPath ? ` with project: ${projectPath}` : ''}`);
	} catch (error) {
	  return this.createError(`Failed to launch Unreal: ${error}`);
	}
  }

  private async openProject(projectPath?: string): Promise<IntegrationActionResult> {
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
  }

  private async createBlueprint(blueprintName?: string): Promise<IntegrationActionResult> {
	if (!this.mcpProcess) {
	  return this.createError('MCP server not running. Start it with "start-mcp" action.');
	}

	// TODO: Implement MCP client call to Unreal MCP server (NeoStack AI or similar)
	return this.createSuccess({
	  blueprint: blueprintName || 'NewBlueprint',
	  status: 'created',
	}, `Blueprint created: ${blueprintName || 'NewBlueprint'} (via MCP - implementation pending)`);
  }

  private async generateLevel(levelName?: string, prompt?: string): Promise<IntegrationActionResult> {
	if (!this.mcpProcess) {
	  return this.createError('MCP server not running. Start it with "start-mcp" action.');
	}

	// TODO: Implement MCP client call for AI-based level generation
	return this.createSuccess({
	  level: levelName || 'NewLevel',
	  prompt,
	  status: 'generated',
	}, `Level generated: ${levelName || 'NewLevel'} (via MCP - implementation pending)`);
  }

  private async startMCPServer(projectPath?: string): Promise<IntegrationActionResult> {
	if (this.mcpProcess) {
	  return this.createError('MCP server already running');
	}

	if (!this.config.mcp?.available) {
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

	  return this.createSuccess({ running: false }, 'Unreal MCP server stopped');
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
  }

  private async buildProject(projectPath?: string, config?: string): Promise<IntegrationActionResult> {
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
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private async findUnrealExecutable(): Promise<string | undefined> {
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
	} else if (platform === 'darwin') {
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
  }

  private async detectUnrealVersion(): Promise<string | undefined> {
	if (!this.executablePath) return undefined;

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
	} catch {
	  return 'unknown';
	}
  }
}
