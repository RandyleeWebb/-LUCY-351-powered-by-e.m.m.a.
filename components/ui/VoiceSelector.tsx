/**
 * VOICE SELECTOR COMPONENT - NEURAL VOICE SYSTEM
 * ===============================================
 * Dropdown to pick Lucy's voice with neural/premium voice prioritization.
 * Integrates with VoiceManager for Sovereign tuning and persistence.
 */

import React, { useState, useEffect } from 'react';
import { 
  initVoiceSystem, 
  VoiceProfile, 
  speakSovereign, 
  saveVoiceSelection, 
  getSavedVoice 
} from '../../core/audio/VoiceManager';

interface VoiceSelectorProps {
  onVoiceSelected?: (voiceName: string) => void;
}

export default function VoiceSelector({ onVoiceSelected }: VoiceSelectorProps) {
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
	// Try to load voices immediately
	const loadVoices = async () => {
	  const availableVoices = await initVoiceSystem();
	  if (availableVoices.length > 0) {
		setVoices(availableVoices);
		setIsInitialized(true);

		// Auto-select: 1) Saved voice, 2) Neural voice, 3) Zira, 4) First
		const savedVoice = getSavedVoice();
		if (savedVoice && availableVoices.find(v => v.name === savedVoice)) {
		  setSelectedVoice(savedVoice);
		  onVoiceSelected?.(savedVoice);
		} else {
		  const neuralVoice = availableVoices.find(v => v.isNeural);
		  const ziraVoice = availableVoices.find(v => v.name.includes('Zira'));
		  const autoSelect = neuralVoice || ziraVoice || availableVoices[0];

		  if (autoSelect) {
			setSelectedVoice(autoSelect.name);
			onVoiceSelected?.(autoSelect.name);
		  }
		}
	  }
	};

	loadVoices();
  }, [onVoiceSelected]);

  const handleInitVoices = async () => {
	setIsLoading(true);
	const availableVoices = await initVoiceSystem();
	setVoices(availableVoices);
	setIsInitialized(true);
	setIsLoading(false);

	if (availableVoices.length > 0) {
	  const neuralVoice = availableVoices.find(v => v.isNeural);
	  const autoSelect = neuralVoice || availableVoices[0];
	  setSelectedVoice(autoSelect.name);
	  onVoiceSelected?.(autoSelect.name);
	}
  };

  const testVoice = () => {
	if (selectedVoice) {
	  speakSovereign(
		'Lucy Sovereign voice test. Neural synthesis online. This is my selected voice configuration.',
		selectedVoice
	  );
	}
  };

  const handleVoiceChange = (voiceName: string) => {
	setSelectedVoice(voiceName);
	saveVoiceSelection(voiceName);
	onVoiceSelected?.(voiceName);
  };

  if (!isInitialized || voices.length === 0) {
	return (
	  <div style={{
		padding: '16px',
		background: 'oklch(18% 0.02 240)',
		borderRadius: '8px',
		border: '2px solid oklch(78.9% 0.154 211.53 / 0.3)'
	  }}>
		<div style={{
		  fontSize: '12px',
		  fontWeight: 900,
		  color: 'oklch(78.9% 0.154 211.53)',
		  marginBottom: '12px',
		  letterSpacing: '1px'
		}}>
		  🎙️ VOICE ENGINE
		</div>
		<button
		  onClick={handleInitVoices}
		  disabled={isLoading}
		  style={{
			width: '100%',
			background: 'oklch(78.9% 0.154 211.53)',
			color: 'oklch(12.9% 0.042 264.695)',
			border: 'none',
			padding: '12px',
			borderRadius: '6px',
			fontSize: '13px',
			fontWeight: 900,
			cursor: isLoading ? 'wait' : 'pointer',
			letterSpacing: '1px',
			opacity: isLoading ? 0.6 : 1
		  }}
		>
		  {isLoading ? '⏳ INITIALIZING...' : '⚡ INITIALIZE VOICE ENGINE'}
		</button>
	  </div>
	);
  }

  const neuralVoices = voices.filter(v => v.isNeural);
  const standardVoices = voices.filter(v => !v.isNeural);

  return (
	<div style={{
	  padding: '16px',
	  background: 'oklch(18% 0.02 240)',
	  borderRadius: '8px',
	  border: '2px solid oklch(78.9% 0.154 211.53 / 0.3)'
	}}>
	  <div style={{
		fontSize: '12px',
		fontWeight: 900,
		color: 'oklch(78.9% 0.154 211.53)',
		marginBottom: '12px',
		letterSpacing: '1px'
	  }}>
		🗣️ LUCY VOICE SELECT
	  </div>

	  <select
		value={selectedVoice}
		onChange={(e) => handleVoiceChange(e.target.value)}
		style={{
		  width: '100%',
		  background: 'oklch(12.9% 0.042 264.695)',
		  color: '#ffffff',
		  border: '2px solid oklch(78.9% 0.154 211.53 / 0.3)',
		  borderRadius: '6px',
		  padding: '10px',
		  fontSize: '13px',
		  fontWeight: 900,
		  marginBottom: '12px',
		  cursor: 'pointer'
		}}
	  >
		{neuralVoices.length > 0 && (
		  <optgroup label="🌟 NEURAL VOICES (Premium Quality)">
			{neuralVoices.map((voice, i) => (
			  <option key={i} value={voice.name}>
				✨ {voice.name} {voice.lang ? `(${voice.lang})` : ''}
			  </option>
			))}
		  </optgroup>
		)}
		{standardVoices.length > 0 && (
		  <optgroup label="📢 STANDARD VOICES">
			{standardVoices.map((voice, i) => (
			  <option key={i} value={voice.name}>
				{voice.name} {voice.lang ? `(${voice.lang})` : ''}
			  </option>
			))}
		  </optgroup>
		)}
	  </select>

	  {selectedVoice && (
		<div style={{
		  fontSize: '10px',
		  fontWeight: 900,
		  opacity: 0.6,
		  marginBottom: '12px',
		  letterSpacing: '0.5px'
		}}>
		  {voices.find(v => v.name === selectedVoice)?.isNeural 
			? '✨ NEURAL VOICE ACTIVE' 
			: '📢 STANDARD VOICE ACTIVE'}
		</div>
	  )}

	  <button
		onClick={testVoice}
		style={{
		  width: '100%',
		  background: 'oklch(78.9% 0.154 211.53)',
		  color: 'oklch(12.9% 0.042 264.695)',
		  border: 'none',
		  padding: '10px',
		  borderRadius: '6px',
		  fontSize: '13px',
		  fontWeight: 900,
		  cursor: 'pointer',
		  letterSpacing: '1px',
		  boxShadow: '0 0 15px oklch(78.9% 0.154 211.53 / 0.3)',
		  transition: 'all 0.2s ease'
		}}
		onMouseEnter={(e) => {
		  e.currentTarget.style.transform = 'scale(1.02)';
		  e.currentTarget.style.boxShadow = '0 0 25px oklch(78.9% 0.154 211.53 / 0.5)';
		}}
		onMouseLeave={(e) => {
		  e.currentTarget.style.transform = 'scale(1)';
		  e.currentTarget.style.boxShadow = '0 0 15px oklch(78.9% 0.154 211.53 / 0.3)';
		}}
	  >
		▶ TEST VOICE
	  </button>
	</div>
  );
}
