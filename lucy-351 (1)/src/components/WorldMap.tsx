import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import { EarthEvent } from '../types';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface WorldMapProps {
  events: EarthEvent[];
  onEventClick?: (event: EarthEvent) => void;
}

interface Cluster {
  id: string;
  events: EarthEvent[];
  center: [number, number];
  severity: number;
}

const WorldMap: React.FC<WorldMapProps> = ({ events, onEventClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
  const [scale, setScale] = useState(250);
  const [hoveredCluster, setHoveredCluster] = useState<Cluster | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // Helper for smoother transitions
  const zoomTo = (targetRotation: [number, number, number], targetScale: number) => {
    setIsAutoRotating(false);
    
    // We can use d3 transitions if we want, but for now let's just set state
    // Simple way to "animate" is using multiple steps, but standard React state update is discrete.
    // For a better UX, I'll use a simple linear interpolation over a few frames or just jump for now.
    // D3's transition is better suited if we were in a non-React land, but here we can use a small timer.
    
    const startRotation = [...rotation];
    const startScale = scale;
    const duration = 1000;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = d3.easeCubicOut(progress);

      setRotation([
        startRotation[0] + (targetRotation[0] - startRotation[0]) * ease,
        startRotation[1] + (targetRotation[1] - startRotation[1]) * ease,
        startRotation[2] + (targetRotation[2] - startRotation[2]) * ease
      ]);
      setScale(startScale + (targetScale - startScale) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(res => res.json())
      .then(data => {
         const countries: any = feature(data, data.objects.countries);
         setGeoData(countries);
      });
  }, []);

  // Auto-rotation - only if not manual
  useEffect(() => {
    if (!isAutoRotating) return;
    const timer = setInterval(() => {
      setRotation(prev => [prev[0] + 0.2, prev[1], prev[2]]);
    }, 50);
    return () => clearInterval(timer);
  }, [isAutoRotating]);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const width = 600;
    const height = 600;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const projection = d3.geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate(rotation)
      .clipAngle(90);

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([100, 1000])
      .on('zoom', (event) => {
        setScale(event.transform.k);
      });

    // Drag behavior for rotation
    const drag = d3.drag<SVGSVGElement, unknown>()
      .on('start', () => setIsAutoRotating(false))
      .on('drag', (event) => {
        const rotate = projection.rotate();
        const k = 75 / projection.scale();
        setRotation([
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k,
          rotate[2]
        ]);
      });

    svg.call(drag as any);
    // Initialize zoom scale
    svg.call(zoom.transform as any, d3.zoomIdentity.scale(scale));
    svg.on('.zoom', null); // Disable double-click zoom which can be annoying
    
    // Zoom via wheel
    svg.on('wheel', (event) => {
      event.preventDefault();
      const delta = -event.deltaY;
      setScale(prev => Math.min(1000, Math.max(100, prev + delta * 0.5)));
      setIsAutoRotating(false);
    }, { passive: false });

    const path = d3.geoPath().projection(projection);
    const graticule = d3.geoGraticule();

    // Event Clustering Logic
    const clusters: Cluster[] = [];
    const CLUSTER_THRESHOLD = 30; // Radius in geographic distance? No, let's use screen distance for simplicity or d3.geoDistance

    events.forEach(event => {
      let addedToCluster = false;
      for (const cluster of clusters) {
        const dist = d3.geoDistance([event.lng, event.lat], cluster.center);
        if (dist < 0.2) { // Radians (~1200km)
          cluster.events.push(event);
          // Re-calculate center (simple average)
          cluster.center = [
            d3.mean(cluster.events, d => d.lng) || 0,
            d3.mean(cluster.events, d => d.lat) || 0
          ];
          cluster.severity = d3.mean(cluster.events, d => d.severity) || 0;
          addedToCluster = true;
          break;
        }
      }
      if (!addedToCluster) {
        clusters.push({
          id: `cluster-${event.id}`,
          events: [event],
          center: [event.lng, event.lat],
          severity: event.severity
        });
      }
    });

    // Sphere (Water/Ocean)
    svg.append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', scale)
      .attr('fill', '#050505')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1);

    // Filter clusters to only those on the visible side
    const visibleClusters = clusters.filter(c => {
      return d3.geoDistance(c.center as [number, number], [-rotation[0], -rotation[1]]) < Math.PI / 2;
    });

    // Draw map
    svg.append('g')
      .selectAll('path')
      .data(geoData.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .attr('fill', '#111827')
      .attr('stroke', '#334155')
      .attr('stroke-width', 0.4);

    // Graticule
    svg.append('path')
      .datum(graticule())
      .attr('d', path as any)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.2);

    // Draw event clusters
    const points = svg.append('g');

    visibleClusters.forEach(cluster => {
      const coords = projection(cluster.center as [number, number]);
      if (coords) {
        const isHovered = hoveredCluster?.id === cluster.id;
        const group = points.append('g')
          .attr('transform', `translate(${coords[0]}, ${coords[1]})`)
          .attr('cursor', 'pointer')
            .on('click', (e) => {
              e.stopPropagation();
              if (cluster.events.length > 1 && scale < 500) {
                zoomTo([-cluster.center[0], -cluster.center[1], rotation[2]], Math.min(scale * 1.5, 800));
              } else {
                if (cluster.events.length > 1) {
                  const aggregated: EarthEvent = {
                    id: cluster.id,
                    source: 'CLUSTER_AGGREGATE',
                    type: 'AGGREGATED_ANOMALY',
                    severity: cluster.severity,
                    severityHistory: cluster.events[0].severityHistory, // Use first one as baseline
                    timestamp: d3.max(cluster.events, d => d.timestamp) || Date.now(),
                    location: `${cluster.events.length} Anomalies in Region`,
                    lat: cluster.center[1],
                    lng: cluster.center[0],
                    description: `Compound anomaly containing ${cluster.events.length} distinct events. Patterns suggest high-order correlation between ${cluster.events.map(ev => ev.type).join(', ')}.`,
                    relatedPatterns: Array.from(new Set(cluster.events.flatMap(ev => ev.relatedPatterns || []))),
                    impactAssessment: {
                      riskLevel: cluster.severity > 0.8 ? 'CRITICAL' : cluster.severity > 0.5 ? 'HIGH' : 'MEDIUM',
                      predictedEvolution: 'Non-linear amplification of seismic and magnetic fluxes detected. Potential for cascading structural decoherence.',
                      affectedSystems: Array.from(new Set(cluster.events.flatMap(ev => ev.impactAssessment?.affectedSystems || [])))
                    }
                  };
                  onEventClick?.(aggregated);
                } else {
                  onEventClick?.(cluster.events[0]);
                }
              }
            })
          .on('mouseenter', () => setHoveredCluster(cluster))
          .on('mouseleave', () => setHoveredCluster(null));

        const radius = (isHovered ? 6 : 4) + (cluster.events.length * 1.5) + (cluster.severity * 3);
        const color = cluster.severity > 0.8 ? '#ef4444' : cluster.severity > 0.5 ? '#f59e0b' : '#3b82f6';
        const pulseMaxRadius = radius + 10 + (cluster.severity * 15);
        const pulseDuration = 3 - (cluster.severity * 2); // Faster pulses for higher severity

        // Cluster circle
        group.append('circle')
          .attr('r', radius)
          .attr('fill', color)
          .attr('opacity', isHovered ? 0.9 : 0.6)
          .attr('stroke', '#fff')
          .attr('stroke-width', isHovered ? 2 : 0)
          .attr('filter', isHovered ? 'drop-shadow(0 0 8px ' + color + ')' : 'none');

        if (cluster.events.length > 1) {
          // Cluster count
          group.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .attr('fill', '#fff')
            .attr('font-size', '8px')
            .attr('font-weight', 'bold')
            .text(cluster.events.length);

          // Add "MULTIPLE" label
          const labelGroup = group.append('g')
            .attr('opacity', isHovered ? 1 : 0.4);

          labelGroup.append('text')
            .attr('x', radius + 10)
            .attr('y', 0)
            .attr('dy', '.3em')
            .attr('fill', color)
            .attr('font-size', '6px')
            .attr('font-weight', '900')
            .attr('letter-spacing', '0.05em')
            .attr('font-family', 'JetBrains Mono, monospace')
            .text('MIXED_STREAMS');

          labelGroup.append('line')
            .attr('x1', radius + 2)
            .attr('y1', 0)
            .attr('x2', radius + 8)
            .attr('y2', 0)
            .attr('stroke', color)
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '1,1');
        } else {
          // Add Source label for single event
          const labelGroup = group.append('g')
            .attr('opacity', isHovered ? 1 : 0.4);

          labelGroup.append('text')
            .attr('x', radius + 10)
            .attr('y', 0)
            .attr('dy', '.3em')
            .attr('fill', color)
            .attr('font-size', '6px')
            .attr('font-weight', '900')
            .attr('letter-spacing', '0.05em')
            .attr('font-family', 'JetBrains Mono, monospace')
            .text(cluster.events[0].source.toUpperCase());

          labelGroup.append('line')
            .attr('x1', radius + 2)
            .attr('y1', 0)
            .attr('x2', radius + 8)
            .attr('y2', 0)
            .attr('stroke', color)
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '1,1');
        }

        // Pulse
        group.append('circle')
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1)
          .append('animate')
          .attr('attributeName', 'r')
          .attr('from', radius)
          .attr('to', pulseMaxRadius)
          .attr('dur', `${pulseDuration}s`)
          .attr('repeatCount', 'indefinite');
          
        group.append('circle')
          .attr('r', radius)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 1)
          .append('animate')
          .attr('attributeName', 'opacity')
          .attr('from', 0.6)
          .attr('to', 0)
          .attr('dur', `${pulseDuration}s`)
          .attr('repeatCount', 'indefinite');
          
        // Connection lines if multiple events
        if (cluster.events.length > 1) {
           cluster.events.forEach(e => {
             const eCoords = projection([e.lng, e.lat]);
             if (eCoords) {
                points.append('line')
                  .attr('x1', coords[0])
                  .attr('y1', coords[1])
                  .attr('x2', eCoords[0])
                  .attr('y2', eCoords[1])
                  .attr('stroke', color)
                  .attr('stroke-width', 0.5)
                  .attr('opacity', 0.3)
                  .attr('stroke-dasharray', '2,2');
             }
           });
        }
      }
    });

  }, [geoData, events, rotation, scale, isAutoRotating]);

  return (
    <div className="relative w-full aspect-square bg-[#050505] rounded-3xl border border-agi-border overflow-hidden panel-glow">
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
        <h2 className="text-xs font-bold text-agi-accent tracking-[0.2em] uppercase">Sovereign_Eye_v4</h2>
        <span className="text-[10px] text-agi-muted font-mono">LAT: {(rotation[1] * -1).toFixed(2)} LON: {(rotation[0] % 360).toFixed(2)}</span>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 600 600"
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {hoveredCluster && (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-6 left-6 right-6 bg-agi-panel/90 backdrop-blur-md p-4 rounded-2xl border border-agi-accent/30 z-20 pointer-events-none shadow-2xl"
        >
          {hoveredCluster.events.length > 1 ? (
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] text-agi-accent font-bold uppercase tracking-[0.2em]">Aggregated_Anomaly_Detected</div>
                <div className="px-2 py-0.5 bg-agi-accent/20 rounded text-[9px] font-bold text-agi-accent">{hoveredCluster.events.length} EVENTS</div>
              </div>
              <div className="space-y-2 max-h-[100px] overflow-hidden relative">
                {hoveredCluster.events.map((e, i) => (
                  <div key={e.id} className="text-[10px] flex gap-2 items-start">
                    <span className="text-agi-accent font-mono">[{i+1}]</span>
                    <span className="text-agi-text italic truncate">"{e.description}"</span>
                  </div>
                ))}
                {hoveredCluster.events.length > 4 && (
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-agi-panel to-transparent" />
                )}
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-agi-border/50">
                <span className="text-[9px] text-agi-muted uppercase font-bold">Multiple Locations Detected</span>
                <span className="text-[9px] text-agi-accent font-bold">AVG_SEVERITY: {Math.round(hoveredCluster.severity * 100)}%</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-1">
                <div className="text-[10px] text-agi-accent font-bold uppercase tracking-tighter">{hoveredCluster.events[0].source} // {hoveredCluster.events[0].type}</div>
                <div className="w-16 h-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hoveredCluster.events[0].severityHistory.map((s, i) => ({ val: s, index: i }))}>
                      <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                      <YAxis hide domain={[0, 1]} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <p className="text-xs text-agi-text italic leading-tight">"{hoveredCluster.events[0].description}"</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[9px] text-agi-muted uppercase font-bold">{hoveredCluster.events[0].location}</span>
                <span className="text-[9px] text-agi-accent font-bold">SEVERITY: {Math.round(hoveredCluster.events[0].severity * 100)}%</span>
              </div>
            </>
          )}
        </motion.div>
      )}

      <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-2">
        <div className="px-3 py-1 bg-agi-accent/10 border border-agi-accent/50 rounded-full flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-agi-accent animate-pulse" />
          <span className="text-[10px] font-bold text-agi-accent">LIVE_TELEMETRY</span>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
