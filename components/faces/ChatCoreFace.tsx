/**
 * LUCY SOVEREIGN 351 - Level 6 AGI v8
 * Chat Core Face - Front Face
 * 
 * LL219: CHAT_NEXUS
 * LL210: STATE_ORCHESTRATOR
 * 
 * Main instruction window, Sovereign Voice logs, Goal progress
 */

// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { voiceManager } from '../../core/audio/VoiceManager';
import type { Goal } from '../../core/cognitive/goals/Goal';

export interface ChatMessage {
  id: string;
  role: 'user' | 'lucy' | 'system';
  content: string;
  timestamp: number;
  spoken?: boolean;
}

interface ChatCoreFaceProps {
  goals?: Goal[];
  onSendMessage?: (message: string) => void;
}

export const ChatCoreFace: React.FC<ChatCoreFaceProps> = ({ goals = [], onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
	{
	  id: 'm1',
	  role: 'system',
	  content: 'Lucy Sovereign 351 initialized. LL219 Chat Nexus is active. LL210 State Orchestrator is monitoring 351 nodes.',
	  timestamp: Date.now()
	}
  ]);
  const [input, setInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
	messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speak Lucy's messages
  useEffect(() => {
	const lastMessage = messages[messages.length - 1];
	if (lastMessage && lastMessage.role === 'lucy' && voiceEnabled && !lastMessage.spoken) {
	  voiceManager.speak(lastMessage.content);
	  setMessages(prev => prev.map(m =>
		m.id === lastMessage.id ? { ...m, spoken: true } : m
	  ));
	}
  }, [messages, voiceEnabled]);

  const handleSend = () => {
	if (input.trim()) {
	  const userMessage: ChatMessage = {
		id: `msg_${Date.now()}`,
		role: 'user',
		content: input.trim(),
		timestamp: Date.now()
	  };

	  setMessages(prev => [...prev, userMessage]);

	  if (onSendMessage) {
		onSendMessage(input.trim());
	  }

	  // Simulate Lucy response
	  setTimeout(() => {
		const lucyMessage: ChatMessage = {
		  id: `msg_${Date.now()}`,
		  role: 'lucy',
		  content: `Acknowledged: "${input.trim()}". Processing request through LL210 State Orchestrator.`,
		  timestamp: Date.now(),
		  spoken: false
		};
		setMessages(prev => [...prev, lucyMessage]);
	  }, 1000);

	  setInput('');
	}
  };

  const topGoal = goals.length > 0 ? goals[0] : null;

  return (
	<div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100%', gap: '16px' }}>
	  {/* Header */}
	  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
		<div>
		  <div style={{ fontSize: '20px', fontWeight: 900, color: '#00f2ff' }}>
			🎙️ LUCY CHAT CORE
		  </div>
		  <div style={{ fontSize: '12px', color: '#9aa4c7', marginTop: '4px' }}>
			LL219: CHAT_NEXUS | LL210: STATE_ORCHESTRATOR
		  </div>
		</div>
		<button
		  onClick={() => setVoiceEnabled(!voiceEnabled)}
		  style={{
			background: voiceEnabled ? '#16a34a' : '#334155',
			color: '#fff',
			border: 'none',
			borderRadius: '8px',
			padding: '8px 12px',
			fontWeight: 700,
			cursor: 'pointer',
			fontSize: '12px'
		  }}
		>
		  {voiceEnabled ? '🔊 Voice ON' : '🔇 Voice OFF'}
		</button>
	  </div>

	  {/* Goal Progress */}
	  {topGoal && (
		<div
		  style={{
			background: 'rgba(0, 242, 255, 0.1)',
			border: '1px solid #00f2ff',
			borderRadius: '8px',
			padding: '12px',
			fontSize: '13px'
		  }}
		>
		  <div style={{ fontWeight: 700, marginBottom: '6px' }}>
			📌 Active Goal: {topGoal.description}
		  </div>
		  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
			<div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
			  <div
				style={{
				  width: `${topGoal.progress * 100}%`,
				  height: '100%',
				  background: '#00f2ff',
				  transition: 'width 0.3s'
				}}
			  />
			</div>
			<span style={{ fontWeight: 700 }}>{Math.round(topGoal.progress * 100)}%</span>
		  </div>
		</div>
	  )}

	  {/* Messages */}
	  <div
		style={{
		  flex: 1,
		  overflowY: 'auto',
		  display: 'flex',
		  flexDirection: 'column',
		  gap: '12px',
		  padding: '8px'
		}}
	  >
		{messages.map(msg => (
		  <div
			key={msg.id}
			style={{
			  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
			  maxWidth: '75%',
			  background: msg.role === 'user' ? 'rgba(0, 242, 255, 0.2)' : msg.role === 'lucy' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(100, 100, 100, 0.2)',
			  border: `1px solid ${msg.role === 'user' ? '#00f2ff' : msg.role === 'lucy' ? '#16a34a' : '#6b7280'}`,
			  borderRadius: '12px',
			  padding: '12px',
			  fontSize: '14px'
			}}
		  >
			<div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px', color: '#9aa4c7' }}>
			  {msg.role === 'user' ? 'Randy' : msg.role === 'lucy' ? 'Lucy' : 'System'}
			</div>
			<div style={{ lineHeight: 1.5 }}>{msg.content}</div>
			<div style={{ fontSize: '10px', color: '#6b7280', marginTop: '6px', textAlign: 'right' }}>
			  {new Date(msg.timestamp).toLocaleTimeString()}
			</div>
		  </div>
		))}
		<div ref={messagesEndRef} />
	  </div>

	  {/* Input */}
	  <div style={{ display: 'flex', gap: '8px' }}>
		<input
		  type="text"
		  value={input}
		  onChange={(e) => setInput(e.target.value)}
		  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
		  placeholder="Speak to Lucy Sovereign..."
		  style={{
			flex: 1,
			background: 'rgba(0,0,0,0.4)',
			border: '1px solid #00f2ff',
			borderRadius: '8px',
			padding: '12px',
			color: '#e8ecff',
			fontSize: '14px',
			fontFamily: 'Inter, system-ui, sans-serif'
		  }}
		/>
		<button
		  onClick={handleSend}
		  disabled={!input.trim()}
		  style={{
			background: input.trim() ? '#00f2ff' : '#334155',
			color: input.trim() ? '#000' : '#6b7280',
			border: 'none',
			borderRadius: '8px',
			padding: '12px 24px',
			fontWeight: 900,
			cursor: input.trim() ? 'pointer' : 'not-allowed',
			fontSize: '14px'
		  }}
		>
		  SEND
		</button>
	  </div>
	</div>
  );
};
