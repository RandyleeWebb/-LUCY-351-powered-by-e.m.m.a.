import React, { useState, useEffect } from "react";
import { Folder, File, HardDrive, Search, Lock, ShieldCheck, Link2, Download, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FileManager() {
  const [sandboxRoot, setSandboxRoot] = useState("C:\\LucySandbox");
  const [fivemRoot, setFivemRoot] = useState("C:\\LucySandbox\\FiveM-Framework");
  
  // Dynamic fetch tree
  const [tree, setTree] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState("");

  const loadDir = async (relPath: string = '') => {
      try {
          const res = await fetch('/api/kernel/sandbox/listdir', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ path: relPath })
          });
          const data = await res.json();
          if (data.success) {
              setTree(data.items || []);
              setCurrentPath(relPath);
          }
      } catch(e) {
          console.error("Failed to fetch sandbox dir", e);
      }
  };

  // Initially load root
  useEffect(() => {
     loadDir('');
  }, []);

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const handleDragLeave = () => {
      setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      
      const files = Array.from(e.dataTransfer.files) as File[];
      if (files.length === 0) return;

      for (const file of files) {
          const reader = new FileReader();
          reader.onload = async (event) => {
          const content = event.target?.result as string;
          // Construct correct path separator
          const targetPath = currentPath ? `${currentPath}\\${file.name}` : file.name;
          
          await fetch('/api/kernel/sandbox/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ path: targetPath, content })
          });
              
              loadDir(currentPath); // Refresh the directory tree
          };
          reader.readAsDataURL(file);
      }
  };

  const handleHumanOverride = async () => {
      await fetch('/api/kernel/sandbox/open', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: currentPath || 'root' })
      });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-8 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex justify-between items-end border-b border-slate-800 pb-4"
      >
        <div>
           <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
             <HardDrive className="w-8 h-8 text-lucy-primary" />
             Workspace <span className="font-light text-slate-400">Manager</span>
           </h2>
           <p className="text-xs text-lucy-success font-mono mt-1 uppercase tracking-widest flex items-center gap-2">
             <ShieldCheck className="w-4 h-4" /> Sandbox Locked & Enforced
           </p>
        </div>
        <div className="relative">
           <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
           <input type="text" placeholder="Search workspace..." className="bg-slate-900 border border-slate-700 rounded pl-9 pr-4 py-1.5 text-sm outline-none focus:border-lucy-primary text-slate-200" />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 text-xs font-mono"
      >
         <div className="bg-slate-900 border border-lucy-primary/30 p-3 rounded flex items-center gap-3 group">
            <Lock className="w-4 h-4 text-lucy-primary group-hover:scale-110 transition-transform" />
            <div>
               <div className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">Sandbox Root</div>
               <div className="text-white">{sandboxRoot}</div>
            </div>
         </div>
         <div className="bg-slate-900 border border-lucy-primary/30 p-3 rounded flex items-center gap-3 group">
            <Lock className="w-4 h-4 text-lucy-primary/60 group-hover:scale-110 transition-transform" />
            <div>
               <div className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">FiveM Framework Root</div>
               <div className="text-white">{fivemRoot}</div>
            </div>
         </div>
         <div className="bg-slate-900 border border-cyan-700 p-3 rounded flex items-center gap-3 group col-span-2">
            <Link2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="flex-1">
               <div className="text-slate-400 uppercase tracking-widest text-[9px] mb-0.5">Primary FiveM Scripting Handbook Enforced</div>
               <div className="text-cyan-200 truncate w-full">https://docs.fivem.net/docs/scripting-manual/</div>
            </div>
         </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="flex-1 grid grid-cols-[300px_1fr] gap-6 overflow-hidden"
      >
         <div className="bg-slate-900/50 border border-slate-800 rounded-md p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex justify-between items-center">
              Directory Tree
              <button onClick={() => loadDir('')} className="text-[10px] text-lucy-primary bg-lucy-primary/10 px-1.5 py-0.5 rounded hover:bg-lucy-primary hover:text-slate-900 transition-colors">ROOT</button>
            </h3>
            <div className="space-y-1.5 text-sm text-slate-300 font-mono">
               <div className="flex items-center gap-2 text-lucy-primary"><Folder className="w-4 h-4"/> <span>{currentPath || "LucySandbox"}</span></div>
               
               {tree.length === 0 && <div className="pl-6 text-slate-600 text-xs italic mt-2 text-center w-full">Sandbox is empty</div>}
               
               <AnimatePresence>
               {tree.map((item, idx) => (
                   <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.relPath} 
                      className="flex items-center gap-2 pl-4 cursor-pointer hover:text-white hover:bg-white/5 py-1 rounded transition-colors group"
                      onClick={() => item.isDir && loadDir(item.relPath)}
                   >
                       {item.isDir ? <Folder className="w-4 h-4 text-slate-500 group-hover:text-lucy-primary transition-colors"/> : <File className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors"/>}
                       <span className={!item.isDir ? "opacity-75 group-hover:text-cyan-100" : "group-hover:text-lucy-primary"}>{item.name}</span>
                   </motion.div>
               ))}
               </AnimatePresence>
            </div>
         </div>
         <div 
            className={`bg-slate-900/20 border rounded-md p-8 border-dashed flex flex-col items-center justify-center text-slate-500 relative transition-colors ${
              isDragging ? "border-lucy-primary bg-lucy-primary/10 shadow-[0_0_20px_rgba(6,182,212,0.2)]" : "border-slate-800"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
         >
            <Lock className="w-24 h-24 mb-4 opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <HardDrive className={`w-16 h-16 mb-4 z-10 transition-colors ${isDragging ? "text-lucy-primary" : "opacity-50"}`} />
            <p className={`z-10 font-bold mb-2 ${isDragging ? "text-lucy-primary" : "text-white"}`}>
               {isDragging ? "Drop Files Here" : "Sandbox Isolated"}
            </p>
            <p className="z-10 text-xs text-center max-w-sm">No operations can escape the {sandboxRoot} boundary. Internal generation is active. External access denied.</p>
            
            <div className="flex gap-4 mt-6 z-10 pointer-events-auto">
               <button className="flex items-center gap-2 bg-lucy-primary/20 text-lucy-primary border border-lucy-primary/50 px-4 py-2 rounded text-xs hover:bg-lucy-primary/40 transition-colors">
                 <Download className="w-4 h-4" /> Download Archive
               </button>
               <button 
                 onClick={handleHumanOverride}
                 className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded text-xs hover:bg-slate-700 transition-colors" 
                 title="Open in physical File Explorer"
               >
                 <ExternalLink className="w-4 h-4" /> Human Override
               </button>
            </div>
         </div>
      </motion.div>
    </div>
  );
}
