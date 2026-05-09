/**
 * LUCY CHAT SOVEREIGNTY — EMMA SUPERVISORY TERMINAL
 * ==================================================
 * Chat window as central proposal gate with full ActionEngine integration
 * 
 * WHAT THIS DOES:
 * Transforms chat from passive logging to active proposal orchestration.
 * All RiskWeight > 0.7 actions are held in chat state until human approval.
 * 
 * WHY THIS EXISTS:
 * Lucy must never bypass human authority for high-risk actions. The chat
 * window is the visual manifestation of the ActionEngine approval gate.
 * 
 * HOW THIS WORKS:
 * 1. Listen for action.proposed events (RiskWeight > 0.7)
 * 2. Display proposal in chat with approve/deny buttons
 * 3. User clicks approve → emit LUCY.ACTION.APPROVED
 * 4. User clicks deny → emit LUCY.ACTION.BLOCKED
 * 5. ActionEngine proceeds or aborts based on response
 * 
 * NO MORE LOGS-ONLY — THIS IS THE COMMAND CENTER
 */

// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { agentEventBus } from '../../core/agents/AgentEventBus';
import { actionEngine } from '../../core/action/ActionEngine';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  type: 'message' | 'narration' | 'proposal' | 'threat' | 'status';
  content: string;
  timestamp: number;
  agentId?: string;
  livingName?: string;
  metadata?: Record<string, any>;
}

interface PendingProposal {
  id: string;
  traceId: string;
  agentId: string;
  action: string;
  details: Record<string, any>;
  riskWeight: number;
  timestamp: number;
  status: 'pending' | 'approved' | 'denied' | 'timeout';
}

