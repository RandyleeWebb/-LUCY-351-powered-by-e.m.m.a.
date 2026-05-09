// @ts-nocheck
/**
 * LUCY SOVEREIGN 351 - Level 6 AGI v8
 * Omniverse Dashboard - The Sovereign Earth (TOP FACE)
 * 
 * FEATURES:
 * 1. Spatial Intelligence: Lat/Lon → Vector3 positioning
 * 2. Visual Backpressure: useLoader for NASA Blue Marble textures
 * 3. Sovereign Glow: OKLCH cyan atmosphere halo
 * 4. Voice Integration: Seismic alerts trigger Sovereign narration
 * 5. Peel Back: Double-click reveals LL151-LL200 node grid inside globe
 */

import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { speakSovereign } from '../../core/audio/VoiceManager';

export interface SeismicEvent {
  id: string;
  lat: number;
  lon: number;
  magnitude: number;
  depth: number;
  timestamp: number;
  location?: string;
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
 * Node Grid Layer (LL151-LL200) - Revealed on Double-Click
 */
interface NodeGridProps {
  visible: boolean;
  radius: number;
}

const NodeGrid: React.FC<NodeGridProps> = ({ visible, radius }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
	if (groupRef.current && visible) {
	  groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
	}
  });

  if (!visible) return null;

  // Generate LL151-LL200 nodes (50 nodes distributed on sphere)
  const nodes = [];
  for (let i = 0; i < 50; i++) {
	const lat = (Math.random() - 0.5) * 180;
	const lon = (Math.random() - 0.5) * 360;
	const position = latLonToVector3(lat, lon, radius * 0.95);
	const nodeId = 151 + i;

	nodes.push({
	  id: `LL${nodeId}`,
	  position,
	  color: i < 1 ? '#ff0000' : i < 5 ? '#ff6600' : '#00f2ff', // Highlight key nodes
	  glow: i < 5 // Add extra glow for key nodes
	});
  }

  return (
	<group ref={groupRef}>
	  {nodes.map((node, idx) => (
		<group key={node.id} position={node.position}>
		  {/* Glow halo for key nodes */}
		  {node.glow && (
			<mesh>
			  <sphereGeometry args={[0.025, 16, 16]} />
			  <meshBasicMaterial color={node.color} transparent opacity={0.3} />
			</mesh>
		  )}

		  {/* Node sphere */}
		  <mesh>
			<sphereGeometry args={[0.018, 16, 16]} />
			<meshBasicMaterial color={node.color} transparent opacity={1.0} />
		  </mesh>

		  {/* Node connections (to nearby nodes) */}
		  {idx < nodes.length - 1 && idx % 5 === 0 && (
			<line>
			  <bufferGeometry>
				<bufferAttribute
				  attach="attributes-position"
				  count={2}
				  array={new Float32Array([
					...node.position.toArray(),
					...nodes[idx + 1].position.toArray()
				  ])}
				  itemSize={3}
				/>
			  </bufferGeometry>
			  <lineBasicMaterial color="#00f2ff" transparent opacity={0.5} linewidth={2} />
			</line>
		  )}

		  {/* Node label */}
		  <Html distanceFactor={4}>
			<div
			  style={{
				color: '#ffffff',
				fontSize: '11px',
				fontWeight: 900,
				background: 'rgba(0, 0, 0, 0.95)',
				padding: '4px 8px',
				borderRadius: '4px',
				whiteSpace: 'nowrap',
				border: `2px solid ${node.color}`,
				boxShadow: `0 0 15px ${node.color}`
			  }}
			>
			  {node.id}
			</div>
		  </Html>
		</group>
	  ))}
	</group>
  );
};

/**
 * Seismic Pulse Marker with Alert Detection
 */
interface SeismicPulseProps {
  event: SeismicEvent;
  radius: number;
  onMajorEvent: (event: SeismicEvent) => void;
}

