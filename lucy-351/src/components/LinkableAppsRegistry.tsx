import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Link, Share2, Zap, Shield, Cpu, Search, X } from 'lucide-react';
import { LinkableApp } from '../types';

interface LinkableAppsRegistryProps {
  apps: LinkableApp[];
  onLink: (id: string) => void;
  onUnlink: (id: string) => void;
}

export const LinkableAppsRegistry: React.FC<LinkableAppsRegistryProps> = ({ apps, onLink, onUnlink }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return apps;

    return apps.filter(app => 
      app.name.toLowerCase().includes(query) || 
      app.category.toLowerCase().includes(query) ||
      app.strengths.some(s => s.toLowerCase().includes(query)) ||
      app.tools.some(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
    );
  }, [apps, searchQuery]);

  return (
    <section className="bg-agi-panel border border-agi-border rounded-3xl p-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex-1">
          <h3 className="text-xs font-bold text-agi-accent uppercase tracking-[0.3em] flex items-center gap-2 mb-1">
            <Share2 size={16} /> External_Actuation_Bridges
          </h3>
          <p className="text-[10px] text-agi-muted font-mono tracking-tight uppercase opacity-60">High-fidelity execution environments & AI toolsets</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* SEARCH BAR */}
          <div className="relative group/search flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-agi-muted group-focus-within/search:text-agi-accent transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter_Bridges..."
              className="w-full bg-agi-bg/50 border border-agi-border rounded-xl py-2 pl-9 pr-8 text-[10px] font-mono focus:outline-none focus:border-agi-accent/50 focus:ring-1 focus:ring-agi-accent/20 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-agi-border rounded-md text-agi-muted hover:text-agi-accent transition-all"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-agi-success" />
              <span className="text-[9px] font-bold text-agi-muted uppercase tracking-widest whitespace-nowrap">Active: {apps.filter(a => a.status === 'LINKED').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-agi-accent" />
              <span className="text-[9px] font-bold text-agi-muted uppercase tracking-widest whitespace-nowrap">Available: {apps.filter(a => a.status === 'STANDBY').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={app.id} 
                className={`p-6 rounded-2xl border transition-all hover:scale-[1.01] flex flex-col group ${
                  app.status === 'LINKED' ? 'border-agi-success/40 bg-agi-success/5' : 
                  app.status === 'STANDBY' ? 'border-agi-accent/30 bg-agi-accent/5' :
                  'border-agi-border bg-agi-bg/40 opacity-70 grayscale'
                }`}
              >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${
                  app.status === 'LINKED' ? 'bg-agi-success text-agi-bg border-agi-success' : 
                  'bg-agi-bg border-agi-border group-hover:border-agi-accent transition-colors'
                }`}>
                  {app.name === 'Unity' && <Cpu size={18} />}
                  {app.name === 'Unreal Engine' && <Zap size={18} />}
                  {app.name === 'Godot' && <Link size={18} />}
                  {app.name === 'GameMaker' && <Shield size={18} />}
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight">{app.name}</h4>
                  <p className="text-[9px] font-bold text-agi-muted uppercase tracking-widest">{app.category}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                    app.status === 'LINKED' ? 'border-agi-success/50 text-agi-success bg-agi-success/10' : 
                    app.status === 'STANDBY' ? 'border-agi-accent/50 text-agi-accent bg-agi-accent/10' :
                    'border-agi-border text-agi-muted'
                }`}>
                  {app.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {app.strengths.map(s => (
                <span key={s} className="text-[8px] font-mono font-bold bg-agi-border/30 text-agi-text px-2 py-0.5 rounded">
                  {s}
                </span>
              ))}
            </div>

            <div className="space-y-3 flex-1">
              <div className="text-[9px] font-black text-agi-muted uppercase tracking-[0.2em] mb-2 border-b border-agi-border/30 pb-1">AI_Toolbelt / MCP_Registry</div>
              {app.tools.map(tool => (
                <div key={tool.name} className="flex items-start justify-between group/tool p-1.5 hover:bg-agi-panel rounded-lg transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      {tool.url ? (
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[10px] font-bold text-agi-text truncate hover:text-agi-accent transition-colors flex items-center gap-1"
                        >
                          {tool.name}
                          <ExternalLink size={8} className="opacity-0 group-hover/tool:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-agi-text truncate">{tool.name}</span>
                      )}
                      <span className="text-[7px] font-mono font-black border border-agi-border/50 text-agi-muted px-1 rounded flex-shrink-0">{tool.type}</span>
                    </div>
                    <p className="text-[8px] text-agi-muted italic truncate">{tool.description}</p>
                  </div>
                  {tool.url && (
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-agi-accent opacity-0 group-hover/tool:opacity-100 transition-opacity p-1 hover:bg-agi-accent/10 rounded"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-agi-border/30">
               {app.status === 'LINKED' ? (
                 <button 
                  onClick={() => onUnlink(app.id)}
                  className="w-full py-2.5 bg-agi-success text-agi-bg font-black rounded-xl text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:bg-agi-danger hover:text-agi-text transition-colors"
                >
                  Establish_Handshake_Complete
                </button>
               ) : app.status === 'STANDBY' ? (
                 <button 
                  onClick={() => onLink(app.id)}
                  className="w-full py-2.5 bg-agi-accent text-agi-bg font-black rounded-xl text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Initiate_Bridge_Protocol
                </button>
               ) : (
                 <button className="w-full py-2.5 border border-agi-border text-agi-muted font-bold rounded-xl text-[10px] uppercase tracking-widest cursor-not-allowed">Protocol_Offline</button>
               )}
            </div>
              </motion.div>
            ))
          ) : null}
        </AnimatePresence>

        {filteredApps.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-agi-border rounded-3xl"
          >
            <div className="p-4 bg-agi-muted/10 rounded-full mb-4">
              <Search size={32} className="text-agi-muted" />
            </div>
            <h4 className="text-sm font-bold text-agi-text mb-1">No_Matches_Found</h4>
            <p className="text-[10px] text-agi-muted font-mono uppercase tracking-widest">Protocol search returned null results for "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 text-[10px] font-bold text-agi-accent hover:underline uppercase tracking-widest"
            >
              Reset_Filter
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
