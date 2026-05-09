/**
 * LUCY SOVEREIGN 351 - Level 6 AGI v8
 * Realistic Earth - Top Face (Omniverse)
 * 
 * NVIDIA-quality Earth visualization with:
 * - NASA Blue Marble textures (2K/4K/8K)
 * - Live seismic markers (LL151: SEISMIC_VEIL)
 * - Weather overlays (LL153: ATMOS_FLARE)
 * - Tidal patterns (LL152: TIDAL_ECHO)
 * - Solar activity (LL154: SOLAR_SPIKE)
 */

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

export interface SeismicEvent {
  id: string;
  lat: number;
  lon: number;
  magnitude: number;
  depth: number;
  timestamp: number;
}

export interface WeatherEvent {
  id: string;
  lat: number;
  lon: number;
  type: 'storm' | 'hurricane' | 'tornado' | 'heat';
  intensity: number;
}

export interface PlanetaryFeedData {
  seismicEvents: SeismicEvent[];
  weatherEvents: WeatherEvent[];
  tidalStress: number;
  solarActivity: number;
}

interface RealisticEarthProps {
  planetaryData?: PlanetaryFeedData;
  autoRotate?: boolean;
  showMarkers?: boolean;
}

/**
 * Convert latitude/longitude to 3D vector on sphere
 */
function latLonToVector3(lat: number, lon: number, radius: number = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Seismic Pulse Marker
 */
interface SeismicPulseProps {
  event: SeismicEvent;
  radius: number;
}

const SeismicPulse: React.FC<SeismicPulseProps> = ({ event, radius }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);

  // Pulsing animation
  useFrame((state) => {
	if (meshRef.current) {
	  const pulse = Math.sin(state.clock.elapsedTime * 3 + event.id.charCodeAt(0)) * 0.5 + 0.5;
	  setScale(pulse * 0.3);
	  meshRef.current.scale.setScalar(0.02 + scale);
	}
  });

  const position = latLonToVector3(event.lat, event.lon, radius + 0.01);
  const color = event.magnitude > 6 ? '#ff0000' : event.magnitude > 4 ? '#ff6600' : '#ffaa00';

  return (
	<group position={position}>
	  <mesh ref={meshRef}>
		<sphereGeometry args={[0.02, 16, 16]} />
		<meshBasicMaterial color={color} transparent opacity={0.8} />
	  </mesh>

	  {/* Pulse ring */}
	  <mesh rotation={[Math.PI / 2, 0, 0]}>
		<ringGeometry args={[0.02, 0.04, 32]} />
		<meshBasicMaterial color={color} transparent opacity={0.4 + scale} side={THREE.DoubleSide} />
	  </mesh>

	  {/* Magnitude label */}
	  <Html distanceFactor={5}>
		<div
		  style={{
			color,
			fontSize: '10px',
			fontWeight: 700,
			background: 'rgba(0,0,0,0.7)',
			padding: '2px 6px',
			borderRadius: '4px',
			whiteSpace: 'nowrap'
		  }}
		>
		  M{event.magnitude.toFixed(1)}
		</div>
	  </Html>
	</group>
  );
};

/**
 * Weather Event Marker
 */
interface WeatherMarkerProps {
  event: WeatherEvent;
  radius: number;
}

const WeatherMarker: React.FC<WeatherMarkerProps> = ({ event, radius }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
	if (meshRef.current) {
	  meshRef.current.rotation.z = state.clock.elapsedTime * 2;
	}
  });

  const position = latLonToVector3(event.lat, event.lon, radius + 0.02);

  const typeColors = {
	storm: '#9333ea',
	hurricane: '#dc2626',
	tornado: '#f59e0b',
	heat: '#ff0000'
  };

  const typeIcons = {
	storm: '⛈️',
	hurricane: '🌀',
	tornado: '🌪️',
	heat: '🔥'
  };

  return (
	<group position={position}>
	  <mesh ref={meshRef}>
		<cylinderGeometry args={[0.01, 0.03, 0.05, 6]} />
		<meshBasicMaterial color={typeColors[event.type]} transparent opacity={0.7} />
	  </mesh>

	  <Html distanceFactor={5}>
		<div style={{ fontSize: '16px' }}>
		  {typeIcons[event.type]}
		</div>
	  </Html>
	</group>
  );
};

