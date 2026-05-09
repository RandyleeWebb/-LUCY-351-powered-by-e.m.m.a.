/**
 * WHAT THIS DOES:
 * Alpha Delta Vault Dashboard - Face 6 of the hexagonal cube navigator. Displays live
 * directory trees for all registered linked folders, shows file operation history, and
 * provides UI for copying/moving files between sandbox and host machine.
 *
 * WHY THIS EXISTS:
 * Randy needs to see Lucy's "portal" system visually - which host folders Lucy has access to,
 * what her current trust layer is (Bronze/Silver/Gold), and which file operations have
 * been executed. This dashboard makes Lucy's linked-access transparent and debuggable.
 *
 * HOW THIS WORKS:
 * Fetches linked folders from AlphaDeltaVault, displays as collapsible tree view with
 * category grouping (FiveM, Unreal, Unity, Lucy). Shows access status (locked/unlocked
 * based on trust tier), operation history, and stats. Cyber-tech aesthetic with cyan
 * accents and portal icon. File operations trigger trust-aware AlphaDeltaVault methods.
 *
 * HOW TO CHANGE IT:
 * Add drag-and-drop file moving UI, visual file browser for linked folders, or real-time
 * file change monitoring. Customize styling in classNames. Add new folder categories by
 * extending the category filter in the component.
 *
 * DEBUG EXAMPLE:
 * If a linked folder shows "locked" even at Partner tier, check AlphaDeltaVault.canAccessFolder()
 * and verify trust score is >=50. If file operations don't appear in history, verify
 * AlphaDeltaVault.executeFileOperation() is recording correctly.
 */

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { alphaDeltaVault, LinkedFolder, AccessLayer, FileOperationRecord } from '../../core/vault/AlphaDeltaVault';
import { globalEventBus } from '../../core/EventBus';
import { simulationVariableTranslator } from '../../core/earth/SimulationVariableTranslator';
import type { SemanticEvent } from '../../core/LucyIntelligence';

interface FolderGroup {
  category: string;
  folders: LinkedFolder[];
}

