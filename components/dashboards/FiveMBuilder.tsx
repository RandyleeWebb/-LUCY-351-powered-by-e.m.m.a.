import React, { useState } from "react";
import PromptInput from "../ui/PromptInput";
import BuildProgress from "../ui/BuildProgress";
import { Server, Code, RefreshCcw, Search, Info } from "lucide-react";
import { useLucyStore } from "../../state/lucyStore";

export default function FiveMBuilder() {
  const store = useLucyStore();
  const [project, setProject] = useState<any | null>(null);
  const [worldAnalysis, setWorldAnalysis] = useState<any | null>(null);

  const handlePromptSubmit = async (prompt: string) => {
    try {
      const result = await store.runBuildTask({
        id: `task_${Date.now()}`,
        domain: 'fivem',
        purpose: `Generate: ${prompt}`,
        fivemSpec: {
          name: prompt.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 15),
          description: prompt,
          version: '1.0.0',
          author: 'Lucy-core-AI'
        }
      });
      setProject({
        projectName: result.execution?.spec?.name || "fivem_resource",
        status: "ready",
        progress: 100,
        output: result.execution?.logs || ["Build successful."],
        projectPath: result.execution?.projectPath || "C:/LucySandbox/fivem/resource"
      });
    } catch (err) {
       console.error(err);
    }
  };

  const handleScanWorld = async () => {
    try {
      setProject(null);
      const result = await store.runBuildTask({
        id: `scan_${Date.now()}`,
        domain: 'fivem',
        purpose: 'Analyze existing FiveM world intake',
        fivemWorldAnalysis: {
          rootPath: './intake/apexcore-rp-test-main/apexcore-rp-test--main/',
          readOnly: true
        }
      });
      setWorldAnalysis(result.worldAnalysis);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-8 gap-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Server className="w-8 h-8 text-orange-500" />
             FiveM <span className="font-light text-slate-400">Intelligence & Builder</span>
           </h2>
           <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Real BuilderOS Execution • ApexCore Intake Aware</p>
        </div>
        <button
          onClick={handleScanWorld}
          className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all"
        >
          <Search className="w-3.5 h-3.5" /> Scan Existing World
        </button>
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-8">
        {!worldAnalysis && !project && (
           <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-12 flex flex-col items-center text-center gap-4 border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                 <Server className="w-8 h-8 text-slate-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-300 font-bold">No Active Build or Analysis</h3>
                <p className="text-xs text-slate-500 max-w-sm">Use the prompt below to generate a new FiveM resource or scan your current world intake for intelligence mapping.</p>
              </div>
           </div>
        )}

        {worldAnalysis && (
           <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg overflow-hidden shadow-xl">
              <div className="bg-blue-500/10 px-6 py-3 border-b border-blue-500/20 flex items-center justify-between">
                 <h3 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <Info className="w-4 h-4" /> World Intelligence Report
                 </h3>
                 <span className="text-[10px] font-mono text-blue-500/60 uppercase">Mode: {worldAnalysis.mode}</span>
              </div>
              <div className="p-6 grid grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                       <div className="bg-slate-950 p-3 rounded border border-slate-800">
                          <div className="text-2xl font-bold text-white">{worldAnalysis.profile.resourceCount}</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Resources</div>
                       </div>
                       <div className="bg-slate-950 p-3 rounded border border-slate-800">
                          <div className="text-xl font-bold text-orange-400">{worldAnalysis.profile.frameworkPosture}</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">Framework</div>
                       </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2">
                       <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">Intelligence Summary</h4>
                       <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {worldAnalysis.intelligence.summary}
                       </p>
                    </div>
                 </div>
                 <div className="bg-slate-950 p-4 rounded border border-slate-800 overflow-y-auto max-h-[300px] custom-scrollbar">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-3">Resource Groups Identified</h4>
                    <div className="space-y-2">
                       {Object.entries(worldAnalysis.profile.resourceGroups || {}).map(([name, count]: any) => (
                          <div key={name} className="flex justify-between items-center text-xs font-mono py-1 border-b border-slate-900 last:border-0">
                             <span className="text-slate-400">{name}</span>
                             <span className="text-cyan-500">{count} resources</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        )}

        <PromptInput
          onSubmit={handlePromptSubmit}
          placeholder="Describe your FiveM script (e.g., 'A robbery script using ESX with a minigame UI')"
        />

        {project && <BuildProgress project={project} />}
      </div>
    </div>
  );
}
