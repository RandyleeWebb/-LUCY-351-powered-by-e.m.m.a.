/**
 * LUCY SOVEREIGN 351 - Level 6 AGI v8
 * Hexagonal Prism Navigator - The Sovereign Hex
 * 
 * Six specialized dashboards mapped to Lucy's 6-layer intelligence:
 * - FRONT: Lucy Chat Core (LL219, LL210)
 * - TOP: Omniverse/Earth (LL151-LL200)
 * - RIGHT: Builder Studio (LL251-LL325)
 * - LEFT: Signal Intelligence (LL206, LL212)
 * - BACK: DeltaVault Memory (LL215, LL283)
 * - BOTTOM: Ecosystem Scanner (LL189, LL196)
 */

// @ts-nocheck
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { speakSovereign } from '../../core/audio/VoiceManager';
import OmniverseDashboard from '../dashboards/OmniverseDashboard';
import { EcosystemDashboard } from '../dashboards/EcosystemDashboard';
import { agentEventBus } from '../../core/agents/AgentEventBus';
import LucyChatSovereignty from '../chat/LucyChatSovereignty';

// Helper function to execute sovereign actions
const executeSovereignAction = (action: string, params: Record<string, any> = {}) => {
  agentEventBus.publish('inter-agent', {
    agentId: 'lucy-sovereign',
    eventType: 'action.proposed',
    data: {
      action,
      params,
      source: 'hex-navigator'
    },
    timestamp: Date.now(),
    traceId: `hex-${Date.now()}`,
    sourceChannel: 'lucy',
    requiresResponse: false
  });
};

// Face identifiers
export type HexFace = 'CHAT' | 'EARTH' | 'BUILDER' | 'SIGNAL' | 'VAULT' | 'ECOSYSTEM';

interface HexFaceConfig {
  id: HexFace;
  label: string;
  position: [number, number, number];
  rotation: [number, number, number];
  nodes: string;
  color: string;
  narration: string;
}

/**
 * Hexagonal Prism Face Configuration
 * Each face is a specialized application dashboard
 */
const HEX_FACES: HexFaceConfig[] = [
  {
	id: 'CHAT',
	label: 'Lucy Chat Core',
	position: [0, 0, 3.5],
	rotation: [0, 0, 0],
	nodes: 'LL219, LL210',
	color: '#00f2ff',
	narration: 'Rotating to Chat Core. Sovereign Voice active. Goal stack is hot. Standing by for instruction.'
  },
  {
	id: 'EARTH',
	label: 'Omniverse',
	position: [0, 3.5, 0],
	rotation: [-Math.PI / 2, 0, 0],
	nodes: 'LL151-LL200',
	color: '#16a34a',
	narration: 'Rotating to Omniverse. LL151 Seismic Veil is active. Detecting real-time planetary feeds.'
  },
  {
	id: 'BUILDER',
	label: 'Builder Studio',
	position: [3.5, 0, 0],
	rotation: [0, Math.PI / 2, 0],
	nodes: 'LL251-LL325',
	color: '#f59e0b',
	narration: 'Rotating to Builder Studio. UE5.4 and FiveM bridges are hot. Standing by for code injection.'
  },
  {
	id: 'SIGNAL',
	label: 'Signal Intelligence',
	position: [-3.5, 0, 0],
	rotation: [0, -Math.PI / 2, 0],
	nodes: 'LL206, LL212',
	color: '#8b5cf6',
	narration: 'Rotating to Signal Intelligence. Cipher analysis active. Monitoring IoC entropy patterns.'
  },
  {
	id: 'VAULT',
	label: 'DeltaVault Memory',
	position: [0, 0, -3.5],
	rotation: [0, Math.PI, 0],
	nodes: 'LL215, LL283',
	color: '#ec4899',
	narration: 'Rotating to DeltaVault Memory. SQLite pattern history loaded. Dream insights available.'
  },
  {
	id: 'ECOSYSTEM',
	label: 'Ecosystem Scanner',
	position: [0, -3.5, 0],
	rotation: [Math.PI / 2, 0, 0],
	nodes: 'LL189, LL196',
	color: '#06b6d4',
	narration: 'Rotating to Ecosystem Scanner. NVIDIA GPU thermal monitor active. Toolchain scan complete.'
  }
];

/**
 * Individual Hex Face Component
 */
