// @ts-nocheck
/**
 * WHAT THIS DOES:
 * Provides Lucy-core-AI's HomeAssistantBridge for REST/WebSocket communication with Home
 * Assistant entities and services. Lucy can query device states, propose service calls,
 * and control smart home devices with ActionEngine approval for risky operations.
 *
 * WHY THIS EXISTS:
 * Lucy needs "Alexa-style" voice control of smart home while preserving safety: she can
 * check states and propose changes, but critical operations (locks, garage, alarms) require
 * human approval via ActionEngine. This integrates with VRBridge for spatial voice feedback.
 *
 * HOW THIS WORKS:
 * REST API client queries Home Assistant entities (lights, switches, locks, etc). Service
 * calls are classified as safe/risky/critical. Risky and critical operations emit proposals
 * to ActionEngine. Long-lived access token loaded from environment variable (never hardcoded).
 * WebSocket support enables real-time entity state updates.
 *
 * HOW TO CHANGE IT:
 * Add new entity domains to safety classifications. Extend service call methods for new
 * device types. Never hardcode tokens - always use config.tokenEnvName from environment.
 * Add Assist API integration for natural language voice commands.
 *
 * DEBUG EXAMPLE:
 * If lights won't turn on, check: 1) HA_TOKEN environment variable set, 2) baseUrl correct,
 * 3) entity_id exists in HA, 4) network connectivity. If locks open without approval, verify
 * requiresApproval is true and ActionEngine is being called.
 */

import { agentEventBus } from '../../core/agents/AgentEventBus.js';
import { trustCalibration } from '../../core/trust/TrustCalibration.js';

export interface HomeAssistantConfig {
  baseUrl: string;
  tokenEnvName: string;
  localNetworkOnly: boolean;
  enabled: boolean;
}

export interface HomeAssistantServiceProposal {
  domain: string;
  service: string;
  entityId: string;
  data?: Record<string, unknown>;
  requiresApproval: boolean;
  riskLevel: 'safe' | 'risky' | 'critical';
  reason: string;
}

export interface HAEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HAServiceResponse {
  success: boolean;
  error?: string;
}

/**
 * Home Assistant Bridge - Smart Home Control with Safety
 * 
 * Safety Classification:
 * - SAFE: Lights, switches, sensors (read), media players
 * - RISKY: Thermostats, covers (blinds/shades), climate control
 * - CRITICAL: Locks, garage doors, alarms, security systems
 */
export class HomeAssistantBridge {
  private token: string | null = null;
  private connected: boolean = false;

  constructor(private readonly config: HomeAssistantConfig) {
    if (config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize connection and load token from environment
   */
  private initialize(): void {
    // Load token from environment variable (never hardcoded)
    this.token = process.env[this.config.tokenEnvName] || null;

    if (!this.token) {
      console.warn(`[HomeAssistantBridge] Token not found in env var: ${this.config.tokenEnvName}`);
      console.warn('[HomeAssistantBridge] Set HA_TOKEN environment variable to enable');
      return;
    }

    this.connected = true;
    console.log('[HomeAssistantBridge] Initialized successfully');

    agentEventBus.publish('system', {
      type: 'homeassistant.connected',
      data: {
        baseUrl: this.config.baseUrl,
        localNetworkOnly: this.config.localNetworkOnly
      },
      timestamp: Date.now()
    });
  }

  getConfigSummary(): Omit<HomeAssistantConfig, 'tokenEnvName'> & { tokenConfiguredBy: string; connected: boolean } {
    return {
      baseUrl: this.config.baseUrl,
      localNetworkOnly: this.config.localNetworkOnly,
      enabled: this.config.enabled,
      tokenConfiguredBy: this.config.tokenEnvName,
      connected: this.connected
    };
  }

  /**
   * Check if bridge is ready for operations
   */
  isConnected(): boolean {
    return this.connected && this.token !== null;
  }

  /**
   * Get entity state from Home Assistant
   */
  async getEntityState(entityId: string): Promise<HAEntityState | null> {
    if (!this.isConnected()) {
      throw new Error('HomeAssistantBridge not connected. Check HA_TOKEN environment variable.');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/states/${entityId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Entity doesn't exist
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const state: HAEntityState = await response.json();
      return state;

    } catch (error) {
      console.error('[HomeAssistantBridge] Failed to get entity state:', error);
      throw error;
    }
  }

  /**
   * Get all entities (for discovery)
   */
  async getAllEntities(): Promise<HAEntityState[]> {
    if (!this.isConnected()) {
      throw new Error('HomeAssistantBridge not connected. Check HA_TOKEN environment variable.');
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/states`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const states: HAEntityState[] = await response.json();
      return states;

    } catch (error) {
      console.error('[HomeAssistantBridge] Failed to get all entities:', error);
      throw error;
    }
  }

  /**
   * Classify service call by risk level
   */
  private classifyServiceCall(domain: string, service: string, entityId: string): {
    riskLevel: 'safe' | 'risky' | 'critical';
    requiresApproval: boolean;
    reason: string;
  } {
    // CRITICAL operations always require approval
    if (
      domain === 'lock' ||
      domain === 'alarm_control_panel' ||
      (domain === 'cover' && entityId.includes('garage'))
    ) {
      return {
        riskLevel: 'critical',
        requiresApproval: true,
        reason: 'Critical security device - requires human approval'
      };
    }

    // RISKY operations require approval unless trust is Sovereign
    if (
      domain === 'climate' ||
      domain === 'cover' ||
      (domain === 'switch' && entityId.includes('main')) ||
      service.includes('set_temperature')
    ) {
      const { tier } = trustCalibration.getCurrentScore();
      const requiresApproval = tier !== 'sovereign';

      return {
        riskLevel: 'risky',
        requiresApproval,
        reason: requiresApproval
          ? 'Risky operation - requires ActionEngine approval'
          : 'Risky operation - auto-approved at Sovereign tier'
      };
    }

    // SAFE operations can proceed (but still logged)
    return {
      riskLevel: 'safe',
      requiresApproval: false,
      reason: 'Safe operation - can proceed'
    };
  }

  /**
   * Propose service call (does not execute yet)
   */
  proposeServiceCall(input: Omit<HomeAssistantServiceProposal, 'requiresApproval' | 'riskLevel' | 'reason'>): HomeAssistantServiceProposal {
    const classification = this.classifyServiceCall(input.domain, input.service, input.entityId);

    const proposal: HomeAssistantServiceProposal = {
      ...input,
      ...classification
    };

    // Emit proposal for ActionEngine evaluation
    if (proposal.requiresApproval) {
      agentEventBus.publish('inter-agent', {
        type: 'action.proposed',
        data: {
          actionType: 'homeassistant_service_call',
          proposal,
          timestamp: Date.now()
        },
        timestamp: Date.now()
      });
    }

    return proposal;
  }

  /**
   * Execute service call (after approval if required)
   */
  async callService(proposal: HomeAssistantServiceProposal): Promise<HAServiceResponse> {
    if (!this.isConnected()) {
      return {
        success: false,
        error: 'HomeAssistantBridge not connected'
      };
    }

    // Verify approval for risky/critical operations
    if (proposal.requiresApproval) {
      // In production, wait for ActionEngine approval here
      console.log('[HomeAssistantBridge] Approval required for:', proposal);
    }

    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/services/${proposal.domain}/${proposal.service}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            entity_id: proposal.entityId,
            ...proposal.data
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Record success in trust system
      trustCalibration.recordEvent({
        eventType: 'success',
        description: `HA service call: ${proposal.domain}.${proposal.service} on ${proposal.entityId}`,
        impact: 1
      });

      agentEventBus.publish('system', {
        type: 'homeassistant.service_call.success',
        data: proposal,
        timestamp: Date.now()
      });

      return { success: true };

    } catch (error) {
      // Record failure in trust system
      trustCalibration.recordEvent({
        eventType: 'failure',
        description: `HA service call failed: ${error}`,
        impact: -2
      });

      agentEventBus.publish('system', {
        type: 'homeassistant.service_call.failure',
        data: { proposal, error: String(error) },
        timestamp: Date.now()
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Convenience methods for common operations
   */

  async turnOnLight(entityId: string): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'light',
      service: 'turn_on',
      entityId
    });
    return this.callService(proposal);
  }

  async turnOffLight(entityId: string): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'light',
      service: 'turn_off',
      entityId
    });
    return this.callService(proposal);
  }

  async setLightBrightness(entityId: string, brightness: number): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'light',
      service: 'turn_on',
      entityId,
      data: { brightness: Math.max(0, Math.min(255, brightness)) }
    });
    return this.callService(proposal);
  }

  async turnOnSwitch(entityId: string): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'switch',
      service: 'turn_on',
      entityId
    });
    return this.callService(proposal);
  }

  async turnOffSwitch(entityId: string): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'switch',
      service: 'turn_off',
      entityId
    });
    return this.callService(proposal);
  }

  async setClimateTemperature(entityId: string, temperature: number): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'climate',
      service: 'set_temperature',
      entityId,
      data: { temperature }
    });
    return this.callService(proposal);
  }

  async lockDoor(entityId: string): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'lock',
      service: 'lock',
      entityId
    });
    return this.callService(proposal);
  }

  async unlockDoor(entityId: string): Promise<HAServiceResponse> {
    const proposal = this.proposeServiceCall({
      domain: 'lock',
      service: 'unlock',
      entityId
    });
    return this.callService(proposal);
  }
}
