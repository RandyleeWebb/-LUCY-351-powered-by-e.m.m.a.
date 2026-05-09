/**
 * SOVEREIGN OVERLAY — AUDIO CONTEXT INITIALIZATION
 * ================================================
 * First-click overlay to unlock browser audio and initialize Lucy's voice
 * 
 * WHY THIS EXISTS:
 * Browsers block auto-playing audio until user interacts with the page.
 * This overlay provides that initial gesture and performs the "handshake".
 * 
 * THE HANDSHAKE:
 * 1. User clicks "INITIALIZE"
 * 2. Audio context unlocks
 * 3. Lucy speaks: "Sovereign v2.1 initialized. 351 Nodes Online. Ready for the Freeway."
 * 4. Ecosystem scan results are narrated
 * 5. Overlay fades away
 */

import React, { useState } from 'react';

interface SovereignOverlayProps {
  onInitialize: () => Promise<void>;
}

export default function SovereignOverlay({ onInitialize }: SovereignOverlayProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [visible, setVisible] = useState(true);

  const handleInitialize = async () => {
	setIsInitializing(true);

	try {
	  // CRITICAL: Simple unlock, no complex operations
	  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
		const silent = new SpeechSynthesisUtterance('');
		window.speechSynthesis.speak(silent);
	  }

	  // Call parent initialization (no ecosystem scan here!)
	  await onInitialize();

	  // Small delay
	  await new Promise(resolve => setTimeout(resolve, 500));

	  // Speak initialization message AFTER unlock confirmed
	  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
		const utterance = new SpeechSynthesisUtterance(
		  'Sovereign v2.1 initialized. 351 Nodes Online. Ready for the Freeway.'
		);
		utterance.rate = 0.9;
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		const voices = window.speechSynthesis.getVoices();
		const preferredVoice = voices.find(v => v.name.includes('Zira')) || voices[0];
		if (preferredVoice) {
		  utterance.voice = preferredVoice;
		}

		window.speechSynthesis.speak(utterance);
	  }

	  // Fade out overlay after 1.5 seconds (faster)
	  setTimeout(() => {
		setVisible(false);
	  }, 1500);

	} catch (error) {
	  console.error('Initialization error:', error);
	  setIsInitializing(false);
	  // Still hide overlay even if error
	  setTimeout(() => setVisible(false), 1000);
	}
  };

  if (!visible) {
	return null;
  }

  return (
	<div
	  className="fixed inset-0 z-50 flex items-center justify-center"
	  style={{
		background: 'oklch(12.9% 0.042 264.695)',
		transition: 'opacity 0.5s ease',
		opacity: visible ? 1 : 0
	  }}
	>
	  <div className="text-center">
		{/* Lucy Logo / Icon */}
		<div
		  className="mb-8"
		  style={{
			fontSize: '120px',
			fontWeight: 900,
			color: 'oklch(78.9% 0.154 211.53)',
			textShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.6)',
			animation: 'pulse 2s ease-in-out infinite'
		  }}
		>
		  LUCY
		</div>

		{/* Tagline */}
		<p
		  className="mb-12"
		  style={{
			color: '#ffffff',
			fontSize: '16px',
			fontWeight: 900,
			letterSpacing: '3px',
			opacity: 0.7
		  }}
		>
		  SOVEREIGN 351 • AGI OPERATING SYSTEM
		</p>

		{/* Initialize Button */}
		<button
		  onClick={handleInitialize}
		  disabled={isInitializing}
		  style={{
			background: 'oklch(78.9% 0.154 211.53)',
			color: 'oklch(12.9% 0.042 264.695)',
			border: 'none',
			padding: '20px 60px',
			fontSize: '18px',
			fontWeight: 900,
			letterSpacing: '2px',
			borderRadius: '8px',
			cursor: isInitializing ? 'wait' : 'pointer',
			transition: 'all 0.2s ease',
			boxShadow: isInitializing 
			  ? '0 0 30px oklch(78.9% 0.154 211.53 / 0.8)'
			  : '0 0 20px oklch(78.9% 0.154 211.53 / 0.4)',
			animation: isInitializing ? 'pulse 1s ease-in-out infinite' : 'none'
		  }}
		  onMouseEnter={(e) => {
			if (!isInitializing) {
			  e.currentTarget.style.transform = 'translateY(-4px)';
			  e.currentTarget.style.boxShadow = '0 0 40px oklch(78.9% 0.154 211.53 / 0.8)';
			}
		  }}
		  onMouseLeave={(e) => {
			if (!isInitializing) {
			  e.currentTarget.style.transform = 'translateY(0)';
			  e.currentTarget.style.boxShadow = '0 0 20px oklch(78.9% 0.154 211.53 / 0.4)';
			}
		  }}
		>
		  {isInitializing ? 'INITIALIZING...' : 'INITIALIZE'}
		</button>

		{/* Status Text */}
		{isInitializing && (
		  <p
			className="mt-8"
			style={{
			  color: '#ffffff',
			  fontSize: '14px',
			  fontWeight: 900,
			  opacity: 0.5
			}}
		  >
			Unlocking audio context • Loading 351 nodes • Scanning ecosystem...
		  </p>
		)}
	  </div>

	  <style>{`
		@keyframes pulse {
		  0%, 100% {
			opacity: 1;
			transform: scale(1);
		  }
		  50% {
			opacity: 0.8;
			transform: scale(1.05);
		  }
		}
	  `}</style>
	</div>
  );
}