interface HexFaceProps {
  config: HexFaceConfig;
  isActive: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

const HexFacePanel: React.FC<HexFaceProps> = ({ config, isActive, onClick, children }) => {
  return (
	<group position={config.position} rotation={config.rotation}>
	  {/* Dashboard Plane - Only clickable when inactive (to rotate to it) */}
	  <mesh onClick={!isActive ? onClick : undefined}>
		<planeGeometry args={[6, 4.5]} />
		<meshStandardMaterial
		  color={isActive ? config.color : '#1e293b'}
		  transparent
		  opacity={isActive ? 0.95 : 0.2}
		  side={THREE.DoubleSide}
		  emissive={config.color}
		  emissiveIntensity={isActive ? 0.5 : 0.1}
		/>
	  </mesh>

	  {/* Border Glow */}
	  <lineSegments>
		<edgesGeometry attach="geometry" args={[new THREE.PlaneGeometry(6, 4.5)]} />
		<lineBasicMaterial
		  attach="material"
		  color={config.color}
		  linewidth={3}
		  transparent
		  opacity={isActive ? 1 : 0.3}
		/>
	  </lineSegments>

	  {/* Face Label */}
	  <Html
		transform
		distanceFactor={5}
		position={[0, 2, 0.05]}
		style={{
		  pointerEvents: 'none',
		  userSelect: 'none'
		}}
	  >
		<div
		  style={{
			color: isActive ? config.color : '#ffffff',
			fontSize: '24px',
			fontWeight: 900,
			letterSpacing: '2px',
			textAlign: 'center',
			textTransform: 'uppercase',
			textShadow: `0 0 20px ${config.color}`,
			fontFamily: 'Inter, system-ui, sans-serif'
		  }}
		>
		  {config.label}
		</div>
		<div
		  style={{
			color: isActive ? '#ffffff' : '#9aa4c7',
			fontSize: '12px',
			fontWeight: 600,
			textAlign: 'center',
			marginTop: '8px',
			fontFamily: 'monospace'
		  }}
		>
		  {config.nodes}
		</div>
	  </Html>

	  {/* Dashboard Content - ONLY visible and interactive when active */}
	  <Html
		transform
		distanceFactor={6}
		position={[0, -0.3, 0.05]}
		style={{
		  width: '1000px',
		  height: '650px',
		  display: isActive ? 'block' : 'none',
		  visibility: isActive ? 'visible' : 'hidden',
		  pointerEvents: isActive ? 'auto' : 'none'
		}}
	  >
		<div
		  style={{
			width: '100%',
			height: '100%',
			background: 'rgba(5, 8, 16, 0.98)',
			border: `2px solid ${config.color}`,
			borderRadius: '12px',
			padding: '28px',
			color: '#e8ecff',
			fontFamily: 'Inter, system-ui, sans-serif',
			overflowY: 'auto',
			overflowX: 'hidden',
			boxShadow: `0 0 40px ${config.color}40`
		  }}
		>
		  {children}
		</div>
	  </Html>
	</group>
  );
};

/**
 * Rotating Hexagonal Prism Group
 */
interface HexPrismProps {
  activeFace: HexFace;
  onFaceChange: (face: HexFace) => void;
  autoRotate: boolean;
  children: (face: HexFace) => React.ReactNode;
}

const HexPrism: React.FC<HexPrismProps> = ({ activeFace, onFaceChange, autoRotate, children }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [targetRotation, setTargetRotation] = useState<THREE.Euler>(new THREE.Euler(0, 0, 0));

  // Update target rotation when active face changes
  useEffect(() => {
	const faceConfig = HEX_FACES.find(f => f.id === activeFace);
	if (faceConfig && groupRef.current) {
	  // Invert rotation to bring face to front
	  const euler = new THREE.Euler(
		-faceConfig.rotation[0],
		-faceConfig.rotation[1],
		-faceConfig.rotation[2]
	  );
	  setTargetRotation(euler);
	}
  }, [activeFace]);

  // Smooth rotation animation
  useFrame((state, delta) => {
	if (groupRef.current) {
	  if (autoRotate) {
		groupRef.current.rotation.y += delta * 0.1;
	  } else {
		// Lerp to target rotation
		groupRef.current.rotation.x = THREE.MathUtils.lerp(
		  groupRef.current.rotation.x,
		  targetRotation.x,
		  delta * 3
		);
		groupRef.current.rotation.y = THREE.MathUtils.lerp(
		  groupRef.current.rotation.y,
		  targetRotation.y,
		  delta * 3
		);
		groupRef.current.rotation.z = THREE.MathUtils.lerp(
		  groupRef.current.rotation.z,
		  targetRotation.z,
		  delta * 3
		);
	  }
	}
  });

  return (
	<group ref={groupRef}>
	  {HEX_FACES.map(face => (
		<HexFacePanel
		  key={face.id}
		  config={face}
		  isActive={activeFace === face.id}
		  onClick={() => onFaceChange(face.id)}
		>
		  {children(face.id)}
		</HexFacePanel>
	  ))}
	</group>
  );
};

/**
 * Main Hexagonal Prism Navigator
 */
export const HexSovereignNavigator: React.FC = () => {
  const [activeFace, setActiveFace] = useState<HexFace>('CHAT');
  const [autoRotate, setAutoRotate] = useState(false);
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  // === SOVEREIGN PROTOCOL: VAULT REHYDRATION ===
  // On mount, restore Lucy's last known state from the Alpha Delta Vault
  useEffect(() => {
    const rehydrateFromVault = async () => {
      if (typeof window !== 'undefined' && window.sovereignAPI) {
        try {
          console.log('[HexNavigator] 🔄 Rehydrating from Alpha Delta Vault...');
          const state = await window.sovereignAPI.rehydrateState();

          if (state.activeFace) {
            const restoredFace = state.activeFace as HexFace;
            console.log(`[HexNavigator] ✅ Restored face: ${restoredFace}`);
            setActiveFace(restoredFace);
            speakSovereign(`Rehydration complete. Restoring ${restoredFace} dashboard from last session.`);
          } else {
            console.log('[HexNavigator] ℹ️ No saved state, starting fresh');
          }
        } catch (err) {
          console.error('[HexNavigator] ❌ Vault rehydration failed:', err);
        }
      }
    };

    rehydrateFromVault();
  }, []); // Run once on mount

  // Voice narration on face change - cancel previous speech and speak after rotation starts
  useEffect(() => {
	window.speechSynthesis.cancel();

	const faceConfig = HEX_FACES.find(f => f.id === activeFace);
	if (faceConfig) {
	  setTimeout(() => {
		speakSovereign(faceConfig.narration);
	  }, 500);
	}
  }, [activeFace]);

  const handleFaceChange = async (face: HexFace) => {
	setActiveFace(face);
	setAutoRotate(false);

	// === SOVEREIGN PROTOCOL: IMMUTABLE EVENT RECORDING ===
	// Every face change is written to the Alpha Delta Vault
	if (typeof window !== 'undefined' && window.sovereignAPI) {
	  try {
		await window.sovereignAPI.recordState('activeFace', face);
		console.log(`[HexNavigator] 📝 Recorded face change: ${face}`);
	  } catch (err) {
		console.error('[HexNavigator] ❌ Failed to record state:', err);
	  }
	}
  };

  const renderDashboard = (face: HexFace): React.ReactNode => {
	switch (face) {
	  case 'CHAT':
		return (
		  <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '8px' }}>
			<LucyChatSovereignty />
		  </div>
		);

	  case 'EARTH':
		return (
		  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
			<OmniverseDashboard />
		  </div>
		);

	  case 'BUILDER':
		return (
		  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
			{/* Header */}
			<div style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '12px' }}>
			  <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', margin: 0, marginBottom: '4px' }}>
				🛠️ Builder Studio
			  </h2>
			  <p style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>
				LL251-LL325 • UE5.4 & FiveM Bridges Active
			  </p>
			</div>

