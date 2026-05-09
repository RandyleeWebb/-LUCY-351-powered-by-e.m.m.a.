import React from 'react';
import { LucyNode, NodeCategory } from '../../core/types';
import { motion } from 'motion/react';

const CATEGORY_COLORS: Record<string, string> = {
  refiner: 'border-blue-500/50 bg-blue-500/10 text-blue-400',
  classical_core: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  sovereign_core: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400',
  curiosity_governor: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
  human_drive: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 glow-green',
  planetary_sensor_feed: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
  action_authority: 'border-red-500/50 bg-red-500/10 text-red-400 glow-red',
};

const CATEGORY_NAMES: Record<string, string> = {
  refiner: 'Refinement Layers',
  classical_core: 'Classical Core (Legacy LL)',
  sovereign_core: 'Sovereign Core (LL151+)',
  curiosity_governor: 'Curiosity & Ethics',
  human_drive: 'Human Drive & Pulse',
  planetary_sensor_feed: 'Planetary Feeds',
  action_authority: 'Action Engine Authority',
};

const CATEGORY_ORDER = ['refiner', 'classical_core', 'sovereign_core', 'curiosity_governor', 'human_drive', 'planetary_sensor_feed', 'action_authority'];

export const NodeVisualizer: React.FC<{ nodes: Record<string, LucyNode> }> = ({ nodes }) => {
  const groupedNodes = Object.values(nodes).reduce((acc, node: any) => {
    const layer = node.layer || node.category || 'unknown';
    if (!acc[layer]) acc[layer] = [];
    acc[layer].push(node);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col gap-6 pb-20">
      {CATEGORY_ORDER.map((categoryKey) => {
        const catNodes = groupedNodes[categoryKey];
        if (!catNodes || catNodes.length === 0) return null;

        return (
          <div key={categoryKey} className="flex flex-col gap-2">
            <h3 className="text-[10px] font-mono tracking-widest text-slate-500 uppercase border-b border-slate-800 pb-1">
              {CATEGORY_NAMES[categoryKey]}
            </h3>
            <div className="grid grid-cols-6 gap-1.5 pt-1">
              {catNodes.map((node: any) => {
                const isActive = node.status === 'processing';
                const isSuccess = node.status === 'success';

                return (
                  <motion.div
                    key={node.id}
                    layoutId={`node-${node.id}`}
                    initial={false}
                    animate={{
                        scale: isActive ? 1.15 : isSuccess ? 1.05 : 1,
                        opacity: isActive || isSuccess ? 1 : 0.6
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    title={`${node.id}: ${node.name}\n${node.purpose || ''}`}
                    className={`
                      h-6 rounded-[3px] border border-transparent shadow-sm flex items-center justify-center text-[8px] font-mono font-bold transition-all duration-300
                      ${CATEGORY_COLORS[node.layer || node.category] || 'bg-slate-800 border-slate-700'}
                      ${isActive ? 'bg-white text-black glow-blue scale-110 z-10' : ''}
                      ${isSuccess ? 'bg-lucy-success text-white glow-green scale-105 z-10' : ''}
                    `}
                  >
                    {node.id}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
