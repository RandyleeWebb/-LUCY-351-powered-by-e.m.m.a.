/**
 * WHAT THIS DOES:
 * Defines the first Lucy VR / headset access bridge contract. This bridge is designed
 * for Quest Browser, WebXR-capable headsets, SteamVR-compatible browser surfaces, and
 * future headset adapters.
 *
 * WHY THIS EXISTS:
 * Randy should be able to interact with Lucy from a Quest VR headset or other VR
 * environment: ask "why are you seeing that?", ask Lucy to check systems, inspect
 * build artifacts, view logs, and issue proposed commands without bypassing safety.
 *
 * HOW THIS WORKS:
 * VRBridge receives structured VR session events and converts them into Lucy core
 * requests. It does not execute system changes directly. Any action request becomes
 * an ActionProposal and must go through ActionEngine, BuilderSafetyGate, policy checks,
 * Look-Before-Leap, DeltaVault, and ArtifactVault.
 *
 * HOW TO CHANGE IT:
 * Add new headset support by adding a new VRHeadsetKind value or adapter class.
 * Add new interaction modes by extending VRInteractionIntent. Do not add direct system
 * execution methods here; execution authority belongs only to ActionEngine.
 *
 * DEBUG EXAMPLE:
 * If Randy says "restart the FiveM server" in VR, VRBridge should emit a proposed
 * action, not run a command. If the server restarts directly from this file, that is
 * a security bug. Inspect VRBridge.routeIntent() and confirm action intents publish
 * proposals only.
 */

export type VRHeadsetKind =
  | 'quest_browser'
  | 'quest_link'
  | 'steamvr_browser'
  | 'webxr_generic'
  | 'desktop_simulator'
  | 'unknown';

export type VRInteractionIntent =
  | 'ask_why'
  | 'check_status'
  | 'inspect_artifact'
  | 'inspect_logs'
  | 'open_dashboard'
  | 'propose_action'
  | 'voice_conversation'
  | 'spatial_map_view';

export interface VRSessionInfo {
  sessionId: string;
  headsetKind: VRHeadsetKind;
  userLabel: string;
  startedAt: number;
  localNetworkOnly: boolean;
}

export interface VRInteractionEvent {
  id: string;
  sessionId: string;
  intent: VRInteractionIntent;
  spokenText?: string;
  selectedArtifactId?: string;
  target?: string;
  payload?: Record<string, unknown>;
  timestamp: number;
}

export interface VRBridgeRouteResult {
  accepted: boolean;
  routedTo:
    | 'LucyConversationInterface'
    | 'WhyQueryEngine'
    | 'CheckRequestEngine'
    | 'ArtifactVault'
    | 'ActionEngineProposalQueue'
    | 'VRDashboard'
    | 'rejected';
  reason: string;
  requiresActionEngine: boolean;
}

export class VRBridge {
  constructor(private readonly bridgeName = 'VRBridge') {}

  routeIntent(event: VRInteractionEvent): VRBridgeRouteResult {
    switch (event.intent) {
      case 'ask_why':
        return {
          accepted: true,
          routedTo: 'WhyQueryEngine',
          reason: 'VR why-query routed to Lucy rationale system.',
          requiresActionEngine: false
        };

      case 'check_status':
        return {
          accepted: true,
          routedTo: 'CheckRequestEngine',
          reason: 'VR check request routed to Lucy check engine.',
          requiresActionEngine: false
        };

      case 'inspect_artifact':
        return {
          accepted: true,
          routedTo: 'ArtifactVault',
          reason: 'VR artifact inspection routed to ArtifactVault.',
          requiresActionEngine: false
        };

      case 'inspect_logs':
        return {
          accepted: true,
          routedTo: 'ArtifactVault',
          reason: 'VR log inspection routed to ArtifactVault evidence records.',
          requiresActionEngine: false
        };

      case 'open_dashboard':
      case 'spatial_map_view':
        return {
          accepted: true,
          routedTo: 'VRDashboard',
          reason: 'VR spatial interface request routed to dashboard layer.',
          requiresActionEngine: false
        };

      case 'propose_action':
        return {
          accepted: true,
          routedTo: 'ActionEngineProposalQueue',
          reason: 'VR action request converted into proposal; ActionEngine must decide.',
          requiresActionEngine: true
        };

      case 'voice_conversation':
        return {
          accepted: true,
          routedTo: 'LucyConversationInterface',
          reason: 'VR voice conversation routed to Lucy conversation interface.',
          requiresActionEngine: false
        };

      default:
        return {
          accepted: false,
          routedTo: 'rejected',
          reason: `Unsupported VR intent: ${String(event.intent)}`,
          requiresActionEngine: false
        };
    }
  }
}