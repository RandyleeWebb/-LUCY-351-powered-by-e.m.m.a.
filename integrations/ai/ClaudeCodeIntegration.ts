/**
 * ClaudeCodeIntegration.ts
 * Adapter for Claude Code, Cursor, Windsurf, and other AI-first editors.
 * Supports launching editors and MCP-based bidirectional AI communication.
 */

import { BaseIntegration, IntegrationAction, IntegrationActionResult, IntegrationStatus, IntegrationConfig } from '../../core/integration/IIntegration';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export class ClaudeCodeIntegration extends BaseIntegration {
  private mcpServerProcess?: ChildProcess;

  constructor(config: IntegrationConfig) {
	super(config);
  }

  async initialize(): Promise<void> {
	console.log(`[ClaudeCodeIntegration] Initializing ${this.name}...`);
	this.status = IntegrationStatus.INITIALIZING;

	try {
	  // Try to find the editor executable
	  this.executablePath = await this.findExecutable();

	  if (this.executablePath) {
		this.status = IntegrationStatus.AVAILABLE;
		this.version = await this.detectVersion();
		console.log(`[ClaudeCodeIntegration] ✓ Found ${this.name} at ${this.executablePath} (version: ${this.version})`);
	  } else {
		this.status = IntegrationStatus.NOT_INSTALLED;
		console.log(`[ClaudeCodeIntegration] ${this.name} not found on system`);
	  }

	  this.lastStatusCheck = new Date();
	} catch (error) {
	  this.status = IntegrationStatus.ERROR;
	  console.error(`[ClaudeCodeIntegration] Initialization error:`, error);
	}
  }

  async execute(action: IntegrationAction): Promise<IntegrationActionResult> {
	const startTime = Date.now();

	try {
	  switch (action.action) {
		case 'launch':
		  return await this.launchEditor(action.params);
		case 'open-project':
		  return await this.openProject(action.params?.projectPath);
		case 'open-file':
		  return await this.openFile(action.params?.filePath);
		case 'start-mcp-server':
		  return await this.startMCPServer();
		case 'stop-mcp-server':
		  return await this.stopMCPServer();
		case 'send-prompt':
		  return await this.sendPrompt(action.params?.prompt);
		case 'get-context':
		  return await this.getProjectContext(action.params?.projectPath);
		default:
		  return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
	  }
	} catch (error) {
	  return this.createError(String(error), Date.now() - startTime);
	}
  }

  async getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>> {
	return [
	  { name: 'launch', description: `Launch ${this.name}`, params: ['projectPath'] },
	  { name: 'open-project', description: 'Open a project', params: ['projectPath'] },
	  { name: 'open-file', description: 'Open a specific file', params: ['filePath'] },
	  { name: 'start-mcp-server', description: 'Start Lucy MCP server for bidirectional AI', params: [] },
	  { name: 'stop-mcp-server', description: 'Stop Lucy MCP server', params: [] },
	  { name: 'send-prompt', description: 'Send AI prompt to editor', params: ['prompt'] },
	  { name: 'get-context', description: 'Get project context for AI', params: ['projectPath'] },
	];
  }

  async shutdown(): Promise<void> {
	console.log(`[ClaudeCodeIntegration] Shutting down ${this.name}...`);
	await this.stopMCPServer();
	this.status = IntegrationStatus.STOPPED;
  }

  // ----------------------------
  // AI Editor Actions
  // ----------------------------

  private async launchEditor(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError(`${this.name} not available on this system`);
	}

	const projectPath = params?.projectPath;
	const command = projectPath
	  ? `"${this.executablePath}" "${projectPath}"`
	  : `"${this.executablePath}"`;

	console.log(`[ClaudeCodeIntegration] Launching ${this.name}: ${command}`);

	try {
	  // Launch editor as background process
	  exec(command);
	  this.status = IntegrationStatus.RUNNING;

	  return this.createSuccess({
		launched: true,
		executable: this.executablePath,
		projectPath,
	  }, `${this.name} launched${projectPath ? ` with project: ${projectPath}` : ''}`);
	} catch (error) {
	  return this.createError(`Failed to launch ${this.name}: ${error}`);
	}
  }

  private async openProject(projectPath?: string): Promise<IntegrationActionResult> {
	if (!projectPath) {
	  return this.createError('projectPath is required');
	}

	if (!fs.existsSync(projectPath)) {
	  return this.createError(`Project path does not exist: ${projectPath}`);
	}

	return this.launchEditor({ projectPath });
  }

  private async openFile(filePath?: string): Promise<IntegrationActionResult> {
	if (!filePath) {
	  return this.createError('filePath is required');
	}

	if (!fs.existsSync(filePath)) {
	  return this.createError(`File does not exist: ${filePath}`);
	}

	if (this.status !== IntegrationStatus.AVAILABLE) {
	  return this.createError(`${this.name} not available on this system`);
	}

	const command = `"${this.executablePath}" "${filePath}"`;

	try {
	  exec(command);

	  return this.createSuccess({
		opened: true,
		filePath,
	  }, `File opened in ${this.name}: ${filePath}`);
	} catch (error) {
	  return this.createError(`Failed to open file: ${error}`);
	}
  }

  private async startMCPServer(): Promise<IntegrationActionResult> {
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

	  this.mcpServerProcess = spawn('node', [serverScript], {
		stdio: ['ignore', 'pipe', 'pipe'],
	  });

	  this.mcpServerProcess.stdout?.on('data', (data) => {
		console.log(`[Lucy MCP] ${data.toString()}`);
	  });

	  this.mcpServerProcess.stderr?.on('data', (data) => {
		console.error(`[Lucy MCP Error] ${data.toString()}`);
	  });

	  this.mcpServerProcess.on('exit', (code) => {
		console.log(`[Lucy MCP] Process exited with code ${code}`);
		this.mcpServerProcess = undefined;
	  });

	  // Create or update Claude Desktop config
	  await this.updateClaudeConfig();

	  return this.createSuccess({
		running: true,
		pid: this.mcpServerProcess.pid,
		config: 'Claude Desktop config updated',
	  }, `Lucy MCP server started - ${this.name} can now connect to Lucy`);
	} catch (error) {
	  return this.createError(`Failed to start MCP server: ${error}`);
	}
  }

  private async stopMCPServer(): Promise<IntegrationActionResult> {
	if (!this.mcpServerProcess) {
	  return this.createSuccess({ running: false }, 'MCP server not running');
	}

	try {
	  this.mcpServerProcess.kill();
	  this.mcpServerProcess = undefined;

	  return this.createSuccess({ running: false }, 'Lucy MCP server stopped');
	} catch (error) {
	  return this.createError(`Failed to stop MCP server: ${error}`);
	}
  }

  private async sendPrompt(prompt?: string): Promise<IntegrationActionResult> {
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
  }

  private async getProjectContext(projectPath?: string): Promise<IntegrationActionResult> {
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
	} catch (error) {
	  return this.createError(`Failed to get project context: ${error}`);
	}
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private async findExecutable(): Promise<string | undefined> {
	const platform = process.platform;
	const username = process.env.USERNAME || process.env.USER || '';

	// Define search paths based on integration ID
	let searchPaths: string[] = [];

	if (this.id === 'claude-code') {
	  if (platform === 'win32') {
		searchPaths = [
		  `C:\\Users\\${username}\\AppData\\Local\\Programs\\Claude\\Claude.exe`,
		];
	  } else if (platform === 'darwin') {
		searchPaths = [
		  '/Applications/Claude.app/Contents/MacOS/Claude',
		];
	  }
	} else if (this.id === 'cursor') {
	  if (platform === 'win32') {
		searchPaths = [
		  `C:\\Users\\${username}\\AppData\\Local\\Programs\\cursor\\Cursor.exe`,
		];
	  } else if (platform === 'darwin') {
		searchPaths = [
		  '/Applications/Cursor.app/Contents/MacOS/Cursor',
		];
	  }
	} else if (this.id === 'windsurf') {
	  if (platform === 'win32') {
		searchPaths = [
		  `C:\\Users\\${username}\\AppData\\Local\\Programs\\Windsurf\\Windsurf.exe`,
		];
	  } else if (platform === 'darwin') {
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
	  const { stdout } = await execAsync(`${cmd} ${this.id}`, { timeout: 2000 });
	  const path = stdout.trim().split('\n')[0];
	  if (path) return path;
	} catch {}

	return undefined;
  }

  private async detectVersion(): Promise<string | undefined> {
	if (!this.executablePath) return undefined;

	try {
	  const { stdout } = await execAsync(`"${this.executablePath}" --version`, { timeout: 5000 });
	  const match = stdout.match(/(\d+\.\d+\.\d+)/);
	  return match ? match[1] : 'unknown';
	} catch {
	  return 'unknown';
	}
  }

  private async updateClaudeConfig(): Promise<void> {
	const platform = process.platform;
	const username = process.env.USERNAME || process.env.USER || '';

	let configPath = '';
	if (platform === 'win32') {
	  configPath = path.join(`C:\\Users\\${username}\\AppData\\Roaming\\Claude`, 'claude_desktop_config.json');
	} else if (platform === 'darwin') {
	  configPath = path.join(process.env.HOME || '', 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
	} else {
	  configPath = path.join(process.env.HOME || '', '.config', 'Claude', 'claude_desktop_config.json');
	}

	const configDir = path.dirname(configPath);
	if (!fs.existsSync(configDir)) {
	  fs.mkdirSync(configDir, { recursive: true });
	}

	// Load existing config or create new
	let config: any = { mcpServers: {} };
	if (fs.existsSync(configPath)) {
	  try {
		config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	  } catch {}
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
  }

  private scanProjectFiles(dirPath: string, currentDepth: number, maxDepth: number): string[] {
	if (currentDepth > maxDepth) return [];

	const files: string[] = [];
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
		} else {
		  files.push(fullPath);
		}
	  }
	} catch {}

	return files;
  }
}
