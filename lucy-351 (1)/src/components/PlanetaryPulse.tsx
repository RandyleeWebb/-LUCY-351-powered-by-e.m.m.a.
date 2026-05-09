import React from 'react';
import { motion } from 'motion/react';
import { Activity, Sun, Wind, AlertTriangle, TrendingUp, TrendingDown, Info, Zap, Magnet, ShieldCheck } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { PlanetaryPulse, PlanetaryPulseMetric } from '../types';

interface PlanetaryPulseProps {
  pulse: PlanetaryPulse;
}

const PulseMetricCard: React.FC<{ metric: PlanetaryPulseMetric; icon: any }> = ({ metric, icon: Icon }) => {
  const isDeviation = metric.status !== 'stable';
  const data = metric.history.map((v, i) => ({ value: v, index: i }));
  
  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`p-4 rounded-2xl bg-agi-bg/50 border transition-all duration-300 relative overflow-hidden group ${
        metric.status === 'critical' ? 'border-agi-danger shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-agi-danger/50' : 
        metric.status === 'warning' ? 'border-agi-warning shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 
        'border-agi-border hover:border-agi-accent/50'
      }`}
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-500 ${
        metric.status === 'critical' ? 'bg-agi-danger' : 
        metric.status === 'warning' ? 'bg-agi-warning' : 
        'bg-agi-accent'
      }`} />

      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg transition-colors ${
            metric.status === 'critical' ? 'bg-agi-danger text-agi-bg animate-pulse' : 
            metric.status === 'warning' ? 'bg-agi-warning text-agi-bg' : 
            'bg-agi-accent/10 text-agi-accent group-hover:bg-agi-accent group-hover:text-agi-bg'
          }`}>
            <Icon size={14} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-agi-text uppercase tracking-wider">{metric.label}</h4>
            <p className="text-[8px] text-agi-muted font-mono">{metric.source}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {isDeviation && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 1 }}
              className="mb-1"
            >
              <AlertTriangle size={12} className={metric.status === 'critical' ? 'text-agi-danger' : 'text-agi-warning'} />
            </motion.div>
          )}
          <span className="text-[8px] font-mono text-agi-muted uppercase tracking-tighter">
            Lat: {metric.latency || '--'}ms
          </span>
        </div>
      </div>

      <div className="flex items-baseline justify-between mb-4 relative z-10">
        <div className="flex items-baseline gap-2">
          <span className={`text-xl font-bold font-mono tracking-tighter transition-colors ${
             metric.status === 'critical' ? 'text-agi-danger' : 
             metric.status === 'warning' ? 'text-agi-warning' : 
             'text-agi-text'
          }`}>
            {(metric.value ?? 0).toFixed(metric.unit === 'hPa' || metric.unit === 'nT' ? 1 : 2)}
          </span>
          <span className="text-[9px] text-agi-muted uppercase font-bold">{metric.unit}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className="w-16 h-1 bg-agi-border rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(metric.reliability || 0) * 100}%` }}
                className={`h-full transition-colors ${(metric.reliability || 0) > 0.8 ? 'bg-agi-success' : (metric.reliability || 0) > 0.5 ? 'bg-agi-warning' : 'bg-agi-danger'}`}
              />
           </div>
           <span className="text-[7px] text-agi-muted uppercase tracking-widest font-bold">Signal Confidence</span>
        </div>
      </div>

      <div className="h-16 w-full -mx-1 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={metric.status === 'critical' ? '#ef4444' : metric.status === 'warning' ? '#f59e0b' : '#3b82f6'} 
              strokeWidth={2} 
              dot={false}
              isAnimationActive={false}
            />
            <YAxis hide domain={['auto', 'auto']} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex justify-between items-center text-[8px] font-bold uppercase tracking-widest border-t border-agi-border pt-3 relative z-10">
         <span className={`flex items-center gap-1 ${metric.status === 'stable' ? 'text-agi-success' : metric.status === 'warning' ? 'text-agi-warning' : 'text-agi-danger font-black animate-pulse'}`}>
            <span className={`w-1 h-1 rounded-full ${metric.status === 'stable' ? 'bg-agi-success' : metric.status === 'warning' ? 'bg-agi-warning' : 'bg-agi-danger'}`} />
            {metric.status}
         </span>
         <span className="text-agi-muted">Aggregated Feed</span>
      </div>
    </motion.div>
  );
};

