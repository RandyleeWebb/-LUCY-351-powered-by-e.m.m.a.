/**
 * GenericCommandIntegration.ts
 * Fallback adapter for any tool/application that can be launched via command line.
 * Used when no specialized adapter exists for an integration.
 */

import { BaseIntegration, IntegrationAction, IntegrationActionResult, IntegrationStatus, IntegrationConfig } from '../core/integration/IIntegration';
import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as glob from 'glob';

const execAsync = promisify(exec);

export class GenericCommandIntegration extends BaseIntegration {
  private runningProcesses: Map<string, ChildProcess> = new Map();

  constructor(config: IntegrationConfig) {
	super(config);
  }

  async initialize(): Promise<void> {
	console.log(`[GenericCommandIntegration] Initializing ${this.name}...`);
	this.status = IntegrationStatus.INITIALIZING;

	try {
	  // Try to find the executable
	  this.executablePath = this.findExecutable();

	  if (this.executablePath && fs.existsSync(this.executablePath)) {
		this.status = IntegrationStatus.AVAILABLE;
		this.version = 'unknown'; // Generic tools may not have detectable versions
		console.log(`[GenericCommandIntegration] ✓ Found ${this.name} at ${this.executablePath}`);
	  } else if (this.config.api?.available) {
		// API-only integration (no executable needed)
		this.status = IntegrationStatus.AVAILABLE;
		console.log(`[GenericCommandIntegration] ✓ ${this.name} configured as API-only integration`);
	  } else {
		this.status = IntegrationStatus.NOT_INSTALLED;
		console.log(`[GenericCommandIntegration] ${this.name} not found on system`);
	  }

	  this.lastStatusCheck = new Date();
	} catch (error) {
	  this.status = IntegrationStatus.ERROR;
	  console.error(`[GenericCommandIntegration] Initialization error:`, error);
	}
  }

  async execute(action: IntegrationAction): Promise<IntegrationActionResult> {
	const startTime = Date.now();

	try {
	  switch (action.action) {
		case 'launch':
		  return await this.launch(action.params);
		case 'run-command':
		  return await this.runCommand(action.params?.command, action.params?.args);
		case 'start-process':
		  return await this.startProcess(action.params?.command, action.params?.args, action.params?.processId);
		case 'stop-process':
		  return await this.stopProcess(action.params?.processId);
		case 'check-status':
		  return await this.checkStatus();
		case 'api-call':
		  return await this.makeAPICall(action.params);
		default:
		  return this.createError(`Unknown action: ${action.action}`, Date.now() - startTime);
	  }
	} catch (error) {
	  return this.createError(String(error), Date.now() - startTime);
	}
  }

  async getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>> {
	const actions = [
	  { name: 'check-status', description: 'Check if integration is available', params: [] },
	];

	if (this.executablePath) {
	  actions.push(
		{ name: 'launch', description: `Launch ${this.name}`, params: ['args'] },
		{ name: 'run-command', description: 'Run a command and wait for completion', params: ['command', 'args'] },
		{ name: 'start-process', description: 'Start a background process', params: ['command', 'args', 'processId'] },
		{ name: 'stop-process', description: 'Stop a background process', params: ['processId'] }
	  );
	}

	if (this.config.api?.available) {
	  actions.push(
		{ name: 'api-call', description: `Make API call to ${this.name}`, params: ['method', 'endpoint', 'body'] }
	  );
	}

	return actions;
  }

  async shutdown(): Promise<void> {
	console.log(`[GenericCommandIntegration] Shutting down ${this.name}...`);

	// Stop all running processes
	for (const [processId, process] of this.runningProcesses) {
	  try {
		process.kill();
		console.log(`[GenericCommandIntegration] Stopped process: ${processId}`);
	  } catch (error) {
		console.error(`[GenericCommandIntegration] Failed to stop process ${processId}:`, error);
	  }
	}
	this.runningProcesses.clear();

	this.status = IntegrationStatus.STOPPED;
  }

  // ----------------------------
  // Generic Actions
  // ----------------------------

  private async launch(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (!this.executablePath) {
	  return this.createError(`${this.name} not available on this system`);
	}

	const args = params?.args || [];
	const command = Array.isArray(args)
	  ? `"${this.executablePath}" ${args.join(' ')}`
	  : `"${this.executablePath}" ${args}`;

	console.log(`[GenericCommandIntegration] Launching ${this.name}: ${command}`);

	try {
	  // Launch as background process
	  exec(command);
	  this.status = IntegrationStatus.RUNNING;

	  return this.createSuccess({
		launched: true,
		executable: this.executablePath,
		args,
	  }, `${this.name} launched`);
	} catch (error) {
	  return this.createError(`Failed to launch ${this.name}: ${error}`);
	}
  }

  private async runCommand(command?: string, args?: string[]): Promise<IntegrationActionResult> {
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
	  const { stdout, stderr } = await execAsync(fullCommand, { timeout: 30000 });

	  return this.createSuccess({
		stdout,
		stderr,
		command: fullCommand,
	  }, 'Command executed successfully');
	} catch (error: any) {
	  return this.createError(`Command failed: ${error.message}`);
	}
  }

  private async startProcess(command?: string, args?: string[], processId?: string): Promise<IntegrationActionResult> {
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

	console.log(`[GenericCommandIntegration] Starting process ${id}: ${command} ${args?.join(' ') || ''}`);

	try {
	  const process = spawn(command, args || [], {
		stdio: ['ignore', 'pipe', 'pipe'],
		detached: true,
	  });

	  process.stdout?.on('data', (data) => {
		console.log(`[${id}] ${data.toString()}`);
	  });

	  process.stderr?.on('data', (data) => {
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
	} catch (error) {
	  return this.createError(`Failed to start process: ${error}`);
	}
  }

  private async stopProcess(processId?: string): Promise<IntegrationActionResult> {
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
	} catch (error) {
	  return this.createError(`Failed to stop process: ${error}`);
	}
  }

  private async checkStatus(): Promise<IntegrationActionResult> {
	const status = await this.getStatus();

	return this.createSuccess({
	  ...status,
	  runningProcesses: Array.from(this.runningProcesses.keys()),
	}, `Status: ${status.status}`);
  }

  private async makeAPICall(params?: Record<string, any>): Promise<IntegrationActionResult> {
	if (!this.config.api?.available) {
	  return this.createError('API not configured for this integration');
	}

	const method = params?.method || 'GET';
	const endpoint = params?.endpoint;
	const body = params?.body;

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
  }

  // ----------------------------
  // Helper Methods
  // ----------------------------

  private findExecutable(): string | undefined {
	// Try to resolve executable path from config
	const resolved = this.resolveExecutablePath();
	if (resolved) {
	  // Handle wildcards in path
	  if (resolved.includes('*')) {
		const matches = glob.sync(resolved);
		if (matches.length > 0) {
		  return matches.sort().pop(); // Return latest version
		}
	  } else if (fs.existsSync(resolved)) {
		return resolved;
	  }
	}

	// Try PATH
	try {
	  const platform = process.platform;
	  const cmd = platform === 'win32' ? 'where' : 'which';
	  const commandName = this.config.executable?.default || this.id;

	  const { stdout } = require('child_process').execSync(`${cmd} ${commandName}`, {
		encoding: 'utf-8',
		stdio: ['ignore', 'pipe', 'ignore'],
		timeout: 2000,
	  });

	  const path = stdout.trim().split('\n')[0];
	  if (path) return path;
	} catch {}

	return undefined;
  }
}