// ═══════════════════════════════════════════════════════════════════════════
// LUCY CHAT SOVEREIGNTY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LucyChatSovereignty() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingProposals, setPendingProposals] = useState<PendingProposal[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // Initialize voice synthesis and recognition
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Load available voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Try to select "Microsoft Zira" or first available
        const preferredVoice = voices.find(v => v.name.includes('Zira')) || voices[0];
        if (preferredVoice) {
          setSelectedVoice(preferredVoice.name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Initialize Web Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
      }
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Lucy speaks (TTS)
  // ─────────────────────────────────────────────────────────────────────────

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;  // Sovereign, calm pace
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Use selected voice
    if (selectedVoice) {
      const voice = availableVoices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
    }

    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, selectedVoice, availableVoices]);

  // ─────────────────────────────────────────────────────────────────────────
  // Start listening (STT)
  // ─────────────────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      addMessage({
        type: 'status',
        content: '⚠️ Speech recognition not available in this browser',
        timestamp: Date.now(),
        livingName: 'LUCY'
      });
      return;
    }

    setIsListening(true);

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setUserInput(transcript);
      setIsListening(false);

      // Add confirmation message
      addMessage({
        type: 'status',
        content: `👂 Heard: "${transcript}"`,
        timestamp: Date.now(),
        livingName: 'EARS_ENGINE'
      });
    };

    recognitionRef.current.onerror = (error: any) => {
      setIsListening(false);
      addMessage({
        type: 'status',
        content: `❌ Speech recognition error: ${error.error}`,
        timestamp: Date.now(),
        livingName: 'EARS_ENGINE'
      });
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Stop listening
  // ─────────────────────────────────────────────────────────────────────────

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-scroll to bottom
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
	messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingProposals]);

  // ─────────────────────────────────────────────────────────────────────────
  // Listen to AgentEventBus
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
	// Narration events
	const handleNarration = (payload: any) => {
	  const message = {
		type: 'narration' as const,
		content: payload.text,
		timestamp: payload.timestamp,
		livingName: payload.livingName
	  };

	  addMessage(message);

	  // Lucy speaks narration (if voice enabled)
	  if (voiceEnabled && payload.livingName && payload.livingName.includes('LUCY')) {
		speak(payload.text);
	  }
	};

	// Action proposals (high-risk actions requiring approval)
	const handleProposal = (payload: any) => {
	  const riskWeight = payload.data?.riskWeight || 0;

	  // Only hold proposals with RiskWeight > 0.7
	  if (riskWeight > 0.7) {
		const proposal: PendingProposal = {
		  id: `proposal-${Date.now()}`,
		  traceId: payload.traceId,
		  agentId: payload.agentId,
		  action: payload.data.action,
		  details: payload.data,
		  riskWeight,
		  timestamp: payload.timestamp,
		  status: 'pending'
		};

		setPendingProposals(prev => [...prev, proposal]);

		addMessage({
		  type: 'proposal',
		  content: `⚠️  HIGH-RISK ACTION PROPOSED: ${payload.data.action}`,
		  timestamp: payload.timestamp,
		  agentId: payload.agentId,
		  metadata: { proposalId: proposal.id }
		});
	  } else {
		// Low-risk actions auto-approve (just log)
		addMessage({
		  type: 'status',
		  content: `✅ Action proposed: ${payload.data.action} (auto-approved, risk: ${(riskWeight * 100).toFixed(0)}%)`,
		  timestamp: payload.timestamp,
		  agentId: payload.agentId
		});
	  }
	};

	// Action completed
	const handleCompleted = (payload: any) => {
	  addMessage({
		type: 'status',
		content: `✅ Action completed: ${payload.data.action}`,
		timestamp: payload.timestamp,
		agentId: payload.agentId
	  });
	};

	// Action blocked by Emma
	const handleBlocked = (payload: any) => {
	  addMessage({
		type: 'threat',
		content: `🛑 Emma blocked: ${payload.data.rationale || payload.data.error}`,
		timestamp: payload.timestamp,
		agentId: payload.agentId
	  });

	  // Remove from pending proposals if exists
	  setPendingProposals(prev =>
		prev.filter(p => p.traceId !== payload.traceId)
	  );
	};

	// Threat detected
	const handleThreat = (payload: any) => {
	  addMessage({
		type: 'threat',
		content: `🔴 THREAT DETECTED: ${payload.data.threat || payload.data.severity}`,
		timestamp: payload.timestamp,
		agentId: payload.agentId
	  });
	};

	// Register listeners
	agentEventBus.on('narration', handleNarration);
	agentEventBus.on('action.proposed', handleProposal);
	agentEventBus.on('action.completed', handleCompleted);
	agentEventBus.on('action.blocked', handleBlocked);
	agentEventBus.on('threat.detected', handleThreat);

	// Cleanup
	return () => {
	  agentEventBus.off('narration', handleNarration);
	  agentEventBus.off('action.proposed', handleProposal);
	  agentEventBus.off('action.completed', handleCompleted);
	  agentEventBus.off('action.blocked', handleBlocked);
	  agentEventBus.off('threat.detected', handleThreat);
	};
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Add message to chat
  // ─────────────────────────────────────────────────────────────────────────

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id'>) => {
	const newMessage: ChatMessage = {
	  ...msg,
	  id: `msg-${Date.now()}-${Math.random()}`
	};

	setMessages(prev => [...prev, newMessage]);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Handle user input
  // ─────────────────────────────────────────────────────────────────────────

  const handleSendMessage = useCallback(async () => {
	if (!userInput.trim()) return;

	const userMessage = userInput.trim();
	setUserInput('');

	// Add user message to chat
	addMessage({
	  type: 'message',
	  content: userMessage,
	  timestamp: Date.now(),
	  livingName: 'HUMAN_ROOT'
	});

	// Emit to ActionEngine
	agentEventBus.emit('action.proposed', {
	  agentId: 'human-root',
	  eventType: 'action.proposed',
	  data: {
		action: 'human_message',
		message: userMessage,
		riskWeight: 0.1  // Human messages are always low-risk
	  },
	  timestamp: Date.now(),
	  traceId: `human-msg-${Date.now()}`,
	  sourceChannel: 'inter-agent',
	  requiresResponse: false
	});

	// Show typing indicator
	setIsTyping(true);

	// Simulate Lucy's response (replace with real ActionEngine integration)
	setTimeout(() => {
	  setIsTyping(false);
	  addMessage({
		type: 'message',
		content: `Acknowledged: "${userMessage}"`,
		timestamp: Date.now(),
		livingName: 'LUCY'
	  });
	}, 1000);
  }, [userInput, addMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // Approve proposal
  // ─────────────────────────────────────────────────────────────────────────

  const handleApproveProposal = useCallback(async (proposal: PendingProposal) => {
	// Emit approval event
	agentEventBus.emit('action.approved', {
	  agentId: 'human-root',
	  eventType: 'action.approved',
	  data: {
		action: proposal.action,
		traceId: proposal.traceId,
		approvedAt: Date.now()
	  },
	  timestamp: Date.now(),
	  traceId: proposal.traceId,
	  sourceChannel: 'inter-agent'
	});

	// Update proposal status
	setPendingProposals(prev =>
	  prev.map(p =>
		p.id === proposal.id ? { ...p, status: 'approved' } : p
	  )
	);

	// Add confirmation message
	addMessage({
	  type: 'status',
	  content: `✅ APPROVED: ${proposal.action}`,
	  timestamp: Date.now(),
	  livingName: 'HUMAN_ROOT'
	});

	// Remove from pending after 3 seconds
	setTimeout(() => {
	  setPendingProposals(prev => prev.filter(p => p.id !== proposal.id));
	}, 3000);
  }, [addMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // Deny proposal
  // ─────────────────────────────────────────────────────────────────────────

  const handleDenyProposal = useCallback(async (proposal: PendingProposal) => {
	// Emit blocked event
	agentEventBus.emit('action.blocked', {
	  agentId: 'human-root',
	  eventType: 'action.blocked',
	  data: {
		action: proposal.action,
		traceId: proposal.traceId,
		rationale: 'Denied by Human Root',
		blockedAt: Date.now()
	  },
	  timestamp: Date.now(),
	  traceId: proposal.traceId,
	  sourceChannel: 'inter-agent'
	});

	// Update proposal status
	setPendingProposals(prev =>
	  prev.map(p =>
		p.id === proposal.id ? { ...p, status: 'denied' } : p
	  )
	);

	// Add confirmation message
	addMessage({
	  type: 'threat',
	  content: `🛑 DENIED: ${proposal.action}`,
	  timestamp: Date.now(),
	  livingName: 'HUMAN_ROOT'
	});

	// Remove from pending after 3 seconds
	setTimeout(() => {
	  setPendingProposals(prev => prev.filter(p => p.id !== proposal.id));
	}, 3000);
  }, [addMessage]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
	<div className="flex flex-col h-full bg-[#050810] font-mono">

	  {/* Header */}
	  <div className="border-b border-slate-800 p-4">
		<h2 className="text-xl font-black text-white tracking-tighter">
		  LUCY CHAT SOVEREIGNTY
		</h2>
		<p className="text-xs text-slate-500 uppercase tracking-widest mt-1">
		  Emma Supervisory Terminal — Central Proposal Gate
		</p>
	  </div>

	  {/* Pending Proposals Bar */}
	  {pendingProposals.filter(p => p.status === 'pending').length > 0 && (
		<div className="bg-red-950 border-b border-red-800 p-4">
		  <div className="flex items-center gap-3">
			<div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
			<span className="text-red-400 font-black text-xs uppercase tracking-widest">
			  {pendingProposals.filter(p => p.status === 'pending').length} HIGH-RISK ACTIONS PENDING APPROVAL
			</span>
		  </div>
		</div>
	  )}

	  {/* Messages */}
	  <div
		ref={chatContainerRef}
		className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
	  >
		{messages.map(msg => (
		  <div
			key={msg.id}
			className={`
			  flex gap-3 items-start
			  ${msg.livingName === 'HUMAN_ROOT' ? 'flex-row-reverse' : 'flex-row'}
			`}
		  >
			{/* Avatar */}
			<div
			  className={`
				w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black
				${msg.type === 'threat' ? 'bg-red-500 text-white' : ''}
				${msg.type === 'proposal' ? 'bg-yellow-500 text-black' : ''}
				${msg.type === 'narration' ? 'bg-cyan-500 text-black' : ''}
				${msg.type === 'message' && msg.livingName === 'HUMAN_ROOT' ? 'bg-white text-black' : ''}
				${msg.type === 'message' && msg.livingName !== 'HUMAN_ROOT' ? 'bg-purple-500 text-white' : ''}
				${msg.type === 'status' ? 'bg-slate-700 text-slate-300' : ''}
			  `}
			>
			  {msg.livingName?.slice(0, 2) || msg.agentId?.slice(0, 2)?.toUpperCase() || '??'}
			</div>

			{/* Message Content */}
			<div
			  className={`
				flex-1 max-w-[70%] rounded-lg p-3 text-sm
				${msg.livingName === 'HUMAN_ROOT' ? 'bg-white text-black' : 'bg-slate-800 text-white'}
				${msg.type === 'threat' ? 'bg-red-900 border border-red-700' : ''}
				${msg.type === 'proposal' ? 'bg-yellow-900 border border-yellow-700' : ''}
			  `}
			>
			  {/* Header */}
			  <div className="flex items-center justify-between mb-1">
				<span className="text-[10px] font-black uppercase tracking-wider opacity-70">
				  {msg.livingName || msg.agentId || 'SYSTEM'}
				</span>
				<span className="text-[9px] opacity-50">
				  {new Date(msg.timestamp).toLocaleTimeString()}
				</span>
			  </div>

			  {/* Content */}
			  <div className="text-xs leading-relaxed whitespace-pre-wrap">
				{msg.content}
			  </div>
			</div>
		  </div>
		))}

		{/* Typing Indicator */}
		{isTyping && (
		  <div className="flex gap-3 items-start">
			<div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-black text-white">
			  LU
			</div>
			<div className="bg-slate-800 rounded-lg p-3">
			  <div className="flex gap-1">
				<div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
				<div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
				<div className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
			  </div>
			</div>
		  </div>
		)}

		<div ref={messagesEndRef} />
	  </div>

	  {/* Pending Proposals */}
	  {pendingProposals.filter(p => p.status === 'pending').map(proposal => (
		<div
		  key={proposal.id}
		  className="bg-yellow-900 border-t border-yellow-700 p-4"
		>
		  <div className="flex items-start justify-between gap-4">
			<div className="flex-1">
			  <div className="flex items-center gap-2 mb-2">
				<div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
				<span className="text-yellow-400 font-black text-sm uppercase tracking-widest">
				  HIGH-RISK ACTION REQUIRES APPROVAL
				</span>
			  </div>

			  <div className="text-white text-sm font-bold mb-1">
				{proposal.action.replace(/_/g, ' ').toUpperCase()}
			  </div>

			  <div className="text-yellow-300 text-xs mb-2">
				Risk Weight: {(proposal.riskWeight * 100).toFixed(0)}% | Agent: {proposal.agentId}
			  </div>

			  {/* Details */}
			  <div className="bg-black bg-opacity-30 rounded p-2 text-[10px] text-slate-300 font-mono mb-3">
				{Object.entries(proposal.details)
				  .filter(([key]) => !['action', 'riskWeight'].includes(key))
				  .map(([key, value]) => (
					<div key={key} className="flex gap-2">
					  <span className="text-yellow-500 font-bold">{key}:</span>
					  <span>{JSON.stringify(value)}</span>
					</div>
				  ))}
			  </div>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-col gap-2">
			  <button
				onClick={() => handleApproveProposal(proposal)}
				className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-black text-xs uppercase tracking-wider rounded transition-colors"
			  >
				APPROVE
			  </button>
			  <button
				onClick={() => handleDenyProposal(proposal)}
				className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded transition-colors"
			  >
				DENY
			  </button>
			</div>
		  </div>
		</div>
	  ))}

	  {/* Input */}
	  <div className="border-t border-slate-800 p-4">
		{/* Voice Controls */}
		<div className="flex gap-2 mb-3 items-center">
		  <button
			onClick={isListening ? stopListening : startListening}
			className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
			  isListening
				? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
				: 'bg-slate-700 hover:bg-slate-600 text-slate-300'
			}`}
			title={isListening ? 'Stop listening' : 'Voice input'}
		  >
			{isListening ? '🎤 LISTENING...' : '🎤 VOICE'}
		  </button>

		  <button
			onClick={() => setVoiceEnabled(!voiceEnabled)}
			className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${
			  voiceEnabled
				? 'bg-cyan-600 hover:bg-cyan-700 text-white'
				: 'bg-slate-700 hover:bg-slate-600 text-slate-300'
			}`}
			title={voiceEnabled ? 'Voice enabled' : 'Voice disabled'}
		  >
			{voiceEnabled ? '🗣️ VOICE ON' : '🔇 VOICE OFF'}
		  </button>

		  {/* Voice Selector */}
		  {availableVoices.length > 0 && (
			<select
			  value={selectedVoice}
			  onChange={(e) => setSelectedVoice(e.target.value)}
			  className="flex-1 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-mono border border-slate-700 focus:border-cyan-500 focus:outline-none"
			>
			  {availableVoices.map(voice => (
				<option key={voice.name} value={voice.name}>
				  {voice.name} ({voice.lang})
				</option>
			  ))}
			</select>
		  )}
		</div>

		{/* Text Input */}
		<div className="flex gap-3">
		  <input
			type="text"
			value={userInput}
			onChange={(e) => setUserInput(e.target.value)}
			onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
			placeholder="Send command to Lucy..."
			className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-lg text-sm font-mono border border-slate-700 focus:border-cyan-500 focus:outline-none"
		  />
		  <button
			onClick={handleSendMessage}
			disabled={!userInput.trim()}
			className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black text-xs uppercase tracking-wider rounded-lg transition-colors"
		  >
			SEND
		  </button>
		</div>
	  </div>
	</div>
  );
}
