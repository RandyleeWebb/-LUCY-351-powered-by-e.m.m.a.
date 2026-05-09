import React, { useState, useEffect, useRef } from "react";
import { emitEvent } from "../../core/ipcMock";

export default function DebugChatWindow() {
  const [messages, setMessages] = useState<{ role: "lucy" | "human"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  const [CustomApiKey, setCustomApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("LUCY_CUSTOM_API_KEY");
    if (savedKey) setCustomApiKey(savedKey);

    const handler = (e: any) => {
      const raw = (e as CustomEvent).detail;
      if (raw && (raw.type === "LUCY_BUILD_PROPOSAL" || raw.type === "UNITY_BUILD_PROPOSAL")) {
         setMessages(prev => [...prev, { role: "lucy", text: raw.message }]);
         setIsVisible(true);
      }
    };
    
    // Listen directly via window event mapping from our HUD
    window.addEventListener("SYSTEM.SPATIALFACE.SURFACED", handler);
    return () => window.removeEventListener("SYSTEM.SPATIALFACE.SURFACED", handler);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem("LUCY_CUSTOM_API_KEY", CustomApiKey);
    alert("Local Cloud API Override Saved");
    setShowSettings(false);
  };

  useEffect(() => {
    if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: "human", text: input }]);
    
    // Human input stays outside E.M.M.A. control — just log it
    emitEvent("HUMAN.INPUT", { source: "DEBUG_CHAT", action: input });
    
    // If human says "approve", "yes", "go", "build it" etc. → trigger execution
    if (/^(approve|yes|go|build it|execute|do it)/i.test(input.trim())) {
      emitEvent("LUCY.ACTION.APPROVED", { originalProposalId: "last-proposal", lane: "UE5", command: 'echo "Mocking local Windows Execution"' }); 
    }
    
    setInput("");
  };

  if (!isVisible) return (
     <button onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 bg-lucy-primary text-[#050810] px-4 py-2 rounded shadow-lg font-mono text-xs font-bold z-50 hover:bg-cyan-400 transition-colors">
         [🔬] Debug Chat
     </button>
  );

  return (
    <div className="fixed bottom-4 right-4 w-[350px] bg-[#0b1021] border border-slate-700 shadow-2xl rounded-lg z-50 flex flex-col font-mono overflow-hidden transition-all">
      <div className="bg-slate-800 p-3 flex justify-between items-center text-xs text-slate-300 font-bold border-b border-slate-700">
         <span>🧪 Lucy Debug Chat</span>
         <div className="flex gap-3 items-center">
            <button onClick={() => setShowSettings(!showSettings)} className="text-lucy-primary hover:text-white transition-colors">⚙️</button>
            <button onClick={() => setIsVisible(false)} className="hover:text-white transition-colors">X</button>
         </div>
      </div>
      
      {showSettings ? (
        <div className="p-4 flex-1 h-[300px] overflow-y-auto flex flex-col gap-3 text-sm">
           <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-slate-700 pb-2">Cloud Connect</h4>
           <p className="text-[10px] text-slate-400">Lucy normally operates in physical sovereign mode. If you require advanced off-site inference, supply your API key below. Otherwise, Lucy is completely unrestricted and free from cloud dependencies.</p>
           
           <label className="text-[10px] text-slate-300 font-bold mt-2">Custom AI API Key</label>
           <input 
             type="password"
             value={CustomApiKey} 
             onChange={e => setCustomApiKey(e.target.value)} 
             placeholder="sk-..." 
             className="bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs focus:outline-none focus:border-lucy-primary mb-2"
           />
           <button onClick={handleSaveKey} className="bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/50 px-3 py-2 rounded text-xs hover:bg-lucy-primary/40 transition-colors uppercase tracking-widest font-bold">
              Save Config
           </button>
        </div>
      ) : (
        <div ref={chatRef} className="p-4 flex-1 h-[300px] overflow-y-auto flex flex-col gap-3 text-sm">
          {messages.map((msg, i) => (
            <div key={i} className={`p-2 rounded max-w-[85%] ${msg.role === "lucy" ? "bg-lucy-primary/10 text-cyan-50 border border-lucy-primary/30 self-start" : "bg-slate-700 text-white self-end"}`}>
              <strong className="block text-[10px] text-slate-400 mb-1">{msg.role === "lucy" ? "LUCY:" : "YOU:"}</strong>
              {msg.text}
            </div>
          ))}
          {messages.length === 0 && <p className="text-slate-500 text-xs italic text-center mt-10">Awaiting governed proposals...</p>}
        </div>
      )}
      
      {!showSettings && (
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={e => e.key === "Enter" && sendMessage()} 
            placeholder="Say 'approve'..." 
            className="flex-1 bg-slate-800 border border-slate-700 text-white p-2 rounded text-xs focus:outline-none focus:border-lucy-primary"
          />
          <button onClick={sendMessage} className="bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/50 px-3 rounded text-xs hover:bg-lucy-primary/40 transition-colors">
            Send
          </button>
        </div>
      )}
      <p className="bg-slate-950 text-slate-500 p-2 text-[9px] text-center">Every user is different. Chat your paths/preferences here — Lucy adapts.</p>
    </div>
  );
}
