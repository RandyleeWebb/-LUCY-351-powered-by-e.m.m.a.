/**
 * MAIN DASHBOARD — LUCY SOVEREIGN 351
 * ===================================
 * Primary dashboard with NodeMatrixView and LucyChatSovereignty
 */

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Cpu, Shield, Activity } from 'lucide-react';
import NodeMatrixView from './NodeMatrixView';
import LucyChatSovereignty from '../chat/LucyChatSovereignty';

export default function MainDashboard() {
  const [initialized, setInitialized] = useState(false);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

  // Initialize Lucy's voice on first user interaction
  useEffect(() => {
	const initAudio = async () => {
	  if (!initialized && typeof window !== 'undefined' && 'speechSynthesis' in window) {
		try {
		  // This requires user gesture (Chrome policy)
		  const utterance = new SpeechSynthesisUtterance('Sovereign systems initialized. Scanning ecosystem.');
		  utterance.rate = 0.9;
		  utterance.pitch = 1.0;
		  window.speechSynthesis.speak(utterance);
		  setInitialized(true);
		} catch (error) {
		  console.log('Voice initialization requires user gesture');
		}
	  }
	};

	// Auto-initialize on mount (will only work if user already interacted)
	initAudio();

	// Also try on first click anywhere
	const handleFirstClick = () => {
	  initAudio();
	  document.removeEventListener('click', handleFirstClick);
	};
	document.addEventListener('click', handleFirstClick);

	return () => document.removeEventListener('click', handleFirstClick);
  }, [initialized]);

  // Monitor system health (placeholder - would connect to HardwareMonitor)
  useEffect(() => {
	// TODO: Connect to HardwareMonitor
	// const interval = setInterval(() => {
	//   const stats = hardwareMonitor.getCurrentStats();
	//   if (stats.systemLoadPressure > 0.85) setSystemHealth('critical');
	//   else if (stats.systemLoadPressure > 0.70) setSystemHealth('degraded');
	//   else setSystemHealth('healthy');
	// }, 5000);
	// return () => clearInterval(interval);
  }, []);

  const healthColor = {
	healthy: 'text-green-400',
	degraded: 'text-yellow-400',
	critical: 'text-red-400'
  }[systemHealth];

  return (
	<div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden">

	  {/* Top Navigation Bar */}
	  <div className="h-14 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950 backdrop-blur-md z-20 shadow-lg">
		<div className="flex items-center gap-3">
		  <Cpu className="w-5 h-5 text-cyan-400" />
		  <h1 className="text-sm font-black tracking-widest text-slate-200">
			LUCY<span className="text-cyan-400">SOVEREIGN</span> 351
		  </h1>
		</div>

		<div className="flex items-center gap-4 text-xs font-mono text-slate-500">
		  <div className="flex items-center gap-1">
			<Shield className="w-3 h-3 text-green-400"/> 
			<span>PRODUCTION MODE</span>
		  </div>
		  <div className="flex items-center gap-1">
			<Activity className={`w-3 h-3 ${healthColor}`} />
			<span className={healthColor}>{systemHealth.toUpperCase()}</span>
		  </div>
		  <div>v5.0.0</div>
		</div>
	  </div>

	  {/* Main Content Area */}
	  <div className="flex-1 flex overflow-hidden">

		{/* Left Panel: Node Matrix View (70%) */}
		<div className="flex-1 p-4 overflow-auto">
		  <NodeMatrixView />
		</div>

		{/* Right Panel: Lucy Chat Sovereignty (30%) */}
		<div className="w-[400px] border-l border-slate-800 flex flex-col">
		  <LucyChatSovereignty />
		</div>

	  </div>

	  {/* Bottom Status Bar */}
	  <div className="h-8 border-t border-slate-800 flex items-center px-6 bg-slate-950 text-xs font-mono text-slate-500">
		<div className="flex items-center gap-6">
		  <span>351 NODES ACTIVE</span>
		  <span>•</span>
		  <span>EMMA: ONLINE</span>
		  <span>•</span>
		  <span>OLLAMA: {initialized ? 'READY' : 'INITIALIZING'}</span>
		  <span>•</span>
		  <span>SANDBOX: C:\LucySandbox</span>
		</div>
	  </div>

	</div>
  );
}
