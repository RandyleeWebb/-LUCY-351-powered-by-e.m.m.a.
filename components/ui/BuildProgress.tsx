import React from "react";
import { Server, Terminal, CheckCircle } from "lucide-react";

interface BuildProgressProps {
  project: {
    projectName: string;
    status: string;
    progress: number;
    output: string[];
  };
}

export default function BuildProgress({ project }: BuildProgressProps) {
  return (
    <div className="bg-lucy-base/40 border border-slate-700/50 p-4 rounded-md space-y-4 backdrop-blur-sm">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-slate-200 flex items-center gap-2">
           <Server className="w-4 h-4 text-lucy-accent" />
           {project.projectName}
        </span>
        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded-sm font-mono text-[10px] uppercase text-lucy-primary tracking-widest flex items-center gap-1.5">
           {project.status === "ready" && <CheckCircle className="w-3 h-3 text-lucy-success" />}
           {project.status}
        </span>
      </div>

      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${project.progress === 100 ? 'bg-lucy-success glow-green' : 'bg-lucy-primary glow-blue'}`}
          style={{ width: `${project.progress}%` }}
        />
      </div>

      <div className="bg-[#0a0f18] p-3 rounded-sm border border-slate-800 h-48 overflow-y-auto font-mono text-[10px] text-emerald-400/90 custom-scrollbar flex flex-col gap-1">
        <div className="text-slate-500 mb-2 flex items-center gap-2">
           <Terminal className="w-3 h-3" /> System Out Log
        </div>
        {project.output.map((line, i) => (
          <div key={i} className="break-all opacity-90 hover:opacity-100 transition-opacity">
            <span className="text-slate-600 mr-2">[{new Date().toISOString().split('T')[1].slice(0, -1)}]</span> 
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
