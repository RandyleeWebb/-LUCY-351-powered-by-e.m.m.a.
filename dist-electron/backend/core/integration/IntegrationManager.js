"use strict";
/**
 * IntegrationManager.ts
 * Central registry and dispatcher for all external tool/service integrations.
 * Loads registry.json, instantiates adapters, and provides unified access.
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
exports.getIntegrationManager = exports.IntegrationManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const IIntegration_1 = require("./IIntegration");
class IntegrationManager {
    constructor() {
        this.integrations = new Map();
        this.initialized = false;
        this.eventListeners = [];
        // Singleton pattern
        this.registryPath = path.join(process.cwd(), 'backend', 'integrations', 'registry.json');
    }
    /**
     * Get singleton instance.
     */
    static getInstance() {
        if (!IntegrationManager.instance) {
            IntegrationManager.instance = new IntegrationManager();
        }
        return IntegrationManager.instance;
    }
    /**
     * Initialize the integration manager.
     * Loads registry and instantiates all adapters.
     */
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
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
                        const adapter = yield this.createAdapter(config);
                        if (adapter) {
                            this.integrations.set(config.id, adapter);
                            yield adapter.initialize();
                            this.emitEvent({
                                type: 'integration:initialized',
                                integrationId: config.id,
                                timestamp: new Date(),
                            });
                            console.log(`[IntegrationManager] ✓ Initialized: ${config.id}`);
                        }
                    }
                    catch (error) {
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
            }
            catch (error) {
                console.error('[IntegrationManager] Initialization failed:', error);
                throw error;
            }
        });
    }
    /**
     * Get a specific integration by ID.
     */
    getIntegration(id) {
        return this.integrations.get(id);
    }
    /**
     * Get all registered integration IDs.
     */
    listIntegrations() {
        return Array.from(this.integrations.keys());
    }
    /**
     * Get all integrations with their status.
     */
    getAllIntegrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
            for (const [id, integration] of this.integrations) {
                const status = yield integration.getStatus();
                results.push({ id, name: integration.name, status });
            }
            return results;
        });
    }
    /**
     * Get only available (installed/ready) integrations.
     */
    getAvailableIntegrations() {
        return __awaiter(this, void 0, void 0, function* () {
            const all = yield this.getAllIntegrations();
            return all
                .filter(i => i.status.installed && i.status.status !== IIntegration_1.IntegrationStatus.ERROR)
                .map(i => { var _a; return ({ id: i.id, name: i.name, type: ((_a = this.integrations.get(i.id)) === null || _a === void 0 ? void 0 : _a.type) || 'unknown' }); });
        });
    }
    /**
     * Execute an action on a specific integration.
     */
    executeAction(integrationId, action, params) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const result = yield integration.execute({ action, params });
                const executionTime = Date.now() - startTime;
                this.emitEvent({
                    type: 'integration:action',
                    integrationId,
                    timestamp: new Date(),
                    data: { action, params, success: result.success, executionTime },
                });
                return Object.assign(Object.assign({}, result), { executionTime });
            }
            catch (error) {
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
        });
    }
    /**
     * Get status of a specific integration.
     */
    getIntegrationStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const integration = this.integrations.get(id);
            if (!integration)
                return null;
            return integration.getStatus();
        });
    }
    /**
     * Reload a specific integration (shutdown and re-initialize).
     */
    reloadIntegration(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const integration = this.integrations.get(id);
            if (!integration) {
                throw new Error(`Integration '${id}' not found`);
            }
            console.log(`[IntegrationManager] Reloading ${id}...`);
            yield integration.shutdown();
            yield integration.initialize();
            console.log(`[IntegrationManager] ✓ Reloaded ${id}`);
        });
    }
    /**
     * Shutdown all integrations.
     */
    shutdown() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('[IntegrationManager] Shutting down all integrations...');
            for (const [id, integration] of this.integrations) {
                try {
                    yield integration.shutdown();
                    this.emitEvent({
                        type: 'integration:shutdown',
                        integrationId: id,
                        timestamp: new Date(),
                    });
                }
                catch (error) {
                    console.error(`[IntegrationManager] Error shutting down ${id}:`, error);
                }
            }
            this.integrations.clear();
            this.initialized = false;
            console.log('[IntegrationManager] Shutdown complete');
        });
    }
    /**
     * Subscribe to integration events.
     */
    on(listener) {
        this.eventListeners.push(listener);
    }
    /**
     * Unsubscribe from integration events.
     */
    off(listener) {
        this.eventListeners = this.eventListeners.filter(l => l !== listener);
    }
    /**
     * Get raw registry data.
     */
    getRegistry() {
        return this.registry;
    }
    // ----------------------------
    // Private Methods
    // ----------------------------
    loadRegistry() {
        if (!fs.existsSync(this.registryPath)) {
            throw new Error(`Registry not found at ${this.registryPath}`);
        }
        const raw = fs.readFileSync(this.registryPath, 'utf-8');
        return JSON.parse(raw);
    }
    createAdapter(config) {
        return __awaiter(this, void 0, void 0, function* () {
            // Dynamic adapter loading based on integration ID
            // We'll create adapters for high-priority integrations first
            // Others fall back to GenericCommandIntegration
            try {
                switch (config.id) {
                    case 'unity':
                        const { UnityIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/engines/UnityIntegration')));
                        return new UnityIntegration(config);
                    case 'unreal':
                        const { UnrealIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/engines/UnrealIntegration')));
                        return new UnrealIntegration(config);
                    case 'godot':
                        const { GodotIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/engines/GodotIntegration')));
                        return new GodotIntegration(config);
                    case 'blender':
                        const { BlenderIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/tools/BlenderIntegration')));
                        return new BlenderIntegration(config);
                    case 'claude-code':
                    case 'cursor':
                    case 'windsurf':
                        const { ClaudeCodeIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/ai/ClaudeCodeIntegration')));
                        return new ClaudeCodeIntegration(config);
                    case 'github':
                        const { GitHubIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/apis/GitHubIntegration')));
                        return new GitHubIntegration(config);
                    default:
                        // Fallback to generic command integration for everything else
                        const { GenericCommandIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/GenericCommandIntegration')));
                        return new GenericCommandIntegration(config);
                }
            }
            catch (error) {
                console.error(`[IntegrationManager] Failed to load adapter for ${config.id}:`, error);
                // Fall back to generic if adapter not found
                try {
                    const { GenericCommandIntegration } = yield Promise.resolve().then(() => __importStar(require('../../integrations/GenericCommandIntegration')));
                    return new GenericCommandIntegration(config);
                }
                catch (_a) {
                    return null;
                }
            }
        });
    }
    emitEvent(event) {
        for (const listener of this.eventListeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.error('[IntegrationManager] Event listener error:', error);
            }
        }
    }
}
exports.IntegrationManager = IntegrationManager;
// Export singleton instance accessor
const getIntegrationManager = () => IntegrationManager.getInstance();
exports.getIntegrationManager = getIntegrationManager;
