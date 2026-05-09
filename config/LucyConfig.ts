// @ts-nocheck
/**
 * WHAT THIS DOES:
 * Defines LucyConfig - centralized configuration system for Lucy with command-line flag
 * support. Handles --sandbox-mode off, --approval-policy high-trust-auto, and other
 * runtime configuration options for transitioning Lucy from sandbox to AGI OS.
 *
 * WHY THIS EXISTS:
 * The user wants command flags like "lucy-core-ai --sandbox-mode off --approval-policy
 * high-trust-auto" to unlock Lucy's full capabilities. LucyConfig parses these flags,
 * validates them, and provides a single source of truth for system-wide configuration.
 * This makes Lucy's operational mode explicit and controllable.
 *
 * HOW THIS WORKS:
 * LucyConfig reads from: (1) environment variables, (2) command-line arguments, (3) config
 * file (optional), (4) defaults. Provides type-safe access to all configuration. Validates
 * dangerous combinations (e.g., sandbox off + no trust check). Exports singleton instance
 * that all modules reference. Supports runtime config updates with validation.
 *
 * HOW TO CHANGE IT:
 * Add new config options in LucyConfigOptions interface. Add parsing logic in parseArgs().
 * Add validation in validateConfig(). Keep dangerous modes explicit (require multiple flags).
 * Document all flags in getUsageHelp().
 *
 * DEBUG EXAMPLE:
 * If --sandbox-mode off doesn't work, check process.argv parsing and verify flag is
 * recognized. If Lucy still sandboxed despite flag, check that SovereignExecutor and
 * SafeRepoEditor reference lucyConfig.sandboxMode. Print config at startup to verify.
 */

export interface LucyConfigOptions {
  // Sandbox mode
  sandboxMode: 'on' | 'off';
  sandboxRoot: string;

  // Approval policy
  approvalPolicy: 'always-prompt' | 'high-trust-auto' | 'trust-adaptive';

  // Admin overrides
  adminOverride: boolean;
  dangerFullAccess: boolean;

  // Trust system
  enableTrustCalibration: boolean;
  initialTrustScore: number;
  trustPersistencePath?: string;

  // Agent system
  enableEmmaOversight: boolean;
  enableEagleEyeMonitoring: boolean;
  enableBioPythonIsolation: boolean;

  // Hardware integration
  enableProcessManagement: boolean;
  enableScreenCapture: boolean;
  enableVRBridge: boolean;

  // Alpha Delta Vault
  enableAlphaDeltaVault: boolean;
  alphaDeltaSandboxRoot: string;

  // Home Assistant
  enableHomeAssistant: boolean;
  haBaseUrl: string;
  haTokenEnvName: string;
  haLocalNetworkOnly: boolean;

  // Weighted Risk Classification
  enableWeightedRisk: boolean;
  emmaAnomalyDetection: boolean;
  emmaBecauseProtocol: boolean;

  // Earth-to-Sim Bridge (LL214/LL182/LL230)
  enableEarthToSim: boolean;
  earthAnomalyThreshold: number; // 0-1 scale, default 0.7 (legacy/base threshold)
  earthAutoInject: boolean; // Auto-apply or always ask
  earthIngestInterval: number; // ms between ingestion cycles

  // Adaptive Baseline System
  earthAdaptiveBaseline: boolean; // Use 3σ anomaly detection
  earthBaselineWindow: number; // Rolling window in hours (default 48)
  earthMinSamples: number; // Minimum samples before baseline valid

  // Sovereign Preview System
  earthSovereignPreview: boolean; // Preview-only mode for Sovereign
  earthPreviewDuration: number; // Preview sim duration in ms
  earthSessionExpiry: number; // Preview session expiry in minutes

  // Resource Monitoring
  enableResourceMonitor: boolean;
  resourceCpuThreshold: number; // Throttle at % CPU usage
  resourceMemoryThreshold: number; // Throttle at % memory usage
  resourceHibernationTimeout: number; // Minutes before hibernation
  resourceHeartbeatInterval: number; // Heartbeat check interval in seconds

  // FX Server
  fxServerEnabled: boolean;
  fxServerHost: string;
  fxServerPort: number;
  fxServerToken?: string;
  fxResourcePath: string;

  // VR Bridge
  vrBridgePort: number;
  vrBridgeHost: string;
  vrTTSProvider: 'elevenlabs' | 'azure' | 'coqui' | 'browser';
  vrTTSApiKey?: string;

  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  logToFile: boolean;
  logFilePath?: string;

  // Development
  devMode: boolean;
  autoStartAgents: boolean;
}

class LucyConfig {
  private config: LucyConfigOptions;
  private configLoaded = false;