const SourceNetworkGraph: React.FC<{ pulse: PlanetaryPulse }> = ({ pulse }) => {
  const sources = [
    { name: 'USGS', metric: pulse.seismicActivity, color: 'var(--color-agi-accent)', type: 'GEO' },
    { name: 'NOAA_S', metric: pulse.solarFlares, color: 'var(--color-agi-warning)', type: 'SPACE' },
    { name: 'NOAA_P', metric: pulse.protonFlux, color: 'var(--color-agi-danger)', type: 'SPACE' },
    { name: 'NOAA_M', metric: pulse.magnetometer, color: 'var(--color-agi-success)', type: 'GEO' },
    { name: 'WMO', metric: pulse.atmosphericPressure, color: 'var(--color-agi-accent)', type: 'ATMOS' },
  ];

  // Logic for relay nodes (invisible points for path bending)
  const getRelayPoint = (i: number, total: number) => {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const r = 25; // Relay radius
    return {
      x: 50 + Math.cos(angle) * r,
      y: 50 + Math.sin(angle) * r
    };
  };

  return (
    <div className="bg-agi-bg/30 border border-agi-border rounded-2xl p-6 relative overflow-hidden h-[350px] flex items-center justify-center">
      {/* Dynamic Network Mesh */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: `radial-gradient(circle at center, var(--color-agi-accent) 0.5px, transparent 0.5px)`, 
             backgroundSize: '40px 40px' 
           }} />
      
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="var(--color-agi-accent)" stopOpacity="0" />
             <stop offset="50%" stopColor="var(--color-agi-accent)" stopOpacity="0.2" />
             <stop offset="100%" stopColor="var(--color-agi-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Global Connection Rings */}
        <circle cx="50%" cy="50%" r="25%" fill="none" stroke="var(--color-agi-border)" strokeWidth="0.5" strokeDasharray="3 10" opacity="0.3" />
        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="var(--color-agi-border)" strokeWidth="0.5" strokeDasharray="5 15" opacity="0.2" />

        {sources.map((s, i) => {
          const angle = (i / sources.length) * Math.PI * 2 - Math.PI / 2;
          const startX = 50 + Math.cos(angle) * 38;
          const startY = 50 + Math.sin(angle) * 38;
          const relay = getRelayPoint(i, sources.length);
          
          const reliability = s.metric.reliability || 1;
          const latency = s.metric.latency || 100;
          const speedFactor = Math.max(0.4, 4 - (latency / 150));

          return (
            <React.Fragment key={s.name}>
              {/* Complex Pathing (Double Segments) */}
              <motion.path
                d={`M ${startX} ${startY} Q ${relay.x} ${relay.y} 50 50`}
                stroke={s.color}
                strokeWidth={0.5 + reliability * 2}
                strokeOpacity={0.1 + reliability * 0.2}
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              />

              {/* Data Packets along Splines */}
              {[...Array(2)].map((_, j) => (
                <motion.circle
                  key={`${s.name}-p-${j}`}
                  r={1 + reliability * 0.5}
                  fill={s.color}
                  filter="url(#nodeGlow)"
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{ 
                    offsetDistance: "100%",
                    opacity: [0, 1, 0]
                  }}
                  style={{ 
                    offsetPath: `path('M ${startX} ${startY} Q ${relay.x} ${relay.y} 50 50')`,
                    offsetRotate: "auto"
                  }}
                  transition={{
                    duration: 2.5 / speedFactor,
                    repeat: Infinity,
                    delay: j * (2.5 / speedFactor / 2) + (Math.random() * 0.5),
                    ease: "linear"
                  }}
                />
              ))}

              {/* Individual Relay Nodes (Visual only) */}
              <motion.circle 
                cx={`${relay.x}%`} 
                cy={`${relay.y}%`} 
                r="1.5" 
                fill={s.color} 
                opacity="0.4"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </React.Fragment>
          );
        })}
      </svg>

      {/* Central Hub Refinement */}
      <div className="relative z-10">
        <div className="absolute inset-0 bg-agi-accent/5 rounded-full blur-2xl animate-pulse" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 rounded-full border border-agi-accent/10 flex items-center justify-center p-1"
        >
           <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full border-2 border-dashed border-agi-accent/30 flex items-center justify-center"
           >
              <div className="w-14 h-14 rounded-full bg-agi-bg/90 border border-agi-accent flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                <Activity className="text-agi-accent animate-pulse" size={28} />
              </div>
           </motion.div>
        </motion.div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center">
          <div className="text-[7px] text-agi-muted uppercase font-bold tracking-[0.4em] mb-1">Planetary_Node</div>
          <div className="bg-agi-panel border border-agi-accent/30 rounded px-3 py-1 text-[9px] font-mono font-bold text-agi-accent shadow-xl backdrop-blur-md">
            LUCY_SYNC_v4.2
          </div>
        </div>
      </div>

      {/* Source Node HUDs */}
      {sources.map((s, i) => {
        const angle = (i / sources.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + Math.cos(angle) * 38;
        const y = 50 + Math.sin(angle) * 38;

        return (
          <motion.div
            key={s.name}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 group z-20"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className={`p-3 rounded-2xl bg-agi-bg/80 backdrop-blur-xl border-2 transition-all hover:scale-105 hover:z-30 shadow-2xl flex flex-col items-center gap-1.5 min-w-[70px] ${
              s.metric.status === 'critical' ? 'border-agi-danger ring-2 ring-agi-danger/20' : 
              s.metric.status === 'warning' ? 'border-agi-warning' : 'border-agi-border'
            }`}>
              <div className={`text-[10px] font-black uppercase tracking-widest ${
                s.metric.status === 'critical' ? 'text-agi-danger' : 
                s.metric.status === 'warning' ? 'text-agi-warning' : 'text-agi-accent'
              }`}>
                {s.name}
              </div>
              
              <div className="flex items-center gap-2 w-full px-1">
                 <div className="h-0.5 flex-1 bg-agi-border rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${s.metric.reliability > 0.8 ? 'bg-agi-success' : 'bg-agi-warning'}`}
                      animate={{ width: `${s.metric.reliability * 100}%` }}
                    />
                 </div>
              </div>

              <div className="flex justify-between w-full text-[7px] font-mono px-1">
                 <span className="text-agi-muted">L: {s.metric.latency}ms</span>
                 <span className={`${s.metric.reliability > 0.9 ? 'text-agi-success' : 'text-agi-warning'}`}>
                    R: {(s.metric.reliability * 100).toFixed(0)}%
                 </span>
              </div>
              
              {/* Type Badge */}
              <div className="text-[6px] absolute -top-2 -right-2 bg-agi-panel border border-agi-border rounded px-1.5 py-0.5 font-bold tracking-tighter text-agi-muted bg-white/5 backdrop-blur-sm">
                {s.type}
              </div>
            </div>
            
            {/* Expanded Telemetry Tooltip */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-agi-panel p-3 border border-agi-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40 min-w-[140px] backdrop-blur-2xl">
               <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.metric.status === 'stable' ? 'bg-agi-success' : 'bg-agi-danger'}`} />
                  <span className="text-[8px] font-bold text-agi-muted uppercase tracking-[0.2em]">Telemetry_Source</span>
               </div>
               <div className="text-[10px] font-mono text-agi-text mb-2 leading-tight">{s.metric.source}</div>
               <div className="space-y-1 pt-2 border-t border-agi-border/50">
                  <div className="flex justify-between items-center text-[8px] uppercase">
                    <span className="text-agi-muted">Protocol</span>
                    <span className="text-agi-accent font-bold">WSS_SPECTRAL</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] uppercase">
                    <span className="text-agi-muted">Encryption</span>
                    <span className="text-agi-success font-bold">AES-256-QUANTUM</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] uppercase">
                    <span className="text-agi-muted">Uptime</span>
                    <span className="text-agi-text">99.94%</span>
                  </div>
               </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const metricStatusToDash = (status: string) => {
  switch (status) {
    case 'critical': return "2 2";
    case 'warning': return "4 4";
    default: return "none";
  }
};

const AnomalyTimeline: React.FC<{ pulse: PlanetaryPulse }> = ({ pulse }) => {
  const deviations = (Object.values(pulse) as PlanetaryPulseMetric[]).filter(m => m.status !== 'stable');

  return (
    <div className="bg-agi-bg/30 border border-agi-border rounded-2xl p-6 h-full flex flex-col">
       <h3 className="text-xs font-bold text-agi-danger uppercase tracking-widest mb-6 flex items-center gap-2">
          <AlertTriangle size={14} /> Critical Deviations
       </h3>
       
       <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {deviations.length > 0 ? deviations.map((m, i) => (
            <motion.div 
              key={m.label}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`p-4 border rounded-xl flex items-center justify-between ${
                m.status === 'critical' ? 'bg-agi-danger/10 border-agi-danger/30' : 'bg-agi-warning/10 border-agi-warning/30'
              }`}
            >
               <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full animate-ping ${m.status === 'critical' ? 'bg-agi-danger' : 'bg-agi-warning'}`} />
                 <div>
                   <h5 className="text-[10px] font-bold text-agi-text uppercase">{m.label}</h5>
                   <p className="text-[8px] text-agi-muted font-mono">{m.source}</p>
                 </div>
               </div>
               <div className="text-right">
                 <div className={`text-xs font-bold font-mono ${m.status === 'critical' ? 'text-agi-danger' : 'text-agi-warning'}`}>
                   {(m.value ?? 0).toFixed(1)} {m.unit}
                 </div>
                 <div className="text-[7px] text-agi-muted uppercase font-bold">Value Drift</div>
               </div>
            </motion.div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-agi-muted gap-2 opacity-50">
               <ShieldCheck size={24} />
               <span className="text-[10px] font-bold uppercase">No Critical Deviations Detected</span>
            </div>
          )}
       </div>
    </div>
  );
};

