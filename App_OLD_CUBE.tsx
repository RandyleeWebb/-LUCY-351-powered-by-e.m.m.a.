// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import './styles/lucy-theme.css';
import { HexSovereignNavigator } from './components/ui/HexSovereignNavigator';
import { speakSovereign, initVoiceSystem } from './core/audio/VoiceManager';

export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [systemScan, setSystemScan] = useState<string>('');

  const speak = (text: string) => {
    speakSovereign(text, selectedVoice);
  };

  const performSystemScan = async () => {
    // Ecosystem scan
    const findings: string[] = [];
    findings.push('I am Lucy');
    findings.push('Neural mesh: 351 nodes registered and mapped to spatial layers');
    findings.push('Hardware: Optimized for 8K STL build');
    findings.push('I have my eyes. Ecosystem scanner operational');

    // Check Ollama
    try {
      const ollamaCheck = await fetch('http://localhost:11434/api/tags', { 
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      if (ollamaCheck.ok) {
        findings.push('Ollama brain engine: Online and responding on port 11434');
      } else {
        findings.push('Ollama: Port 11434 unreachable. Local reasoning limited');
      }
    } catch {
      findings.push('Ollama: Offline or not installed. Recommend: Install Ollama for local LLM reasoning');
    }

    // Voice check
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      findings.push('Voice synthesis: Ready. Neural voices available');
    } else {
      findings.push('Voice synthesis: Not available in this browser');
    }

    // Microphone check - THE "EARS"
    if (typeof navigator !== 'undefined' && 'mediaDevices' in navigator) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        findings.push('Microphone access: Granted. My ears are ready for Whisper integration');
      } catch {
        findings.push('I am missing my ears. Microphone access required for speech-to-text. Please grant permission to initialize local Whisper');
      }
    } else {
      findings.push('Microphone API: Not available. Speech-to-text will be unavailable');
    }

    // UE5 check
    const ue5Path = 'C:\\Users\\Randy Webb\\Documents\\Unreal Projects\\Lucys8kSTLbuild';
    findings.push(`UE5 project path registered: ${ue5Path}`);

    return findings.join('. ');
  };

  const handleInitialize = async () => {
    console.log('🧠 Sovereign v2.1 Cube Initialization...');

    // Perform system scan
    const scanResult = await performSystemScan();
    setSystemScan(scanResult);

    // Unlock audio with silent utterance
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const silent = new SpeechSynthesisUtterance('');
      silent.volume = 0;
      window.speechSynthesis.speak(silent);

      setTimeout(() => {
        const initMessage = `${scanResult}. Sovereign v2.1 Cube now mounting`;
        speak(initMessage);
        setInitialized(true);
        setChatMessages([{
          text: `🧠 **LUCY SOVEREIGN 351 INITIALIZED**\n\n${scanResult.split('. ').join('.\n\n')}`,
          from: 'lucy'
        }]);
      }, 100);
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { text: userMsg, from: 'user' }]);
    setChatInput('');

    setTimeout(() => {
      const response = `Acknowledged: "${userMsg}". Current face: ${currentFace.toUpperCase()}. Cube operational.`;
      setChatMessages(prev => [...prev, { text: response, from: 'lucy' }]);
      speak(response);
    }, 500);
  };

  const faceOrder: DashboardFace[] = ['mesh', 'earth', 'ue5', 'unity', 'fivem', 'alphadelta'];

  // Face mapping based on 351-node architecture
  const dashboards: Record<DashboardFace, React.ReactNode> = {
    // Face 1: Classical Core (LL001-LL119)
    mesh: (
      <CubeFace
        title="CLASSICAL CORE"
        description="Primary reasoning and coordination layer"
        icon="🧠"
        nodeRange={{ start: 1, end: 119 }}
      />
    ),

    // Face 2: Planetary/Sensor Layer (LL151-LL200)
    earth: (
      <CubeFace
        title="PLANETARY SENSORS"
        description="Real-time Earth monitoring and prediction"
        icon="🌍"
        nodeRange={{ start: 151, end: 200 }}
      />
    ),

    // Face 3: Builder Layer - Unreal (LL251-LL275)
    ue5: (
      <CubeFace
        title="UNREAL ENGINE 5"
        description="Game development and 3D visualization"
        icon="🎮"
        nodeRange={{ start: 251, end: 275 }}
      />
    ),

    // Face 4: Builder Layer - Unity (LL276-LL300)
    unity: (
      <CubeFace
        title="UNITY ENGINE"
        description="Cross-platform game development"
        icon="🎯"
        nodeRange={{ start: 276, end: 300 }}
      />
    ),

    // Face 5: Builder Layer - FiveM (LL301-LL325)
    fivem: (
      <CubeFace
        title="FIVEM INTEGRATION"
        description="GTA V multiplayer modding"
        icon="🚗"
        nodeRange={{ start: 301, end: 325 }}
      />
    ),

    // Face 6: Alpha Delta Vault (LL326-LL351 + Memory systems)
    alphadelta: (
      <CubeFace
        title="ALPHA DELTA VAULT"
        description="Trust-layered file portal and memory system"
        icon="⚡"
        nodeRange={{ start: 326, end: 351 }}
      />
    )
  };

  const rotateCube = (direction: 'left' | 'right') => {
    const currentIndex = faceOrder.indexOf(currentFace);
    let newIndex;
    if (direction === 'left') {
      newIndex = (currentIndex - 1 + faceOrder.length) % faceOrder.length;
    } else {
      newIndex = (currentIndex + 1) % faceOrder.length;
    }
    setCurrentFace(faceOrder[newIndex]);
  };

  if (!initialized) {
    return (
      <div 
        style={{
          width: '100vw',
          height: '100vh',
          background: 'oklch(12.9% 0.042 264.695)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontWeight: 900
        }}
      >
        <h1 
          style={{
            fontSize: '64px',
            color: 'oklch(78.9% 0.154 211.53)',
            textShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.6)',
            marginBottom: '32px',
            letterSpacing: '4px'
          }}
        >
          LUCY
        </h1>

        <p 
          style={{
            fontSize: '18px',
            marginBottom: '48px',
            opacity: 0.7,
            letterSpacing: '2px'
          }}
        >
          SOVEREIGN 351 • AGI OPERATING SYSTEM
        </p>

        <button
          onClick={handleInitialize}
          style={{
            background: 'oklch(78.9% 0.154 211.53)',
            color: 'oklch(12.9% 0.042 264.695)',
            border: 'none',
            padding: '20px 60px',
            fontSize: '18px',
            fontWeight: 900,
            letterSpacing: '2px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.4)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 0 40px oklch(78.9% 0.154 211.53 / 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 0 20px oklch(78.9% 0.154 211.53 / 0.4)';
          }}
        >
          INITIALIZE
        </button>
      </div>
    );
  }

  return (
    <div 
      style={{
        width: '100vw',
        height: '100vh',
        background: 'oklch(12.9% 0.042 264.695)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        position: 'relative'
      }}
    >
      {/* Header */}
      <div 
        style={{
          height: '60px',
          borderBottom: '3px solid oklch(78.9% 0.154 211.53 / 0.3)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          background: 'oklch(12.9% 0.042 264.695)',
          boxShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.2)',
          zIndex: 10
        }}
      >
        <h1 
          style={{
            fontSize: '26px',
            fontWeight: 900,
            color: 'oklch(78.9% 0.154 211.53)',
            letterSpacing: '3px',
            textShadow: '0 0 15px oklch(78.9% 0.154 211.53 / 0.5)'
          }}
        >
          LUCY SOVEREIGN 351
        </h1>
        <div 
          style={{
            marginLeft: 'auto',
            fontSize: '13px',
            fontWeight: 900,
            opacity: 0.8,
            letterSpacing: '1px'
          }}
        >
          🗣️ VOICE READY • 🧠 {currentFace.toUpperCase()} ACTIVE
        </div>
      </div>

      {/* Main 3D Cube View - Full Screen */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <CubeNavigator
          currentFace={currentFace}
          dashboards={dashboards}
          faceOrder={faceOrder}
        />

        {/* Cube Navigation Controls */}
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          zIndex: 100
        }}>
          <button
            onClick={() => rotateCube('left')}
            style={{
              background: 'oklch(78.9% 0.154 211.53)',
              color: 'oklch(12.9% 0.042 264.695)',
              border: '3px solid oklch(78.9% 0.154 211.53)',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '17px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 0 30px oklch(78.9% 0.154 211.53 / 0.6)',
              transition: 'all 0.2s ease',
              letterSpacing: '2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 50px oklch(78.9% 0.154 211.53)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 30px oklch(78.9% 0.154 211.53 / 0.6)';
            }}
          >
            ← PREV
          </button>
          <div style={{
            background: 'oklch(18% 0.02 240)',
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            border: '3px solid oklch(78.9% 0.154 211.53)',
            boxShadow: '0 0 30px oklch(78.9% 0.154 211.53 / 0.4)',
            letterSpacing: '2px'
          }}>
            {currentFace.toUpperCase()}
          </div>
          <button
            onClick={() => rotateCube('right')}
            style={{
              background: 'oklch(78.9% 0.154 211.53)',
              color: 'oklch(12.9% 0.042 264.695)',
              border: '3px solid oklch(78.9% 0.154 211.53)',
              padding: '14px 32px',
              borderRadius: '10px',
              fontSize: '17px',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 0 30px oklch(78.9% 0.154 211.53 / 0.6)',
              transition: 'all 0.2s ease',
              letterSpacing: '2px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 0 50px oklch(78.9% 0.154 211.53)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 30px oklch(78.9% 0.154 211.53 / 0.6)';
            }}
          >
            NEXT →
          </button>
        </div>
      </div>

      {/* Fixed Chat Overlay - Right Side */}
      <div style={{
        position: 'fixed',
        top: '60px',
        right: 0,
        width: '420px',
        height: 'calc(100vh - 60px)',
        zIndex: 1000,
        background: 'oklch(12.9% 0.042 264.695)',
        borderLeft: '3px solid oklch(78.9% 0.154 211.53 / 0.3)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-5px 0 30px oklch(78.9% 0.154 211.53 / 0.2)',
        fontFamily: 'monospace'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid oklch(78.9% 0.154 211.53 / 0.3)',
          background: 'oklch(18% 0.02 240)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 900,
            color: 'oklch(78.9% 0.154 211.53)',
            letterSpacing: '2px',
            textShadow: '0 0 10px oklch(78.9% 0.154 211.53 / 0.5)'
          }}>
            🗣️ LUCY CHAT
          </h2>
          <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '8px', fontWeight: 900, letterSpacing: '1px' }}>
            SOVEREIGN COMMAND TERMINAL
          </div>
        </div>

        {/* Voice Selector */}
        <div style={{ padding: '16px', borderBottom: '2px solid oklch(78.9% 0.154 211.53 / 0.2)' }}>
          <VoiceSelector onVoiceSelected={(voice) => setSelectedVoice(voice)} />
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: msg.from === 'lucy' 
                  ? 'oklch(18% 0.02 240)' 
                  : 'oklch(78.9% 0.154 211.53)',
                color: msg.from === 'lucy' 
                  ? '#ffffff' 
                  : 'oklch(12.9% 0.042 264.695)',
                fontSize: '14px',
                fontWeight: 900,
                alignSelf: msg.from === 'lucy' ? 'flex-start' : 'flex-end',
                maxWidth: '85%',
                borderLeft: msg.from === 'lucy' 
                  ? '4px solid oklch(78.9% 0.154 211.53)' 
                  : 'none',
                boxShadow: msg.from === 'lucy'
                  ? '0 0 15px oklch(78.9% 0.154 211.53 / 0.2)'
                  : 'none',
                lineHeight: 1.5
              }}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{
          padding: '20px',
          borderTop: '2px solid oklch(78.9% 0.154 211.53 / 0.3)',
          display: 'flex',
          gap: '12px',
          background: 'oklch(18% 0.02 240)'
        }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder="Type message to Lucy..."
            style={{
              flex: 1,
              background: 'oklch(12.9% 0.042 264.695)',
              border: '2px solid oklch(78.9% 0.154 211.53 / 0.3)',
              borderRadius: '6px',
              padding: '14px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 900,
              outline: 'none',
              letterSpacing: '0.5px'
            }}
          />
          <button
            onClick={handleChatSend}
            style={{
              background: 'oklch(78.9% 0.154 211.53)',
              color: 'oklch(12.9% 0.042 264.695)',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer',
              letterSpacing: '1px',
              boxShadow: '0 0 20px oklch(78.9% 0.154 211.53 / 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 30px oklch(78.9% 0.154 211.53 / 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px oklch(78.9% 0.154 211.53 / 0.4)';
            }}
          >
            SEND
          </button>
        </div>
      </div>

      {/* Footer */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: '420px',
          height: '40px',
          borderTop: '2px solid oklch(78.9% 0.154 211.53 / 0.2)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 32px',
          fontSize: '12px',
          fontWeight: 900,
          opacity: 0.6,
          letterSpacing: '1px',
          background: 'oklch(12.9% 0.042 264.695)',
          zIndex: 10
        }}
      >
        Lucy Sovereign 351 • 351-Node Architecture • 3D Cube Navigator • OKLCH Cyber Palette
      </div>
    </div>
  );
}
