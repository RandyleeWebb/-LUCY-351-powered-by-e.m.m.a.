/**
 * LUCY SOVEREIGN - Real Ecosystem Scanner Dashboard
 * Shows LIVE system resources, not static text
 */

import React, { useState, useEffect } from 'react';
import { systemMonitor, type SystemResources } from '../../core/monitoring/SystemMonitor';

export const EcosystemDashboard: React.FC = () => {
  const [resources, setResources] = useState<SystemResources | null>(null);
  const [kernelOnline, setKernelOnline] = useState(false);

  useEffect(() => {
	// === SOVEREIGN PROTOCOL: CORE TICK SYNC ===
	// 100ms updates from Alpha Delta Vault hardware truth
	systemMonitor.start();

	// Subscribe to updates
	const unsubscribe = systemMonitor.subscribe((res) => {
	  setResources(res);
	  // If we're getting real data (not all zeros), kernel is online
	  setKernelOnline(res.cpu.cores > 0);
	});

	// Check if Sovereign Kernel is available
	setKernelOnline(typeof window !== 'undefined' && !!window.sovereignAPI);

	return () => {
	  unsubscribe();
	  systemMonitor.stop();
	};
  }, []);

  if (!resources) {
	return (
	  <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>
		🔄 Initializing system monitor...
	  </div>
	);
  }

  const { cpu, memory, gpu, network } = resources;

  return (
	<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
	  {/* Sovereign Kernel Status Banner */}
	  <div
		style={{
		  padding: '12px',
		  background: kernelOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
		  border: `1px solid ${kernelOnline ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
		  borderRadius: '8px',
		  display: 'flex',
		  alignItems: 'center',
		  gap: '8px',
		  fontSize: '11px',
		  color: kernelOnline ? '#22c55e' : '#ef4444'
		}}
	  >
		<span>{kernelOnline ? '✅' : '⚠️'}</span>
		<span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
		  {kernelOnline
			? 'SOVEREIGN KERNEL ONLINE • Hardware truth via IPC bridge • 100ms Core Tick'
			: 'SOVEREIGN KERNEL OFFLINE • Launch Lucy via START_LUCY.bat for hardware truth'}
		</span>
	  </div>

	  {/* CPU */}
	  <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px' }}>
		<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
		  <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: '14px' }}>🖥️ CPU</span>
		  <span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>
			{cpu.usage.toFixed(1)}%
		  </span>
		</div>
		<div style={{ width: '100%', height: '6px', background: 'rgba(100, 116, 139, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
		  <div
			style={{
			  width: `${cpu.usage}%`,
			  height: '100%',
			  background: `linear-gradient(90deg, #06b6d4, #3b82f6)`,
			  transition: 'width 0.5s ease'
			}}
		  />
		</div>
		<div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
		  <span>{cpu.cores} cores</span>
		  <span>{cpu.speed} GHz</span>
		</div>
	  </div>

	  {/* Memory */}
	  <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px' }}>
		<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
		  <span style={{ color: '#8b5cf6', fontWeight: 700, fontSize: '14px' }}>💾 RAM</span>
		  <span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>
			{memory.used.toFixed(1)} / {memory.total.toFixed(1)} GB
		  </span>
		</div>
		<div style={{ width: '100%', height: '6px', background: 'rgba(100, 116, 139, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
		  <div
			style={{
			  width: `${memory.percent}%`,
			  height: '100%',
			  background: `linear-gradient(90deg, #8b5cf6, #ec4899)`,
			  transition: 'width 0.5s ease'
			}}
		  />
		</div>
		<div style={{ marginTop: '8px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
		  {memory.available.toFixed(1)} GB available • {memory.percent.toFixed(1)}% used
		</div>
	  </div>

	  {/* GPU */}
	  {gpu && (
		<div style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px' }}>
		  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
			<span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '14px' }}>🎮 {gpu.name}</span>
			<span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}>
			  {gpu.temperature.toFixed(1)}°C
			</span>
		  </div>
		  <div style={{ width: '100%', height: '6px', background: 'rgba(100, 116, 139, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
			<div
			  style={{
				width: `${gpu.usage}%`,
				height: '100%',
				background: `linear-gradient(90deg, #f59e0b, #ef4444)`,
				transition: 'width 0.5s ease'
			  }}
			/>
		  </div>
		  <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
			<span>{gpu.usage.toFixed(1)}% usage</span>
			<span>{gpu.memory} GB VRAM</span>
		  </div>
		</div>
	  )}

	  {/* Network */}
	  <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px' }}>
		<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
		  <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '14px' }}>🌐 Network</span>
		</div>
		<div style={{ display: 'flex', gap: '24px', fontSize: '12px', fontFamily: 'monospace' }}>
		  <div>
			<div style={{ color: '#94a3b8', marginBottom: '4px' }}>⬇️ Download</div>
			<div style={{ color: '#e2e8f0', fontWeight: 700 }}>{network.rx.toFixed(2)} MB/s</div>
		  </div>
		  <div>
			<div style={{ color: '#94a3b8', marginBottom: '4px' }}>⬆️ Upload</div>
			<div style={{ color: '#e2e8f0', fontWeight: 700 }}>{network.tx.toFixed(2)} MB/s</div>
		  </div>
		</div>
	  </div>

	  {/* Last Update */}
	  <div style={{ textAlign: 'center', fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
		Last update: {new Date(resources.timestamp).toLocaleTimeString()}
	  </div>
	</div>
  );
};
