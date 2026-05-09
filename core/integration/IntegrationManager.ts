/**
 * IntegrationManager.ts
 * Central registry and dispatcher for all external tool/service integrations.
 * Loads registry.json, instantiates adapters, and provides unified access.
 */

import * as fs from 'fs';
import * as path from 'path';
import { IIntegration, IntegrationConfig, IntegrationStatus, IntegrationStatusReport, IntegrationAction, IntegrationActionResult, IntegrationEvent } from './IIntegration';

export class IntegrationManager {
  private static instance: IntegrationManager;
  private integrations: Map<string, IIntegration> = new Map();
  private registry: any;
  private registryPath: string;
  private initialized = false;
  private eventListeners: Array<(event: IntegrationEvent) => void> = [];

  private constructor() {
	// Singleton pattern
	this.registryPath = path.join(process.cwd(), 'backend', 'integrations', 'registry.json');
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): IntegrationManager {
	if (!IntegrationManager.instance) {
	  IntegrationManager.instance = new IntegrationManager();
	}
	return IntegrationManager.instance;
  }

  /**
   * Initialize the integration manager.
   * Loads registry and instantiates all adapters.
   */
  async initialize(): Promise<void> {
	if (this.initialized) {
	  console.log('[IntegrationManager] Already initialized');
	  return;
	}

	console.log('[IntegrationManager] Initializing...');

	try {
	  // Load registry
	  this.registry = this.loadRegistry();
	  console.log(`[IntegrationManager] Loaded ${this.registry.integrations.length} integrations from registry`);

	  // Instantiate adapters for each integration
	  for (const config of this.registry.integrations) {
		try {
		  const adapter = await this.createAdapter(config);
		  if (adapter) {
			this.integrations.set(config.id, adapter);
			await adapter.initialize();
			this.emitEvent({
			  type: 'integration:initialized',
			  integrationId: config.id,
			  timestamp: new Date(),
			});
			console.log(`[IntegrationManager] ✓ Initialized: ${config.id}`);
		  }
		} catch (error) {
		  console.error(`[IntegrationManager] ✗ Failed to initialize ${config.id}:`, error);
		  this.emitEvent({
			type: 'integration:error',
			integrationId: config.id,
			timestamp: new Date(),
			error: String(error),
		  });
		}
	  }

	  this.initialized = true;
	  console.log(`[IntegrationManager] Ready with ${this.integrations.size} active integrations`);
	} catch (error) {
	  console.error('[IntegrationManager] Initialization failed:', error);
	  throw error;
	}
  }

  /**
   * Get a specific integration by ID.
   */
  getIntegration(id: string): IIntegration | undefined {
	return this.integrations.get(id);
  }

  /**
   * Get all registered integration IDs.
   */
  listIntegrations(): string[] {
	return Array.from(this.integrations.keys());
  }

  /**
   * Get all integrations with their status.
   */
  async getAllIntegrations(): Promise<Array<{ id: string; name: string; status: IntegrationStatusReport }>> {
	const results: Array<{ id: string; name: string; status: IntegrationStatusReport }> = [];
	for (const [id, integration] of this.integrations) {
	  const status = await integration.getStatus();
	  results.push({ id, name: integration.name, status });
	}
	return results;
  }

  /**
   * Get only available (installed/ready) integrations.
   */
  async getAvailableIntegrations(): Promise<Array<{ id: string; name: string; type: string }>> {
	const all = await this.getAllIntegrations();
	return all
	  .filter(i => i.status.installed && i.status.status !== IntegrationStatus.ERROR)
	  .map(i => ({ id: i.id, name: i.name, type: this.integrations.get(i.id)?.type || 'unknown' }));
  }

  /**
   * Execute an action on a specific integration.
   */
  async executeAction(integrationId: string, action: string, params?: Record<string, any>): Promise<IntegrationActionResult> {
	const integration = this.integrations.get(integrationId);
	if (!integration) {
	  return {
		success: false,
		error: `Integration '${integrationId}' not found`,
	  };
	}

	console.log(`[IntegrationManager] Executing ${integrationId}.${action}`);

	try {
	  const startTime = Date.now();
	  const result = await integration.execute({ action, params });
	  const executionTime = Date.now() - startTime;

	  this.emitEvent({
		type: 'integration:action',
		integrationId,
		timestamp: new Date(),
		data: { action, params, success: result.success, executionTime },
	  });

	  return { ...result, executionTime };
	} catch (error) {
	  console.error(`[IntegrationManager] Action failed for ${integrationId}.${action}:`, error);
	  this.emitEvent({
		type: 'integration:error',
		integrationId,
		timestamp: new Date(),
		error: String(error),
	  });
	  return {
		success: false,
		error: String(error),
	  };
	}
  }

