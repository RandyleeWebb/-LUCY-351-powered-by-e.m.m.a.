/**
 * CUBE FACE COMPONENT
 * ====================
 * Displays a specific subset of the 351-node architecture per cube face.
 * Simplified grid without complex dependencies.
 */

import React from 'react';

interface CubeFaceProps {
  title: string;
  description: string;
  nodeRange: { start: number; end: number };
  icon?: string;
}

export default function CubeFace({ title, description, nodeRange, icon }: CubeFaceProps) {
  // Generate node range
  const nodeCount = nodeRange.end - nodeRange.start + 1;
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
	num: nodeRange.start + i,
	id: `LL${String(nodeRange.start + i).padStart(3, '0')}`
  }));

  return (
	<div style={{ 
	  height: '100%', 
	  display: 'flex', 
	  flexDirection: 'column',
	  background: 'oklch(12.9% 0.042 264.695)',
	  fontFamily: 'monospace',
	  overflow: 'auto'
	}}>
	  {/* Face Header */}
	  <div style={{
		padding: '24px 32px',
		borderBottom: '3px solid oklch(78.9% 0.154 211.53 / 0.3)',
		background: 'oklch(18% 0.02 240)',
		boxShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.2)'
	  }}>
		<div style={{
		  fontSize: '28px',
		  fontWeight: 900,
		  color: 'oklch(78.9% 0.154 211.53)',
		  textShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.6)',
		  letterSpacing: '3px',
		  marginBottom: '8px'
		}}>
		  {icon && <span style={{ marginRight: '12px' }}>{icon}</span>}
		  {title}
		</div>
		<div style={{
		  fontSize: '13px',
		  fontWeight: 900,
		  opacity: 0.7,
		  letterSpacing: '1px'
		}}>
		  {description} • NODES {String(nodeRange.start).padStart(3, '0')}–{String(nodeRange.end).padStart(3, '0')}
		</div>
	  </div>

	  {/* Node Grid */}
	  <div style={{ 
		flex: 1, 
		padding: '32px',
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
		gap: '12px',
		alignContent: 'start'
	  }}>
		{nodes.map((node, i) => {
		  const isActive = i < 5; // First 5 nodes active
		  const isStandby = i >= 5 && i < 15;

		  return (
			<div
			  key={node.id}
			  style={{
				aspectRatio: '1',
				background: isActive 
				  ? 'oklch(78.9% 0.154 211.53)' 
				  : isStandby 
					? 'oklch(68.3% 0.164 313.42)' 
					: 'oklch(18% 0.02 240)',
				borderRadius: '8px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: '11px',
				fontWeight: 900,
				boxShadow: isActive 
				  ? '0 0 20px oklch(78.9% 0.154 211.53)' 
				  : isStandby 
					? '0 0 12px oklch(68.3% 0.164 313.42 / 0.5)' 
					: 'none',
				cursor: 'pointer',
				transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				border: `2px solid ${isActive ? 'oklch(78.9% 0.154 211.53)' : isStandby ? 'oklch(68.3% 0.164 313.42 / 0.5)' : 'oklch(25% 0.02 240)'}`
			  }}
			  onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'scale(1.2) translateY(-6px)';
				e.currentTarget.style.boxShadow = '0 0 30px oklch(78.9% 0.154 211.53)';
				e.currentTarget.style.zIndex = '10';
			  }}
			  onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'scale(1)';
				e.currentTarget.style.boxShadow = isActive ? '0 0 20px oklch(78.9% 0.154 211.53)' : 'none';
				e.currentTarget.style.zIndex = '1';
			  }}
			  title={`${node.id} • ${isActive ? 'ACTIVE' : isStandby ? 'STANDBY' : 'DORMANT'}`}
			>
			  {node.num}
			</div>
		  );
		})}
	  </div>

	  {/* Status Panel */}
	  <div style={{
		padding: '24px 32px',
		borderTop: '3px solid oklch(78.9% 0.154 211.53 / 0.3)',
		background: 'oklch(18% 0.02 240)',
		display: 'grid',
		gridTemplateColumns: 'repeat(3, 1fr)',
		gap: '20px'
	  }}>
		<div>
		  <div style={{ fontSize: '11px', fontWeight: 900, color: 'oklch(78.9% 0.154 211.53)', marginBottom: '6px', letterSpacing: '1px' }}>
			ACTIVE
		  </div>
		  <div style={{ fontSize: '24px', fontWeight: 900, color: 'oklch(78.9% 0.154 211.53)' }}>
			{Math.min(5, nodeCount)}
		  </div>
		</div>
		<div>
		  <div style={{ fontSize: '11px', fontWeight: 900, color: 'oklch(68.3% 0.164 313.42)', marginBottom: '6px', letterSpacing: '1px' }}>
			STANDBY
		  </div>
		  <div style={{ fontSize: '24px', fontWeight: 900, color: 'oklch(68.3% 0.164 313.42)' }}>
			{Math.min(10, Math.max(0, nodeCount - 5))}
		  </div>
		</div>
		<div>
		  <div style={{ fontSize: '11px', fontWeight: 900, opacity: 0.6, marginBottom: '6px', letterSpacing: '1px' }}>
			TOTAL
		  </div>
		  <div style={{ fontSize: '24px', fontWeight: 900 }}>
			{nodeCount}
		  </div>
		</div>
	  </div>
	</div>
  );
}