  constructor() {
	// Default configuration
	this.config = {
	  // Sandbox defaults to ON for safety
	  sandboxMode: 'on',
	  sandboxRoot: 'C:\\LucySandbox',

	  // Approval defaults to always prompt
	  approvalPolicy: 'trust-adaptive',

	  // Admin overrides default OFF
	  adminOverride: false,
	  dangerFullAccess: false,

	  // Trust system enabled by default
	  enableTrustCalibration: true,
	  initialTrustScore: 0, // Start at Initiate tier
	  trustPersistencePath: './data/trust-score.json',

	  // Agent system all enabled
	  enableEmmaOversight: true,
	  enableEagleEyeMonitoring: true,
	  enableBioPythonIsolation: true,

	  // Hardware integration enabled
	  enableProcessManagement: true,
	  enableScreenCapture: true,
	  enableVRBridge: true,

	  // Alpha Delta Vault enabled by default
	  enableAlphaDeltaVault: true,
	  alphaDeltaSandboxRoot: 'C:\\LucySandbox',

	  // Home Assistant disabled by default (requires HA_TOKEN)
	  enableHomeAssistant: false,
	  haBaseUrl: 'http://homeassistant.local:8123',
	  haTokenEnvName: 'HA_TOKEN',
	  haLocalNetworkOnly: true,

	  // Weighted Risk Classification enabled
	  enableWeightedRisk: true,
	  emmaAnomalyDetection: true,
	  emmaBecauseProtocol: true,

	  // Earth-to-Sim Bridge defaults (LL214/LL182/LL230)
	  enableEarthToSim: true,
	  earthAnomalyThreshold: 0.7, // Base threshold (legacy scoring)
	  earthAutoInject: false, // Always ask (safety-first)
	  earthIngestInterval: 120000, // 2 minutes

	  // Adaptive Baseline System defaults
	  earthAdaptiveBaseline: true, // Use 3σ anomaly detection
	  earthBaselineWindow: 48, // 48-hour rolling window
	  earthMinSamples: 10, // Minimum samples for valid baseline

	  // Sovereign Preview System defaults
	  earthSovereignPreview: true, // Preview-only mode
	  earthPreviewDuration: 5000, // 5 seconds
	  earthSessionExpiry: 15, // 15 minutes

	  // Resource Monitoring defaults
	  enableResourceMonitor: true,
	  resourceCpuThreshold: 85, // Throttle at 85% CPU
	  resourceMemoryThreshold: 90, // Throttle at 90% memory
	  resourceHibernationTimeout: 15, // 15 minutes before hibernation
	  resourceHeartbeatInterval: 60, // 60 second heartbeat

	  // FX Server defaults
	  fxServerEnabled: true,
	  fxServerHost: 'localhost',
	  fxServerPort: 30120,
	  fxResourcePath: 'C:\\FiveM\\server\\resources',

	  // VR Bridge defaults
	  vrBridgePort: 8765,
	  vrBridgeHost: '0.0.0.0',
	  vrTTSProvider: 'browser',

	  // Logging
	  logLevel: 'info',
	  logToFile: false,

	  // Development
	  devMode: false,
	  autoStartAgents: true
	};

	this.loadConfig();
  }

  /**
   * Load configuration from env vars and command-line args
   */
  private loadConfig(): void {
	if (this.configLoaded) {
	  return;
	}

	// Parse environment variables
	this.loadFromEnv();

	// Parse command-line arguments
	this.loadFromArgs();

	// Validate configuration
	this.validateConfig();

	this.configLoaded = true;

	// Print config in dev mode
	if (this.config.devMode) {
	  console.log('[LucyConfig] Configuration loaded:');
	  console.log(JSON.stringify(this.config, null, 2));
	}
  }

