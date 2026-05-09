/**
 * LUCY SOVEREIGN 351 - Global Type Definitions
 * 
 * Extends Window interface with Sovereign APIs
 */

declare global {
  interface Window {
	sovereignAPI?: {
	  hardwareScan: () => Promise<any>;
	  executeCommand: (command: string, args: string[]) => Promise<{
		success: boolean;
		command: string;
		stdout?: string;
		stderr?: string;
		error?: string;
		timestamp: number;
	  }>;
	  recordState: (key: string, value: string) => Promise<{ success: boolean }>;
	  rehydrateState: () => Promise<Record<string, any>>;
	  getHistory: (table: string, limit?: number) => Promise<any[]>;
	};
  }
}

export {};