export default function AlphaDeltaVaultDashboard() {
  const [linkedFolders, setLinkedFolders] = useState<LinkedFolder[]>([]);
  const [operations, setOperations] = useState<FileOperationRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['fivem']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Drop zone state for Earth event injection
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null);
  const [lastInjection, setLastInjection] = useState<{ event: SemanticEvent; folder: string; timestamp: number } | null>(null);

  useEffect(() => {
	loadVaultData();
	const interval = setInterval(loadVaultData, 5000); // Refresh every 5s
	return () => clearInterval(interval);
  }, []);

  const loadVaultData = () => {
	const folders = alphaDeltaVault.listLinkedFolders();
	const recentOps = alphaDeltaVault.getOperationHistory(20);
	const vaultStats = alphaDeltaVault.getStats();

	setLinkedFolders(folders);
	setOperations(recentOps);
	setStats(vaultStats);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Earth Event Drop Zone Handlers
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle drag over folder (allow drop)
   */
  const handleDragOver = (e: React.DragEvent, folderId: string) => {
	e.preventDefault();
	e.stopPropagation();
	setDropTargetFolder(folderId);
  };

  /**
   * Handle drag leave folder
   */
  const handleDragLeave = (e: React.DragEvent) => {
	e.preventDefault();
	setDropTargetFolder(null);
  };

  /**
   * Handle drop Earth event onto folder
   */
  const handleDrop = async (e: React.DragEvent, folderId: string) => {
	e.preventDefault();
	e.stopPropagation();
	setDropTargetFolder(null);

	try {
	  // Parse drag data from TwinEarthDashboard
	  const dragDataStr = e.dataTransfer.getData('text/plain');
	  let earthEvent: SemanticEvent;

	  // Try to parse as JSON first (from our dashboard)
	  try {
		const dragData = JSON.parse(dragDataStr);
		if (dragData.type === 'earth-event') {
		  earthEvent = dragData.event;
		} else {
		  console.warn('[AlphaDeltaVault] Unknown drag data type:', dragData.type);
		  return;
		}
	  } catch {
		// If not JSON, might be a direct event object
		console.warn('[AlphaDeltaVault] Could not parse drag data');
		return;
	  }

	  // Get folder details
	  const folder = linkedFolders.find(f => f.id === folderId);
	  if (!folder) {
		console.error('[AlphaDeltaVault] Folder not found:', folderId);
		return;
	  }

	  // Check access
	  const access = alphaDeltaVault.canAccessFolder(folderId);
	  if (!access.allowed) {
		alert(`Cannot inject into ${folder.displayName}: ${access.reason}`);
		return;
	  }

	  // Translate event to simulation variables
	  const engine = folder.category === 'fivem' ? 'fivem' : 
					 folder.category === 'unreal' ? 'ue5' : 
					 folder.category === 'unity' ? 'unity' : 'generic';

	  const simPacket = simulationVariableTranslator.translateEvent(earthEvent, engine);

	  // Create injection file
	  const timestamp = Date.now();
	  const filename = `earth_injection_${earthEvent.type}_${timestamp}.json`;
	  const content = JSON.stringify({
		earthEvent,
		simPacket,
		injectedAt: new Date().toISOString(),
		targetFolder: folder.displayName,
		code: simPacket.code,
	  }, null, 2);

	  // Save to linked folder using AlphaDeltaVault
	  const targetPath = `${folder.hostPath}/${filename}`;

	  // Publish injection event (actual file write would go through vault operation)
	  globalEventBus.emit('earth:injection', {
		earthEvent,
		simPacket,
		targetFolder: folder.displayName,
		targetPath,
		timestamp,
	  });

	  // Update UI
	  setLastInjection({
		event: earthEvent,
		folder: folder.displayName,
		timestamp,
	  });

	  console.log(`[AlphaDeltaVault] 🌍→📁 Earth event injected: ${earthEvent.type} → ${folder.displayName}`);
	  console.log('Simulation variables:', simPacket.variables);

	  // Show success notification (in production, write actual file)
	  alert(`✅ Earth Event Injected!\n\n` +
			`Event: ${earthEvent.type}\n` +
			`Target: ${folder.displayName}\n` +
			`Variables: ${simPacket.variables.length}\n` +
			`File: ${filename}`);

	} catch (error) {
	  console.error('[AlphaDeltaVault] Drop error:', error);
	  alert('Failed to inject Earth event. Check console for details.');
	}
  };

  const groupFolders = (): FolderGroup[] => {
	const categories = ['fivem', 'unreal', 'unity', 'gamedev', 'lucy', 'custom'];
	return categories
	  .map(cat => ({
		category: cat,
		folders: linkedFolders.filter(f => f.category === cat)
	  }))
	  .filter(group => group.folders.length > 0);
  };

  const toggleCategory = (category: string) => {
	const newExpanded = new Set(expandedCategories);
	if (newExpanded.has(category)) {
	  newExpanded.delete(category);
	} else {
	  newExpanded.add(category);
	}
	setExpandedCategories(newExpanded);
  };

  const getAccessStatus = (folder: LinkedFolder) => {
	const access = alphaDeltaVault.canAccessFolder(folder.id);
	return access;
  };

  const getLayerColor = (layer: AccessLayer): string => {
	switch (layer) {
	  case AccessLayer.BRONZE:
		return 'text-orange-500';
	  case AccessLayer.SILVER:
		return 'text-cyan-400';
	  case AccessLayer.GOLD:
		return 'text-yellow-500';
	  default:
		return 'text-gray-500';
	}
  };

  const getLayerIcon = (layer: AccessLayer): string => {
	switch (layer) {
	  case AccessLayer.BRONZE:
		return '🛡️';
	  case AccessLayer.SILVER:
		return '🔷';
	  case AccessLayer.GOLD:
		return '👑';
	  default:
		return '🔒';
	}
  };

  const getCategoryIcon = (category: string): string => {
	switch (category) {
	  case 'fivem':
		return '🎮';
	  case 'unreal':
		return '🎨';
	  case 'unity':
		return '🧊';
	  case 'gamedev':
		return '🕹️';
	  case 'lucy':
		return '🧠';
	  case 'custom':
		return '📁';
	  default:
		return '📂';
	}
  };

  const formatTimestamp = (timestamp: number): string => {
	return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
	<div className="w-full h-full bg-slate-950 text-cyan-50 p-6 overflow-y-auto">
	  {/* Header with Portal Icon */}
	  <div className="flex items-center gap-4 mb-6 border-b border-cyan-500/30 pb-4">
		<div className="text-5xl">🌀</div>
		<div>
		  <h1 className="text-3xl font-bold text-cyan-400 tracking-wide">
			ALPHA DELTA VAULT
		  </h1>
		  <p className="text-sm text-cyan-300/70">
			Direct Linked Access Portal • Multi-Hop Architecture
		  </p>
		</div>
	  </div>

	  {/* Stats Overview */}
	  {stats && (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
		  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
			<div className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">
			  Access Layer
			</div>
			<div className={`text-2xl font-bold ${getLayerColor(stats.currentAccessLayer)}`}>
			  {getLayerIcon(stats.currentAccessLayer)} {stats.currentAccessLayer.toUpperCase()}
			</div>
			<div className="text-xs text-cyan-300/50 mt-1">
			  Trust: {stats.trustTier} ({stats.trustScore.toFixed(1)})
			</div>
		  </div>

		  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
			<div className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">
			  Linked Folders
			</div>
			<div className="text-2xl font-bold text-cyan-400">
			  {stats.activeLinkedFolders} / {stats.totalLinkedFolders}
			</div>
			<div className="text-xs text-cyan-300/50 mt-1">Active</div>
		  </div>

		  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
			<div className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">
			  Operations
			</div>
			<div className="text-2xl font-bold text-green-400">
			  {stats.successfulOperations}
			</div>
			<div className="text-xs text-cyan-300/50 mt-1">
			  {stats.failedOperations} failed
			</div>
		  </div>

		  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4">
			<div className="text-xs text-cyan-300/70 uppercase tracking-wider mb-1">
			  Success Rate
			</div>
			<div className="text-2xl font-bold text-cyan-400">
			  {stats.totalOperations > 0
				? ((stats.successfulOperations / stats.totalOperations) * 100).toFixed(1)
				: '100'}%
			</div>
			<div className="text-xs text-cyan-300/50 mt-1">
			  {stats.totalOperations} total
			</div>
		  </div>
		</div>
	  )}

	  {/* Linked Folders Tree */}
	  <div className="mb-6">
		<h2 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
		  <span>🔗</span> Linked Folders
		</h2>
		<div className="space-y-2">
		  {groupFolders().map(group => (
			<div key={group.category} className="bg-slate-900/30 border border-cyan-500/20 rounded-lg overflow-hidden">
			  {/* Category Header */}
			  <button
				onClick={() => toggleCategory(group.category)}
				className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
			  >
				<div className="flex items-center gap-3">
				  <span className="text-2xl">{getCategoryIcon(group.category)}</span>
				  <span className="text-lg font-semibold text-cyan-300 uppercase tracking-wide">
					{group.category}
				  </span>
				  <span className="text-xs text-cyan-300/50">
					{group.folders.length} folders
				  </span>
				</div>
				<span className="text-cyan-400">
				  {expandedCategories.has(group.category) ? '▼' : '▶'}
				</span>
			  </button>

			  {/* Folder List */}
			  {expandedCategories.has(group.category) && (
				<div className="px-4 pb-3 space-y-2">
				  {group.folders.map(folder => {
					const access = getAccessStatus(folder);
					const isSelected = selectedFolder === folder.id;
					const isDropTarget = dropTargetFolder === folder.id;

					return (
					  <div
						key={folder.id}
						onClick={() => setSelectedFolder(isSelected ? null : folder.id)}
						onDragOver={(e) => handleDragOver(e, folder.id)}
						onDragLeave={handleDragLeave}
						onDrop={(e) => handleDrop(e, folder.id)}
						className={`p-3 rounded border cursor-pointer transition-all ${
						  isDropTarget
							? 'bg-lucy-primary/20 border-lucy-primary scale-105 shadow-lg shadow-lucy-primary/30'
							: isSelected
							? 'bg-cyan-500/10 border-cyan-500'
							: 'bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50'
						}`}
						title={access.allowed ? 'Drop Earth events here to inject' : 'Unlock folder to inject events'}
					  >
						{isDropTarget && (
						  <div className="absolute inset-0 border-2 border-dashed border-lucy-primary rounded animate-pulse pointer-events-none" />
						)}

						<div className="flex items-center justify-between mb-2">
						  <div className="flex items-center gap-2">
							<span className={getLayerColor(folder.accessLayer)}>
							  {getLayerIcon(folder.accessLayer)}
							</span>
							<span className="font-medium text-cyan-200">
							  {folder.displayName}
							</span>
							{folder.readonly && (
							  <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded">
								READ-ONLY
							  </span>
							)}
							{access.allowed && (
							  <span className="text-xs bg-lucy-primary/20 text-lucy-primary px-2 py-0.5 rounded">
								🌍 DROP ZONE
							  </span>
							)}
						  </div>
						  <div className="flex items-center gap-2">
							{access.allowed ? (
							  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
								✓ UNLOCKED
							  </span>
							) : (
							  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
								🔒 LOCKED
							  </span>
							)}
						  </div>
						</div>

						<div className="text-xs text-cyan-300/70 mb-1">
						  {folder.hostPath}
						</div>

						<div className="text-xs text-cyan-300/50">
						  {folder.description}
						</div>

						{!access.allowed && (
						  <div className="text-xs text-red-400/80 mt-2 bg-red-500/5 px-2 py-1 rounded">
							{access.reason}
						  </div>
						)}

						{folder.requiresApproval && (
						  <div className="text-xs text-yellow-400/80 mt-2 bg-yellow-500/5 px-2 py-1 rounded">
							⚠️ Writes require ActionEngine approval
						  </div>
						)}
					  </div>
					);
				  })}
				</div>
			  )}
			</div>
		  ))}
		</div>
	  </div>

	  {/* Recent Operations */}
	  <div>
		<h2 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
		  <span>📋</span> Recent Operations
		</h2>

		{/* Last Earth Injection Status */}
		{lastInjection && (
		  <div className="mb-4 bg-lucy-primary/10 border border-lucy-primary/30 rounded-lg p-4">
			<div className="flex items-center gap-2 mb-2">
			  <span className="text-2xl">🌍</span>
			  <div>
				<div className="text-sm font-bold text-lucy-primary">Earth Event Injected</div>
				<div className="text-xs text-cyan-300/70">
				  {new Date(lastInjection.timestamp).toLocaleString()}
				</div>
			  </div>
			</div>
			<div className="text-xs text-cyan-200 space-y-1">
			  <div>Event Type: <span className="font-bold">{lastInjection.event.type}</span></div>
			  <div>Target: <span className="font-bold">{lastInjection.folder}</span></div>
			  <div>Value: <span className="font-bold">{lastInjection.event.value}</span></div>
			  {lastInjection.event.location && (
				<div>Location: <span className="font-mono text-xs">{lastInjection.event.location}</span></div>
			  )}
			</div>
		  </div>
		)}

		<div className="bg-slate-900/30 border border-cyan-500/20 rounded-lg overflow-hidden">
		  {operations.length === 0 ? (
			<div className="p-6 text-center text-cyan-300/50">
			  No operations yet. Copy or move files to see history.
			</div>
		  ) : (
			<div className="divide-y divide-slate-700/50">
			  {operations.map(op => (
				<div key={op.id} className="p-3 hover:bg-slate-800/30 transition-colors">
				  <div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
					  <span className={op.success ? 'text-green-400' : 'text-red-400'}>
						{op.success ? '✓' : '✗'}
					  </span>
					  <span className="font-medium text-cyan-200 text-sm">
						{op.operation.replace(/_/g, ' ').toUpperCase()}
					  </span>
					  <span className="text-xs text-cyan-300/50">
						{formatFileSize(op.fileSize)}
					  </span>
					</div>
					<span className="text-xs text-cyan-300/50">
					  {formatTimestamp(op.timestamp)}
					</span>
				  </div>

				  <div className="text-xs text-cyan-300/70 font-mono bg-slate-950/50 p-2 rounded mb-1">
					<div>→ {op.sourcePath}</div>
					<div>→ {op.targetPath}</div>
				  </div>

				  <div className="flex items-center gap-3 text-xs">
					<span className="text-cyan-300/50">
					  Trust: {op.trustTier} ({op.trustScore.toFixed(1)})
					</span>
					{op.rollbackAvailable && (
					  <span className="text-yellow-400/70">
						↻ Rollback available
					  </span>
					)}
					{op.error && (
					  <span className="text-red-400/70">
						Error: {op.error}
					  </span>
					)}
				  </div>
				</div>
			  ))}
			</div>
		  )}
		</div>
	  </div>

	  {/* Usage Instructions */}
	  <div className="mt-6 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
		<h3 className="text-sm font-semibold text-cyan-400 mb-2">Portal Usage</h3>
		<ul className="text-xs text-cyan-300/70 space-y-1">
		  <li>• Bronze Layer (Initiate/Copilot): Sandbox access only</li>
		  <li>• Silver Layer (Partner): FiveM, UE5, Unity linked folders unlocked</li>
		  <li>• Gold Layer (Sovereign): Lucy's own codebase access</li>
		  <li>• Use Lucy's copyToSandbox(), copyToLinked(), moveToLinked() methods</li>
		  <li>• All operations tracked and can be rolled back if needed</li>
		  <li>• <strong className="text-lucy-primary">🌍 Drag Earth events from Face 1 to inject into simulations</strong></li>
		</ul>
	  </div>
	</div>
  );
}
