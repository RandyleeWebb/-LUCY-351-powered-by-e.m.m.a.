/**
 * IIntegration.ts
 * Common interface for all external tool/service integrations in Lucy Sovereign 351.
 * Provides lifecycle management, status detection, and action execution.
 */

export enum IntegrationStatus {
  UNKNOWN = 'unknown',
  AVAILABLE = 'available',       // Installed and ready
  NOT_INSTALLED = 'not_installed', // Not found on system
  OFFLINE = 'offline',            // Network service unavailable
  ERROR = 'error',                // Configuration or runtime error
  INITIALIZING = 'initializing',  // Currently starting up
  RUNNING = 'running',            // Active process/connection
  STOPPED = 'stopped'             // Was running, now stopped
}

export enum IntegrationType {
  GAME_ENGINE = 'game-engine',
  AI_ASSISTANT = 'ai-assistant',
  THREE_D_MODELING = '3d-modeling',
  API = 'api',
  COMMUNICATION = 'communication',
  CLOUD = 'cloud',
  SYSTEM_UTILITY = 'system-utility',
  CUSTOM = 'custom'
}

export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  category: string;
  url: string;
  description: string;
  executable?: {
	windows?: string;
	linux?: string;
	darwin?: string;
	default?: string;
  };
  mcp?: {
	available: boolean;
	serverCommand?: string;
	configExample?: any;
  };
  api?: {
	available: boolean;
	type?: 'rest' | 'graphql' | 'grpc' | 'websocket' | 'command' | 'python' | 'node';
	endpoint?: string;
	requiresAuth?: boolean;
	authType?: 'api-key' | 'oauth' | 'token' | 'bot-token' | 'none';
	docs?: string;
  };
  features?: string[];
  priority?: 'high' | 'medium' | 'low';
  notes?: string;
  env?: Record<string, string>;
}

export interface IntegrationStatusReport {
  id: string;
  status: IntegrationStatus;
  installed: boolean;
  executable?: string;
  version?: string;
  error?: string;
  lastChecked: Date;
  details?: Record<string, any>;
}

export interface IntegrationAction {
  action: string;
  params?: Record<string, any>;
  timeout?: number;
}

export interface IntegrationActionResult {
  success: boolean;
  data?: any;
  error?: string;
  output?: string;
  executionTime?: number;
}

/**
 * Base interface for all Lucy integrations.
 * Adapters implement this to provide unified access to external tools.
 */
export interface IIntegration {
  /** Unique identifier matching registry */
  readonly id: string;

  /** Human-readable name */
  readonly name: string;

  /** Integration type classification */
  readonly type: IntegrationType;

  /** Configuration from registry */
  readonly config: IntegrationConfig;

  /**
   * Initialize the integration.
   * Called once during IntegrationManager startup.
   * Should validate config, check installation status, and prepare for use.
   * @returns Promise resolving when ready
   */
  initialize(): Promise<void>;

  /**
   * Get current status of the integration.
   * Used by dashboard and health checks.
   * @returns Status report with installation/availability info
   */
  getStatus(): Promise<IntegrationStatusReport>;

  /**
   * Execute an action on this integration.
   * Actions are integration-specific (e.g., "launch", "createScene", "apiCall").
   * @param action - Action to execute
   * @returns Result of the action
   */
  execute(action: IntegrationAction): Promise<IntegrationActionResult>;

  /**
   * Shutdown the integration gracefully.
   * Called during system shutdown or integration reload.
   * Should clean up resources, close connections, terminate processes.
   * @returns Promise resolving when shutdown complete
   */
  shutdown(): Promise<void>;

  /**
   * Get list of available actions for this integration.
   * Used by UI to show available commands.
   * @returns Array of action names with descriptions
   */
  getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>>;
}

/**
 * Base abstract class providing common integration functionality.
 * Concrete adapters can extend this for shared behavior.
 */
export abstract class BaseIntegration implements IIntegration {
  readonly id: string;
  readonly name: string;
  readonly type: IntegrationType;
  readonly config: IntegrationConfig;

  protected status: IntegrationStatus = IntegrationStatus.UNKNOWN;
  protected lastStatusCheck?: Date;
  protected executablePath?: string;
  protected version?: string;

  constructor(config: IntegrationConfig) {
	this.id = config.id;
	this.name = config.name;
	this.type = config.type as IntegrationType;
	this.config = config;
  }

  abstract initialize(): Promise<void>;
  abstract execute(action: IntegrationAction): Promise<IntegrationActionResult>;
  abstract getAvailableActions(): Promise<Array<{ name: string; description: string; params?: string[] }>>;

  async getStatus(): Promise<IntegrationStatusReport> {
	return {
	  id: this.id,
	  status: this.status,
	  installed: this.status === IntegrationStatus.AVAILABLE || this.status === IntegrationStatus.RUNNING,
	  executable: this.executablePath,
	  version: this.version,
	  lastChecked: this.lastStatusCheck || new Date(),
	};
  }

  async shutdown(): Promise<void> {
	// Default: no-op, override if cleanup needed
	this.status = IntegrationStatus.STOPPED;
  }

  /**
   * Helper: resolve executable path from config based on platform.
   */
  protected resolveExecutablePath(): string | undefined {
	if (!this.config.executable) return undefined;

	const platform = process.platform;
	if (platform === 'win32' && this.config.executable.windows) {
	  return this.config.executable.windows;
	} else if (platform === 'linux' && this.config.executable.linux) {
	  return this.config.executable.linux;
	} else if (platform === 'darwin' && this.config.executable.darwin) {
	  return this.config.executable.darwin;
	}
	return this.config.executable.default;
  }

  /**
   * Helper: create standard success result.
   */
  protected createSuccess(data?: any, output?: string, executionTime?: number): IntegrationActionResult {
	return { success: true, data, output, executionTime };
  }

  /**
   * Helper: create standard error result.
   */
  protected createError(error: string, executionTime?: number): IntegrationActionResult {
	return { success: false, error, executionTime };
  }
}

/**
 * Integration lifecycle events for event bus.
 */
export interface IntegrationEvent {
  type: 'integration:initialized' | 'integration:launched' | 'integration:action' | 'integration:error' | 'integration:shutdown';
  integrationId: string;
  timestamp: Date;
  data?: any;
  error?: string;
}
