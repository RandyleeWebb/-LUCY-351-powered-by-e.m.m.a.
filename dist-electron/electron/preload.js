"use strict";
/**
 * LUCY SOVEREIGN 351 - PRELOAD SCRIPT
 *
 * Secure bridge between Renderer (dashboard) and Main (kernel)
 * Exposes ONLY the APIs Lucy needs, nothing more
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose sovereign APIs to the renderer
electron_1.contextBridge.exposeInMainWorld('sovereignAPI', {
    // Hardware Truth
    hardwareScan: () => electron_1.ipcRenderer.invoke('sovereign:hardware-scan'),
    // Command Execution
    executeCommand: (command, args) => electron_1.ipcRenderer.invoke('sovereign:execute-command', command, args),
    // State Persistence (Alpha Delta Vault)
    recordState: (key, value) => electron_1.ipcRenderer.invoke('sovereign:record-state', key, value),
    rehydrateState: () => electron_1.ipcRenderer.invoke('sovereign:rehydrate-state'),
    // Vault History
    getHistory: (table, limit) => electron_1.ipcRenderer.invoke('sovereign:get-history', table, limit),
    // Integration Manager
    integrations: {
        initialize: () => electron_1.ipcRenderer.invoke('integration:initialize'),
        list: () => electron_1.ipcRenderer.invoke('integration:list'),
        available: () => electron_1.ipcRenderer.invoke('integration:available'),
        execute: (integrationId, action, params) => electron_1.ipcRenderer.invoke('integration:execute', integrationId, action, params),
        status: (integrationId) => electron_1.ipcRenderer.invoke('integration:status', integrationId),
        registry: () => electron_1.ipcRenderer.invoke('integration:registry'),
    }
});
console.log('[PRELOAD] Sovereign API bridge established');
