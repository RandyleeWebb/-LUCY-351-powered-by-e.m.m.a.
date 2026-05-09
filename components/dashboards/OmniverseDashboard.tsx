import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { speakSovereign } from '../../core/audio/VoiceManager';

const EnhancedEarth: React.FC<{ peelBack: boolean }> = ({ peelBack }) => {
  const earthRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.LineSegments>(null);

  useFrame((_, delta) => {
    if (earthRef.current && !peelBack) {
      earthRef.current.rotation.y += delta * 0.1;
    }
    if (gridRef.current) {
      gridRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={earthRef}>
      {/* Outer atmosphere glow */}
      <Sphere args={[1.15, 32, 32]}>
        <meshBasicMaterial
          color="#00f2ff"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Mid atmosphere */}
      <Sphere args={[1.08, 32, 32]}>
        <meshBasicMaterial
          color="#16a34a"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main Earth sphere with realistic colors */}
      <Sphere args={[1, 64, 64]}>
        <meshStandardMaterial
          color="#1a5f7a"
          roughness={0.7}
          metalness={0.2}
          emissive="#0d3b4f"
          emissiveIntensity={0.3}
          transparent={peelBack}
          opacity={peelBack ? 0.15 : 1.0}
        />
      </Sphere>

      {/* Continent-like patches (simplified continents) */}
      {!peelBack && [
        { pos: [0.5, 0.3, 0.8], scale: 0.15, color: '#2d7a4f' },
        { pos: [-0.6, 0.4, 0.7], scale: 0.2, color: '#2d7a4f' },
        { pos: [0.3, -0.5, 0.8], scale: 0.18, color: '#2d7a4f' },
        { pos: [-0.4, -0.3, 0.85], scale: 0.12, color: '#2d7a4f' },
        { pos: [0.7, 0, 0.7], scale: 0.25, color: '#2d7a4f' },
        { pos: [-0.8, 0, 0.6], scale: 0.22, color: '#2d7a4f' }
      ].map((continent, i) => (
        <Sphere key={i} args={[continent.scale, 16, 16]} position={continent.pos as [number, number, number]}>
          <meshStandardMaterial
            color={continent.color}
            roughness={0.9}
            emissive="#16a34a"
            emissiveIntensity={0.1}
          />
        </Sphere>
      ))}

      {/* Latitude/Longitude grid lines */}
      <lineSegments ref={gridRef}>
        <edgesGeometry args={[new THREE.SphereGeometry(1.02, 24, 24)]} />
        <lineBasicMaterial color="#00f2ff" transparent opacity={0.3} />
      </lineSegments>

      {/* Equator line (bright) */}
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[1.03, 0.005, 16, 100]} />
        <meshBasicMaterial color="#00f2ff" />
      </mesh>

      {/* Polar circles */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.7, 0]}>
        <torusGeometry args={[0.7, 0.003, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.7, 0]}>
        <torusGeometry args={[0.7, 0.003, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
      </mesh>

      {/* Seismic event markers */}
      {[
        { pos: [0.7, 0.5, 0.5], color: '#ff0000', size: 0.03 },
        { pos: [-0.6, -0.4, 0.7], color: '#ff6600', size: 0.025 },
        { pos: [0.3, 0.8, 0.3], color: '#ffaa00', size: 0.02 }
      ].map((marker, i) => (
        <group key={i}>
          <Sphere args={[marker.size, 16, 16]} position={marker.pos as [number, number, number]}>
            <meshBasicMaterial color={marker.color} />
          </Sphere>
          <mesh position={marker.pos as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[marker.size * 1.5, marker.size * 2, 32]} />
            <meshBasicMaterial color={marker.color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={1.5}
        maxDistance={5}
        autoRotate={!peelBack}
        autoRotateSpeed={0.3}
      />
    </group>
  );
};

export const OmniverseDashboard: React.FC = () => {
  const [peelBack, setPeelBack] = useState(false);

  const handleDoubleClick = () => {
    setPeelBack(!peelBack);
    speakSovereign(peelBack ? 'Restoring Earth surface layer.' : 'Peeling back surface. Revealing LL151 through LL200 neural mesh.');
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
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(11, 16, 33, 0.98)',
        border: '3px solid #16a34a',
        borderRadius: '16px',
        padding: '20px',
        color: '#ffffff',
        fontWeight: 900,
        zIndex: 10,
        maxWidth: '350px',
        boxShadow: '0 0 30px rgba(22, 163, 74, 0.4)'
      }}>
        <div style={{ fontSize: '22px', color: '#16a34a', marginBottom: '16px', textShadow: '0 0 10px #16a34a' }}>
          🌍 OMNIVERSE - LL151-200
        </div>
        <div style={{ fontSize: '13px', display: 'grid', gap: '10px' }}>
          <div><strong style={{ color: '#00f2ff' }}>LL151 (SEISMIC_VEIL):</strong> 3 events active</div>
          <div><strong style={{ color: '#00f2ff' }}>LL152 (TIDAL_ECHO):</strong> 45% stress</div>
          <div><strong style={{ color: '#00f2ff' }}>LL153 (ATMOS_FLARE):</strong> 2 weather systems</div>
          <div><strong style={{ color: '#00f2ff' }}>LL154 (SOLAR_SPIKE):</strong> 62% activity</div>
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #00f2ff' }}>
            <strong style={{ color: peelBack ? '#8b5cf6' : '#00f2ff' }}>
              {peelBack ? '🔓 NEURAL MESH VISIBLE' : '🔒 SURFACE LAYER'}
            </strong>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
            Double-click Earth to toggle layers
          </div>
        </div>
      </div>

      <div style={{
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
      }}>
        <div style={{ marginBottom: '10px', color: '#16a34a', fontSize: '16px', textShadow: '0 0 10px #16a34a' }}>LEGEND:</div>
        <div style={{ display: 'grid', gap: '6px' }}>
          <div><span style={{ color: '#ff0000', fontSize: '16px' }}>●</span> Major (M &gt; 6)</div>
          <div><span style={{ color: '#ff6600', fontSize: '16px' }}>●</span> Moderate (M 4-6)</div>
          <div><span style={{ color: '#ffaa00', fontSize: '16px' }}>●</span> Minor (M &lt; 4)</div>
          <div><span style={{ color: '#00f2ff' }}>━━</span> Grid Lines</div>
          <div><span style={{ color: '#2d7a4f' }}>▣</span> Landmass</div>
        </div>
      </div>

      <Canvas style={{ width: '100%', height: '100%' }}>
        <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={50} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1.8} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={1.2} color="#00f2ff" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#16a34a" />
        <pointLight position={[0, -5, 0]} intensity={0.6} color="#8b5cf6" />
        <EnhancedEarth peelBack={peelBack} />
      </Canvas>
    </div>
  );
};

export default OmniverseDashboard;