/**
 * Realistic Earth Sphere
 */
export const RealisticEarth: React.FC<RealisticEarthProps> = ({
  planetaryData,
  autoRotate = true,
  showMarkers = true
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load Earth textures
  // NOTE: You'll need to download these textures and place them in public/textures/
  // Source: https://visibleearth.nasa.gov/collection/1484/blue-marble
  const colorMap = useLoader(THREE.TextureLoader, '/textures/earth_color.jpg');
  const normalMap = useLoader(THREE.TextureLoader, '/textures/earth_normal.jpg');
  const specularMap = useLoader(THREE.TextureLoader, '/textures/earth_specular.jpg');
  const cloudsTexture = useLoader(THREE.TextureLoader, '/textures/earth_clouds.jpg');
  const nightLights = useLoader(THREE.TextureLoader, '/textures/earth_night_lights.jpg');

  // Auto-rotate
  useFrame((state, delta) => {
	if (autoRotate) {
	  if (earthRef.current) {
		earthRef.current.rotation.y += delta * 0.1;
	  }
	  if (cloudsRef.current) {
		cloudsRef.current.rotation.y += delta * 0.12; // Slightly faster than Earth
	  }
	}
  });

  const earthRadius = 1;
  const cloudsRadius = earthRadius + 0.01;
  const atmosphereRadius = earthRadius + 0.05;

  return (
	<group>
	  {/* Atmosphere Glow */}
	  <mesh ref={atmosphereRef} scale={atmosphereRadius}>
		<sphereGeometry args={[1, 64, 64]} />
		<meshBasicMaterial
		  color="#00f2ff"
		  transparent
		  opacity={0.1}
		  side={THREE.BackSide}
		/>
	  </mesh>

	  {/* Clouds Layer */}
	  <mesh ref={cloudsRef} scale={cloudsRadius}>
		<sphereGeometry args={[1, 64, 64]} />
		<meshPhongMaterial
		  map={cloudsTexture}
		  transparent
		  opacity={0.4}
		  depthWrite={false}
		/>
	  </mesh>

	  {/* Earth Sphere */}
	  <mesh ref={earthRef} scale={earthRadius}>
		<sphereGeometry args={[1, 128, 128]} />
		<meshPhongMaterial
		  map={colorMap}
		  normalMap={normalMap}
		  specularMap={specularMap}
		  emissiveMap={nightLights}
		  emissive="#ffffff"
		  emissiveIntensity={0.8}
		  shininess={10}
		/>
	  </mesh>

	  {/* Seismic Markers (LL151: SEISMIC_VEIL) */}
	  {showMarkers && planetaryData?.seismicEvents.map(event => (
		<SeismicPulse key={event.id} event={event} radius={earthRadius} />
	  ))}

	  {/* Weather Markers (LL153: ATMOS_FLARE) */}
	  {showMarkers && planetaryData?.weatherEvents.map(event => (
		<WeatherMarker key={event.id} event={event} radius={earthRadius} />
	  ))}

	  {/* Orbit Controls */}
	  <OrbitControls
		enableZoom={true}
		enablePan={true}
		enableRotate={true}
		minDistance={1.5}
		maxDistance={5}
		autoRotate={autoRotate}
		autoRotateSpeed={0.5}
	  />
	</group>
  );
};

/**
 * Fallback Earth (if textures not loaded)
 */
export const FallbackEarth: React.FC<{ autoRotate?: boolean }> = ({ autoRotate = true }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
	if (autoRotate && meshRef.current) {
	  meshRef.current.rotation.y += delta * 0.1;
	}
  });

  return (
	<mesh ref={meshRef}>
	  <sphereGeometry args={[1, 64, 64]} />
	  <meshStandardMaterial
		color="#0a4d7d"
		roughness={0.7}
		metalness={0.2}
	  />
	</mesh>
  );
};