export const PlanetaryPulseDisplay: React.FC<PlanetaryPulseProps> = ({ pulse }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-agi-accent/20 flex items-center justify-center text-agi-accent">
            <Activity size={18} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-agi-text uppercase tracking-[0.2em] mb-0.5">Planetary Pulse Monitoring</h2>
            <p className="text-[9px] text-agi-muted uppercase font-mono tracking-widest">Aggregated Multi-Spectral Telemetry</p>
          </div>
        </div>
        <div className="flex gap-4 items-center">
           {pulse.lastSync && (
             <div className="text-[9px] text-agi-muted font-mono uppercase tracking-widest text-right">
               Last Sync: {new Date(pulse.lastSync).toLocaleTimeString()}
             </div>
           )}
           <div className="px-3 py-1 rounded-full bg-agi-bg border border-agi-border flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-agi-success animate-pulse" />
              <span className="text-[8px] font-bold text-agi-text uppercase tracking-widest">Real-time Feed Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <PulseMetricCard metric={pulse.seismicActivity} icon={Activity} />
        <PulseMetricCard metric={pulse.solarFlares} icon={Sun} />
        <PulseMetricCard metric={pulse.protonFlux} icon={Zap} />
        <PulseMetricCard metric={pulse.magnetometer} icon={Magnet} />
        <PulseMetricCard metric={pulse.atmosphericPressure} icon={Wind} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
           <h3 className="text-[10px] font-bold text-agi-muted uppercase tracking-[0.2em]">Source_Flow_Analysis</h3>
           <SourceNetworkGraph pulse={pulse} />
        </div>
        <div className="lg:col-span-1 space-y-2">
           <h3 className="text-[10px] font-bold text-agi-muted uppercase tracking-[0.2em]">Real-time_Deviations</h3>
           <AnomalyTimeline pulse={pulse} />
        </div>
      </div>

      <div className="bg-agi-accent/5 rounded-2xl p-4 border border-agi-accent/10">
        <div className="flex items-start gap-3">
           <Info size={14} className="text-agi-accent mt-0.5" />
           <div>
              <h5 className="text-[9px] font-bold text-agi-accent uppercase mb-1">Anomaly Detection Heuristics</h5>
              <p className="text-[10px] text-agi-muted leading-relaxed">
                System is continuously monitoring USGS seismic arrays, NOAA space weather telemetry, and WMO atmospheric stations. 
                Any deviation beyond 1.5 standard deviations from baseline will trigger an identity tension spike.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PlanetaryPulseDisplay;
