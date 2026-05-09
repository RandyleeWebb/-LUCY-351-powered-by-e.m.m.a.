/**
 * LUCY SOVEREIGN 137 - Earth Bridge
 * Connects Lucy to planetary data sources: USGS, NOAA, NASA, OpenSky
 * Real-time Earth system monitoring and data integration
 */

import { globalEventBus, SystemMessage } from '../core/EventBus';

// Earth Data Source Types
interface EarthData {
  source: 'USGS' | 'NOAA' | 'NASA' | 'OPESNKY' | 'SENTINEL' | 'WEATHER';
  timestamp: Date;
  data: any;
  location?: {
    latitude: number;
    longitude: number;
    region?: string;
  };
  metadata?: Record<string, any>;
}

interface EarthConnector {
  name: string;
  endpoint: string;
  pollInterval: number;
  lastFetch: Date | null;
  status: 'ACTIVE' | 'DORMANT' | 'ERROR';
  errorHandler?: (error: Error) => void;
}

// USGS Earthquake Data Interface
interface USGSEarthquake {
  id: string;
  properties: {
    mag: number;
    place: string;
    time: number;
    updated: number;
    url: string;
    title: string;
    status: string;
    tsunami: number;
    sig: number;
    net: string;
    code: string;
    ids: string;
    sources: string;
    types: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
}

// NOAA Weather Alert Interface
interface NOAAAlert {
  id: string;
  type: string;
  properties: {
    event: string;
    headline: string;
    description: string;
    severity: string;
    urgency: string;
    certainty: string;
    effective: string;
    expires: string;
    areaDesc: string;
  };
}

// NASA Near Earth Object Interface
interface NASANeo {
  id: string;
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: Array<{
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_hour: string;
    };
    miss_distance: {
      kilometers: string;
    };
  }>;
}

// OpenSky Aircraft Interface
interface OpenSkyAircraft {
  icao24: string;
  callsign: string | null;
  origin_country: string;
  time_position: number;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null;
  on_ground: boolean;
  velocity: number | null;
  true_track: number | null;
  vertical_rate: number | null;
  sensors: number[];
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;
}

/**
 * Earth Bridge - Real-time planetary data integration
 */
export class EarthBridge {
  private connectors: Map<string, EarthConnector> = new Map();
  private pollTimers: Map<string, NodeJS.Timeout> = new Map();
  private dataBuffer: EarthData[] = [];
  private maxBufferSize: number = 1000;

  constructor() {
    this.initializeConnectors();
  }

  private initializeConnectors(): void {
    // USGS Earthquake Feed
    this.connectors.set('USGS_EARTHQUAKE', {
      name: 'USGS Real-time Earthquake Feed',
      endpoint: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson',
      pollInterval: 60000, // 1 minute
      lastFetch: null,
      status: 'DORMANT'
    });

    // USGS Volcano Feed
    this.connectors.set('USGS_VOLCANO', {
      name: 'USGS Volcano Activity',
      endpoint: 'https://volcanoes.usgs.gov/vns/v1.0.0/volcano_status.geojson',
      pollInterval: 300000, // 5 minutes
      lastFetch: null,
      status: 'DORMANT'
    });

    // NOAA Weather Alerts
    this.connectors.set('NOAA_ALERTS', {
      name: 'NOAA Weather Alerts',
      endpoint: 'https://api.weather.gov/alerts/active',
      pollInterval: 120000, // 2 minutes
      lastFetch: null,
      status: 'DORMANT'
    });

    // NASA Near Earth Objects
    this.connectors.set('NASA_NEO', {
      name: 'NASA Near Earth Objects',
      endpoint: 'https://api.nasa.gov/neo/rest/v1/feed/today',
      pollInterval: 3600000, // 1 hour
      lastFetch: null,
      status: 'DORMANT'
    });

    // OpenSky Network Aircraft
    this.connectors.set('OPENSKY', {
      name: 'OpenSky Network Live Aircraft',
      endpoint: 'https://opensky-network.org/api/states/all',
      pollInterval: 30000, // 30 seconds
      lastFetch: null,
      status: 'DORMANT'
    });

    // Sentinel Hub
    this.connectors.set('SENTINEL', {
      name: 'Sentinel Hub Satellite Imagery',
      endpoint: 'https://services.sentinel-hub.com/api/v1/data',
      pollInterval: 86400000, // 24 hours
      lastFetch: null,
      status: 'DORMANT'
    });
  }