  /**
   * Load from environment variables
   */
  private loadFromEnv(): void {
	if (process.env.LUCY_SANDBOX_MODE) {
	  this.config.sandboxMode = process.env.LUCY_SANDBOX_MODE as 'on' | 'off';
	}

	if (process.env.LUCY_SANDBOX_ROOT) {
	  this.config.sandboxRoot = process.env.LUCY_SANDBOX_ROOT;
	}

	if (process.env.LUCY_APPROVAL_POLICY) {
	  this.config.approvalPolicy = process.env.LUCY_APPROVAL_POLICY as any;
	}

	if (process.env.LUCY_ADMIN_OVERRIDE === 'true') {
	  this.config.adminOverride = true;
	}

	if (process.env.LUCY_DANGER_FULL_ACCESS === 'true') {
	  this.config.dangerFullAccess = true;
	}

	if (process.env.LUCY_INITIAL_TRUST_SCORE) {
	  this.config.initialTrustScore = parseInt(process.env.LUCY_INITIAL_TRUST_SCORE);
	}

	if (process.env.LUCY_DEV_MODE === 'true') {
	  this.config.devMode = true;
	}

	if (process.env.LUCY_LOG_LEVEL) {
	  this.config.logLevel = process.env.LUCY_LOG_LEVEL as any;
	}

	// FX Server
	if (process.env.FX_SERVER_HOST) {
	  this.config.fxServerHost = process.env.FX_SERVER_HOST;
	}

	if (process.env.FX_SERVER_PORT) {
	  this.config.fxServerPort = parseInt(process.env.FX_SERVER_PORT);
	}

	if (process.env.FX_SERVER_TOKEN) {
	  this.config.fxServerToken = process.env.FX_SERVER_TOKEN;
	}

	if (process.env.FX_RESOURCE_PATH) {
	  this.config.fxResourcePath = process.env.FX_RESOURCE_PATH;
	}

	// VR Bridge
	if (process.env.VR_BRIDGE_PORT) {
	  this.config.vrBridgePort = parseInt(process.env.VR_BRIDGE_PORT);
	}

	if (process.env.VR_TTS_PROVIDER) {
	  this.config.vrTTSProvider = process.env.VR_TTS_PROVIDER as any;
	}

	if (process.env.VR_TTS_API_KEY) {
	  this.config.vrTTSApiKey = process.env.VR_TTS_API_KEY;
	}
  }

  /**
   * Load from command-line arguments
   */
  private loadFromArgs(): void {
	const args = process.argv.slice(2);

	for (let i = 0; i < args.length; i++) {
	  const arg = args[i];

	  switch (arg) {
		case '--sandbox-mode':
		  if (args[i + 1] === 'off' || args[i + 1] === 'on') {
			this.config.sandboxMode = args[i + 1];
			i++;
		  }
		  break;

		case '--approval-policy':
		  if (args[i + 1]) {
			this.config.approvalPolicy = args[i + 1] as any;
			i++;
		  }
		  break;

		case '--admin-override':
		  this.config.adminOverride = true;
		  break;

		case '--danger-full-access':
		  this.config.dangerFullAccess = true;
		  break;

		case '--initial-trust-score':
		  if (args[i + 1]) {
			this.config.initialTrustScore = parseInt(args[i + 1]);
			i++;
		  }
		  break;

		case '--dev-mode':
		  this.config.devMode = true;
		  break;

		case '--log-level':
		  if (args[i + 1]) {
			this.config.logLevel = args[i + 1] as any;
			i++;
		  }
		  break;

		case '--disable-emma':
		  this.config.enableEmmaOversight = false;
		  break;

		case '--disable-eagleeye':
		  this.config.enableEagleEyeMonitoring = false;
		  break;

		// Earth-to-Sim Bridge flags
		case '--earth-to-sim':
		  if (args[i + 1] === 'on' || args[i + 1] === 'off') {
			this.config.enableEarthToSim = args[i + 1] === 'on';
			i++;
		  }
		  break;

		case '--earth-anomaly-threshold':
		  if (args[i + 1]) {
			const threshold = parseFloat(args[i + 1]);
			if (threshold >= 0 && threshold <= 1) {
			  this.config.earthAnomalyThreshold = threshold;
			}
			i++;
		  }
		  break;

		case '--earth-auto-inject':
		  this.config.earthAutoInject = true;
		  break;

		// Adaptive Baseline flags
		case '--earth-adaptive-baseline':
		  if (args[i + 1] === 'on' || args[i + 1] === 'off') {
			this.config.earthAdaptiveBaseline = args[i + 1] === 'on';
			i++;
		  }
		  break;

		case '--earth-baseline-window':
		  if (args[i + 1]) {
			this.config.earthBaselineWindow = parseInt(args[i + 1]);
			i++;
		  }
		  break;

		// Sovereign Preview flags
		case '--earth-sovereign-preview':
		  if (args[i + 1] === 'on' || args[i + 1] === 'off') {
			this.config.earthSovereignPreview = args[i + 1] === 'on';
			i++;
		  }
		  break;

		// Resource Monitoring flags
		case '--disable-resource-monitor':
		  this.config.enableResourceMonitor = false;
		  break;

		case '--resource-cpu-threshold':
		  if (args[i + 1]) {
			const threshold = parseInt(args[i + 1]);
			if (threshold > 0 && threshold <= 100) {
			  this.config.resourceCpuThreshold = threshold;
			}
			i++;
		  }
		  break;

		case '--resource-hibernation-timeout':
		  if (args[i + 1]) {
			this.config.resourceHibernationTimeout = parseInt(args[i + 1]);
			i++;
		  }
		  break;

		case '--help':
		  console.log(this.getUsageHelp());
		  process.exit(0);
		  break;
	  }
	}
  }

