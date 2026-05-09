/**
 * NODE MATRIX VIEW — PRODUCTION CYBER-TECH DASHBOARD
 * ==================================================
 * High-contrast, bold 351-node visualization with real-time status tracking
 * 
 * VISUAL SPECIFICATION:
 * - Font Weight: 900 (Heavy Bold)
 * - Active State: Neon-Cyan (#00f2ff) with glow
 * - Simulation State: Deep-Amethyst (#bc13fe) with pulse
 * - Bubble Bath: White (#ffffff) with bounce animation
 * - Idle State: Slate (#1e293b) no effects
 * 
 * INTERACTION:
 * - Hover: Show node identity tooltip
 * - Click: Select for manual team requisition
 * - Drag: Multi-select for team formation
 * - Right-click: Trigger manual Bubble Bath
 */

// @ts-nocheck
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { LUCY_NODE_IDENTITY_REGISTRY } from '../../core/nodes/NodeIdentityRegistry.js';
import { manualTeamManager } from '../../core/nodes/ManualTeamManager.js';
import { stateOrchestrator } from '../../core/nodes/StateOrchestrator.js';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface NodeMatrixProps {
  activeNodeIds: string[];    // Nodes in active task teams
  simNodeIds: string[];       // Nodes in background simulations
  soakingNodeIds: string[];   // Nodes in Bubble Bath
  onNodeClick?: (nodeId: string) => void;
  onTeamFormed?: (teamId: string) => void;
}

interface NodeStatus {
  id: string;
  livingName: string;
  layer: string;
  status: 'active' | 'simulation' | 'soaking' | 'idle';
  intensity?: number;  // 0.0-1.0 for planetary feeds
}

// ═══════════════════════════════════════════════════════════════════════════
// LAYER COLORS
// ═══════════════════════════════════════════════════════════════════════════

const LAYER_COLORS: Record<string, string> = {
  'refiner': '#ff6b6b',                    // Red
  'classical_core': '#4ecdc4',             // Teal
  'quantum_oracle': '#9b59b6',             // Purple
  'stem_cell': '#f39c12',                  // Orange
  'planetary_sensor_feed': '#3498db',      // Blue
  'intelligence_control': '#2ecc71',       // Green
  'builder_gamedev': '#e74c3c',            // Crimson
  'reserved_evolution': '#95a5a6'          // Gray
};