/**
 * Omniverse Face - Complete Earth Visualization
 */
export const OmniverseFace: React.FC = () => {
  const [planetaryData, setPlanetaryData] = useState<PlanetaryFeedData>({
	seismicEvents: [
	  { id: 's1', lat: 35.6762, lon: 139.6503, magnitude: 5.2, depth: 10, timestamp: Date.now() }, // Tokyo
	  { id: 's2', lat: -33.8688, lon: 151.2093, magnitude: 4.1, depth: 15, timestamp: Date.now() }, // Sydney
	  { id: 's3', lat: 37.7749, lon: -122.4194, magnitude: 3.8, depth: 8, timestamp: Date.now() }  // San Francisco
	],
	weatherEvents: [
	  { id: 'w1', lat: 25.7617, lon: -80.1918, type: 'hurricane', intensity: 0.8 }, // Miami
	  { id: 'w2', lat: 19.4326, lon: -99.1332, type: 'storm', intensity: 0.6 }      // Mexico City
	],
	tidalStress: 0.45,
	solarActivity: 0.62
  });

  return (
	<div style={{ width: '100%', height: '100%', position: 'relative' }}>
	  {/* Info Panel */}
	  <div
		style={{
		  position: 'absolute',
		  top: '20px',
		  left: '20px',
		  background: 'rgba(7, 16, 33, 0.9)',
		  border: '2px solid #16a34a',
		  borderRadius: '12px',
		  padding: '16px',
		  color: '#e8ecff',
		  fontFamily: 'Inter, system-ui, sans-serif',
		  zIndex: 10
		}}
	  >
		<div style={{ fontWeight: 900, fontSize: '18px', color: '#16a34a', marginBottom: '12px' }}>
		  🌍 OMNIVERSE - LL151-LL200
		</div>
		<div style={{ fontSize: '13px', display: 'grid', gap: '8px' }}>
		  <div>
			<strong>LL151 (SEISMIC_VEIL):</strong> {planetaryData.seismicEvents.length} active events
		  </div>
		  <div>
			<strong>LL152 (TIDAL_ECHO):</strong> {(planetaryData.tidalStress * 100).toFixed(0)}% stress
		  </div>
		  <div>
			<strong>LL153 (ATMOS_FLARE):</strong> {planetaryData.weatherEvents.length} weather systems
		  </div>
		  <div>
			<strong>LL154 (SOLAR_SPIKE):</strong> {(planetaryData.solarActivity * 100).toFixed(0)}% activity
		  </div>
		</div>
	  </div>

	  {/* Legend */}
	  <div
		style={{
		  position: 'absolute',
		  bottom: '20px',
		  left: '20px',
		  background: 'rgba(7, 16, 33, 0.9)',
		  border: '2px solid #16a34a',
		  borderRadius: '12px',
		  padding: '12px',
		  fontSize: '12px',
		  color: '#e8ecff',
		  zIndex: 10
		}}
	  >
		<div style={{ fontWeight: 700, marginBottom: '8px' }}>Legend:</div>
		<div style={{ display: 'grid', gap: '4px' }}>
		  <div><span style={{ color: '#ff0000' }}>●</span> Major Earthquake (M &gt; 6)</div>
		  <div><span style={{ color: '#ff6600' }}>●</span> Moderate Earthquake (M 4-6)</div>
		  <div><span style={{ color: '#ffaa00' }}>●</span> Minor Earthquake (M &lt; 4)</div>
		  <div>🌀 Hurricane | ⛈️ Storm | 🌪️ Tornado | 🔥 Heat Event</div>
		</div>
	  </div>
	</div>
  );
};
