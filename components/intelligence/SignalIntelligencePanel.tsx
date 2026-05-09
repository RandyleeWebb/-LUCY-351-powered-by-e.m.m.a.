/**
 * LUCY SOVEREIGN 351 - Signal Intelligence Panel
 * LL206 (SIGNAL_JUDGE) UI Integration
 * File analysis with voice narration
 */

import React, { useState } from 'react';
import SignalHeatMap from './SignalHeatMap';
import { analyzeSignalIntelligence, SignalComplexityResult } from '../../core/intelligence/SignalJudge';
import { speakSovereign } from '../../core/audio/VoiceManager';

interface SignalIntelligencePanelProps {
  onAnalysisComplete?: (result: SignalComplexityResult) => void;
}

export default function SignalIntelligencePanel({ onAnalysisComplete }: SignalIntelligencePanelProps) {
  const [analysisResult, setAnalysisResult] = useState<SignalComplexityResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');

  const handleAnalyze = async () => {
	if (!inputText.trim()) return;

	setAnalyzing(true);

	try {
	  // Perform signal analysis
	  const result = analyzeSignalIntelligence(inputText);
	  setAnalysisResult(result);

	  // Speak Lucy's narration
	  await speakSovereign(result.narration);

	  // Notify parent
	  if (onAnalysisComplete) {
		onAnalysisComplete(result);
	  }
	} catch (error) {
	  console.error('Signal analysis failed:', error);
	  await speakSovereign('Signal analysis encountered an error. Check console for details.');
	} finally {
	  setAnalyzing(false);
	}
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
	const file = event.target.files?.[0];
	if (!file) return;

	setSelectedFile(file.name);

	const reader = new FileReader();
	reader.onload = (e) => {
	  const content = e.target?.result as string;
	  setInputText(content);
	};
	reader.readAsText(file);
  };

  const handleClearAnalysis = () => {
	setAnalysisResult(null);
	setInputText('');
	setSelectedFile('');
  };

  return (
	<div style={{
	  display: 'flex',
	  flexDirection: 'column',
	  gap: '16px',
	  padding: '20px',
	  backgroundColor: 'oklch(10% 0.02 264)',
	  borderRadius: '12px',
	  border: '2px solid oklch(78.9% 0.154 211.53)',
	  fontFamily: 'system-ui, -apple-system, sans-serif',
	  maxWidth: '900px',
	  margin: '0 auto'
	}}>
	  {/* Header */}
	  <div style={{
		color: 'oklch(78.9% 0.154 211.53)',
		fontSize: '24px',
		fontWeight: 900,
		textAlign: 'center',
		borderBottom: '2px solid oklch(78.9% 0.154 211.53)',
		paddingBottom: '12px'
	  }}>
		🔍 LL206 SIGNAL_JUDGE - Intelligence Analysis
	  </div>

	  {/* Input Section */}
	  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
		<div style={{
		  display: 'flex',
		  gap: '12px',
		  alignItems: 'center'
		}}>
		  <label
			htmlFor="file-upload"
			style={{
			  padding: '10px 20px',
			  backgroundColor: 'oklch(20% 0.05 264)',
			  color: 'oklch(78.9% 0.154 211.53)',
			  border: '2px solid oklch(78.9% 0.154 211.53)',
			  borderRadius: '6px',
			  cursor: 'pointer',
			  fontWeight: 900,
			  fontSize: '14px',
			  transition: 'all 0.2s'
			}}
			onMouseEnter={(e) => {
			  e.currentTarget.style.backgroundColor = 'oklch(25% 0.08 264)';
			}}
			onMouseLeave={(e) => {
			  e.currentTarget.style.backgroundColor = 'oklch(20% 0.05 264)';
			}}
		  >
			📂 LOAD FILE
		  </label>
		  <input
			id="file-upload"
			type="file"
			accept=".txt,.log,.dat,.bin,.enc,.cipher"
			onChange={handleFileUpload}
			style={{ display: 'none' }}
		  />
		  {selectedFile && (
			<span style={{ color: 'oklch(85% 0.05 211.53)', fontSize: '14px' }}>
			  {selectedFile}
			</span>
		  )}
		</div>

		<textarea
		  value={inputText}
		  onChange={(e) => setInputText(e.target.value)}
		  placeholder="Paste text to analyze or load a file..."
		  style={{
			width: '100%',
			minHeight: '120px',
			padding: '12px',
			backgroundColor: 'oklch(8% 0.02 264)',
			color: 'oklch(90% 0.05 211.53)',
			border: '2px solid oklch(30% 0.05 264)',
			borderRadius: '6px',
			fontFamily: 'monospace',
			fontSize: '13px',
			resize: 'vertical',
			outline: 'none'
		  }}
		  onFocus={(e) => {
			e.currentTarget.style.borderColor = 'oklch(78.9% 0.154 211.53)';
		  }}
		  onBlur={(e) => {
			e.currentTarget.style.borderColor = 'oklch(30% 0.05 264)';
		  }}
		/>

		<div style={{ display: 'flex', gap: '12px' }}>
		  <button
			onClick={handleAnalyze}
			disabled={analyzing || !inputText.trim()}
			style={{
			  flex: 1,
			  padding: '12px',
			  backgroundColor: analyzing ? 'oklch(30% 0.05 264)' : 'oklch(78.9% 0.154 211.53)',
			  color: analyzing ? 'oklch(50% 0.05 264)' : 'oklch(10% 0.02 264)',
			  border: 'none',
			  borderRadius: '6px',
			  fontWeight: 900,
			  fontSize: '16px',
			  cursor: analyzing ? 'not-allowed' : 'pointer',
			  transition: 'all 0.2s'
			}}
			onMouseEnter={(e) => {
			  if (!analyzing && inputText.trim()) {
				e.currentTarget.style.backgroundColor = 'oklch(85% 0.18 211.53)';
			  }
			}}
			onMouseLeave={(e) => {
			  if (!analyzing) {
				e.currentTarget.style.backgroundColor = 'oklch(78.9% 0.154 211.53)';
			  }
			}}
		  >
			{analyzing ? '⏳ ANALYZING...' : '🔬 ANALYZE SIGNAL'}
		  </button>

		  {analysisResult && (
			<button
			  onClick={handleClearAnalysis}
			  style={{
				padding: '12px 20px',
				backgroundColor: 'oklch(20% 0.05 264)',
				color: 'oklch(78.9% 0.154 211.53)',
				border: '2px solid oklch(78.9% 0.154 211.53)',
				borderRadius: '6px',
				fontWeight: 900,
				fontSize: '14px',
				cursor: 'pointer',
				transition: 'all 0.2s'
			  }}
			  onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = 'oklch(25% 0.08 264)';
			  }}
			  onMouseLeave={(e) => {
				e.currentTarget.style.backgroundColor = 'oklch(20% 0.05 264)';
			  }}
			>
			  🗑️ CLEAR
			</button>
		  )}
		</div>
	  </div>

	  {/* Results Section */}
	  {analysisResult && (
		<>
		  {/* Heat Map */}
		  <div style={{ display: 'flex', justifyContent: 'center' }}>
			<SignalHeatMap result={analysisResult} width={700} height={450} />
		  </div>

		  {/* Lucy's Narration */}
		  <div style={{
			padding: '16px',
			backgroundColor: 'oklch(8% 0.02 264)',
			border: '2px solid oklch(78.9% 0.154 211.53)',
			borderRadius: '8px'
		  }}>
			<div style={{
			  color: 'oklch(78.9% 0.154 211.53)',
			  fontSize: '16px',
			  fontWeight: 900,
			  marginBottom: '8px'
			}}>
			  🎙️ LUCY'S ANALYSIS:
			</div>
			<div style={{
			  color: 'oklch(85% 0.05 211.53)',
			  fontSize: '14px',
			  lineHeight: '1.6',
			  fontStyle: 'italic'
			}}>
			  "{analysisResult.narration}"
			</div>
		  </div>

		  {/* Detailed Metrics */}
		  <div style={{
			display: 'grid',
			gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
			gap: '12px'
		  }}>
			<MetricCard
			  label="Stability"
			  value={`${(analysisResult.stability * 100).toFixed(1)}%`}
			  description="Inverse of entropy"
			  color="oklch(60% 0.1 150)"
			/>
			<MetricCard
			  label="Randomness"
			  value={`${(analysisResult.randomness * 100).toFixed(1)}%`}
			  description="Normalized entropy"
			  color="oklch(60% 0.15 30)"
			/>
			<MetricCard
			  label="Compression"
			  value={`${(analysisResult.compressionLikelihood * 100).toFixed(1)}%`}
			  description="Compressed data probability"
			  color="oklch(65% 0.12 60)"
			/>
			<MetricCard
			  label="Character Diversity"
			  value={`${(analysisResult.profile.characterDiversity * 100).toFixed(1)}%`}
			  description="Unique character ratio"
			  color="oklch(78.9% 0.154 211.53)"
			/>
		  </div>
		</>
	  )}
	</div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  color: string;
}

function MetricCard({ label, value, description, color }: MetricCardProps) {
  return (
	<div style={{
	  padding: '12px',
	  backgroundColor: 'oklch(12% 0.02 264)',
	  border: `2px solid ${color}`,
	  borderRadius: '8px'
	}}>
	  <div style={{
		color,
		fontSize: '14px',
		fontWeight: 900,
		marginBottom: '4px'
	  }}>
		{label}
	  </div>
	  <div style={{
		color: 'oklch(90% 0.05 211.53)',
		fontSize: '24px',
		fontWeight: 900,
		marginBottom: '4px'
	  }}>
		{value}
	  </div>
	  <div style={{
		color: 'oklch(70% 0.05 211.53)',
		fontSize: '11px'
	  }}>
		{description}
	  </div>
	</div>
  );
}