const SeismicPulse: React.FC<SeismicPulseProps> = ({ event, radius, onMajorEvent }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(0);
  const [alerted, setAlerted] = useState(false);

  // Trigger alert for major events
  useEffect(() => {
	if (event.magnitude > 6.0 && !alerted) {
	  onMajorEvent(event);
	  setAlerted(true);
	}
  }, [event, alerted, onMajorEvent]);

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
	  {/* Glow halo */}
	  <mesh>
		<sphereGeometry args={[0.035, 16, 16]} />
		<meshBasicMaterial color={color} transparent opacity={0.3} />
	  </mesh>

	  {/* Main marker */}
	  <mesh ref={meshRef}>
		<sphereGeometry args={[0.025, 16, 16]} />
		<meshBasicMaterial color={color} transparent opacity={1.0} />
	  </mesh>

	  {/* Pulse ring */}
	  <mesh rotation={[Math.PI / 2, 0, 0]}>
		<ringGeometry args={[0.025, 0.05, 32]} />
		<meshBasicMaterial color={color} transparent opacity={0.6 + scale} side={THREE.DoubleSide} />
	  </mesh>

	  {/* Magnitude label */}
	  <Html distanceFactor={5}>
		<div
		  style={{
			color: '#ffffff',
			fontSize: '13px',
			fontWeight: 900,
			background: 'rgba(0, 0, 0, 0.95)',
			padding: '5px 10px',
			borderRadius: '6px',
			whiteSpace: 'nowrap',
			border: `3px solid ${color}`,
			boxShadow: `0 0 20px ${color}`
		  }}
		>
		  M{event.magnitude.toFixed(1)}
		  {event.location && <div style={{ fontSize: '11px', marginTop: '2px', color: '#00f2ff' }}>{event.location}</div>}
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
 * Realistic Earth Sphere with Peel-Back Feature
 * Uses conditional loading with error handling
 */
interface RealisticEarthProps {
  planetaryData?: PlanetaryFeedData;
  autoRotate?: boolean;
  showMarkers?: boolean;
  peelBack: boolean;
  onMajorSeismicEvent: (event: SeismicEvent) => void;
}

/**
 * Earth with textures - wrapped in Suspense
 */
const EarthWithTextures: React.FC<RealisticEarthProps> = ({
  planetaryData,
  autoRotate = true,
  showMarkers = true,
  peelBack,
  onMajorSeismicEvent
}) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load Earth textures - Suspense will handle loading state
  const colorMap = useLoader(THREE.TextureLoader, '/textures/earth_color.jpg');
  const normalMap = useLoader(THREE.TextureLoader, '/textures/earth_normal.jpg');
  const cloudsTexture = useLoader(THREE.TextureLoader, '/textures/earth_clouds.jpg');

  // Auto-rotate
  useFrame((state, delta) => {
	if (autoRotate && !peelBack) {
	  if (earthRef.current) {
		earthRef.current.rotation.y += delta * 0.1;
	  }
	  if (cloudsRef.current) {
		cloudsRef.current.rotation.y += delta * 0.12;
	  }
	}
  });

  const earthRadius = 1;
  const cloudsRadius = earthRadius + 0.01;
  const atmosphereRadius = earthRadius + 0.05;

  return (
	<group>
	  {/* Atmosphere Glow - Sovereign Cyan - Much Brighter */}
	  <mesh ref={atmosphereRef} scale={atmosphereRadius}>
		<sphereGeometry args={[1, 64, 64]} />
		<meshBasicMaterial
		  color="#00f2ff"
		  transparent
		  opacity={0.4}
		  side={THREE.BackSide}
		/>
	  </mesh>

	  {/* Clouds Layer */}
	  {!peelBack && cloudsTexture && (
		<mesh ref={cloudsRef} scale={cloudsRadius}>
		  <sphereGeometry args={[1, 64, 64]} />
		  <meshPhongMaterial
			map={cloudsTexture}
			transparent
			opacity={0.4}
			depthWrite={false}
		  />
		</mesh>
	  )}

	  {/* Earth Sphere - Transparent when peeled back */}
	  <mesh ref={earthRef} scale={earthRadius}>
		<sphereGeometry args={[1, 128, 128]} />
		<meshPhongMaterial
		  map={colorMap}
		  normalMap={normalMap}
		  transparent={peelBack}
		  opacity={peelBack ? 0.1 : 1.0}
		  shininess={20}
		/>
	  </mesh>

	  {/* Node Grid (visible when peeled back) */}
	  <NodeGrid visible={peelBack} radius={earthRadius} />

	  {/* Seismic Markers (LL151: SEISMIC_VEIL) */}
	  {showMarkers && planetaryData?.seismicEvents.map(event => (
		<SeismicPulse
		  key={event.id}
		  event={event}
		  radius={earthRadius}
		  onMajorEvent={onMajorSeismicEvent}
		/>
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
		autoRotate={autoRotate && !peelBack}
		autoRotateSpeed={0.5}
	  />
	</group>
  );
};

/**
 * Main RealisticEarth component with error boundary
 */
const RealisticEarth: React.FC<RealisticEarthProps> = (props) => {
  const [useTextures, setUseTextures] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  // Error boundary fallback
  useEffect(() => {
	if (errorCount > 2) {
	  console.warn('Failed to load textures after multiple attempts, using fallback');
	  setUseTextures(false);
	}
  }, [errorCount]);

  if (!useTextures) {
	return <FallbackEarth autoRotate={props.autoRotate} peelBack={props.peelBack} />;
  }

  return (
	<Suspense fallback={<FallbackEarth autoRotate={props.autoRotate} peelBack={props.peelBack} />}>
	  <EarthWithTextures {...props} />
	</Suspense>
  );
};

/**
 * Fallback Earth (when textures fail to load)
 */
const FallbackEarth: React.FC<{ autoRotate?: boolean; peelBack: boolean }> = ({ 
  autoRotate = true, 
  peelBack 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
	if (autoRotate && !peelBack && meshRef.current) {
	  meshRef.current.rotation.y += delta * 0.1;
	}
  });

  return (
	<group>
	  {/* Bright fallback glow */}
	  <mesh scale={1.05}>
		<sphereGeometry args={[1, 64, 64]} />
		<meshBasicMaterial
		  color="#00f2ff"
		  transparent
		  opacity={0.3}
		  side={THREE.BackSide}
		/>
	  </mesh>

	  {/* Main Earth sphere */}
	  <mesh ref={meshRef}>
		<sphereGeometry args={[1, 64, 64]} />
		<meshStandardMaterial
		  color="#2a9fd6"
		  roughness={0.5}
		  metalness={0.4}
		  transparent={peelBack}
		  opacity={peelBack ? 0.1 : 1.0}
		  emissive="#16a34a"
		  emissiveIntensity={0.4}
		/>
	  </mesh>
	  <NodeGrid visible={peelBack} radius={1} />
	</group>
  );
};

/**
 * Loading Spinner for Canvas Suspense
 */
const LoadingSpinner: React.FC = () => {
  return (
    <Html center>
      <div style={{
        color: '#00f2ff',
        fontSize: '20px',
        fontWeight: 900,
        textAlign: 'center',
        textShadow: '0 0 20px #00f2ff',
        background: 'rgba(0, 0, 0, 0.95)',
        padding: '24px 48px',
        borderRadius: '12px',
        border: '3px solid #00f2ff',
        boxShadow: '0 0 30px #00f2ff'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🌍</div>
        <div>INITIALIZING OMNIVERSE...</div>
        <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>Loading planetary textures</div>
      </div>
    </Html>
  );
};

/**
 * Main Omniverse Dashboard
 */
export const OmniverseDashboard: React.FC = () => {
  const [planetaryData, setPlanetaryData] = useState<PlanetaryFeedData>({
	seismicEvents: [
	  { id: 's1', lat: 35.6762, lon: 139.6503, magnitude: 6.2, depth: 10, timestamp: Date.now(), location: 'Tokyo' },
	  { id: 's2', lat: -33.8688, lon: 151.2093, magnitude: 4.1, depth: 15, timestamp: Date.now(), location: 'Sydney' },
	  { id: 's3', lat: 37.7749, lon: -122.4194, magnitude: 3.8, depth: 8, timestamp: Date.now(), location: 'San Francisco' }
	],
	weatherEvents: [
	  { id: 'w1', lat: 25.7617, lon: -80.1918, type: 'hurricane', intensity: 0.8 },
	  { id: 'w2', lat: 19.4326, lon: -99.1332, type: 'storm', intensity: 0.6 }
	],
	tidalStress: 0.45,
	solarActivity: 0.62
  });

  const [peelBack, setPeelBack] = useState(false);
  const [alertPulse, setAlertPulse] = useState(false);

  // Handle major seismic events
  const handleMajorSeismicEvent = (event: SeismicEvent) => {
	const location = event.location || `${event.lat.toFixed(2)}°, ${event.lon.toFixed(2)}°`;
	const narration = `Signal Spike on LL151. Major seismic event detected near ${location}. Magnitude ${event.magnitude.toFixed(1)}. Adjusting Planetary Pulse priority.`;

	speakSovereign(narration);

	// Trigger visual pulse
	setAlertPulse(true);
	setTimeout(() => setAlertPulse(false), 3000);
  };

  // Handle double-click to toggle peel-back
  const handleDoubleClick = () => {
	setPeelBack(!peelBack);
	const narration = peelBack 
	  ? 'Restoring Earth surface layer. Node grid concealed.'
	  : 'Peeling back surface layer. Revealing LL151 through LL200 neural mesh. Fifty nodes now visible.';
	speakSovereign(narration);
  };

  return (
	<div 
	  style={{ 
		width: '100%', 
		height: '100%', 
		position: 'relative', 
		background: 'linear-gradient(180deg, #0a1628 0%, #050714 100%)'
	  }}
	  onDoubleClick={handleDoubleClick}
	>
	  {/* Loading indicator */}
	  <div
		style={{
		  position: 'absolute',
		  top: '50%',
		  left: '50%',
		  transform: 'translate(-50%, -50%)',
		  color: '#00f2ff',
		  fontSize: '48px',
		  fontWeight: 900,
		  textShadow: '0 0 40px #00f2ff',
		  zIndex: 5,
		  pointerEvents: 'none'
		}}
	  >
		🌍
	  </div>
	  {/* Alert Banner */}
	  {alertPulse && (
		<div
		  style={{
			position: 'absolute',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			background: 'rgba(139, 92, 246, 0.9)',
			border: '3px solid #8b5cf6',
			borderRadius: '16px',
			padding: '24px 48px',
			color: '#ffffff',
			fontWeight: 900,
			fontSize: '24px',
			textAlign: 'center',
			zIndex: 1000,
			boxShadow: '0 0 40px #8b5cf6',
			animation: 'pulse 1s ease-in-out infinite'
		  }}
		>
		  ⚠️ MAJOR SEISMIC EVENT ⚠️
		  <div style={{ fontSize: '16px', marginTop: '8px', fontWeight: 700 }}>
			LL151: SEISMIC_VEIL ALERT
		  </div>
		</div>
	  )}

	  {/* Info Panel */}
	  <div
		style={{
		  position: 'absolute',
		  top: '20px',
		  left: '20px',
		  background: 'rgba(11, 16, 33, 0.98)',
		  border: '3px solid #16a34a',
		  borderRadius: '16px',
		  padding: '20px',
		  color: '#ffffff',
		  fontFamily: 'Space Mono, monospace',
		  fontWeight: 900,
		  zIndex: 10,
		  maxWidth: '350px',
		  boxShadow: '0 0 30px rgba(22, 163, 74, 0.4)'
		}}
	  >
		<div style={{ fontSize: '22px', color: '#16a34a', marginBottom: '16px', textShadow: '0 0 10px #16a34a' }}>
		  🌍 OMNIVERSE
		</div>
		<div style={{ fontSize: '13px', display: 'grid', gap: '10px', fontWeight: 700 }}>
		  <div style={{ color: '#ffffff' }}>
			<strong style={{ color: '#00f2ff' }}>LL151 (SEISMIC_VEIL):</strong> {planetaryData.seismicEvents.length} active
		  </div>
		  <div style={{ color: '#ffffff' }}>
			<strong style={{ color: '#00f2ff' }}>LL152 (TIDAL_ECHO):</strong> {(planetaryData.tidalStress * 100).toFixed(0)}% stress
		  </div>
		  <div style={{ color: '#ffffff' }}>
			<strong style={{ color: '#00f2ff' }}>LL153 (ATMOS_FLARE):</strong> {planetaryData.weatherEvents.length} systems
		  </div>
		  <div style={{ color: '#ffffff' }}>
			<strong style={{ color: '#00f2ff' }}>LL154 (SOLAR_SPIKE):</strong> {(planetaryData.solarActivity * 100).toFixed(0)}% active
		  </div>
		  <div style={{ 
			marginTop: '12px', 
			paddingTop: '12px', 
			borderTop: '2px solid #00f2ff',
			color: '#ffffff'
		  }}>
			<strong style={{ color: peelBack ? '#8b5cf6' : '#00f2ff' }}>
			  {peelBack ? '🔓 NODE LAYER VISIBLE' : '🔒 SURFACE LAYER'}
			</strong>
		  </div>
		  <div style={{ fontSize: '11px', color: '#ffffff', marginTop: '6px', opacity: 0.8 }}>
			Double-click Earth to toggle node grid
		  </div>
		</div>
	  </div>

	  {/* Legend */}
	  <div
		style={{
		  position: 'absolute',
		  bottom: '20px',
		  left: '20px',
		  background: 'rgba(11, 16, 33, 0.98)',
		  border: '3px solid #16a34a',
		  borderRadius: '16px',
		  padding: '16px',
		  fontSize: '13px',
		  color: '#ffffff',
		  fontWeight: 700,
		  zIndex: 10,
		  boxShadow: '0 0 30px rgba(22, 163, 74, 0.4)'
		}}
	  >
		<div style={{ marginBottom: '10px', color: '#16a34a', fontSize: '16px', textShadow: '0 0 10px #16a34a' }}>LEGEND:</div>
		<div style={{ display: 'grid', gap: '6px', color: '#ffffff' }}>
		  <div><span style={{ color: '#ff0000', fontSize: '16px' }}>●</span> Major (M &gt; 6)</div>
		  <div><span style={{ color: '#ff6600', fontSize: '16px' }}>●</span> Moderate (M 4-6)</div>
		  <div><span style={{ color: '#ffaa00', fontSize: '16px' }}>●</span> Minor (M &lt; 4)</div>
		  <div style={{ marginTop: '4px' }}>🌀 Hurricane | ⛈️ Storm | 🌪️ Tornado | 🔥 Heat</div>
		</div>
	  </div>

	  {/* 3D Canvas */}
	  <Canvas style={{ background: 'linear-gradient(180deg, #0a1628 0%, #050714 100%)' }}>
		<PerspectiveCamera makeDefault position={[0, 0, 3]} fov={50} />

		{/* Lighting - Much Brighter */}
		<ambientLight intensity={0.8} />
		<directionalLight position={[5, 3, 5]} intensity={2.0} color="#ffffff" />
		<directionalLight position={[-5, -3, -5]} intensity={1.2} color="#00f2ff" />
		<pointLight position={[0, 5, 0]} intensity={1.0} color="#16a34a" />
		<pointLight position={[0, -5, 0]} intensity={0.8} color="#8b5cf6" />

		{/* Earth with Suspense fallback */}
		<Suspense fallback={<LoadingSpinner />}>
		  <RealisticEarth
			planetaryData={planetaryData}
			autoRotate={true}
			showMarkers={true}
			peelBack={peelBack}
			onMajorSeismicEvent={handleMajorSeismicEvent}
		  />
		</Suspense>
	  </Canvas>

	  <style>{`
		@keyframes pulse {
		  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
		  50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
		}

		@keyframes spin {
		  from { transform: rotate(0deg); }
		  to { transform: rotate(360deg); }
		}

		/* Ensure Canvas renders properly */
		canvas {
		  display: block !important;
		  background: transparent !important;
		}
	  `}</style>
	</div>
  );
};

export default OmniverseDashboard;
