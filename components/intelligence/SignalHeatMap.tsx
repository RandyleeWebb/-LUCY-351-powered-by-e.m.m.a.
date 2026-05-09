/**
 * LUCY SOVEREIGN 351 - Signal Intelligence Heat Map
 * Entropy vs IoC visualization for LL206 (SIGNAL_JUDGE)
 * Shows where analyzed signals fall in the threat landscape
 */

import React from 'react';
import { SignalProfile, SignalComplexityResult } from '../../core/intelligence/SignalJudge';

interface SignalHeatMapProps {
  result?: SignalComplexityResult;
  width?: number;
  height?: number;
}

export default function SignalHeatMap({ result, width = 600, height = 400 }: SignalHeatMapProps) {
  if (!result) {
	return (
	  <div style={{
		width,
		height,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'oklch(15% 0.02 264)',
		border: '1px solid oklch(78.9% 0.154 211.53)',
		borderRadius: '8px',
		color: 'oklch(78.9% 0.154 211.53)',
		fontWeight: 700
	  }}>
		No signal data to analyze
	  </div>
	);
  }

  const { profile, cipherComplexity, possibleCiphers } = result;

  // Normalize entropy (0-8) and IoC (0-0.07) to canvas coordinates
  const entropyX = (profile.entropy / 8) * (width - 60) + 30;
  const iocY = height - ((profile.ioc / 0.07) * (height - 60) + 30);

  // Define threat zones
  const zones = [
	{
	  name: 'Strong Encryption\n(AES, ChaCha, Post-Quantum)',
	  minEntropy: 7.5,
	  maxEntropy: 8.0,
	  minIoC: 0.038,
	  maxIoC: 0.042,
	  color: 'oklch(50% 0.2 0)',      // Red zone
	  threat: 'CRITICAL'
	},
	{
	  name: 'Moderate Encryption\n(DES, Blowfish)',
	  minEntropy: 6.5,
	  maxEntropy: 7.5,
	  minIoC: 0.038,
	  maxIoC: 0.045,
	  color: 'oklch(60% 0.15 30)',    // Orange zone
	  threat: 'HIGH'
	},
	{
	  name: 'Polyalphabetic\n(Vigenère, Beaufort)',
	  minEntropy: 5.0,
	  maxEntropy: 7.0,
	  minIoC: 0.038,
	  maxIoC: 0.055,
	  color: 'oklch(65% 0.12 60)',    // Yellow zone
	  threat: 'MEDIUM'
	},
	{
	  name: 'Classical/Transposition\n(Caesar, Columnar)',
	  minEntropy: 4.0,
	  maxEntropy: 6.0,
	  minIoC: 0.060,
	  maxIoC: 0.068,
	  color: 'oklch(50% 0.1 150)',    // Green zone
	  threat: 'LOW'
	},
	{
	  name: 'Plaintext\n(English, Natural Language)',
	  minEntropy: 3.5,
	  maxEntropy: 5.0,
	  minIoC: 0.065,
	  maxIoC: 0.068,
	  color: 'oklch(55% 0.12 211.53)', // Cyan zone
	  threat: 'NONE'
	}
  ];

  const getThreatColor = (complexity: string): string => {
	switch (complexity) {
	  case 'CRITICAL': return 'oklch(60% 0.2 0)';
	  case 'HIGH': return 'oklch(65% 0.15 30)';
	  case 'STANDARD': return 'oklch(70% 0.12 60)';
	  case 'LOW': return 'oklch(60% 0.1 150)';
	  case 'PLAINTEXT': return 'oklch(78.9% 0.154 211.53)';
	  default: return 'oklch(78.9% 0.154 211.53)';
	}
  };

  return (
	<div style={{
	  width: width + 40,
	  padding: '20px',
	  backgroundColor: 'oklch(12% 0.02 264)',
	  border: '2px solid oklch(78.9% 0.154 211.53)',
	  borderRadius: '12px',
	  fontFamily: 'system-ui, -apple-system, sans-serif'
	}}>
	  {/* Title */}
	  <div style={{
		marginBottom: '16px',
		color: 'oklch(78.9% 0.154 211.53)',
		fontSize: '18px',
		fontWeight: 900,
		textAlign: 'center'
	  }}>
		LL206 SIGNAL JUDGE - ENTROPY vs IoC HEAT MAP
	  </div>

	  {/* Canvas */}
	  <svg width={width} height={height} style={{ backgroundColor: 'oklch(8% 0.02 264)', borderRadius: '8px' }}>
		{/* Grid lines */}
		{[0, 2, 4, 6, 8].map(e => {
		  const x = (e / 8) * (width - 60) + 30;
		  return (
			<line
			  key={`entropy-${e}`}
			  x1={x}
			  y1={30}
			  x2={x}
			  y2={height - 30}
			  stroke="oklch(30% 0.02 264)"
			  strokeWidth="1"
			  strokeDasharray="4,4"
			/>
		  );
		})}
		{[0, 0.02, 0.04, 0.06].map(ioc => {
		  const y = height - ((ioc / 0.07) * (height - 60) + 30);
		  return (
			<line
			  key={`ioc-${ioc}`}
			  x1={30}
			  y1={y}
			  x2={width - 30}
			  y2={y}
			  stroke="oklch(30% 0.02 264)"
			  strokeWidth="1"
			  strokeDasharray="4,4"
			/>
		  );
		})}

		{/* Threat zones (background) */}
		{zones.map((zone, idx) => {
		  const x1 = (zone.minEntropy / 8) * (width - 60) + 30;
		  const x2 = (zone.maxEntropy / 8) * (width - 60) + 30;
		  const y1 = height - ((zone.maxIoC / 0.07) * (height - 60) + 30);
		  const y2 = height - ((zone.minIoC / 0.07) * (height - 60) + 30);

		  return (
			<rect
			  key={idx}
			  x={x1}
			  y={y1}
			  width={x2 - x1}
			  height={y2 - y1}
			  fill={zone.color}
			  opacity="0.15"
			/>
		  );
		})}

		{/* Axes */}
		<line x1={30} y1={height - 30} x2={width - 30} y2={height - 30} stroke="oklch(78.9% 0.154 211.53)" strokeWidth="2" />
		<line x1={30} y1={30} x2={30} y2={height - 30} stroke="oklch(78.9% 0.154 211.53)" strokeWidth="2" />

		{/* Axis labels */}
		<text x={width / 2} y={height - 5} textAnchor="middle" fill="oklch(78.9% 0.154 211.53)" fontSize="12" fontWeight="700">
		  Entropy (bits/char)
		</text>
		<text x={10} y={height / 2} textAnchor="middle" fill="oklch(78.9% 0.154 211.53)" fontSize="12" fontWeight="700" transform={`rotate(-90, 10, ${height / 2})`}>
		  IoC
		</text>

		{/* Tick labels - Entropy */}
		{[0, 2, 4, 6, 8].map(e => {
		  const x = (e / 8) * (width - 60) + 30;
		  return (
			<text key={`elabel-${e}`} x={x} y={height - 12} textAnchor="middle" fill="oklch(78.9% 0.154 211.53)" fontSize="10">
			  {e}
			</text>
		  );
		})}

		{/* Tick labels - IoC */}
		{[0, 0.02, 0.04, 0.06].map(ioc => {
		  const y = height - ((ioc / 0.07) * (height - 60) + 30);
		  return (
			<text key={`ilabel-${ioc}`} x={20} y={y + 4} textAnchor="end" fill="oklch(78.9% 0.154 211.53)" fontSize="10">
			  {ioc.toFixed(2)}
			</text>
		  );
		})}

		{/* Current signal point */}
		<circle
		  cx={entropyX}
		  cy={iocY}
		  r="8"
		  fill={getThreatColor(cipherComplexity)}
		  stroke="oklch(100% 0 0)"
		  strokeWidth="2"
		/>
		<circle
		  cx={entropyX}
		  cy={iocY}
		  r="12"
		  fill="none"
		  stroke={getThreatColor(cipherComplexity)}
		  strokeWidth="2"
		  opacity="0.5"
		>
		  <animate attributeName="r" from="12" to="20" dur="1.5s" repeatCount="indefinite" />
		  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
		</circle>
	  </svg>

	  {/* Analysis panel */}
	  <div style={{
		marginTop: '16px',
		padding: '12px',
		backgroundColor: 'oklch(10% 0.02 264)',
		borderRadius: '8px',
		border: `2px solid ${getThreatColor(cipherComplexity)}`
	  }}>
		<div style={{ color: getThreatColor(cipherComplexity), fontWeight: 900, fontSize: '16px', marginBottom: '8px' }}>
		  COMPLEXITY: {cipherComplexity}
		</div>

		<div style={{ color: 'oklch(85% 0.05 211.53)', fontSize: '13px', marginBottom: '4px' }}>
		  <strong>Entropy:</strong> {profile.entropy.toFixed(3)} bits/char
		</div>

		<div style={{ color: 'oklch(85% 0.05 211.53)', fontSize: '13px', marginBottom: '4px' }}>
		  <strong>IoC:</strong> {profile.ioc.toFixed(4)}
		</div>

		<div style={{ color: 'oklch(85% 0.05 211.53)', fontSize: '13px', marginBottom: '4px' }}>
		  <strong>Periodicity:</strong> {(profile.periodicity * 100).toFixed(1)}%
		</div>

		<div style={{ color: 'oklch(85% 0.05 211.53)', fontSize: '13px', marginBottom: '8px' }}>
		  <strong>N-Gram Repetition:</strong> {(profile.nGramRepetition * 100).toFixed(1)}%
		</div>

		{possibleCiphers.length > 0 && (
		  <div style={{ marginTop: '12px' }}>
			<div style={{ color: 'oklch(78.9% 0.154 211.53)', fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>
			  TOP CIPHER MATCHES:
			</div>
			{possibleCiphers.slice(0, 3).map((inference, idx) => (
			  <div key={idx} style={{ 
				color: 'oklch(85% 0.05 211.53)', 
				fontSize: '12px', 
				marginBottom: '4px',
				paddingLeft: '8px'
			  }}>
				<strong>{Math.round(inference.confidence * 100)}%</strong> - {inference.cipher.name}
				{inference.matchReasons.length > 0 && (
				  <div style={{ fontSize: '11px', opacity: 0.8, paddingLeft: '12px' }}>
					{inference.matchReasons[0]}
				  </div>
				)}
			  </div>
			))}
		  </div>
		)}

		<div style={{ 
		  marginTop: '12px', 
		  padding: '8px',
		  backgroundColor: 'oklch(8% 0.02 264)',
		  borderRadius: '6px',
		  color: 'oklch(78.9% 0.154 211.53)',
		  fontSize: '12px',
		  fontWeight: 700
		}}>
		  ACTION: {result.recommendedAction.replace(/_/g, ' ')}
		</div>
	  </div>

	  {/* Legend */}
	  <div style={{ marginTop: '12px', fontSize: '11px' }}>
		<div style={{ color: 'oklch(78.9% 0.154 211.53)', fontWeight: 900, marginBottom: '6px' }}>
		  THREAT ZONES:
		</div>
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
		  {zones.map((zone, idx) => (
			<div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
			  <div style={{ 
				width: '12px', 
				height: '12px', 
				backgroundColor: zone.color, 
				border: '1px solid oklch(50% 0.02 264)' 
			  }} />
			  <span style={{ color: 'oklch(85% 0.05 211.53)', fontSize: '10px' }}>
				{zone.name.split('\n')[0]}
			  </span>
			</div>
		  ))}
		</div>
	  </div>
	</div>
  );
}