  /**
   * Get status of a specific integration.
   */
  async getIntegrationStatus(id: string): Promise<IntegrationStatusReport | null> {
	const integration = this.integrations.get(id);
	if (!integration) return null;
	return integration.getStatus();
  }

  /**
   * Reload a specific integration (shutdown and re-initialize).
   */
  async reloadIntegration(id: string): Promise<void> {
	const integration = this.integrations.get(id);
	if (!integration) {
	  throw new Error(`Integration '${id}' not found`);
	}

	console.log(`[IntegrationManager] Reloading ${id}...`);
	await integration.shutdown();
	await integration.initialize();
	console.log(`[IntegrationManager] ✓ Reloaded ${id}`);
  }

  /**
   * Shutdown all integrations.
   */
  async shutdown(): Promise<void> {
	console.log('[IntegrationManager] Shutting down all integrations...');
	for (const [id, integration] of this.integrations) {
	  try {
		await integration.shutdown();
		this.emitEvent({
		  type: 'integration:shutdown',
		  integrationId: id,
		  timestamp: new Date(),
		});
	  } catch (error) {
		console.error(`[IntegrationManager] Error shutting down ${id}:`, error);
	  }
	}
	this.integrations.clear();
	this.initialized = false;
	console.log('[IntegrationManager] Shutdown complete');
  }

  /**
   * Subscribe to integration events.
   */
  on(listener: (event: IntegrationEvent) => void): void {
	this.eventListeners.push(listener);
  }

  /**
   * Unsubscribe from integration events.
   */
  off(listener: (event: IntegrationEvent) => void): void {
	this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  /**
   * Get raw registry data.
   */
  getRegistry(): any {
	return this.registry;
  }

  // ----------------------------
  // Private Methods
  // ----------------------------

  private loadRegistry(): any {
	if (!fs.existsSync(this.registryPath)) {
	  throw new Error(`Registry not found at ${this.registryPath}`);
	}
	const raw = fs.readFileSync(this.registryPath, 'utf-8');
	return JSON.parse(raw);
  }

  private async createAdapter(config: IntegrationConfig): Promise<IIntegration | null> {
	// Dynamic adapter loading based on integration ID
	// We'll create adapters for high-priority integrations first
	// Others fall back to GenericCommandIntegration

	try {
	  switch (config.id) {
		case 'unity':
		  const { UnityIntegration } = await import('../../integrations/engines/UnityIntegration');
		  return new UnityIntegration(config);
		case 'unreal':
		  const { UnrealIntegration } = await import('../../integrations/engines/UnrealIntegration');
		  return new UnrealIntegration(config);
		case 'godot':
		  const { GodotIntegration } = await import('../../integrations/engines/GodotIntegration');
		  return new GodotIntegration(config);
		case 'blender':
		  const { BlenderIntegration } = await import('../../integrations/tools/BlenderIntegration');
		  return new BlenderIntegration(config);
		case 'claude-code':
		case 'cursor':
		case 'windsurf':
		  const { ClaudeCodeIntegration } = await import('../../integrations/ai/ClaudeCodeIntegration');
		  return new ClaudeCodeIntegration(config);
		case 'github':
		  const { GitHubIntegration } = await import('../../integrations/apis/GitHubIntegration');
		  return new GitHubIntegration(config);
		default:
		  // Fallback to generic command integration for everything else
		  const { GenericCommandIntegration } = await import('../../integrations/GenericCommandIntegration');
		  return new GenericCommandIntegration(config);
	  }
	} catch (error) {
	  console.error(`[IntegrationManager] Failed to load adapter for ${config.id}:`, error);
	  // Fall back to generic if adapter not found
	  try {
		const { GenericCommandIntegration } = await import('../../integrations/GenericCommandIntegration');
		return new GenericCommandIntegration(config);
	  } catch {
		return null;
	  }
	}
  }

  private emitEvent(event: IntegrationEvent): void {
	for (const listener of this.eventListeners) {
	  try {
		listener(event);
	  } catch (error) {
		console.error('[IntegrationManager] Event listener error:', error);
	  }
	}
  }
}

// Export singleton instance accessor
export const getIntegrationManager = () => IntegrationManager.getInstance();
