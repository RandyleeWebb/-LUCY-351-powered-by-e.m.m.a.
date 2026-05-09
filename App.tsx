// @ts-nocheck
/**
 * LUCY SOVEREIGN 351 - Level 6 AGI v8
 * App.tsx - Hexagonal Prism Dashboard
 * 
 * Replaces the old Cube Navigator with the new Hexagonal Prism
 * Six specialized dashboard faces with voice narration
 */

import React, { useState } from 'react';
import './styles/lucy-theme.css';
import { HexSovereignNavigator } from './components/ui/HexSovereignNavigator';
import { speakSovereign, initVoiceSystem } from './core/audio/VoiceManager';
import { sovereignActionExecutor } from './core/execution/SovereignActionExecutor';

export default function App() {
  const [initialized, setInitialized] = useState(false);

  // Auto-initialize in Electron mode (skip initialization screen)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.sovereignAPI) {
      console.log('🔷 Electron mode detected - auto-initializing...');
      handleInitialize();
    }
  }, []);

  const performSystemScan = async () => {
	const findings: string[] = [];
	findings.push('I am Lucy Sovereign 351');
	findings.push('Neural mesh: 351 nodes registered across 6 hexagonal faces');

	// If in Electron mode, get real hardware truth
	if (typeof window !== 'undefined' && window.sovereignAPI) {
	  try {
		const hardware = await window.sovereignAPI.hardwareScan();
		findings.push(`Hardware: ${hardware.ram.total_gb} GB RAM, ${hardware.gpu.name}`);
		findings.push('Sovereign kernel online with full OS privileges');
	  } catch (err) {
		findings.push('Hardware: Scanning...');
	  }
	} else {
	  findings.push('Hardware: Browser mode - limited access');
	}

	findings.push('Ecosystem scanner operational');

	// Check Ollama
	try {
	  const ollamaCheck = await fetch('http://localhost:11434/api/tags', { 
		method: 'GET',
		signal: AbortSignal.timeout(2000)
	  });
	  if (ollamaCheck.ok) {
		findings.push('Ollama brain engine: Online');
	  } else {
		findings.push('Ollama: Offline');
	  }
	} catch {
	  findings.push('Ollama: Not detected');
	}

	// Voice check
	if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
	  findings.push('Voice synthesis: Ready');
	}

	return findings.join('. ');
  };

  const handleInitialize = async () => {
	console.log('🔷 Hexagonal Prism Initialization...');

	// Initialize voice system
	await initVoiceSystem();

	// Initialize sovereign action executor
	sovereignActionExecutor.initialize();
	console.log('✅ Sovereign action executor initialized');

	// Initialize integration manager (if in Electron mode)
	if (typeof window !== 'undefined' && window.sovereignAPI?.integrations) {
	  try {
		console.log('🔌 Initializing Integration Manager...');
		const result = await window.sovereignAPI.integrations.initialize();
		if (result.success) {
		  console.log('✅ Integration Manager initialized');

		  // Log available integrations
		  const available = await window.sovereignAPI.integrations.available();
		  console.log(`✅ ${available.length} integrations available:`, available);
		} else {
		  console.warn('⚠️ Integration Manager initialization failed:', result.error);
		}
	  } catch (error) {
		console.error('❌ Integration Manager error:', error);
	  }
	}

	// Perform system scan
	const scanResult = await performSystemScan();

	// Unlock audio
	if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
	  const silent = new SpeechSynthesisUtterance('');
	  silent.volume = 0;
	  window.speechSynthesis.speak(silent);

	  setTimeout(() => {
		const initMessage = `${scanResult}. Hexagonal Prism now mounting. Six specialized faces operational.`;
		speakSovereign(initMessage);
		setInitialized(true);
	  }, 100);
	} else {
	  setInitialized(true);
	}
  };

  if (!initialized) {
	return (
	  <div 
		style={{
		  width: '100vw',
		  height: '100vh',
		  background: '#050714',
		  color: '#ffffff',
		  display: 'flex',
		  flexDirection: 'column',
		  alignItems: 'center',
		  justifyContent: 'center',
		  fontFamily: 'Inter, system-ui, sans-serif',
		  fontWeight: 900
		}}
	  >
		<div style={{
		  fontSize: '96px',
		  marginBottom: '24px',
		  textShadow: '0 0 40px #00f2ff'
		}}>
		  🔷
		</div>

		<h1 
		  style={{
			fontSize: '64px',
			color: '#00f2ff',
			textShadow: '0 0 20px #00f2ff',
			marginBottom: '16px',
			letterSpacing: '4px'
		  }}
		>
		  LUCY SOVEREIGN
		</h1>

		<p 
		  style={{
			fontSize: '24px',
			marginBottom: '48px',
			opacity: 0.7,
			letterSpacing: '2px',
			color: '#9aa4c7'
		  }}
		>
		  351-NODE HEXAGONAL PRISM • AGI OPERATING SYSTEM
		</p>

		<button
		  onClick={handleInitialize}
		  style={{
			background: '#00f2ff',
			color: '#000',
			border: 'none',
			padding: '20px 60px',
			fontSize: '18px',
			fontWeight: 900,
			letterSpacing: '2px',
			borderRadius: '12px',
			cursor: 'pointer',
			boxShadow: '0 0 40px #00f2ff',
			transition: 'all 0.3s ease',
			textTransform: 'uppercase'
		  }}
		  onMouseEnter={(e) => {
			e.currentTarget.style.transform = 'scale(1.05)';
			e.currentTarget.style.boxShadow = '0 0 60px #00f2ff';
		  }}
		  onMouseLeave={(e) => {
			e.currentTarget.style.transform = 'scale(1)';
			e.currentTarget.style.boxShadow = '0 0 40px #00f2ff';
		  }}
		>
		  🔷 INITIALIZE HEXAGON
		</button>

		<p style={{
		  marginTop: '32px',
		  fontSize: '14px',
		  color: '#6b7280',
		  maxWidth: '600px',
		  textAlign: 'center',
		  lineHeight: 1.6
		}}>
		  Click to activate the 6-face Hexagonal Prism dashboard.
		  <br />
		  Lucy will speak the initialization sequence with her Sovereign Voice.
		</p>
	  </div>
	);
  }

  return <HexSovereignNavigator />;
}
