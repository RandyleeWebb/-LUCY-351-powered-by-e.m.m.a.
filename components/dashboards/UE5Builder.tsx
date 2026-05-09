import React, { useState } from "react";
import PromptInput from "../ui/PromptInput";
import BuildProgress from "../ui/BuildProgress";
import { Box, Play, Package, Code } from "lucide-react";
// import { emitEvent } from "../../core/ipcMock"; // This path might need adjustment based on where ipcMock is

export default function UE5Builder() {
  const [project, setProject] = useState<any | null>(null);

  const simulateProgressUpdates = (
    initialStatus: "generating" | "compiling" | "packaging", 
    endStatus: "ready", 
    messages: string[]
  ) => {
    setProject((prev: any) => prev ? { ...prev, status: initialStatus, progress: 0, output: [...prev.output, `--- Starting ${initialStatus} ---`] } : null);
    
    let step = 0;
    const interval = setInterval(() => {
      setProject((prev: any) => {
        if (!prev) return null;
        if (step >= messages.length) {
          clearInterval(interval);
          return { ...prev, progress: 100, status: endStatus, output: [...prev.output, "Operation complete."] };
        }
        return {
          ...prev,
          progress: Math.floor(((step + 1) / messages.length) * 100),
          output: [...prev.output, messages[step]]
        };
      });
      step++;
    }, 800);
  };

  const handlePromptSubmit = async (prompt: string) => {
    /*
    emitEvent("HUMAN.INPUT", {
        action: "START_GENERATION",
        source: "UE5_PROMPT_INPUT",
        details: { prompt }
    });
    */

    // Generate dummy project name from prompt
    const nameStr = prompt.replace(/[^a-zA-Z0-9]/g, '');
    const projectName = "UE5_" + (nameStr.length > 10 ? nameStr.substring(0, 10) : "Project") + "_" + Math.floor(Math.random() * 1000);
    
    setProject({
      projectName,
      status: "generating",
      progress: 0,
      output: [`Parsing prompt: "${prompt}"...`, "Initializing Local LLM Pipeline..."],
      projectPath: `C:/Workspace/UE5/${projectName}`,
    });

    simulateProgressUpdates("generating", "ready", [
      "Generating Project Spec from natural language...",
      "Scaffolding UE5 Folder Structure...",
      "Generating PlayerController.cpp...",
      "Generating Character.h and Character.cpp...",
      "Generating EnemyAIController.cpp...",
      "Writing .uproject configuration...",
      "Project files written to disk."
    ]);
  };

  const handleCompile = () => {
    /*
    emitEvent("HUMAN.INPUT", {
        action: "START_BUILD_COMPILE",
        source: "UE5_BUILD_BUTTON",
        details: { project: project?.projectName }
    });
    */

    if (!project) return;
    simulateProgressUpdates("compiling", "ready", [
      "Running UnrealBuildTool...",
      `Building ${project.projectName}Editor...`,
      "[1/15] Compile SharedPCH.Engine.ShadowErrors.cpp",
      "[5/15] Compile PlayerController.cpp",
      "[9/15] Compile Character.cpp",
      "[14/15] Link UnrealEditor-Core.lib",
      "Total time in Local executor: 4.2 seconds.",
      "Compilation successful."
    ]);
  };

  const handlePackage = () => {
    /*
    emitEvent("HUMAN.INPUT", {
        action: "START_BUILD_PACKAGE",
        source: "UE5_PACKAGE_BUTTON",
        details: { project: project?.projectName }
    });
    */

    if (!project) return;
    simulateProgressUpdates("packaging", "ready", [
       "Running RunUAT.bat BuildCookRun...",
       "Cooking content for Windows...",
       "Building target Shipping...",
       "Packaging project...",
       "Archiving successful."
    ]);
  };

  const handleOpenEditor = () => {
    /*
    emitEvent("HUMAN.INPUT", {
        action: "OPEN_UE5_EDITOR",
        source: "UE5_OPEN_BUTTON",
        details: { project: project?.projectName }
    });
    */
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-8 gap-6 overflow-y-auto">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <Box className="w-8 h-8 text-cyan-500" />
             Unreal Engine 5 <span className="font-light text-slate-400">Builder</span>
           </h2>
           <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">Local LLM C++ Generation • Win64 Target</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        <PromptInput
          onSubmit={handlePromptSubmit}
          placeholder="Describe your UE5 project (e.g., 'Third-person action game with stealth AI')"
        />

        {project && <BuildProgress project={project} />}

        {project && (
          <div className="flex gap-4">
            <button
              onClick={handleCompile}
              disabled={project.status !== "ready"}
              className="flex-1 px-4 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded shadow-md hover:bg-cyan-500/20 hover:border-cyan-500/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Code className="w-4 h-4" /> Compile Source
            </button>
            <button 
              onClick={handlePackage}
              disabled={project.status !== "ready"}
              className="flex-1 px-4 py-3 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded shadow-md hover:bg-purple-500/20 hover:border-purple-500/80 transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Package className="w-4 h-4" /> Package Project
            </button>
            <button 
              onClick={handleOpenEditor}
              className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 border border-slate-700 rounded shadow-md hover:bg-slate-700 transition-all flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest"
            >
              <Play className="w-4 h-4" /> Open in UE5 Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
