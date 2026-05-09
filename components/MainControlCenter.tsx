import React, { useState } from "react";
import { emitEvent } from "../core/ipcMock";
import { Network, Globe, Box, Gamepad2, Database, Folder, Cpu } from 'lucide-react';
import DebugChatWindow from "./ui/DebugChatWindow";

const modules = [
  { id: "EARTH", label: "Twin Earth Intel", icon: <Globe className="w-8 h-8" /> },
  { id: "UE5", label: "UE5 Build Lane", icon: <Box className="w-8 h-8" /> },
  { id: "UNITY", label: "Unity Lane", icon: <Gamepad2 className="w-8 h-8" /> },
  { id: "FIVEM", label: "FiveM Live", icon: <Database className="w-8 h-8" /> },
  { id: "EMMA", label: "137-Mesh (E.M.M.A)", icon: <Network className="w-8 h-8" /> },
  { id: "FILES", label: "Mesh Builder", icon: <Folder className="w-8 h-8" /> },
  { id: "RUNTIME", label: "Runtime Control", icon: <Cpu className="w-8 h-8" /> },
];

export const MainControlCenter: React.FC = () => {
  const [currentModule, setCurrentModule] = useState("HOME");

  const handleSelect = (moduleId: string) => {
    setCurrentModule(moduleId);
    // Fires event to backend -> reasoningNode evaluates -> governed dashboard flip returned.
    emitEvent("USER.SELECT.MODULE", { module: moduleId, timestamp: Date.now() });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050810] text-slate-100 p-8 relative overflow-hidden z-0">
      <div className="absolute inset-0 z-[-1] opacity-10 bg-[linear-gradient(#334155_1px,transparent_1px),linear-gradient(90deg,#334155_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lucy-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-3">Lucy Command Center</h1>
        <p className="text-lucy-primary font-mono tracking-widest text-xs uppercase flex items-center justify-center gap-3">
          <span className="w-2 h-2 rounded-full bg-lucy-success animate-pulse inline-block"></span>
          Sovereign Mode • Governed Spines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl relative z-10">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => handleSelect(mod.id)}
            className={`group flex flex-col items-center justify-center gap-4 p-8 min-h-[180px] rounded-xl border transition-all duration-300
              ${currentModule === mod.id 
                ? "bg-lucy-primary/20 border-lucy-primary shadow-[0_0_40px_rgba(6,182,212,0.3)] scale-[1.02]" 
                : "bg-[#0b1021] border-slate-800 shadow-xl hover:border-lucy-primary/50 hover:bg-[#121930]"}`}
          >
            <div className={`${currentModule === mod.id ? "text-lucy-primary scale-110" : "text-slate-500 group-hover:text-lucy-primary"} transition-all duration-300 drop-shadow-md`}>
              {mod.icon}
            </div>
            <span className={`font-mono font-bold tracking-wide uppercase text-sm ${currentModule === mod.id ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
              {mod.label}
            </span>
          </button>
        ))}
      </div>
      
      <DebugChatWindow />
    </div>
  );
}

export default MainControlCenter;