// ═══════════════════════════════════════════════════════════════════════════
// NODE MATRIX VIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function NodeMatrixView({
  activeNodeIds,
  simNodeIds,
  soakingNodeIds,
  onNodeClick,
  onTeamFormed
}: NodeMatrixProps) {

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Generate full 351-node array with status
  // ─────────────────────────────────────────────────────────────────────────

  const allNodes = useMemo((): NodeStatus[] => {
	return Array.from({ length: 351 }, (_, i) => {
	  const id = `LL${i.toString().padStart(3, '0')}`;
	  const identity = LUCY_NODE_IDENTITY_REGISTRY[id];

	  // Determine status
	  let status: 'active' | 'simulation' | 'soaking' | 'idle' = 'idle';
	  if (activeNodeIds.includes(id)) status = 'active';
	  else if (simNodeIds.includes(id)) status = 'simulation';
	  else if (soakingNodeIds.includes(id)) status = 'soaking';

	  return {
		id,
		livingName: identity?.livingName || 'RESERVED_SEED',
		layer: identity?.layer || 'reserved_evolution',
		status,
		intensity: status === 'simulation' ? Math.random() : undefined
	  };
	});
  }, [activeNodeIds, simNodeIds, soakingNodeIds]);

  // ─────────────────────────────────────────────────────────────────────────
  // Node Status Colors & Effects
  // ─────────────────────────────────────────────────────────────────────────

  const getNodeColor = useCallback((node: NodeStatus): string => {
	switch (node.status) {
	  case 'active':
		return '#00f2ff';  // Neon-Cyan
	  case 'simulation':
		return '#bc13fe';  // Deep-Amethyst
	  case 'soaking':
		return '#ffffff';  // White
	  default:
		return '#1e293b';  // Slate
	}
  }, []);

  const getNodeGlow = useCallback((node: NodeStatus): string => {
	switch (node.status) {
	  case 'active':
		return '0 0 8px #00f2ff, 0 0 12px #00f2ff';
	  case 'simulation':
		return '0 0 6px #bc13fe, 0 0 10px #bc13fe';
	  case 'soaking':
		return '0 0 10px #ffffff, 0 0 15px #ffffff';
	  default:
		return 'none';
	}
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Node Selection Logic
  // ─────────────────────────────────────────────────────────────────────────

  const toggleNodeSelection = useCallback((nodeId: string) => {
	setSelectedNodes(prev =>
	  prev.includes(nodeId)
		? prev.filter(n => n !== nodeId)
		: [...prev, nodeId]
	);
  }, []);

  const handleNodeClick = useCallback((nodeId: string, event: React.MouseEvent) => {
	event.preventDefault();
	toggleNodeSelection(nodeId);
	onNodeClick?.(nodeId);
  }, [toggleNodeSelection, onNodeClick]);

  const handleNodeRightClick = useCallback(async (nodeId: string, event: React.MouseEvent) => {
	event.preventDefault();

	// Trigger manual Bubble Bath on right-click
	const confirmBubbleBath = window.confirm(
	  `Trigger Bubble Bath on ${nodeId}?\n\nThis will refresh the node and clear any cached state.`
	);

	if (confirmBubbleBath) {
	  await stateOrchestrator.performBubbleBath({
		nodeIds: [nodeId],
		mode: 'cache_residue_clear'
	  });
	}
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Team Formation
  // ─────────────────────────────────────────────────────────────────────────

  const handleFormTeam = useCallback(async () => {
	const taskName = window.prompt('Enter Task Name for this Team:');

	if (taskName && selectedNodes.length > 0) {
	  try {
		const team = await manualTeamManager.requisitionCustomTeam(
		  selectedNodes,
		  taskName,
		  'high'
		);

		alert(
		  `✅ Team formed with ${selectedNodes.length} nodes.\n` +
		  `Team ID: ${team.teamId}\n` +
		  `Nodes are now SOAKING before deployment.`
		);

		setSelectedNodes([]);
		onTeamFormed?.(team.teamId);

	  } catch (error) {
		alert(`❌ Team formation failed: ${error.message}`);
	  }
	}
  }, [selectedNodes, onTeamFormed]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
	<div className="relative w-full h-full bg-[#050810] p-6 overflow-y-auto scrollbar-hide font-mono">

	  {/* Header */}
	  <div className="mb-6 border-b border-slate-800 pb-4">
		<h1 className="text-2xl font-black text-white tracking-tighter">
		  LUCY SOVEREIGN 351 — NODE MATRIX
		</h1>
		<p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
		  High-Contrast Cyber-Tech Neural Density Visualization
		</p>
	  </div>

	  {/* Node Grid */}
	  <div
		className="grid grid-cols-20 gap-1 select-none mb-8"
		onMouseDown={() => setIsSelecting(true)}
		onMouseUp={() => setIsSelecting(false)}
		onMouseLeave={() => setIsSelecting(false)}
	  >
		{allNodes.map((node) => {
		  const isSelected = selectedNodes.includes(node.id);
		  const isHovered = hoveredNode === node.id;

		  return (
			<div
			  key={node.id}
			  onClick={(e) => handleNodeClick(node.id, e)}
			  onContextMenu={(e) => handleNodeRightClick(node.id, e)}
			  onMouseEnter={() => {
				setHoveredNode(node.id);
				if (isSelecting) toggleNodeSelection(node.id);
			  }}
			  onMouseLeave={() => setHoveredNode(null)}
			  className={`
				group relative w-4 h-4 rounded-sm cursor-crosshair
				transition-all duration-300
				${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}
				${node.status === 'soaking' ? 'animate-bounce' : ''}
				${node.status === 'simulation' ? 'animate-pulse' : ''}
			  `}
			  style={{
				backgroundColor: getNodeColor(node),
				boxShadow: getNodeGlow(node),
				transform: isHovered ? 'scale(1.2)' : 'scale(1)',
				zIndex: isHovered ? 100 : 1
			  }}
			  title={`${node.id}: ${node.livingName}`}
			>
			  {/* Node ID Label (Heavy Bold) */}
			  <span
				className={`
				  absolute top-[-14px] left-0 text-[9px] font-black tracking-tighter
				  pointer-events-none whitespace-nowrap
				  ${node.status === 'active' ? 'text-[#00f2ff]' : 'text-slate-600'}
				`}
				style={{
				  textShadow: node.status === 'active' ? '0 0 5px #00f2ff' : 'none',
				  fontWeight: 900
				}}
			  >
				{node.id}
			  </span>

			  {/* Hover Tooltip */}
			  {isHovered && (
				<div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-black border border-cyan-500 p-3 text-[10px] w-48 shadow-2xl rounded-md pointer-events-none">
				  <div className="flex justify-between items-start mb-2">
					<span className="text-cyan-500 font-black text-xs">{node.id}</span>
					<span
					  className="text-[8px] px-2 py-0.5 rounded-full font-bold uppercase"
					  style={{
						backgroundColor: LAYER_COLORS[node.layer] || '#95a5a6',
						color: 'black'
					  }}
					>
					  {node.layer.replace(/_/g, ' ')}
					</span>
				  </div>
				  <div className="text-white font-bold truncate mb-1">
					{node.livingName}
				  </div>
				  <div className="text-slate-400 text-[9px] uppercase tracking-wider mb-2">
					Status: {node.status}
				  </div>
				  {node.intensity !== undefined && (
					<div className="mt-2 pt-2 border-t border-slate-700">
					  <div className="text-[8px] text-slate-500 mb-1">INTENSITY</div>
					  <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
						<div
						  className="h-full bg-purple-500"
						  style={{ width: `${node.intensity * 100}%` }}
						/>
					  </div>
					</div>
				  )}
				</div>
			  )}
			</div>
		  );
		})}
	  </div>

	  {/* Legend & Statistics */}
	  <div className="border-t border-slate-800 pt-4">
		<div className="flex gap-8 text-[10px] font-black uppercase tracking-widest mb-4">
		  <div className="flex items-center gap-2">
			<div
			  className="w-3 h-3 rounded-sm animate-pulse"
			  style={{
				backgroundColor: '#00f2ff',
				boxShadow: '0 0 8px #00f2ff'
			  }}
			/>
			<span className="text-cyan-400">ACTIVE_TASK ({activeNodeIds.length})</span>
		  </div>

		  <div className="flex items-center gap-2">
			<div
			  className="w-3 h-3 rounded-sm animate-pulse"
			  style={{
				backgroundColor: '#bc13fe',
				boxShadow: '0 0 6px #bc13fe'
			  }}
			/>
			<span className="text-purple-500">PLANETARY_SIM ({simNodeIds.length})</span>
		  </div>

		  <div className="flex items-center gap-2">
			<div
			  className="w-3 h-3 rounded-sm animate-bounce"
			  style={{
				backgroundColor: '#ffffff',
				boxShadow: '0 0 10px #ffffff'
			  }}
			/>
			<span className="text-white">BUBBLE_BATH ({soakingNodeIds.length})</span>
		  </div>

		  <div className="ml-auto text-slate-500">
			TOTAL_NODES: 351 | NEURAL_DENSITY: 100%
		  </div>
		</div>

		{/* Layer Distribution */}
		<div className="grid grid-cols-4 gap-4 text-[9px] uppercase tracking-wider">
		  {Object.entries(
			allNodes.reduce((acc, node) => {
			  acc[node.layer] = (acc[node.layer] || 0) + 1;
			  return acc;
			}, {} as Record<string, number>)
		  ).map(([layer, count]) => (
			<div key={layer} className="flex items-center gap-2">
			  <div
				className="w-2 h-2 rounded-full"
				style={{ backgroundColor: LAYER_COLORS[layer] || '#95a5a6' }}
			  />
			  <span className="text-slate-400 truncate">
				{layer.replace(/_/g, ' ')}: {count}
			  </span>
			</div>
		  ))}
		</div>
	  </div>

	  {/* Floating Action Menu (Team Formation) */}
	  {selectedNodes.length > 0 && (
		<div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-cyan-500 text-black px-8 py-4 rounded-full font-black text-sm shadow-[0_0_40px_rgba(0,242,255,0.6)] flex gap-6 items-center animate-bounce z-50">
		  <span className="text-base">{selectedNodes.length} NODES SELECTED</span>

		  <button
			onClick={handleFormTeam}
			className="bg-black text-white px-6 py-2 rounded-full hover:bg-slate-900 transition-colors font-black uppercase tracking-wider text-xs"
		  >
			EXECUTE_TEAM_FORM
		  </button>

		  <button
			onClick={() => setSelectedNodes([])}
			className="opacity-70 hover:opacity-100 transition-opacity font-bold uppercase text-xs"
		  >
			CANCEL
		  </button>
		</div>
	  )}

	  {/* Instructions */}
	  <div className="mt-6 text-[9px] text-slate-600 uppercase tracking-widest border-t border-slate-800 pt-4">
		<div className="grid grid-cols-2 gap-4">
		  <div>
			<span className="text-slate-500 font-bold">CLICK:</span> Select node for team requisition
		  </div>
		  <div>
			<span className="text-slate-500 font-bold">DRAG:</span> Multi-select nodes
		  </div>
		  <div>
			<span className="text-slate-500 font-bold">RIGHT-CLICK:</span> Trigger Bubble Bath
		  </div>
		  <div>
			<span className="text-slate-500 font-bold">HOVER:</span> View node identity & status
		  </div>
		</div>
	  </div>

	</div>
  );
}
