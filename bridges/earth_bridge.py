"""
Lucy Sovereign 137 - Earth Bridge (Python)

Connects Lucy to planetary data sources: USGS, NOAA, NASA, OpenSky
Real-time Earth system monitoring and data integration.
Python implementation mirroring the TypeScript EarthBridge.ts

Data Sources:
- USGS: Earthquake monitoring
- NOAA: Weather alerts and forecasts
- NASA: Satellite imagery references
- OpenSky: Aviation/flight tracking
- Sentinel: Environmental monitoring
"""

from __future__ import annotations
import asyncio
import json
import time
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional, Any, Callable, Tuple

logger = logging.getLogger("bridges.earth")


class EarthDataSource(Enum):
    """Available earth data sources."""
    USGS = "USGS"
    NOAA = "NOAA"
    NASA = "NASA"
    OPENSKY = "OPENSKY"
    SENTINEL = "SENTINEL"
    WEATHER = "WEATHER"


class ConnectorStatus(Enum):
    """Status of a data source connector."""
    ACTIVE = "ACTIVE"
    DORMANT = "DORMANT"
    ERROR = "ERROR"
    INITIALIZING = "INITIALIZING"


@dataclass
class GeoLocation:
    """Geographic location with coordinates."""
    latitude: float
    longitude: float
    region: str = ""
    altitude: Optional[float] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'region': self.region,
            'altitude': self.altitude
        }
    
    def distance_to(self, other: 'GeoLocation') -> float:
        """Calculate approximate distance in km using Haversine formula."""
        import math
        R = 6371  # Earth radius in km
        dlat = math.radians(other.latitude - self.latitude)
        dlon = math.radians(other.longitude - self.longitude)
        a = (math.sin(dlat / 2) ** 2 + 
             math.cos(math.radians(self.latitude)) * 
             math.cos(math.radians(other.latitude)) * 
             math.sin(dlon / 2) ** 2)
        c = 2 * math.asin(math.sqrt(a))
        return R * c


@dataclass
class EarthData:
    """Container for earth observation data."""
    source: EarthDataSource
    timestamp: float
    data: Dict[str, Any]
    location: Optional[GeoLocation] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'source': self.source.value,
            'timestamp': self.timestamp,
            'data': self.data,
            'location': self.location.to_dict() if self.location else None,
            'metadata': self.metadata
        }


@dataclass
class EarthConnector:
    """A data source connector configuration."""
    name: str
    source: EarthDataSource
    endpoint: str
    poll_interval: int  # seconds
    last_fetch: Optional[float] = None
    status: ConnectorStatus = ConnectorStatus.DORMANT
    error_count: int = 0
    fetch_count: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'name': self.name,
            'source': self.source.value,
            'endpoint': self.endpoint,
            'poll_interval': self.poll_interval,
            'last_fetch': self.last_fetch,
            'status': self.status.value,
            'error_count': self.error_count,
            'fetch_count': self.fetch_count
        }


@dataclass
class USGSEarthquake:
    """USGS Earthquake data."""
    event_id: str
    magnitude: float
    place: str
    time: float
    url: str
    coordinates: Tuple[float, float, float]  # lon, lat, depth
    tsunami: bool = False
    significance: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.event_id,
            'magnitude': self.magnitude,
            'place': self.place,
            'time': self.time,
            'url': self.url,
            'coordinates': list(self.coordinates),
            'tsunami': self.tsunami,
            'significance': self.significance
        }


@dataclass
class NOAAAlert:
    """NOAA Weather Alert data."""
    alert_id: str
    event_type: str
    headline: str
    description: str
    severity: str
    urgency: str
    areas: List[str]
    effective: float
    expires: float
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.alert_id,
            'event_type': self.event_type,
            'headline': self.headline,
            'description': self.description,
            'severity': self.severity,
            'urgency': self.urgency,
            'areas': self.areas,
            'effective': self.effective,
            'expires': self.expires
        }


@dataclass
class FlightData:
    """OpenSky flight tracking data."""
    icao24: str
    callsign: str
    origin_country: str
    longitude: float
    latitude: float
    altitude: float
    velocity: float
    heading: float
    on_ground: bool = False
    timestamp: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'icao24': self.icao24,
            'callsign': self.callsign.strip(),
            'origin_country': self.origin_country,
            'longitude': self.longitude,
            'latitude': self.latitude,
            'altitude': self.altitude,
            'velocity': self.velocity,
            'heading': self.heading,
            'on_ground': self.on_ground,
            'timestamp': self.timestamp
        }


