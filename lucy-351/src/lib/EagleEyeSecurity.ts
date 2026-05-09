import { EarthEvent, SecurityAlert, SecurityNode } from '../types';

export class EagleEyeSecurity {
  private static ATTACK_SIGNATURES = [
    { pattern: /select.*from/i, type: 'SQL_INJECTION_PROBE' as const, desc: 'Heuristic match for SQL query injection in telemetry buffer.' },
    { pattern: /0x[0-9a-f]{8,}/i, type: 'BUFFER_OVERFLOW_ATTEMPT' as const, desc: 'Memory address escape sequence detected in data stream.' },
    { pattern: /admin.*password/i, type: 'IDENTITY_SPOOF' as const, desc: 'Unauthorized credential probe in planetary message.' },
    { pattern: /\{\{.*\}\}/i, type: 'SHADOW_STATE_INJECTION' as const, desc: 'Template injection detected in cognitive frame.' }
  ];

  static scan(event: EarthEvent): SecurityAlert | null {
    // Audit the description for known attack patterns
    for (const sig of this.ATTACK_SIGNATURES) {
      if (sig.pattern.test(event.description)) {
        return {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: sig.type,
          severity: 0.8 + Math.random() * 0.2, // High severity
          origin: event.source,
          timestamp: Date.now(),
          description: sig.desc,
          mitigated: false
        };
      }
    }

    // High frequency detection (simulated as entropy check)
    if (event.severity > 0.99 && Math.random() > 0.9) {
      return {
        id: `alert-entropy-${Date.now()}`,
        type: 'DDOS_STORM' as const,
        severity: 0.95,
        origin: 'GLOBAL_NETWORK',
        timestamp: Date.now(),
        description: 'Synchronized signal spike detected from multiple unverified planetary origins.',
        mitigated: false
      };
    }

    return null;
  }

  static getInitialNodes(): SecurityNode[] {
    return [
      { id: 'node-v-1', label: 'VISUAL_AUDIT_01', status: 'SCANNING', lastScanTime: Date.now(), load: 0.12, bandwidth: 45.2, connections: 12 },
      { id: 'node-l-1', label: 'LINGUISTIC_SENTINEL', status: 'SCANNING', lastScanTime: Date.now(), load: 0.08, bandwidth: 12.8, connections: 4 },
      { id: 'node-p-1', label: 'PLANETARY_PORT_WALL', status: 'SCANNING', lastScanTime: Date.now(), load: 0.15, bandwidth: 156.4, connections: 89 },
      { id: 'node-i-1', label: 'IDENTITY_CORE_VAULT', status: 'SCANNING', lastScanTime: Date.now(), load: 0.02, bandwidth: 2.1, connections: 1 }
    ];
  }
}