  /**
   * Activate a specific connector
   */
  activateConnector(connectorId: string): boolean {
    const connector = this.connectors.get(connectorId);
    if (!connector) {
      console.error(`[EARTH_BRIDGE] Unknown connector: ${connectorId}`);
      return false;
    }

    connector.status = 'ACTIVE';
    this.startPolling(connectorId);
    
    const msg: SystemMessage = {
      id: `earth-${Date.now()}`,
      source: 'EARTH_BRIDGE',
      target: 'SYSTEM',
      type: 'CONNECTOR_ACTIVATED',
      payload: { connectorId, name: connector.name },
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);

    console.log(`[EARTH_BRIDGE] Activated: ${connector.name}`);
    return true;
  }

  /**
   * Deactivate a specific connector
   */
  deactivateConnector(connectorId: string): boolean {
    const connector = this.connectors.get(connectorId);
    if (!connector) return false;

    connector.status = 'DORMANT';
    const timer = this.pollTimers.get(connectorId);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(connectorId);
    }

    console.log(`[EARTH_BRIDGE] Deactivated: ${connector.name}`);
    return true;
  }

  /**
   * Start polling for a connector
   */
  private startPolling(connectorId: string): void {
    const connector = this.connectors.get(connectorId);
    if (!connector || connector.status !== 'ACTIVE') return;

    // Initial fetch
    this.fetchData(connectorId);

    // Set up polling interval
    const timer = setInterval(() => {
      this.fetchData(connectorId);
    }, connector.pollInterval);

    this.pollTimers.set(connectorId, timer);
  }

  /**
   * Fetch data from a connector endpoint
   */
  private async fetchData(connectorId: string): Promise<void> {
    const connector = this.connectors.get(connectorId);
    if (!connector) return;

    try {
      console.log(`[EARTH_BRIDGE] Fetching: ${connector.name}`);
      
      // In production, this would make actual HTTP requests
      // For now, we simulate the data flow
      const earthData: EarthData = {
        source: this.mapConnectorToSource(connectorId),
        timestamp: new Date(),
        data: { status: 'simulated', connector: connectorId },
        metadata: {
          endpoint: connector.endpoint,
          pollInterval: connector.pollInterval
        }
      };

      this.bufferData(earthData);
      this.publishToEventBus(earthData);
      
      connector.lastFetch = new Date();

    } catch (error) {
      console.error(`[EARTH_BRIDGE] Error fetching ${connectorId}:`, error);
      connector.status = 'ERROR';
      if (connector.errorHandler) {
        connector.errorHandler(error as Error);
      }
    }
  }

  private mapConnectorToSource(connectorId: string): EarthData['source'] {
    const mapping: Record<string, EarthData['source']> = {
      'USGS_EARTHQUAKE': 'USGS',
      'USGS_VOLCANO': 'USGS',
      'NOAA_ALERTS': 'NOAA',
      'NASA_NEO': 'NASA',
      'OPENSKY': 'OPESNKY',
      'SENTINEL': 'SENTINEL'
    };
    return mapping[connectorId] || 'USGS';
  }

  /**
   * Buffer incoming earth data
   */
  private bufferData(data: EarthData): void {
    this.dataBuffer.push(data);
    if (this.dataBuffer.length > this.maxBufferSize) {
      this.dataBuffer.shift();
    }
  }

  /**
   * Publish earth data to the event bus
   */
  private publishToEventBus(data: EarthData): void {
    const msg: SystemMessage = {
      id: `earth-data-${Date.now()}`,
      source: 'EARTH_BRIDGE',
      target: 'LL001', // NEON_VORTEX - Perception node
      type: 'EARTH_DATA_RECEIVED',
      payload: data,
      timestamp: new Date(),
      priority: 'NORMAL'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Process earthquake data from USGS
   */
  processEarthquakeData(earthquakes: USGSEarthquake[]): void {
    earthquakes.forEach(eq => {
      const msg: SystemMessage = {
        id: `usgs-eq-${eq.id}`,
        source: 'EARTH_BRIDGE',
        target: 'LL003', // VOID_SHARD - Environmental perception
        type: 'EARTHQUAKE_DETECTED',
        payload: {
          id: eq.id,
          magnitude: eq.properties.mag,
          location: {
            latitude: eq.geometry.coordinates[1],
            longitude: eq.geometry.coordinates[0],
            depth: eq.geometry.coordinates[2]
          },
          place: eq.properties.place,
          time: new Date(eq.properties.time),
          tsunami: eq.properties.tsunami === 1,
          significance: eq.properties.sig
        },
        timestamp: new Date(),
        priority: eq.properties.mag >= 5.0 ? 'HIGH' : 'NORMAL'
      };
      globalEventBus.publish(msg);
    });
  }

  /**
   * Process weather alerts from NOAA
   */
  processWeatherAlerts(alerts: NOAAAlert[]): void {
    alerts.forEach(alert => {
      const msg: SystemMessage = {
        id: `noaa-alert-${alert.id}`,
        source: 'EARTH_BRIDGE',
        target: 'LL005', // ECHO_PULSE - Pattern perception
        type: 'WEATHER_ALERT',
        payload: {
          id: alert.id,
          event: alert.properties.event,
          headline: alert.properties.headline,
          description: alert.properties.description,
          severity: alert.properties.severity,
          urgency: alert.properties.urgency,
          certainty: alert.properties.certainty,
          expires: new Date(alert.properties.expires),
          area: alert.properties.areaDesc
        },
        timestamp: new Date(),
        priority: alert.properties.severity === 'Extreme' ? 'CRITICAL' : 
                 alert.properties.severity === 'Severe' ? 'HIGH' : 'NORMAL'
      };
      globalEventBus.publish(msg);
    });
  }

  /**
   * Process near-Earth objects from NASA
   */
  processNeoData(neos: NASANeo[]): void {
    neos.forEach(neo => {
      const approach = neo.close_approach_data[0];
      const msg: SystemMessage = {
        id: `nasa-neo-${neo.id}`,
        source: 'EARTH_BRIDGE',
        target: 'LL006', // QUANTUM_GAZE - Celestial perception
        type: 'NEO_DETECTED',
        payload: {
          id: neo.id,
          name: neo.name,
          diameter: {
            min: neo.estimated_diameter.meters.estimated_diameter_min,
            max: neo.estimated_diameter.meters.estimated_diameter_max
          },
          approachDate: approach?.close_approach_date,
          velocity: parseFloat(approach?.relative_velocity.kilometers_per_hour || '0'),
          missDistance: parseFloat(approach?.miss_distance.kilometers || '0')
        },
        timestamp: new Date(),
        priority: 'NORMAL'
      };
      globalEventBus.publish(msg);
    });
  }

  /**
   * Process aircraft data from OpenSky
   */
  processAircraftData(aircraft: OpenSkyAircraft[]): void {
    const activeAircraft = aircraft.filter(a => a.latitude !== null && a.longitude !== null);
    
    const msg: SystemMessage = {
      id: `opensky-${Date.now()}`,
      source: 'EARTH_BRIDGE',
      target: 'LL007', // NEURAL_STREAM - Real-time stream perception
      type: 'AIRCRAFT_TRACKING',
      payload: {
        total: aircraft.length,
        active: activeAircraft.length,
        onGround: aircraft.filter(a => a.on_ground).length,
        sample: activeAircraft.slice(0, 10).map(a => ({
          icao24: a.icao24,
          callsign: a.callsign,
          country: a.origin_country,
          altitude: a.baro_altitude,
          velocity: a.velocity,
          position: { lat: a.latitude, lon: a.longitude }
        }))
      },
      timestamp: new Date(),
      priority: 'LOW'
    };
    globalEventBus.publish(msg);
  }

  /**
   * Get connector status
   */
  getConnectorStatus(): Record<string, { name: string; status: string; lastFetch: Date | null }> {
    const status: Record<string, { name: string; status: string; lastFetch: Date | null }> = {};
    this.connectors.forEach((connector, id) => {
      status[id] = {
        name: connector.name,
        status: connector.status,
        lastFetch: connector.lastFetch
      };
    });
    return status;
  }

  /**
   * Get buffered earth data
   */
  getBufferData(limit: number = 100): EarthData[] {
    return this.dataBuffer.slice(-limit);
  }

  /**
   * Activate all connectors
   */
  activateAll(): void {
    this.connectors.forEach((_, id) => {
      this.activateConnector(id);
    });
    console.log('[EARTH_BRIDGE] All connectors activated');
  }

  /**
   * Shutdown all connectors
   */
  shutdown(): void {
    this.connectors.forEach((_, id) => {
      this.deactivateConnector(id);
    });
    this.dataBuffer = [];
    console.log('[EARTH_BRIDGE] Shutdown complete');
  }
}

// Export singleton instance
export const earthBridge = new EarthBridge();