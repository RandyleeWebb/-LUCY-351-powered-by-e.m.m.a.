import React, { useState, useEffect } from "react";
import { useLucyStore } from "../../state/lucyStore";
import { globalEventBus } from "../../core/EventBus";
import { INITIAL_NODES, lucyEngine } from "../../core/LucyEngine";
import { LucyNode, SystemMessage } from "../../core/types";
import { Activity, Network, Terminal, Shield, Database, Bell, Zap } from "lucide-react";
import { NodeVisualizer } from "../ui/NodeVisualizer";
import { ChatInterface } from "../ui/ChatInterface";
import { EventLog } from "../ui/EventLog";

export default function NeuroMeshDashboard() {
  const store = useLucyStore();
  const [localNodes, setLocalNodes] = useState<Record<string, LucyNode>>({});
  const [logs, setLogs] = useState<SystemMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'lucy'; text: string; timestamp: number }[]>([
    { role: 'lucy', text: 'Cognitive Mesh Standalone OS initialized.\n\nLocal Memory Layer: Nominal\nLittle Lucy Swarm: Active (48 nodes)\nEmma Supervisor: Ready (24 nodes)\n\nAll external connections disabled. Waiting for local input.', timestamp: Date.now() }
  ]);
  const [alerts, setAlerts] = useState<{ id: string, msg: string, type: 'info' | 'warn' | 'critical' }[]>([]);
  const [memoryState, setMemoryState] = useState({
    workingMem: '84%',
    episodicCount: 12450,
    semanticHealth: 'OPTIMAL',
    lastSync: 'recent'
  });

  // Sync store nodes to local record for visualizer
  useEffect(() => {
    if (store.nodes && store.nodes.length > 0) {
      const record: Record<string, LucyNode> = {};
      store.nodes.forEach(n => {
        record[n.id] = {
          id: n.id,
          name: n.name,
          category: n.layer as any,
          status: n.status as any,
          lastActive: 0
        };
      });
      setLocalNodes(record);
    }
  }, [store.nodes]);

  useEffect(() => {
    const handleEvent = (msg: SystemMessage) => {
      setLogs((prev) => [...prev, msg].slice(-100));

      setLocalNodes((prev) => {
        const next = { ...prev };
        let targetId = msg.target;
        let sourceId = msg.source;
        
        if (targetId === 'L_Swarm' || targetId === 'LittleLucys(48)') return next;

        if (next[targetId]) next[targetId] = { ...next[targetId], status: 'processing', lastActive: Date.now() };
        if (next[sourceId]) next[sourceId] = { ...next[sourceId], status: 'success', lastActive: Date.now() };
        return next;
      });

      // Simulate memory state changes occasionally based on RAG nodes
      if (msg.target.startsWith('M') || msg.source.startsWith('M')) {
         setMemoryState(prev => ({
            ...prev,
            workingMem: (Math.random() * 20 + 70).toFixed(1) + '%',
            episodicCount: prev.episodicCount + 1,
            lastSync: new Date().toLocaleTimeString()
         }));
      }

      // Add occasional alerts for interesting events
      if (msg.target === 'S1') {
         addAlert("Safety constraint evaluated.", "info");
      }
      if (msg.confidence !== undefined && msg.confidence < 0.82) {
         addAlert(`Low confidence anomaly detected on ${msg.source}`, "warn");
      }

      setTimeout(() => {
        setLocalNodes((prev) => {
          const next = { ...prev };
          const now = Date.now();
          let changed = false;
          Object.keys(next).forEach(id => {
            if (next[id].status !== 'idle' && now - next[id].lastActive > 800) {
              next[id] = { ...next[id], status: 'idle' };
              changed = true;
            }
          });
          return changed ? next : prev;
        });
      }, 900);
    };

    globalEventBus.subscribeAll(handleEvent);
    
    // Initial dummy alert
    addAlert("Mesh initialization sequence verified.", "info");
  }, []);

  const addAlert = (msg: string, type: 'info' | 'warn' | 'critical') => {
      setAlerts(prev => [{ id: Math.random().toString(), msg, type }, ...prev].slice(0, 5));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setChatHistory(prev => [...prev, { role: 'user', text, timestamp: Date.now() }]);
    
    try {
      await store.sendLucyMessage(text);
      // The store handles adding the message to lucyMessages, we can sync it here or just let the UI reflect it
      // For now, let's just wait and then check lucyMessages if needed, or manually add the response if we want immediate feedback
    } catch (e) {
      addAlert("Message failed to send to backend.", "critical");
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync lucyMessages from store to chatHistory
  useEffect(() => {
    if (store.lucyMessages.length > 0) {
      const last = store.lucyMessages[store.lucyMessages.length - 1];
      if (last.role === 'assistant') {
        setChatHistory(prev => {
          // Avoid duplicates
          if (prev[prev.length - 1]?.text === last.text) return prev;
          return [...prev, { role: 'lucy', text: last.text, timestamp: last.createdAt }];
        });
      }
    }
  }, [store.lucyMessages]);

  const handleSimulateNodeInteraction = async () => {
    if (isProcessing) return;
    addAlert("Initiated Background Node Simulation Pulse", "info");
    // We could call a backend simulate endpoint if we had one
  };

  return (
    <div className="flex h-full w-full bg-lucy-dark text-slate-300">
      {/* Left Sidebar - Node Network Map */}
      <div className="w-[35%] max-w-[450px] border-r border-slate-800 bg-lucy-base/30 flex flex-col backdrop-blur-md">
        <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 bg-lucy-base/50">
           <h2 className="font-semibold tracking-wide text-xs text-slate-300 flex items-center gap-2">
             <Network className="w-3.5 h-3.5" /> Logical Node Mesh
           </h2>
           <button 
             onClick={handleSimulateNodeInteraction}
             className="text-[9px] font-mono bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/30 px-2 py-0.5 rounded hover:bg-lucy-primary/40 transition-colors flex items-center gap-1"
           >
             <Zap className="w-3 h-3" /> PING MESH
           </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <NodeVisualizer nodes={localNodes} />
        </div>
      </div>

      {/* Main Content Area - Chat Interface */}
      <div className="flex-1 flex flex-col relative z-0">
        <div className="absolute inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lucy-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lucy-accent/5 rounded-full blur-[120px]" />
        </div>

        <div className="flex-1 overflow-hidden flex flex-col z-10">
          <ChatInterface 
            chat={chatHistory} 
            onSend={handleSendMessage} 
            isProcessing={isProcessing} 
          />
        </div>
      </div>

      {/* Right Sidebar - Event Trace Log & Memory/Alerts */}
      <div className="w-[30%] max-w-[400px] border-l border-slate-800 bg-lucy-base/40 flex flex-col backdrop-blur-md">
        
        {/* Memory State Panel */}
        <div className="border-b border-slate-800 bg-lucy-base/50 p-4">
          <div className="flex items-center gap-2 mb-3">
             <Database className="w-4 h-4 text-emerald-400" />
             <h3 className="font-mono text-xs font-bold text-slate-200 uppercase">Memory Layer State</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
             <div className="bg-slate-900/50 border border-slate-800 p-2 rounded">
                 <span className="block opacity-60 mb-1">WORKING MEM</span>
                 <span className="text-emerald-400 font-bold">{memoryState.workingMem} LOAD</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-2 rounded">
                 <span className="block opacity-60 mb-1">EPISODIC TRACES</span>
                 <span className="text-cyan-400 font-bold">{memoryState.episodicCount}</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-2 rounded">
                 <span className="block opacity-60 mb-1">SEMANTIC STORE</span>
                 <span className="text-lucy-success font-bold">{memoryState.semanticHealth}</span>
             </div>
             <div className="bg-slate-900/50 border border-slate-800 p-2 rounded">
                 <span className="block opacity-60 mb-1">LAST SYNC</span>
                 <span className="text-slate-300">{memoryState.lastSync}</span>
             </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="border-b border-slate-800 bg-lucy-base/50 p-4 h-40 flex flex-col">
          <div className="flex items-center justify-between mb-2">
             <div className="flex items-center gap-2">
                 <Bell className="w-4 h-4 text-amber-400" />
                 <h3 className="font-mono text-xs font-bold text-slate-200 uppercase">System Alerts</h3>
             </div>
             <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-200">{alerts.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pt-1">
             {alerts.length === 0 && <div className="text-[10px] text-slate-500 italic">No active alerts.</div>}
             {alerts.map(alert => (
                 <div key={alert.id} className={`text-[10px] p-2 rounded border font-mono flex items-start gap-2 ${
                     alert.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
                     alert.type === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                     'bg-red-500/10 border-red-500/20 text-red-300'
                 }`}>
                     <span className="mt-0.5">{alert.type === 'warn' ? '⚠️' : 'ℹ️'}</span>
                     <span className="flex-1">{alert.msg}</span>
                 </div>
             ))}
          </div>
        </div>

        <div className="h-10 border-b border-slate-800 flex items-center px-4 gap-2 bg-lucy-base/50 mt-auto border-t">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="font-semibold tracking-wide text-xs text-slate-300">Live Trace Feed</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-[#0a0f18] p-3 custom-scrollbar">
          <EventLog logs={logs} />
        </div>
      </div>
    </div>
  );
}