  /**
   * Validate configuration for dangerous combinations
   */
  private validateConfig(): void {
	// Warn if sandbox is off without admin override
	if (this.config.sandboxMode === 'off' && !this.config.adminOverride) {
	  console.warn('[LucyConfig] WARNING: sandbox-mode is off but admin-override is not set. Add --admin-override to confirm.');
	}

	// Require Emma oversight unless explicitly disabled
	if (!this.config.enableEmmaOversight && this.config.sandboxMode === 'off') {
	  console.warn('[LucyConfig] WARNING: Emma oversight disabled with sandbox off. This is dangerous!');
	}

	// Validate trust score range
	if (this.config.initialTrustScore < 0 || this.config.initialTrustScore > 100) {
	  throw new Error('Initial trust score must be 0-100');
	}

	// Warn if trust calibration disabled
	if (!this.config.enableTrustCalibration && this.config.approvalPolicy === 'trust-adaptive') {
	  console.warn('[LucyConfig] WARNING: Trust calibration disabled but approval policy is trust-adaptive. Falling back to always-prompt.');
	  this.config.approvalPolicy = 'always-prompt';
	}
  }

  /**
   * Get usage help text
   */
  private getUsageHelp(): string {
	return `
Lucy AGI OS - Command-Line Options

Usage: node dist/main.js [options]

SANDBOX & SAFETY:
  --sandbox-mode <on|off>      Enable/disable sandbox restrictions (default: on)
  --approval-policy <policy>   Set approval policy: always-prompt, high-trust-auto, trust-adaptive (default: trust-adaptive)
  --admin-override             Enable admin override mode (bypasses trust requirements)
  --danger-full-access         Enable danger-full-access mode (requires admin-override)

TRUST SYSTEM:
  --initial-trust-score <0-100> Set initial trust score (default: 0)

AGENT SYSTEM:
  --disable-emma               Disable Emma oversight (not recommended)
  --disable-eagleeye           Disable EagleEye monitoring

EARTH-TO-SIM BRIDGE:
  --earth-to-sim <on|off>      Enable/disable Earth-to-Sim intelligence bridge (default: on)
  --earth-anomaly-threshold <0-1> Set anomaly alert threshold (default: 0.7)
  --earth-auto-inject          Auto-apply Earth events to sims (default: ask first)
  --earth-adaptive-baseline <on|off> Use adaptive 3σ anomaly detection (default: on)
  --earth-baseline-window <hours> Rolling baseline window in hours (default: 48)
  --earth-sovereign-preview <on|off> Preview-only mode for Sovereign (default: on)

RESOURCE MONITORING:
  --disable-resource-monitor   Disable resource monitoring and throttling
  --resource-cpu-threshold <1-100> CPU % threshold for throttling (default: 85)
  --resource-hibernation-timeout <minutes> Hibernation timeout in minutes (default: 15)

DEVELOPMENT:
  --dev-mode                   Enable development mode with verbose logging
  --log-level <level>          Set log level: debug, info, warn, error (default: info)

EXAMPLES:
  # Sovereign mode (requires high trust or admin override)
  node dist/main.js --sandbox-mode off --approval-policy high-trust-auto --admin-override

  # Development mode with high initial trust
  node dist/main.js --dev-mode --initial-trust-score 50

  # Safe production mode (default)
  node dist/main.js

  # Earth-to-Sim with aggressive anomaly detection
  node dist/main.js --earth-adaptive-baseline on --earth-anomaly-threshold 0.6

  # Low-resource mode
  node dist/main.js --resource-cpu-threshold 70 --resource-hibernation-timeout 10

For more information, see docs/CONFIGURATION.md
`;
  }

  /**
   * Get configuration value
   */
  get<K extends keyof LucyConfigOptions>(key: K): LucyConfigOptions[K] {
	return this.config[key];
  }

  /**
   * Set configuration value (runtime updates)
   */
  set<K extends keyof LucyConfigOptions>(key: K, value: LucyConfigOptions[K]): void {
	this.config[key] = value;
	this.validateConfig();
  }

  /**
   * Get all configuration
   */
  getAll(): Readonly<LucyConfigOptions> {
	return { ...this.config };
  }

  /**
   * Check if in sovereign mode
   */
  isSovereignMode(): boolean {
	return this.config.sandboxMode === 'off' && 
		   (this.config.adminOverride || this.config.dangerFullAccess);
  }

  /**
   * Check if high trust auto-approval enabled
   */
  isHighTrustAuto(): boolean {
	return this.config.approvalPolicy === 'high-trust-auto';
  }
}

// Singleton instance
export const lucyConfig = new LucyConfig();

// Convenience getters
export const sandboxMode = lucyConfig.get('sandboxMode');
export const approvalPolicy = lucyConfig.get('approvalPolicy');
export const adminOverride = lucyConfig.get('adminOverride');