			{/* Status */}
			<div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '8px' }}>
			  <p style={{ color: '#e2e8f0', fontSize: '13px', margin: 0, marginBottom: '6px' }}>🎮 UE5.4 pipeline ready. FiveM bridge hot.</p>
			  <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>Standing by for code injection and build commands.</p>
			</div>

			  {/* Action Buttons */}
			  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
				<button
				  onClick={() => {
					executeSovereignAction('launch_application', {
					  tool: 'unreal_engine',
					  path: 'C:/Program Files/Epic Games/UE_5.4/Engine/Binaries/Win64/UnrealEditor.exe',
					  name: 'Unreal Engine 5.4'
					});
					speakSovereign("Initializing Unreal Engine 5.4 pipeline. Standby.");
				  }}
				  style={{
					padding: '12px',
					background: 'rgba(245, 158, 11, 0.1)',
					color: '#f59e0b',
					border: '1px solid rgba(245, 158, 11, 0.3)',
					borderRadius: '6px',
					fontSize: '11px',
					fontWeight: '600',
					textTransform: 'uppercase',
					letterSpacing: '1px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'; }}
				>
				  🎯 Launch UE5
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('launch_application', {
					  tool: 'fivem_builder',
					  path: 'C:/FXServer/FXServer.exe',
					  name: 'FiveM Resource Builder'
					});
					speakSovereign("FiveM resource builder activating. Lua generation pipeline hot.");
				  }}
				  style={{
					padding: '12px',
					background: 'rgba(245, 158, 11, 0.1)',
					color: '#f59e0b',
					border: '1px solid rgba(245, 158, 11, 0.3)',
					borderRadius: '6px',
					fontSize: '11px',
					fontWeight: '600',
					textTransform: 'uppercase',
					letterSpacing: '1px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'; }}
				>
				  🚗 FiveM
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('launch_application', {
					  tool: 'unity_hub',
					  path: 'C:/Program Files/Unity/Hub/Unity Hub.exe',
					  name: 'Unity Hub'
					});
					speakSovereign("Unity Hub initializing. C-sharp scaffolding ready.");
				  }}
				  style={{
					padding: '12px',
					background: 'rgba(100, 116, 139, 0.1)',
					color: '#94a3b8',
					border: '1px solid rgba(100, 116, 139, 0.3)',
					borderRadius: '6px',
					fontSize: '11px',
					fontWeight: '600',
					textTransform: 'uppercase',
					letterSpacing: '1px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'; e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'; e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)'; }}
				>
				  📦 Unity
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('open_runtime_control', {
					  tool: 'runtime_manager'
					});
					speakSovereign("Runtime control panel accessing. Process monitor active.");
				  }}
				  style={{
					padding: '12px',
					background: 'rgba(100, 116, 139, 0.1)',
					color: '#94a3b8',
					border: '1px solid rgba(100, 116, 139, 0.3)',
					borderRadius: '6px',
					fontSize: '11px',
					fontWeight: '600',
					textTransform: 'uppercase',
					letterSpacing: '1px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'; e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.5)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'; e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)'; }}
				>
				  🔧 Runtime
				</button>
			  </div>
		  </div>
		);

	  case 'SIGNAL':
		return (
		  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
			{/* Header */}
			<div style={{ borderBottom: '2px solid rgba(139, 92, 246, 0.3)', paddingBottom: '16px' }}>
			  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
				📡 SIGNAL INTELLIGENCE
			  </h2>
			  <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px' }}>
				Cipher Analysis • LL206, LL212 Monitoring
			  </p>
			</div>

			{/* Content */}
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
			  <div style={{ padding: '20px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px' }}>
				<p style={{ color: '#e2e8f0', marginBottom: '8px' }}>🔐 Cipher analysis active. IoC entropy patterns monitored.</p>
				<p style={{ color: '#94a3b8' }}>Threat detection and signal processing online.</p>
			  </div>

			  {/* Action Buttons */}
			  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
				<button
				  onClick={() => {
					executeSovereignAction('scan_threats', {
					  tool: 'security_scanner',
					  mode: 'full_system'
					});
					speakSovereign("Initiating full security threat scan. Eagle Eye monitoring active.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(139, 92, 246, 0.1)',
					color: '#8b5cf6',
					border: '2px solid rgba(139, 92, 246, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; }}
				>
				  🎯 Scan Threats
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('open_ioc_dashboard', {
					  tool: 'threat_intelligence'
					});
					speakSovereign("IoC dashboard loading. Indicators of Compromise database accessing.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(139, 92, 246, 0.1)',
					color: '#8b5cf6',
					border: '2px solid rgba(139, 92, 246, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)'; }}
				>
				  📊 IoC Dashboard
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('view_cipher_logs', {
					  tool: 'cipher_analyzer',
					  log_type: 'encrypted_traffic'
					});
					speakSovereign("Cipher logs accessed. Encrypted traffic analysis ready.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(100, 116, 139, 0.1)',
					color: '#94a3b8',
					border: '2px solid rgba(100, 116, 139, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'; }}
				>
				  🔍 Cipher Logs
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('start_threat_feed', {
					  tool: 'real_time_intelligence',
					  stream: true
					});
					speakSovereign("Real-time threat intelligence feed streaming. LL206 and LL212 monitoring.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(100, 116, 139, 0.1)',
					color: '#94a3b8',
					border: '2px solid rgba(100, 116, 139, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'; }}
				>
				  ⚡ Real-time Feed
				</button>
			  </div>
			</div>
		  </div>
		);

	  case 'VAULT':
		return (
		  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '24px' }}>
			{/* Header */}
			<div style={{ borderBottom: '2px solid rgba(236, 72, 153, 0.3)', paddingBottom: '16px' }}>
			  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
				🗄️ DELTAVAULT MEMORY
			  </h2>
			  <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px' }}>
				SQLite Pattern History • LL215, LL283 Dream Insights
			  </p>
			</div>

			{/* Content */}
			<div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
			  <div style={{ padding: '20px', background: 'rgba(236, 72, 153, 0.05)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px' }}>
				<p style={{ color: '#e2e8f0', marginBottom: '8px' }}>💾 Pattern history loaded. Dream insights available.</p>
				<p style={{ color: '#94a3b8' }}>Long-term memory and learning patterns accessible.</p>
			  </div>

			  {/* Action Buttons */}
			  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
				<button
				  onClick={() => {
					executeSovereignAction('browse_deltavault_memories', {
					  tool: 'memory_browser',
					  database: 'DeltaVault',
					  mode: 'browse'
					});
					speakSovereign("DeltaVault memory browser opening. Pattern history loading from SQLite.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(236, 72, 153, 0.1)',
					color: '#ec4899',
					border: '2px solid rgba(236, 72, 153, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'; }}
				>
				  📖 Browse Memories
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('view_dream_insights', {
					  tool: 'dream_analyzer',
					  neural_layers: ['LL215', 'LL283'],
					  analysis_type: 'pattern_insights'
					});
					speakSovereign("Dream insight analyzer loading. LL215 and LL283 dream patterns accessing.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(236, 72, 153, 0.1)',
					color: '#ec4899',
					border: '2px solid rgba(236, 72, 153, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'; }}
				>
				  🌙 Dream Insights
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('analyze_learning_patterns', {
					  tool: 'pattern_analyzer',
					  scope: 'learning_history',
					  database: 'DeltaVault'
					});
					speakSovereign("Learning pattern analyzer initiating. Historical data correlation running.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(100, 116, 139, 0.1)',
					color: '#94a3b8',
					border: '2px solid rgba(100, 116, 139, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'; }}
				>
				  📊 Pattern Analysis
				</button>
				<button
				  onClick={() => {
					executeSovereignAction('sync_deltavault_database', {
					  tool: 'database_sync',
					  database: 'DeltaVault',
					  sync_mode: 'full'
					});
					speakSovereign("DeltaVault database synchronization starting. Memory consolidation in progress.");
				  }}
				  style={{
					padding: '16px',
					background: 'rgba(100, 116, 139, 0.1)',
					color: '#94a3b8',
					border: '2px solid rgba(100, 116, 139, 0.3)',
					borderRadius: '8px',
					fontSize: '12px',
					fontWeight: 'bold',
					textTransform: 'uppercase',
					letterSpacing: '1.5px',
					cursor: 'pointer',
					transition: 'all 0.2s',
					fontFamily: 'monospace'
				  }}
				  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.2)'; }}
				  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(100, 116, 139, 0.1)'; }}
				>
				  🔄 Sync Database
				</button>
			  </div>
			</div>
		  </div>
		);

	  case 'ECOSYSTEM':
		return (
		  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
			{/* Header */}
			<div style={{ borderBottom: '2px solid rgba(6, 182, 212, 0.3)', paddingBottom: '16px' }}>
			  <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
				🔬 ECOSYSTEM SCANNER
			  </h2>
			  <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px' }}>
				GPU Thermal Monitor • LL189, LL196 Toolchain Active
			  </p>
			</div>

			{/* REAL LIVE SYSTEM MONITORING */}
			<div style={{ flex: 1, overflowY: 'auto' }}>
			  <EcosystemDashboard />
			</div>
		  </div>
		);

	  default:
		return null;
	}
  };

  return (
	<div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(180deg, #0a1628 0%, #050714 100%)' }}>
	  {/* Controls */}
	  <div
		style={{
		  position: 'absolute',
		  top: '20px',
		  left: '20px',
		  zIndex: 1000,
		  display: 'flex',
		  gap: '10px',
		  flexDirection: 'column'
		}}
	  >
		<div style={{ 
		  color: '#00f2ff', 
		  fontWeight: 900, 
		  fontSize: '24px', 
		  marginBottom: '10px',
		  textShadow: '0 0 20px #00f2ff'
		}}>
		  🔷 SOVEREIGN HEX
		</div>
		{HEX_FACES.map(face => (
		  <button
			key={face.id}
			onClick={() => handleFaceChange(face.id)}
			style={{
			  background: activeFace === face.id ? face.color : 'rgba(11, 16, 33, 0.9)',
			  color: '#fff',
			  border: `3px solid ${face.color}`,
			  borderRadius: '8px',
			  padding: '10px 16px',
			  fontWeight: 900,
			  fontSize: '14px',
			  cursor: 'pointer',
			  transition: 'all 0.3s',
			  textTransform: 'uppercase',
			  letterSpacing: '1px',
			  boxShadow: activeFace === face.id ? `0 0 30px ${face.color}` : `0 0 10px ${face.color}`
			}}
		  >
			{face.label}
		  </button>
		))}
		<button
		  onClick={() => setAutoRotate(!autoRotate)}
		  style={{
			background: autoRotate ? '#16a34a' : '#334155',
			color: '#fff',
			border: 'none',
			borderRadius: '8px',
			padding: '10px 16px',
			fontWeight: 700,
			cursor: 'pointer',
			marginTop: '10px'
		  }}
		>
		  {autoRotate ? '⏸ Stop' : '▶ Auto-Rotate'}
		</button>
	  </div>

	  {/* 3D Canvas */}
	  <Canvas>
		<PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />

		{/* High-intensity lighting */}
		<ambientLight intensity={1.5} />
		<pointLight position={[10, 10, 10]} intensity={2.5} color="#ffffff" />
		<pointLight position={[-10, -10, -10]} intensity={2.0} color="#00f2ff" />
		<spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#00f2ff" />
		<directionalLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" />

		{/* Hexagonal Prism */}
		<HexPrism
		  activeFace={activeFace}
		  onFaceChange={handleFaceChange}
		  autoRotate={autoRotate}
		>
		  {renderDashboard}
		</HexPrism>

		{/* Starfield background */}
		<Stars />
	  </Canvas>

	  {/* Voice Settings Panel */}
	  {openPanel === 'SETTINGS' && (
		<div style={{
		  position: 'fixed',
		  top: '50%',
		  left: '50%',
		  transform: 'translate(-50%, -50%)',
		  width: '500px',
		  height: '350px',
		  background: 'rgba(7, 16, 33, 0.98)',
		  border: '2px solid #94a3b8',
		  borderRadius: '12px',
		  padding: '24px',
		  zIndex: 2000,
		  boxShadow: '0 0 60px rgba(148, 163, 184, 0.3)',
		  display: 'flex',
		  flexDirection: 'column'
		}}>
		  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
			<h3 style={{ color: '#94a3b8', fontSize: '20px', fontWeight: '700', margin: 0 }}>⚙️ Voice Settings</h3>
			<button
			  onClick={() => setOpenPanel(null)}
			  style={{
				background: 'rgba(255, 0, 0, 0.2)',
				color: '#ff6b6b',
				border: '1px solid #ff6b6b',
				borderRadius: '6px',
				padding: '6px 12px',
				cursor: 'pointer',
				fontSize: '12px',
				fontWeight: '600'
			  }}
			>
			  ✕ Close
			</button>
		  </div>
		  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
			<div>
			  <label style={{ color: '#e8ecff', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Voice Volume</label>
			  <input type="range" min="0" max="100" defaultValue="80" style={{ width: '100%' }} />
			</div>
			<div>
			  <label style={{ color: '#e8ecff', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Voice Speed</label>
			  <input type="range" min="0" max="100" defaultValue="60" style={{ width: '100%' }} />
			</div>
			<div style={{ marginTop: '8px' }}>
			  <label style={{ color: '#e8ecff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
				<input type="checkbox" defaultChecked />
				Enable Sovereign Narration
			  </label>
			</div>
		  </div>
		</div>
	  )}
	</div>
  );
};

/**
 * Starfield background
 */
const Stars: React.FC = () => {
  const ref = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
	if (ref.current) {
	  ref.current.rotation.x -= delta / 10;
	  ref.current.rotation.y -= delta / 15;
	}
  });

  const [positions] = useState(() => {
	const positions = new Float32Array(5000 * 3);
	for (let i = 0; i < 5000; i++) {
	  positions[i * 3] = (Math.random() - 0.5) * 100;
	  positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
	  positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
	}
	return positions;
  });

  return (
	<points ref={ref}>
	  <bufferGeometry>
		<bufferAttribute
		  attach="attributes-position"
		  args={[positions, 3]}
		/>
	  </bufferGeometry>
	  <pointsMaterial size={0.05} color="#00f2ff" transparent opacity={0.6} />
	</points>
  );
};

export default HexSovereignNavigator;