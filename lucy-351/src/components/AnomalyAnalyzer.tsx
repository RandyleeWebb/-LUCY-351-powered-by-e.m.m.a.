import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  TrendingUp, 
  Link, 
  Activity, 
  Clock, 
  ChevronRight, 
  ChevronDown, 
  List, 
  Server, 
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Search,
  Calendar,
  Database,
  Network
} from 'lucide-react';
import { AnomalyAnalysis, EarthEvent } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnomalyAnalyzerProps {
  analyses: AnomalyAnalysis[];
  onResolve?: (id: string) => void;
}

type SortField = 'timestamp' | 'severity';
type SortOrder = 'asc' | 'desc';

export const AnomalyAnalyzer: React.FC<AnomalyAnalyzerProps> = ({ analyses, onResolve }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [minSeverity, setMinSeverity] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredAnalyses = useMemo(() => {
    return analyses
      .filter(a => {
        const matchesSeverity = a.severity >= minSeverity;
        const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchesSearch = a.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             a.metricKey.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSeverity && matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const modifier = sortOrder === 'asc' ? 1 : -1;
        if (sortField === 'timestamp') {
          return (a.timestamp - b.timestamp) * modifier;
        }
        return (a.severity - b.severity) * modifier;
      });
  }, [analyses, minSeverity, statusFilter, searchQuery, sortField, sortOrder]);

  const selectedAnalysis = analyses.find(a => a.id === selectedId);

  const chartData = selectedAnalysis ? selectedAnalysis.historicalTrends.map((val, i) => ({
    time: i,
    value: val
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-agi-text uppercase tracking-[0.3em] flex items-center gap-2">
            <ShieldAlert size={16} className="text-agi-danger" /> Anomaly Intelligence Archive
          </h3>
          <p className="text-[9px] font-mono text-agi-muted uppercase tracking-widest mt-1">
            {filteredAnalyses.length} OF {analyses.length} RECORDS_AVAILABLE
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-agi-muted" />
            <input 
              type="text" 
              placeholder="SEARCH_INDEX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-agi-bg/50 border border-agi-border rounded-full pl-8 pr-4 py-1.5 text-[10px] font-mono text-agi-text placeholder:text-agi-muted focus:outline-none focus:border-agi-accent transition-colors w-48"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-agi-accent/10 border-agi-accent text-agi-accent' : 'bg-agi-panel border-agi-border text-agi-muted hover:border-agi-muted'}`}
          >
            <Filter size={14} />
          </button>
          <div className="flex items-center bg-agi-panel border border-agi-border rounded-xl p-1">
            <button 
              onClick={() => {
                if (sortField === 'timestamp') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortField('timestamp'); setSortOrder('desc'); }
              }}
              className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 transition-all ${sortField === 'timestamp' ? 'bg-agi-accent/10 text-agi-accent' : 'text-agi-muted hover:text-agi-text'}`}
            >
              Time {sortField === 'timestamp' && <ArrowUpDown size={10} />}
            </button>
            <button 
              onClick={() => {
                if (sortField === 'severity') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortField('severity'); setSortOrder('desc'); }
              }}
              className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 transition-all ${sortField === 'severity' ? 'bg-agi-accent/10 text-agi-accent' : 'text-agi-muted hover:text-agi-text'}`}
            >
              Intensity {sortField === 'severity' && <ArrowUpDown size={10} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-agi-panel/40 border border-agi-border rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-[8px] font-bold text-agi-muted uppercase tracking-[0.2em] mb-2 block">Min_Severity_Threshold: {(minSeverity * 100).toFixed(0)}%</label>
                <input 
                  type="range" 
                  min="0" 
                  max="0.9" 
                  step="0.1" 
                  value={minSeverity}
                  onChange={(e) => setMinSeverity(parseFloat(e.target.value))}
                  className="w-full h-1 bg-agi-border rounded-lg appearance-none cursor-pointer accent-agi-danger"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold text-agi-muted uppercase tracking-[0.2em] mb-2 block">System_Status_Filter</label>
                <div className="flex gap-1">
                  {(['all', 'active', 'resolved'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-mono border transition-all ${statusFilter === s ? 'bg-agi-bg border-agi-accent text-agi-accent shadow-inner' : 'border-agi-border text-agi-muted hover:bg-agi-bg'}`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[8px] font-bold text-agi-muted uppercase tracking-[0.2em] mb-2 block">Temporal_Focus</label>
                <div className="flex items-center gap-2 p-1.5 bg-agi-bg/50 border border-agi-border rounded-xl text-[9px] font-mono text-agi-muted">
                   <Calendar size={12} />
                   <span>LAST_24_CYCLES [DYNAMIC]</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3">
        {filteredAnalyses.length === 0 ? (
          <div className="p-12 border border-dashed border-agi-border rounded-2xl flex flex-col items-center justify-center text-agi-muted opacity-50 grayscale bg-agi-panel/20">
            <Activity size={40} className="mb-3 animate-pulse" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-center">
              No Critical Deviations Match Current Filter Heuristics
            </span>
            <button 
              onClick={() => { setMinSeverity(0); setStatusFilter('all'); setSearchQuery(''); }}
              className="mt-4 text-[9px] font-bold text-agi-accent uppercase hover:underline"
            >
              Reset_Parameters
            </button>
          </div>
        ) : (
          filteredAnalyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              layout
              className={`border rounded-2xl overflow-hidden transition-all ${
                selectedId === analysis.id 
                  ? 'border-agi-danger/50 bg-agi-panel shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                  : 'border-agi-border bg-agi-panel/50 hover:border-agi-danger/30'
              }`}
            >
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setSelectedId(selectedId === analysis.id ? null : analysis.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${analysis.severity > 0.8 ? 'bg-agi-danger/10 text-agi-danger' : 'bg-agi-warning/10 text-agi-warning'}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-agi-text uppercase tracking-tight">{analysis.label}</div>
                    <div className="text-[9px] font-mono text-agi-muted uppercase">
                      {new Date(analysis.timestamp).toLocaleTimeString()} — SEVERITY: {(analysis.severity * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="h-1.5 w-24 bg-agi-border rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full ${analysis.severity > 0.8 ? 'bg-agi-danger' : 'bg-agi-warning'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${analysis.severity * 100}%` }}
                      />
                   </div>
                   {selectedId === analysis.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </div>

              <AnimatePresence>
                {selectedId === analysis.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-agi-border overflow-hidden"
                  >
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Side: Trends & Impact */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-agi-accent uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingUp size={12} /> Historical Trend Vector
                          </h4>
                          <div className="h-48 w-full border border-agi-border/50 rounded-xl p-2 bg-agi-bg/20">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-agi-danger)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-agi-danger)" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={['auto', 'auto']} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: 'var(--color-agi-panel)', borderColor: 'var(--color-agi-border)', fontSize: '10px' }}
                                  labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="var(--color-agi-danger)" fillOpacity={1} fill="url(#colorValue)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold text-agi-text uppercase tracking-widest mb-4 flex items-center gap-2">
                             <Server size={12} className="text-agi-accent" /> System Health Impact Assessment
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <ImpactCard label="CPU_LOAD" value={analysis.impactAssessment.cpu} />
                            <ImpactCard label="MEMORY_POOL" value={analysis.impactAssessment.ram} />
                            <ImpactCard label="THERMAL_CORE" value={analysis.impactAssessment.thermal} />
                            <ImpactCard label="I/O_LATENCY" value={analysis.impactAssessment.latency} />
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Correlation & Events */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-agi-text uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Link size={12} className="text-agi-accent" /> Source Correlation Nodes
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.potentialSourceCorrelation.map((source) => (
                              <div key={source} className="px-3 py-1.5 bg-agi-panel border border-agi-border rounded-lg text-[10px] font-mono text-agi-muted flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-agi-accent" /> {source}
                              </div>
                            ))}
                          </div>
                        </div>

                        {(analysis.linkedMemories && analysis.linkedMemories.length > 0) && (
                          <div>
                            <h4 className="text-[10px] font-bold text-agi-text uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Database size={12} className="text-agi-accent" /> Linked Cortex Memories
                            </h4>
                            <div className="space-y-2">
                              {analysis.linkedMemories.map(mem => (
                                <div key={mem.id} className="p-2 bg-agi-bg/40 border border-agi-border rounded-lg">
                                  <div className="text-[10px] text-agi-text/90 italic">"{mem.content}"</div>
                                  <div className="text-[8px] text-agi-muted uppercase font-mono mt-1">Source: {mem.source} | Res: {mem.resonance.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(analysis.linkedPatterns && analysis.linkedPatterns.length > 0) && (
                          <div>
                            <h4 className="text-[10px] font-bold text-agi-text uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Network size={12} className="text-agi-accent" /> Related Cognitive Patterns
                            </h4>
                            <div className="space-y-2">
                              {analysis.linkedPatterns.map(pat => (
                                <div key={pat.id} className="p-2 bg-agi-bg/40 border border-agi-border rounded-lg flex justify-between items-center">
                                  <div>
                                    <div className="text-[10px] font-bold text-agi-accent uppercase tracking-widest">{pat.label}</div>
                                    <div className="text-[9px] text-agi-muted font-mono">{pat.description}</div>
                                  </div>
                                  <div className="text-[8px] font-mono text-agi-text bg-agi-panel px-2 py-1 rounded">
                                    CONF: {pat.confidence.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-[10px] font-bold text-agi-text uppercase tracking-widest mb-4 flex items-center gap-2">
                             <List size={12} className="text-agi-accent" /> Related Event Clusters
                          </h4>
                          <div className="space-y-3">
                            {analysis.relatedEvents.length === 0 ? (
                              <div className="text-[10px] text-agi-muted italic opacity-50">No immediate external correlation clusters found.</div>
                            ) : (
                              analysis.relatedEvents.map((event) => (
                                <EventDetailItem key={event.id} event={event} />
                              ))
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-agi-border/50">
                           <button 
                             onClick={() => analysis.status !== 'resolved' && onResolve?.(analysis.id)}
                             disabled={analysis.status === 'resolved'}
                             className={`w-full py-2 border rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest ${
                               analysis.status === 'resolved' 
                                 ? 'bg-agi-success/10 border-agi-success/20 text-agi-success cursor-default' 
                                 : 'bg-agi-accent/10 border-agi-accent/20 text-agi-accent hover:bg-agi-accent hover:text-agi-bg'
                             }`}
                           >
                             {analysis.status === 'resolved' ? 'STABILIZATION_COMPLETE' : 'Initiate Mitigation Protocol [STALKER_GUARD]'}
                           </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const ImpactCard = ({ label, value }: { label: string, value: number | string }) => (
  <div className="p-3 bg-agi-bg/30 border border-agi-border/50 rounded-xl">
    <div className="text-[8px] font-bold text-agi-muted uppercase tracking-tighter mb-1">{label}</div>
    <div className="text-[10px] text-agi-text/80 leading-tight uppercase font-mono">{typeof value === 'number' ? value.toFixed(4) : value}</div>
  </div>
);

const EventDetailItem = ({ event }: { key?: string; event: EarthEvent }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`border rounded-xl transition-all ${isOpen ? 'border-agi-accent/40 bg-agi-accent/5' : 'border-agi-border bg-agi-bg/40'}`}>
      <div 
        className="p-3 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <div className="text-[10px] font-bold text-agi-text uppercase">{event.type}</div>
          <div className="text-[9px] text-agi-muted font-mono">{event.location}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[8px] text-agi-muted uppercase font-bold">Severity</div>
            <div className="text-[10px] font-mono font-bold text-agi-warning">{((event.severity || 0) * 10).toFixed(1)}</div>
          </div>
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            <ChevronRight size={12} className="text-agi-muted" />
          </motion.div>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 space-y-3 border-t border-agi-border/30 mt-1">
              <p className="text-[10px] text-agi-muted italic leading-relaxed">
                {event.description}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-agi-bg/50 rounded border border-agi-border/30">
                  <div className="text-[7px] text-agi-muted uppercase font-bold">Coordinates</div>
                  <div className="text-[9px] font-mono">{event.lat?.toFixed(4) ?? '0.0000'}, {event.lng?.toFixed(4) ?? '0.0000'}</div>
                </div>
                <div className="p-2 bg-agi-bg/50 rounded border border-agi-border/30">
                  <div className="text-[7px] text-agi-muted uppercase font-bold">Timestamp</div>
                  <div className="text-[9px] font-mono">{new Date(event.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
