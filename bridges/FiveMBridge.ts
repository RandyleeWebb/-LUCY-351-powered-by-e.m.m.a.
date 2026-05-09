/**
 * LUCY SOVEREIGN 137 - FiveM Bridge
 * Connects Lucy to GTA V FiveM servers for virtual world integration
 * Supports npc interaction, vehicle control, and environment monitoring
 */

import { globalEventBus, SystemMessage } from '../core/EventBus';

// FiveM Data Types
interface FiveMPlayer {
  id: number;
  name: string;
  identifiers: string[];
  ping: number;
  endpoint: string;
}

interface FiveMEntity {
  handle: number;
  type: 'ped' | 'vehicle' | 'object' | 'prop';
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  model: string;
  health: number;
  maxHealth: number;
}

interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface FiveMVehicle extends FiveMEntity {
  type: 'vehicle';
  vehicleClass: string;
  plate: string;
  fuelLevel: number;
  engineHealth: number;
  bodyHealth: number;
  driver: number | null;
  passengers: number[];
  lightsOn: boolean;
  sirenOn: boolean;
  engineRunning: boolean;
}

interface FiveMPed extends FiveMEntity {
  type: 'ped';
  isPlayer: boolean;
  isNpc: boolean;
  isDead: boolean;
  isInVehicle: boolean;
  currentVehicle: number | null;
  task: string;
  weapon: string | null;
  armour: number;
}

interface FiveMWeather {
  weatherType: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  isRaining: boolean;
  isSnowing: boolean;
  isThundering: boolean;
  timeOfDay: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface FiveMZone {
  name: string;
  position: Vector3;
  radius: number;
  type: 'safe' | 'mission' | 'restricted' | 'custom';
  active: boolean;
}

/**
 * FiveM Bridge - Virtual world integration for Lucy Sovereign
 */
export class FiveMBridge {
  private isConnected: boolean = false;
  private serverAddress: string = '';
  private serverPort: number = 30120;
  private players: Map<number, FiveMPlayer> = new Map();
  private entities: Map<number, FiveMEntity> = new Map();
  private vehicles: Map<number, FiveMVehicle> = new Map();
  private peds: Map<number, FiveMPed> = new Map();
  private zones: Map<string, FiveMZone> = new Map();
  private weather: FiveMWeather | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultZones();
  }

  private initializeDefaultZones(): void {
    // Los Santos International Airport
    this.zones.set('lsia', {
      name: 'LSIA',
      position: { x: -1037.0, y: -2736.0, z: 20.0 },
      radius: 300.0,
      type: 'restricted',
      active: true
    });

    // Mission Row Police Station
    this.zones.set('mission_row', {
      name: 'Mission Row PD',
      position: { x: 437.0, y: -982.0, z: 30.0 },
      radius: 100.0,
      type: 'safe',
      active: true
    });

    // Vinewood Hills
    this.zones.set('vinewood', {
      name: 'Vinewood Hills',
      position: { x: -200.0, y: 500.0, z: 150.0 },
      radius: 500.0,
      type: 'custom',
      active: true
    });
  }