class EarthBridge:
    """
    Python Earth Bridge for Lucy Sovereign 137.
    
    Connects to real-time earth data sources for monitoring
    earthquakes, weather, flights, and environmental data.
    Integrates with the Planetary Pulse engine.
    """
    
    def __init__(self):
        self.connectors: Dict[str, EarthConnector] = {}
        self.data_buffer: List[EarthData] = []
        self.earthquakes: List[USGSEarthquake] = []
        self.weather_alerts: List[NOAAAlert] = []
        self.flights: List[FlightData] = []
        self._subscribers: Dict[str, List[Callable]] = {}
        self._running = False
        self._max_buffer = 1000
        
        self._initialize_connectors()
    
    def _initialize_connectors(self) -> None:
        """Set up default connectors for all data sources."""
        self.connectors = {
            'usgs': EarthConnector(
                name="USGS Earthquake Feed",
                source=EarthDataSource.USGS,
                endpoint="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
                poll_interval=60
            ),
            'noaa': EarthConnector(
                name="NOAA Weather Alerts",
                source=EarthDataSource.NOAA,
                endpoint="https://api.weather.gov/alerts/active",
                poll_interval=300
            ),
            'nasa': EarthConnector(
                name="NASA Earth Data",
                source=EarthDataSource.NASA,
                endpoint="https://api.nasa.gov/planetary/earth",
                poll_interval=3600
            ),
            'opensky': EarthConnector(
                name="OpenSky Flight Tracker",
                source=EarthDataSource.OPENSKY,
                endpoint="https://opensky-network.org/api/states/all",
                poll_interval=10
            ),
            'sentinel': EarthConnector(
                name="Sentinel Hub",
                source=EarthDataSource.SENTINEL,
                endpoint="https://services.sentinel-hub.com/api/v1",
                poll_interval=3600
            ),
            'weather': EarthConnector(
                name="OpenWeather Feed",
                source=EarthDataSource.WEATHER,
                endpoint="https://api.openweathermap.org/data/2.5/weather",
                poll_interval=600
            ),
        }
    
    def subscribe(self, event_type: str, handler: Callable[[EarthData], None]) -> None:
        """Subscribe to earth data events."""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)
    
    def unsubscribe(self, event_type: str, handler: Callable) -> None:
        """Unsubscribe from earth data events."""
        if event_type in self._subscribers:
            self._subscribers[event_type] = [
                h for h in self._subscribers[event_type] if h != handler
            ]
    
    def _notify(self, data: EarthData) -> None:
        """Notify subscribers of new data."""
        # Source-specific subscribers
        if data.source.value in self._subscribers:
            for handler in self._subscribers[data.source.value]:
                try:
                    handler(data)
                except Exception as e:
                    logger.error(f"Error in earth data handler: {e}")
        
        # Wildcard subscribers
        if '*' in self._subscribers:
            for handler in self._subscribers['*']:
                try:
                    handler(data)
                except Exception as e:
                    logger.error(f"Error in wildcard handler: {e}")
    
    def _add_to_buffer(self, data: EarthData) -> None:
        """Add data to the buffer with size management."""
        self.data_buffer.append(data)
        if len(self.data_buffer) > self._max_buffer:
            self.data_buffer = self.data_buffer[-self._max_buffer:]
    
    async def fetch_usgs(self) -> List[USGSEarthquake]:
        """
        Fetch recent earthquake data from USGS.
        Returns list of parsed earthquake objects.
        """
        connector = self.connectors.get('usgs')
        if connector:
            connector.status = ConnectorStatus.ACTIVE
            connector.fetch_count += 1
        
        earthquakes = []
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.connectors['usgs'].endpoint,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        for feature in data.get('features', []):
                            props = feature.get('properties', {})
                            geom = feature.get('geometry', {})
                            coords = geom.get('coordinates', [0, 0, 0])
                            
                            eq = USGSEarthquake(
                                event_id=feature.get('id', ''),
                                magnitude=props.get('mag', 0) or 0,
                                place=props.get('place', 'Unknown'),
                                time=props.get('time', 0) / 1000,  # ms to s
                                url=props.get('url', ''),
                                coordinates=tuple(coords),
                                tsunami=bool(props.get('tsunami', 0)),
                                significance=props.get('sig', 0)
                            )
                            earthquakes.append(eq)
                        
                        # Update connector
                        if connector:
                            connector.last_fetch = time.time()
                            connector.status = ConnectorStatus.ACTIVE
                        
                        # Store and notify
                        self.earthquakes = earthquakes
                        earth_data = EarthData(
                            source=EarthDataSource.USGS,
                            timestamp=time.time(),
                            data={'earthquake_count': len(earthquakes)},
                            metadata={'fetch_success': True}
                        )
                        self._add_to_buffer(earth_data)
                        self._notify(earth_data)
                    else:
                        logger.warning(f"USGS API returned status {response.status}")
                        if connector:
                            connector.error_count += 1
        except ImportError:
            logger.warning("aiohttp not available, using simulated data")
            earthquakes = self._simulate_earthquakes()
            self.earthquakes = earthquakes
        except Exception as e:
            logger.error(f"Error fetching USGS data: {e}")
            if connector:
                connector.status = ConnectorStatus.ERROR
                connector.error_count += 1
            earthquakes = self._simulate_earthquakes()
            self.earthquakes = earthquakes
        
        return earthquakes
    
    async def fetch_noaa(self) -> List[NOAAAlert]:
        """
        Fetch active weather alerts from NOAA.
        Returns list of parsed alert objects.
        """
        connector = self.connectors.get('noaa')
        if connector:
            connector.status = ConnectorStatus.ACTIVE
            connector.fetch_count += 1
        
        alerts = []
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.connectors['noaa'].endpoint,
                    timeout=aiohttp.ClientTimeout(total=30),
                    headers={"User-Agent": "LucySovereign137/1.0"}
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        for feature in data.get('features', []):
                            props = feature.get('properties', {})
                            alert = NOAAAlert(
                                alert_id=feature.get('id', ''),
                                event_type=props.get('event', 'Unknown'),
                                headline=props.get('headline', ''),
                                description=props.get('description', ''),
                                severity=props.get('severity', 'Unknown'),
                                urgency=props.get('urgency', 'Unknown'),
                                areas=props.get('areaDesc', '').split('; '),
                                effective=0,
                                expires=0
                            )
                            alerts.append(alert)
                        
                        if connector:
                            connector.last_fetch = time.time()
                        self.weather_alerts = alerts
                    else:
                        logger.warning(f"NOAA API returned status {response.status}")
                        if connector:
                            connector.error_count += 1
        except ImportError:
            logger.warning("aiohttp not available, using simulated data")
            alerts = self._simulate_weather_alerts()
            self.weather_alerts = alerts
        except Exception as e:
            logger.error(f"Error fetching NOAA data: {e}")
            if connector:
                connector.status = ConnectorStatus.ERROR
                connector.error_count += 1
            alerts = self._simulate_weather_alerts()
            self.weather_alerts = alerts
        
        return alerts
    
    async def fetch_flights(self) -> List[FlightData]:
        """
        Fetch flight tracking data from OpenSky Network.
        Returns list of flight objects.
        """
        connector = self.connectors.get('opensky')
        if connector:
            connector.status = ConnectorStatus.ACTIVE
            connector.fetch_count += 1
        
        flights = []
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    self.connectors['opensky'].endpoint,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        for state in data.get('states', [])[:100]:  # Limit to 100
                            if len(state) >= 10:
                                flight = FlightData(
                                    icao24=state[0] or '',
                                    callsign=state[1] or '',
                                    origin_country=state[2] or '',
                                    longitude=state[5] or 0,
                                    latitude=state[6] or 0,
                                    altitude=state[7] or 0,
                                    velocity=state[9] or 0,
                                    heading=state[10] or 0,
                                    on_ground=bool(state[8]) if state[8] is not None else False,
                                    timestamp=state[4] or 0
                                )
                                flights.append(flight)
                        
                        if connector:
                            connector.last_fetch = time.time()
                        self.flights = flights
                    else:
                        logger.warning(f"OpenSky API returned status {response.status}")
                        if connector:
                            connector.error_count += 1
        except ImportError:
            logger.warning("aiohttp not available, using simulated data")
            flights = self._simulate_flights()
            self.flights = flights
        except Exception as e:
            logger.error(f"Error fetching flight data: {e}")
            if connector:
                connector.status = ConnectorStatus.ERROR
                connector.error_count += 1
            flights = self._simulate_flights()
            self.flights = flights
        
        return flights
    
    def _simulate_earthquakes(self) -> List[USGSEarthquake]:
        """Generate simulated earthquake data for testing."""
        import random
        quakes = []
        for i in range(5):
            quakes.append(USGSEarthquake(
                event_id=f"sim_eq_{i}_{int(time.time())}",
                magnitude=round(random.uniform(1.0, 6.0), 1),
                place=f"Simulated Region {i+1}",
                time=time.time() - random.randint(0, 3600),
                url="",
                coordinates=(random.uniform(-180, 180), random.uniform(-90, 90), random.uniform(0, 100)),
                tsunami=random.random() > 0.9,
                significance=random.randint(0, 1000)
            ))
        return quakes
    
    def _simulate_weather_alerts(self) -> List[NOAAAlert]:
        """Generate simulated weather alerts for testing."""
        alerts = []
        severities = ["Minor", "Moderate", "Severe", "Extreme"]
        events = ["Thunderstorm Warning", "Flood Watch", "Wind Advisory", "Heat Advisory"]
        for i, (event, severity) in enumerate(zip(events, severities)):
            alerts.append(NOAAAlert(
                alert_id=f"sim_noaa_{i}_{int(time.time())}",
                event_type=event,
                headline=f"{event} in effect",
                description=f"Simulated {event.lower()} for testing purposes",
                severity=severity,
                urgency="Expected",
                areas=[f"Region {i+1}"],
                effective=time.time(),
                expires=time.time() + 3600
            ))
        return alerts
    
    def _simulate_flights(self) -> List[FlightData]:
        """Generate simulated flight data for testing."""
        import random
        flights = []
        airlines = ["UAL", "DAL", "AAL", "SWA", "BAW"]
        countries = ["United States", "United Kingdom", "Germany", "Japan", "Brazil"]
        for i in range(20):
            flights.append(FlightData(
                icao24=f"sim{i:04x}",
                callsign=f"{random.choice(airlines)}{random.randint(100, 999)}",
                origin_country=random.choice(countries),
                longitude=random.uniform(-180, 180),
                latitude=random.uniform(-90, 90),
                altitude=random.uniform(1000, 40000),
                velocity=random.uniform(100, 900),
                heading=random.uniform(0, 360),
                on_ground=random.random() > 0.8,
                timestamp=time.time()
            ))
        return flights
    
    async def start_polling(self) -> None:
        """Start polling all data sources at their configured intervals."""
        self._running = True
        logger.info("Earth Bridge polling started")
        
        while self._running:
            try:
                await self.fetch_usgs()
                await self.fetch_noaa()
                await self.fetch_flights()
                await asyncio.sleep(60)  # Default polling interval
            except Exception as e:
                logger.error(f"Error in polling loop: {e}")
                await asyncio.sleep(30)
    
    def stop_polling(self) -> None:
        """Stop polling all data sources."""
        self._running = False
        logger.info("Earth Bridge polling stopped")
    
    def get_status(self) -> Dict[str, Any]:
        """Get the current status of all connectors."""
        return {
            'connectors': {k: v.to_dict() for k, v in self.connectors.items()},
            'earthquake_count': len(self.earthquakes),
            'alert_count': len(self.weather_alerts),
            'flight_count': len(self.flights),
            'buffer_size': len(self.data_buffer),
            'polling': self._running
        }
    
    def get_recent_earthquakes(self, min_magnitude: float = 0, limit: int = 20) -> List[Dict]:
        """Get recent earthquakes filtered by minimum magnitude."""
        filtered = [eq for eq in self.earthquakes if eq.magnitude >= min_magnitude]
        filtered.sort(key=lambda x: x.magnitude, reverse=True)
        return [eq.to_dict() for eq in filtered[:limit]]
    
    def get_active_alerts(self, severity: Optional[str] = None) -> List[Dict]:
        """Get active weather alerts, optionally filtered by severity."""
        if severity:
            filtered = [a for a in self.weather_alerts if a.severity == severity]
        else:
            filtered = self.weather_alerts
        return [a.to_dict() for a in filtered]
    
    def get_flights_in_area(
        self, 
        lat: float, 
        lon: float, 
        radius_km: float = 100
    ) -> List[Dict]:
        """Get flights within a geographic area."""
        center = GeoLocation(latitude=lat, longitude=lon)
        result = []
        for flight in self.flights:
            flight_loc = GeoLocation(latitude=flight.latitude, longitude=flight.longitude)
            if center.distance_to(flight_loc) <= radius_km:
                result.append(flight.to_dict())
        return result


# Global instance
_global_earth_bridge: Optional[EarthBridge] = None


def get_earth_bridge() -> EarthBridge:
    """Get or create the global Earth Bridge instance."""
    global _global_earth_bridge
    if _global_earth_bridge is None:
        _global_earth_bridge = EarthBridge()
    return _global_earth_bridge


__all__ = [
    'EarthDataSource',
    'ConnectorStatus',
    'GeoLocation',
    'EarthData',
    'EarthConnector',
    'USGSEarthquake',
    'NOAAAlert',
    'FlightData',
    'EarthBridge',
    'get_earth_bridge',
]