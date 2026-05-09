import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Database, Zap, Activity, Shield, ChevronRight, Battery } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { AwarenessState, SystemHealth, DegradationLevel, ModuleState, TickPriority } from '../types';

interface SystemMonitorProps {
  health: SystemHealth;
  awareness: AwarenessState;
  tickPriority: TickPriority;
}

const StatRow: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: any;
  color: string;
  percent?: number;
  history?: number[];
}> = ({ label, value, unit, icon: Icon, color, percent, history }) => {
  const chartData = history ? history.map((v, i) => ({ value: v, index: i })) : [];
  
  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-white/5 last:border-0 group">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-sm bg-${color}/10`}>
            <Icon className={`w-3.5 h-3.5 text-agi-${color}`} />
          </div>
          <span className="text-[10px] font-bold text-agi-muted uppercase tracking-widest group-hover:text-agi-text transition-colors">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {history && (
            <div className="w-12 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={`var(--color-agi-${color})`} 
                    strokeWidth={1.5} 
                    dot={false} 
                    isAnimationActive={false} 
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm font-bold text-agi-text">
              {typeof value === 'number' && !unit ? value.toFixed(1) : value}
            </span>
            {unit && <span className="text-[9px] font-bold text-agi-muted tracking-tighter">{unit}</span>}
          </div>
        </div>
      </div>
      
      {percent !== undefined && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-agi-${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      )}
    </div>
  );
};

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ health, awareness, tickPriority }) => {
  const getStatusColor = (percent: number) => {
    if (percent > 85) return 'danger';
    if (percent > 60) return 'warning';
    return 'accent';
  };

  const getDegradationLabel = (level: DegradationLevel) => {
    switch (level) {
      case DegradationLevel.NORMAL: return 'OPTIMIZED';
      case DegradationLevel.CONSERVATION: return 'CONSERVATION';
      case DegradationLevel.REDUCED: return 'REDUCED_CAPACITY';
      case DegradationLevel.MINIMAL: return 'MINIMAL_OS';
      case DegradationLevel.EMERGENCY: return 'CRITICAL_THROTTLE';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="bg-agi-card border border-white/10 rounded-lg overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-agi-success animate-pulse" />
          <h2 className="text-xs font-bold text-agi-text tracking-[0.2em] uppercase">System_Heuristics</h2>
          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
            tickPriority === TickPriority.CRITICAL ? 'border-agi-danger/50 text-agi-danger' : 
            tickPriority === TickPriority.IDLE ? 'border-agi-success/50 text-agi-success animate-pulse' :
            'border-agi-accent/30 text-agi-accent'
          }`}>
            PRIORITY: {tickPriority}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-agi-muted">V2.0.48_STABLE</span>
          <Shield className="w-3 h-3 text-agi-success" />
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          <StatRow 
            label="Neural Load" 
            value={health.cpuPercent} 
            unit="%" 
            icon={Cpu} 
            color={getStatusColor(health.cpuPercent)} 
            percent={health.cpuPercent}
            history={health.cpuHistory}
          />
          <StatRow 
            label="Memory sovereignty" 
            value={health.ramPercent} 
            unit="%" 
            icon={Database} 
            color="accent" 
            percent={health.ramPercent}
            history={health.ramHistory}
          />
          <StatRow 
            label="Visual Processing" 
            value={health.gpuPercent} 
            unit="%" 
            icon={Zap} 
            color="success" 
            percent={health.gpuPercent}
            history={health.gpuHistory}
          />
          <StatRow 
            label="Cortex Latency" 
            value={health.latencyMs} 
            unit="ms" 
            icon={Activity} 
            color={health.latencyMs > 100 ? 'warning' : 'success'} 
            history={health.latencyHistory}
          />
          <StatRow 
            label="Energy Density" 
            value={health.batteryLevel} 
            unit="%" 
            icon={Battery} 
            color="warning" 
            percent={health.batteryLevel}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold text-agi-muted uppercase tracking-widest">Cognitive_Auction</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-agi-accent/30 text-agi-accent`}>
                {awareness.cognitiveLoad.currentTotal}% LOAD
              </span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-agi-success/30 text-agi-success`}>
                {awareness.cognitiveLoad.activeModuleCount} ACTIVE
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            {awareness.activeModules.map(mod => (
              <div key={mod.id} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[8px] font-mono">
                  <span className={mod.state === 'CRITICAL' ? 'text-agi-danger font-black' : 'text-agi-text'}>
                    {mod.label}
                  </span>
                  <div className="flex gap-2">
                    <span className="text-agi-muted">COST: {mod.cpuCost}%</span>
                    <span className="text-agi-accent font-bold">SCORE: {mod.activationScore.toFixed(2)}</span>
                  </div>
                </div>
                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full ${mod.state === 'CRITICAL' ? 'bg-agi-danger' : 'bg-agi-accent'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${mod.activationScore * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {awareness.cognitiveLoad.throttledModules.length > 0 && (
              <div className="mt-2 text-[8px] font-mono text-agi-danger uppercase flex items-center gap-1">
                <Shield className="w-2 h-2" />
                Attention_Budget_Exceeded: {awareness.cognitiveLoad.throttledModules.length} Modules Throttled
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-bold text-agi-muted uppercase tracking-widest">Active_Governor</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-agi-accent/30 text-agi-accent`}>
              {getDegradationLabel(health.degradationLevel)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-agi-muted uppercase tracking-tighter">
                <span>Thermal State</span>
                <span className={health.thermalState === 'critical' ? 'text-agi-danger' : 'text-agi-success'}>
                  {health.thermalState}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full flex-1 rounded-[1px] transition-all duration-300 ${
                      i < (health.cpuPercent / 100) * 20 
                        ? (i > 16 ? 'bg-agi-danger' : i > 12 ? 'bg-agi-warning' : 'bg-agi-accent')
                        : 'bg-white/10 text-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-black/40 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[8px] font-mono text-agi-success">
            <div className="w-1 h-1 rounded-full bg-agi-success" />
            LIVE_FEED
          </div>
          <div className="text-[8px] font-mono text-agi-muted">
            SYNC_LOCK_0.023ms
          </div>
        </div>
        <ChevronRight className="w-3 h-3 text-agi-muted" />
      </div>
    </div>
  );
};