  /**
   * Connect to a FiveM server
   */
  async connect(address: string, port: number = 30120): Promise<boolean> {
    try {
      this.serverAddress = address;
      this.serverPort = port;
      
      // In production, would establish WebSocket/HTTP connection
      console.log(`[FIVEM_BRIDGE] Connecting to ${address}:${port}...`);
      
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.isConnected = true;
      this.startUpdateLoop();
      
      const msg: SystemMessage = {
        id: `fivem-connect-${Date.now()}`,
        source: 'FIVEM_BRIDGE',
        target: 'SYSTEM',
        type: 'FIVEM_CONNECTED',
        payload: { address, port, timestamp: new Date() },
        timestamp: new Date(),
        priority: 'NORMAL'
      };
      globalEventBus.publish(msg);

      console.log(`[FIVEM_BRIDGE] Connected to ${address}:${port}`);
      return true;

    } catch (error) {
      console.error('[FIVEM_BRIDGE] Connection failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.isConnected = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    const msg: SystemMessage = {
      id: `fivem-disconnect-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'SYSTEM',
      type: 'FIVEM_DISCONNECTED',
      payload: { timestamp: new Date() },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    console.log('[FIVEM_BRIDGE] Disconnected');
  }

  /**
   * Start the update loop for entity synchronization
   */
  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      if (!this.isConnected) return;
      this.syncEntities();
    }, 50); // 20 FPS update rate
  }

  /**
   * Synchronize entities from the server
   */
  private async syncEntities(): Promise<void> {
    // In production, would fetch actual entity data from FiveM server
    // This simulates the sync process
    
    const msg: SystemMessage = {
      id: `fivem-sync-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL004', // PHOTON_DRIFT - Spatial perception
      type: 'FIVEM_ENTITY_SYNC',
      payload: {
        playerCount: this.players.size,
        vehicleCount: this.vehicles.size,
        pedCount: this.peds.size,
        timestamp: new Date()
      },
      timestamp: new Date(),
      priority: 'LOW'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Register a new player
   */
  registerPlayer(player: FiveMPlayer): void {
    this.players.set(player.id, player);
    
    const msg: SystemMessage = {
      id: `fivem-player-${player.id}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL060', // GRAND_CENTRAL - Routing
      type: 'PLAYER_JOINED',
      payload: {
        id: player.id,
        name: player.name,
        identifiers: player.identifiers,
        ping: player.ping
      },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Unregister a player
   */
  unregisterPlayer(playerId: number): void {
    const player = this.players.get(playerId);
    this.players.delete(playerId);
    
    const msg: SystemMessage = {
      id: `fivem-player-leave-${playerId}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL060',
      type: 'PLAYER_LEFT',
      payload: {
        id: playerId,
        name: player?.name || 'Unknown'
      },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Update vehicle state
   */
  updateVehicle(vehicle: FiveMVehicle): void {
    this.vehicles.set(vehicle.handle, vehicle);
    this.entities.set(vehicle.handle, vehicle);
  }

  /**
   * Update ped state
   */
  updatePed(ped: FiveMPed): void {
    this.peds.set(ped.handle, ped);
    this.entities.set(ped.handle, ped);
  }

  /**
   * Update weather
   */
  updateWeather(weather: FiveMWeather): void {
    this.weather = weather;
    
    const msg: SystemMessage = {
      id: `fivem-weather-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL005', // ECHO_PULSE
      type: 'WEATHER_UPDATE',
      payload: weather,
      timestamp: new Date(),
      priority: 'LOW'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Spawn a vehicle at specified position
   */
  async spawnVehicle(model: string, position: Vector3, heading: number = 0): Promise<number | null> {
    if (!this.isConnected) {
      console.error('[FIVEM_BRIDGE] Not connected to server');
      return null;
    }

    console.log(`[FIVEM_BRIDGE] Spawning vehicle: ${model} at (${position.x}, ${position.y}, ${position.z})`);
    
    // In production, would call native spawn function
    // Returns the vehicle handle
    
    const handle = Date.now(); // Simulated handle
    
    const msg: SystemMessage = {
      id: `fivem-spawn-${handle}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL030', // MUSE_SPARK - Creative
      type: 'VEHICLE_SPAWNED',
      payload: { model, position, heading, handle },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return handle;
  }

  /**
   * Create an NPC at specified position
   */
  async createNpc(model: string, position: Vector3, task: string = 'WANDER'): Promise<number | null> {
    if (!this.isConnected) {
      console.error('[FIVEM_BRIDGE] Not connected to server');
      return null;
    }

    console.log(`[FIVEM_BRIDGE] Creating NPC: ${model} with task: ${task}`);
    
    const handle = Date.now(); // Simulated handle
    
    const msg: SystemMessage = {
      id: `fivem-npc-${handle}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL032', // SYNTHESIS_BLOOM
      type: 'NPC_CREATED',
      payload: { model, position, task, handle },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return handle;
  }

  /**
   * Set player into vehicle
   */
  async setPlayerIntoVehicle(playerId: number, vehicleHandle: number, seat: number = -1): Promise<boolean> {
    if (!this.isConnected) return false;

    console.log(`[FIVEM_BRIDGE] Setting player ${playerId} into vehicle ${vehicleHandle}, seat ${seat}`);
    
    const msg: SystemMessage = {
      id: `fivem-enter-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL042', // PATH_FINDER
      type: 'PLAYER_ENTER_VEHICLE',
      payload: { playerId, vehicleHandle, seat },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Teleport entity to position
   */
  async teleportEntity(entityHandle: number, position: Vector3): Promise<boolean> {
    if (!this.isConnected) return false;

    const entity = this.entities.get(entityHandle);
    if (!entity) {
      console.error('[FIVEM_BRIDGE] Entity not found:', entityHandle);
      return false;
    }

    console.log(`[FIVEM_BRIDGE] Teleporting entity ${entityHandle} to (${position.x}, ${position.y}, ${position.z})`);
    
    entity.position = position;
    
    const msg: SystemMessage = {
      id: `fivem-teleport-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL042', // PATH_FINDER
      type: 'ENTITY_TELEPORTED',
      payload: { entityHandle, position, type: entity.type },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return true;
  }

  /**
   * Create a custom zone
   */
  createZone(zone: FiveMZone): void {
    this.zones.set(zone.name.toLowerCase().replace(/\s+/g, '_'), zone);
    
    const msg: SystemMessage = {
      id: `fivem-zone-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL043', // RISK_MATRIX
      type: 'ZONE_CREATED',
      payload: zone,
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Check if position is in a zone
   */
  isInZone(position: Vector3, zoneType?: string): FiveMZone | null {
    for (const [, zone] of this.zones) {
      if (zoneType && zone.type !== zoneType) continue;
      
      const distance = Math.sqrt(
        Math.pow(position.x - zone.position.x, 2) +
        Math.pow(position.y - zone.position.y, 2) +
        Math.pow(position.z - zone.position.z, 2)
      );
      
      if (distance <= zone.radius && zone.active) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Get nearby entities
   */
  getNearbyEntities(position: Vector3, radius: number): FiveMEntity[] {
    const nearby: FiveMEntity[] = [];
    
    this.entities.forEach(entity => {
      const distance = Math.sqrt(
        Math.pow(position.x - entity.position.x, 2) +
        Math.pow(position.y - entity.position.y, 2) +
        Math.pow(position.z - entity.position.z, 2)
      );
      
      if (distance <= radius) {
        nearby.push(entity);
      }
    });
    
    return nearby;
  }

  /**
   * Get all vehicles
   */
  getVehicles(): FiveMVehicle[] {
    return Array.from(this.vehicles.values());
  }

  /**
   * Get all peds
   */
  getPeds(): FiveMPed[] {
    return Array.from(this.peds.values());
  }

  /**
   * Get weather info
   */
  getWeather(): FiveMWeather | null {
    return this.weather;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; address: string; port: number } {
    return {
      connected: this.isConnected,
      address: this.serverAddress,
      port: this.serverPort
    };
  }

  /**
   * Execute a native game function
   */
  async executeNative(nativeName: string, args: any[]): Promise<any> {
    if (!this.isConnected) {
      throw new Error('Not connected to FiveM server');
    }

    console.log(`[FIVEM_BRIDGE] Executing native: ${nativeName}`);
    
    const msg: SystemMessage = {
      id: `fivem-native-${Date.now()}`,
      source: 'FIVEM_BRIDGE',
      target: 'LL022', // MATH_FORGE
      type: 'NATIVE_EXECUTED',
      payload: { nativeName, args },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    return { success: true, native: nativeName, args };
  }
}

// Export singleton instance
export const fiveMBridge = new FiveMBridge();