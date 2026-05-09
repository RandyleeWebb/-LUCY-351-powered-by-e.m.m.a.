/**
 * LUCY SOVEREIGN 351 - PRELOAD SCRIPT
 * 
 * Secure bridge between Renderer (dashboard) and Main (kernel)
 * Exposes ONLY the APIs Lucy needs, nothing more
 */

import { contextBridge, ipcRenderer } from 'electron';

// Expose sovereign APIs to the renderer
contextBridge.exposeInMainWorld('sovereignAPI', {
  // Hardware Truth
  hardwareScan: () => ipcRenderer.invoke('sovereign:hardware-scan'),

  // Command Execution
  executeCommand: (command: string, args: string[]) =>
	ipcRenderer.invoke('sovereign:execute-command', command, args),

  // State Persistence (Alpha Delta Vault)
  recordState: (key: string, value: string) =>
	ipcRenderer.invoke('sovereign:record-state', key, value),

  rehydrateState: () =>
	ipcRenderer.invoke('sovereign:rehydrate-state'),

  // Vault History
  getHistory: (table: string, limit?: number) =>
	ipcRenderer.invoke('sovereign:get-history', table, limit),

  // Integration Manager
  integrations: {
	initialize: () => ipcRenderer.invoke('integration:initialize'),
	list: () => ipcRenderer.invoke('integration:list'),
	available: () => ipcRenderer.invoke('integration:available'),
	execute: (integrationId: string, action: string, params?: any) =>
	  ipcRenderer.invoke('integration:execute', integrationId, action, params),
	status: (integrationId: string) =>
	  ipcRenderer.invoke('integration:status', integrationId),
	registry: () => ipcRenderer.invoke('integration:registry'),
  }
});

// Type definitions for TypeScript
declare global {
  interface Window {
	sovereignAPI: {
	  hardwareScan: () => Promise<any>;
	  executeCommand: (command: string, args: string[]) => Promise<any>;
	  recordState: (key: string, value: string) => Promise<{ success: boolean }>;
	  rehydrateState: () => Promise<Record<string, any>>;
	  getHistory: (table: string, limit?: number) => Promise<any[]>;
	  integrations: {
		initialize: () => Promise<{ success: boolean; error?: string }>;
		list: () => Promise<Array<{ id: string; name: string; status: any }>>;
		available: () => Promise<Array<{ id: string; name: string; type: string }>>;
		execute: (integrationId: string, action: string, params?: any) => Promise<any>;
		status: (integrationId: string) => Promise<any>;
		registry: () => Promise<any>;
	  };
	};
  }
}

console.log('[PRELOAD] Sovereign API bridge established');
