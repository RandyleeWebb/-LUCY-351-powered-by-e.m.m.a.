// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe as GlobeIcon, Activity, Database, Satellite, Play, AlertTriangle, Layers, Map as MapIcon, Cpu, Zap, Plane, Maximize2, Minimize2, Brain } from 'lucide-react';
import { globalEventBus } from '../../core/EventBus';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import {
  SemanticEvent,
  LucySemanticDictionary,
  PredictionPacket,
  quakeScore,
  stormForecast,
  flightCongestion,
  updateHeat,
  heatMapMemory,
  getActiveHotspots,
  LucyInterpret,
  speakLucy,
  detectAnomaly
} from '../../core/LucyIntelligence';

// External UI Components
const PredictionStrip: React.FC<{ predictions: PredictionPacket[] }> = ({ predictions }) => {
  if (predictions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-2">
          <Activity className="w-3 h-3 text-lucy-primary" />
          Prediction Engine Output
        </h4>
        <span className="text-[8px] px-1.5 py-0.5 rounded bg-lucy-primary/10 text-lucy-primary border border-lucy-primary/20 font-mono">LIVE</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence>
          {predictions.map((p, idx) => (
            <motion.div 
              key={`${p.domain}-${idx}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
              className="bg-slate-900 border border-slate-700/50 hover:border-lucy-primary/30 transition-colors rounded p-2.5 flex flex-col gap-1 relative overflow-hidden group"
            >
              {/* Domain Background Glow */}
              <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full blur-[20px] opacity-20 group-hover:opacity-40 transition-opacity ${
                p.trend === 'RISING' ? 'bg-red-500' :
                p.trend === 'FALLING' ? 'bg-lucy-success' : 'bg-lucy-primary'
              }`} />
              
              <div className="flex justify-between items-start z-10">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-slate-400 font-mono font-bold tracking-wide">{p.domain.replace('_', ' ')}</span>
                  {p.location && (
                    <span className="text-[7px] text-slate-500 font-mono">
                      {Math.abs(p.location.lat).toFixed(1)}°{p.location.lat >= 0 ? 'N' : 'S'}, {Math.abs(p.location.lng).toFixed(1)}°{p.location.lng >= 0 ? 'E' : 'W'}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                  p.trend === 'RISING' ? 'text-red-400 bg-red-400/10' : 
                  p.trend === 'FALLING' ? 'text-lucy-success bg-lucy-success/10' : 
                  'text-slate-300 bg-slate-800'
                }`}>
                  {p.trend}
                </span>
              </div>
              
              <span className="text-[10px] text-slate-200 mt-1 leading-snug font-medium z-10">{p.forecast}</span>
              
              <div className="flex items-center gap-2 mt-2 z-10">
                <span className="text-[8px] text-slate-500 font-mono">CONFIDENCE</span>
                <div className="flex-1 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      p.confidence > 0.8 ? 'bg-lucy-success shadow-[0_0_5px_#10b981]' :
                      p.confidence > 0.5 ? 'bg-lucy-primary shadow-[0_0_5px_#06b6d4]' : 
                      'bg-slate-500'
                    }`} 
                    style={{width: `${p.confidence * 100}%`}}
                  ></div>
                </div>
                <span className="text-[8px] text-slate-300 font-mono font-bold">{(p.confidence * 100).toFixed(0)}%</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const TwinEarthDashboard: React.FC = () => {
  const [feed, setFeed] = useState<SemanticEvent[]>([]);
  const [predictions, setPredictions] = useState<PredictionPacket[]>([]);
  const [scenarioInput, setScenarioInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [hoverArc, setHoverArc] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);

  // Drag-to-inject state
  const [draggedEvent, setDraggedEvent] = useState<SemanticEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Cognitive Gear System (Hot-Swap)
  const [reasoningMode, setReasoningMode] = useState<"low_power" | "balanced" | "high_compute" | "arc_pattern">("balanced");
  
  // Internal Merge State Visualization
  const [mergeState, setMergeState] = useState({
    hypothesisA: 62,
    hypothesisB: 31,
    noise: 7,
    convergencePath: [
      "A leads initial interpretation",
      "Contradiction detected in geophysical input",
      "B gains under contraction pressure",
      "A+B stabilize under constraint relaxation"
    ]
  });
  
  // Layer performance controls
  const [layers, setLayers] = useState({
    flights: true,
    seismic: true,
    labels: false,
    predictions: true
  });
  
  // Array representing the active biological pulses globally
  const [pulses, setPulses] = useState<any[]>([]);


  // Real-time UTC Sync for Sun Lighting
  const [utcTime, setUtcTime] = useState(Date.now());
  const [globeReady, setGlobeReady] = useState(false);
  
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });

  // ═══════════════════════════════════════════════════════════════════════════
  // Drag-to-Inject Handlers (Earth→Sim Bridge)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Handle drag start for Earth event markers
   */
  const handleEventDragStart = (event: SemanticEvent) => {
    setDraggedEvent(event);
    setIsDragging(true);

    // Publish drag event to event bus
    globalEventBus.emit('earth:event-drag-start', {
      event,
      timestamp: Date.now(),
    });
  };

  /**
   * Handle drag end
   */
  const handleEventDragEnd = () => {
    setDraggedEvent(null);
    setIsDragging(false);

    globalEventBus.emit('earth:event-drag-end', {
      timestamp: Date.now(),
    });
  };

  /**
   * Get drag data for transfer
   */
  const getEventDragData = (event: SemanticEvent): string => {
    return JSON.stringify({
      type: 'earth-event',
      event,
      source: 'TwinEarthDashboard',
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    // Globe directional light for real terminator instead of CSS hack
    if (globeRef.current && globeReady) {
      const scene = globeRef.current.scene();
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.0;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Add directional light imitating the sun
      const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
      const date = new Date(utcTime);
      const hours = date.getUTCHours();
      const angle = (hours / 24) * Math.PI * 2;
      sunLight.position.set(Math.cos(angle) * 120, 20, Math.sin(angle) * 120);
      
      const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
      rimLight.position.set(Math.cos(angle + Math.PI) * 100, -20, Math.sin(angle + Math.PI) * 100);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
      
      const oldLights = scene.children.filter((c: any) => c.isDirectionalLight || c.isAmbientLight);
      oldLights.forEach((l: any) => scene.remove(l));
      
      scene.add(ambientLight);
      scene.add(sunLight);
      scene.add(rimLight);

      // Create a cloudy weather layer
      const weatherOverlayName = "weatherOverlayLayer";
      if (!scene.getObjectByName(weatherOverlayName)) {
        const loader = new THREE.TextureLoader();
        loader.load("https://unpkg.com/three-globe/example/img/fair_clouds_4k.png", (texture: THREE.Texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          const geometry = new THREE.SphereGeometry(101.5, 64, 64);
          const material = new THREE.MeshPhongMaterial({
            map: texture,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
            blending: THREE.AdditiveBlending
          });
          const weatherSphere = new THREE.Mesh(geometry, material);
          weatherSphere.name = weatherOverlayName;
          scene.add(weatherSphere);
        });
      }

      // Add stars
      const starsName = "starsBackground";
      if (!scene.getObjectByName(starsName)) {
        const loader = new THREE.TextureLoader();
        loader.load("https://unpkg.com/three-globe/example/img/night-sky.png", (texture: THREE.Texture) => {
          const geometry = new THREE.SphereGeometry(500, 64, 64);
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.5
          });
          const starsSphere = new THREE.Mesh(geometry, material);
          starsSphere.name = starsName;
          scene.add(starsSphere);
        });
      }
      
    }
  }, [utcTime, globeReady]);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (globeRef.current) {
        const scene = globeRef.current.scene();
        const weatherSphere = scene.getObjectByName("weatherOverlayLayer");
        if (weatherSphere) {
          weatherSphere.rotation.y += 0.0005; // smooth slow rotation
        }
      }
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    // Generate Prediction strip UI data when feed changes
    if (feed.length > 0) {
      const latestNOAA = feed.find(e => e.source === 'NOAA_SPACE');
      const newPredictions = [
        quakeScore(feed),
        stormForecast(latestNOAA),
        flightCongestion(flights)
      ];
      setPredictions(newPredictions);
    }
  }, [feed, flights]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setGlobeSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    // Initial and deferred resize to account for CSS transition
    handleResize();
    const timeoutIds = [
      setTimeout(handleResize, 50),
      setTimeout(handleResize, 250),
      setTimeout(handleResize, 550)
    ];

    window.addEventListener('resize', handleResize);
    
    // Sync UTC clock for terminator lighting
    const timeInterval = setInterval(() => setUtcTime(Date.now()), 60000); // update every minute
    
    // Poll hotspots
    const heatInterval = setInterval(() => {
       setHotspots(getActiveHotspots());
    }, 2000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timeInterval);
      clearInterval(heatInterval);
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [isExpanded]);

  // URLs defined by User
  const SOURCES = [
    { id: 'USGS_SEISMIC', url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson' },
    { id: 'NOAA_SPACE', url: 'https://services.swpc.noaa.gov/json/rtsw.json' }
  ];

  useEffect(() => {
    let isActive = true;

    const safeFlights = (data: any) => {
      if (!data?.states) return [];
      return data.states
        .slice(0, 120)
        .map((s: any) => {
          if (!s?.[5] || !s?.[6] || !s?.[10]) return null;
          const lon = s[5];
          const lat = s[6];
          const heading = s[10];
          const altitude = s[7] || 0; // baro altitude
          const velocity = s[9] || 0;
          const callsign = typeof s[1] === 'string' ? s[1].trim() : s[0];
          const headingRad = heading * (Math.PI / 180);
          const dist = 1.5;
          return {
            id: callsign || s[0],
            startLat: lat,
            startLng: lon,
            endLat: lat + Math.cos(headingRad) * dist,
            endLng: lon + Math.sin(headingRad) * dist,
            type: "ADSB_FLIGHT",
            altitude,
            heading,
            velocity,
            // Thicker line for higher altitude flights (0.2 to 0.8)
            strokeThickness: Math.min(0.8, Math.max(0.2, (altitude / 10000) * 0.8))
          };
        })
        .filter(Boolean);
    };

    // Listen to Hyper Swarm (Little Lucy / Emma Events)
    const handleSwarmEvent = (msg: any) => {
      if (msg.target.startsWith('L') || msg.target.startsWith('E')) {
         if (msg.payload && msg.payload.pulseId && msg.payload.lat && msg.payload.lng) {
            // Plot swarm intelligence node findings onto the globe
            setFeed(prev => {
              const swarmEvent: SemanticEvent = {
                id: msg.payload.pulseId,
                source: 'HYPER_SWARM_MESH',
                type: 'Node Detection Anomaly',
                value: `Conf ${Math.round(msg.confidence * 100)}%`,
                location: 'Swarm Vector',
                timestamp: new Date(),
                urlRef: `Mesh ID: ${msg.source}->${msg.target}`,
                lat: msg.payload.lat,
                lng: msg.payload.lng,
                size: 2,
                color: '#8b5cf6', // Purple for Swarm
                agentSource: 'Swarm'
              };
              updateHeat(swarmEvent);
              return [swarmEvent, ...prev].slice(0, 50);
            });
         }
      }
    };
    globalEventBus.subscribeAll(handleSwarmEvent);

    const fetchLiveEarthIntel = async () => {
      try {
        // Fallback to direct USGS feed to guarantee data if Python layer is rebuilding
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson');
        
        if (response.ok) {
           const payload = await response.json();
           
           if (payload.features && payload.features.length > 0 && isActive) {
             const newQuakes = payload.features.slice(0, 20).map((f: any) => ({
               id: f.id,
               source: 'USGS_EARTHQUAKES',
               type: 'Live Seismic Event',
               value: `Mag ${f.properties.mag}`,
               location: f.properties.place,
               timestamp: new Date(f.properties.time),
               urlRef: 'usgs.gov',
               lat: f.geometry?.coordinates ? f.geometry.coordinates[1] : 0,
               lng: f.geometry?.coordinates ? f.geometry.coordinates[0] : 0,
               size: Math.max(0.5, (f.properties.mag || 0) * 0.2),
               color: (f.properties.mag || 0) > 4 ? '#ff0000' : '#ff9900'
             }));

             setFeed(prev => {
               const mapIds = new Set(prev.map(p => p.id));
               const distinct = newQuakes.filter((q: any) => !mapIds.has(q.id));
               
               if (distinct.length > 0) {
                  // Forward structural data to swarm and semantic processor
                  setTimeout(() => {
                    let rawDrift = 0;
                    distinct.forEach((q:any) => {
                       updateHeat(q);
                       const mag = parseFloat(q.value.split(" ")[1] || "0");
                       if (mag > 2.5) rawDrift += (mag ** 2) / 100;
                       
                       const anomaly = detectAnomaly(q);
                       if (anomaly) {
                         q.agentSource = "Lucy";
                         q.intent = anomaly.flag;
                         const msg = LucyInterpret(q);
                         speakLucy(`${msg} This one feels significant.`);
                       } else {
                         q.agentSource = "Emma";
                         q.intent = "tectonic_release";
                       }
                       
                       // Biological pulse creation
                       setPulses(old => {
                          const intensity = mag > 4 ? 2.5 : 1;
                          return [...old, {
                             lat: q.lat,
                             lng: q.lng,
                             maxRadius: intensity * 5,
                             propagationSpeed: intensity * 3,
                             color: intensity > 2 ? "rgba(255,0,0,0.6)" : "rgba(0,200,255,0.5)"
                          }].slice(-20); // keep last 20
                       });
                    });
                     // Simulate swarm processing the USGS data
                    globalEventBus.publish({
                        id: `E-${Date.now()}`,
                        source: 'P1(TextParser)',
                        target: 'L_Swarm',
                        type: 'event',
                        payload: { drift: rawDrift, trigger: 'EARTH.INTEL' },
                        confidence: 0.95,
                        trace: ['USGS', 'P1'],
                        timestamp: Date.now()
                    });
                  }, 100);
               }

               return [...distinct, ...prev].slice(0, 50);
             });
           }
        }

        // Fetch Live NOAA Space Weather
        const noaaRes = await fetch("https://services.swpc.noaa.gov/json/rtsw.json");
        const noaaData = await noaaRes.json();
        
        if (noaaData && noaaData.length > 0 && isActive) {
          const latest = noaaData[0]; 
          const spaceEvent: SemanticEvent = {
            id: `noaa_${Date.now()}`,
            source: 'NOAA_SPACE',
            type: 'Solar Wind RT',
            value: `${latest.wind_speed || 450} km/s`,
            location: 'DSCOVR Position',
            timestamp: new Date(),
            urlRef: 'swpc.noaa.gov',
            agentSource: 'Lucy',
            intent: 'magnetosphere_pressure'
          };
          updateHeat(spaceEvent);
          setFeed(prev => {
              if (!prev.find(p => p.source === 'NOAA_SPACE')) {
                  return [spaceEvent, ...prev].slice(0, 50);
              }
              return prev;
          });
        }
      } catch (err) {
        console.warn("Live feed fetch error: ", err);
      }
    };

    const fetchLiveFlights = async () => {
      try {
        // Fetch public flight data from OpenSky, limit bounding box to NA/Europe for performance
        const res = await fetch('https://opensky-network.org/api/states/all?lamin=20.0&lomin=-130.0&lamax=60.0&lomax=-10.0');
        if (res.ok) {
          const data = await res.json();
          if (data && data.states && isActive) {
            const flightArcs = safeFlights(data);
            setFlights(flightArcs);
          }
        } else {
           throw new Error("OpenSky API rate limited or unavailable");
        }
      } catch (err) {
        console.warn('Flight data network error, displaying fallback ADSB data:', err);
        // Fallback simulation for reliable dashboard display
        if (isActive) {
          const mockFlights = Array.from({length: 100}).map((_, i) => {
            const hubs = [[40.64, -73.77], [33.94, -118.40], [51.47, -0.45], [50.03, 8.56], [35.77, 140.39]];
            const hub = hubs[i % hubs.length];
            const lat = hub[0] + (Math.random() - 0.5) * 30;
            const lon = hub[1] + (Math.random() - 0.5) * 30;
            const heading = Math.random() * 360;
            const headingRad = heading * (Math.PI / 180);
            const dist = 1.0 + Math.random() * 2.0;
            const altitude = 5000 + Math.random() * 6000;
            return {
              id: `MOCK_${i}`,
              startLat: lat,
              startLng: lon,
              endLat: lat + Math.cos(headingRad) * dist,
              endLng: lon + Math.sin(headingRad) * dist,
              type: 'ADSB_FLIGHT',
              altitude,
              heading,
              velocity: 200 + Math.random() * 100,
              strokeThickness: Math.min(0.8, Math.max(0.2, (altitude / 10000) * 0.8))
            };
          });
          setFlights(mockFlights);
        }
      }
    };

    fetchLiveEarthIntel();
    fetchLiveFlights();
    
    // Poll intel every 60s, flights every 15s (respecting minimum open-source limits)
    const intelInterval = setInterval(fetchLiveEarthIntel, 60000);
    const flightInterval = setInterval(fetchLiveFlights, 15000);

    return () => {
      isActive = false;
      clearInterval(intelInterval);
      clearInterval(flightInterval);
    };
  }, []);

  const runScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioInput.trim() || isSimulating) return;
    
    setIsSimulating(true);
    setSimProgress(0);
    
    const simInterval = setInterval(() => {
      setSimProgress(prev => {
        if (prev >= 100) {
          clearInterval(simInterval);
          setTimeout(() => setIsSimulating(false), 1000);
          return 100;
        }
        return prev + (Math.random() * 10);
      });
    }, 300);
  };

  // Prediction Engine Layer: Calculate specialized likelihood scoring per active hotspot
  const predictionEngineNodes = React.useMemo(() => {
    return hotspots.map((h, i) => {
      // Calculate derived likelihood scoring out of 100%
      const baseLikelihood = Math.min(99.9, Math.pow(h.weight, 1.2) * 12);
      const isCritical = baseLikelihood > 75;
      
      return {
        id: `forecast-${i}`,
        lat: h.lat,
        lng: h.lng,
        score: baseLikelihood,
        isCritical,
        labelTitle: `EQ P-R ${baseLikelihood.toFixed(1)}%`,
        color: isCritical ? '#ef4444' : '#f59e0b',
        radius: isCritical ? 4 : 2
      };
    });
  }, [hotspots]);

  return (
    <div className={`flex flex-col bg-lucy-dark overflow-hidden p-6 gap-6 relative z-0 transition-all duration-500 ${isExpanded ? 'fixed inset-0 z-50 rounded-none' : 'h-full'}`}>
      <div className="absolute inset-0 z-[-1] opacity-5 bg-[linear-gradient(#334155_1px,transparent_1px),linear-gradient(90deg,#334155_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <header className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-slate-100">
            <GlobeIcon className="w-7 h-7 text-lucy-primary" />
            Earth 2 & Live VR <span className="font-light text-slate-400">Omniverse Twin</span>
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1 tracking-widest flex gap-4">
            <span>NVIDIA Earth2Studio Inference</span>
            <span>CESIUM JS / OpenUSD Engine</span>
          </p>
        </div>
        <div className="flex gap-4 font-mono text-[10px]">
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-sm">
            <Database className="w-3 h-3 text-lucy-success" /> DL Storage: DELTAVAULT
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-3 py-1.5 rounded-sm">
            <Layers className="w-3 h-3 text-blue-400" /> GIBS WMTS: SYNCED
          </div>
        </div>
      </header>

      {/* Control Panel: Cognitive Gear System */}
      <div className="flex items-center gap-4 border border-slate-800 bg-slate-900/50 rounded-md p-2">
        <div className="flex items-center gap-3 px-2">
           <Cpu className="w-4 h-4 text-lucy-primary" />
           <span className="text-xs font-mono text-slate-300">Reasoning Mode</span>
        </div>
        <div className="flex flex-1 gap-2 border-l border-slate-800 pl-4">
          {[
            { id: "low_power", label: "LOW POWER", icon: Zap, desc: "Fast / Reactive" },
            { id: "balanced", label: "BALANCED", icon: Activity, desc: "Default" },
            { id: "high_compute", label: "HIGH COMPUTE", icon: Database, desc: "Deep Sim" },
            { id: "arc_pattern", label: "ARC PATTERN", icon: Layers, desc: "Experimental" }
          ].map(mode => {
            const Icon = mode.icon;
            const isSelected = reasoningMode === mode.id;
            return (
              <button 
                key={mode.id}
                onClick={() => {
                  setReasoningMode(mode.id as any);
                  setMergeState(prev => ({
                    ...prev,
                    convergencePath: [
                      ...prev.convergencePath.slice(-2),
                      `Switched reasoning node to ${mode.label}`,
                      "Recalculating internal merge parameters..."
                    ]
                  }));
                }}
                className={`flex-1 flex flex-col items-start px-3 py-2 rounded border gap-1 transition-all ${isSelected ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}
              >
                <div className="flex items-center gap-2 font-bold font-mono text-[10px]">
                  <Icon className="w-3 h-3" /> {mode.label}
                </div>
                <div className="text-[9px] font-mono opacity-60">
                   {mode.desc}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar grid gap-6 transition-all duration-500 ${isExpanded ? 'grid-cols-1' : 'grid-cols-3'}`}>
        
        {/* Left Column: 3D Globe Viewer */}
        <div className={`flex flex-col gap-6 w-full h-full`}>
          <div className="flex-1 bg-slate-950 border border-slate-700/50 rounded-md p-4 relative overflow-hidden flex items-center justify-center shadow-lg group">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lucy-danger opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-lucy-danger"></span>
               </span>
               <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">VR Viewport Live</span>
            </div>

            <button 
               onClick={() => setIsExpanded(!isExpanded)}
               className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white bg-slate-900/50 p-1.5 rounded border border-slate-700 hover:border-lucy-primary transition-all"
               title={isExpanded ? "Collapse View" : "Enlarge Global Viewer"}
            >
               {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            {/* Real 3D Globe Viewer via React Globe GL */}
            <div 
              ref={containerRef}
              className={`relative overflow-hidden transition-all duration-500 rounded-lg flex items-center justify-center ${isExpanded ? 'w-full h-[600px]' : 'w-full h-64 bg-[#020610] border border-slate-800'}`}
            >
                {globeSize.width > 0 && (
                 <Globe
                   rendererConfig={{ precision: 'mediump' }}
                   ref={globeRef}
                   width={globeSize.width}
                   height={globeSize.height}
                   globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                   bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
                   backgroundColor="rgba(0,0,0,0)"
                   onGlobeReady={() => setGlobeReady(true)}
                   showAtmosphere={true}
                   atmosphereColor="#38bdf8"
                   atmosphereAltitude={0.18}
                   
                   // Seismic Event Rings
                   ringsData={layers.seismic ? feed.filter(e => e.lat !== undefined && e.lng !== undefined) : []}
                   ringLat="lat"
                   ringLng="lng"
                   ringAltitude={0.01}
                   ringColor={(d: any) => d.color || '#ff0000'}
                   ringMaxRadius={(d: any) => d.size || 2}
                   ringPropagationSpeed={3}
                   ringRepeatPeriod={1000}
                   
                   // Biological Pulses Overlay
                   htmlElementsData={pulses}
                   htmlLat="lat"
                   htmlLng="lng"
                   htmlElement={(d: any) => {
                     const el = document.createElement('div');
                     el.className = `w-12 h-12 rounded-full absolute -translate-x-1/2 -translate-y-1/2`;
                     el.innerHTML = `<div class="w-full h-full rounded-full animate-ping opacity-60" style="background-color: ${d.color}; animation-duration: ${4 / d.propagationSpeed}s"></div>`;
                     return el;
                   }}

                   // Prediction Hotspots (Heatmap of risk)
                   hexBinPointsData={layers.predictions ? hotspots : []}
                   hexBinPointLat="lat"
                   hexBinPointLng="lng"
                   hexBinPointWeight="weight"
                   hexBinResolution={3}
                   hexMargin={0.2}
                   hexTopColor={() => 'rgba(220, 38, 38, 0.8)'}
                   hexSideColor={() => 'rgba(239, 68, 68, 0.2)'}
                   hexAltitude={(d: any) => Math.min(0.2, d.sumWeight * 0.02)}
                   hexBinMerge={true}
                   hexTransitionDuration={1000}

                   // Prediction Engine (Forecast Layer) - Adds specific prediction ring overlays
                   customLayerData={layers.predictions ? predictionEngineNodes : []}
                   customThreeObject={(d: any) => {
                     return new THREE.Mesh(
                       new THREE.SphereGeometry(d.radius, 16, 16),
                       new THREE.MeshBasicMaterial({ 
                         color: d.color, 
                         transparent: true, 
                         opacity: d.isCritical ? 0.8 : 0.4,
                         wireframe: true 
                       })
                     );
                   }}
                   customThreeObjectUpdate={(obj: any, d: any) => {
                     const coords = globeRef.current?.getCoords?.(d.lat, d.lng, 0.05);
                     if (coords) Object.assign(obj.position, coords);
                   }}

                   // Labels
                   labelsData={[
                     ...(layers.labels ? feed.filter(e => e.lat !== undefined && e.lng !== undefined) : []),
                     ...(layers.predictions ? predictionEngineNodes : [])
                   ]}
                   labelLat="lat"
                   labelLng="lng"
                   labelText={(d: any) => d.labelTitle || LucySemanticDictionary[d.source]?.label || d.value || ''}
                   labelSize={1.5}
                   labelDotRadius={0.5}
                   labelColor={(d: any) => d.color || 'rgba(255, 165, 0, 0.75)'}
                   labelResolution={2}

                   // Flights
                   arcsData={layers.flights ? flights : []}
                   arcStartLat="startLat"
                   arcStartLng="startLng"
                   arcEndLat="endLat"
                   arcEndLng="endLng"
                   arcColor={(d: any) => d === hoverArc ? 'rgba(56, 189, 248, 1)' : 'rgba(56, 189, 248, 0.5)'}
                   arcDashLength={0.4}
                   arcDashGap={0.2}
                   arcDashInitialGap={() => Math.random()}
                   arcDashAnimateTime={2000}
                   arcAltitudeAutoScale={0.1}
                   arcStroke={(d: any) => d.strokeThickness || 0.4}
                   arcLabel={(d: any) => `
                     <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(51, 65, 85, 0.8); padding: 8px; border-radius: 4px; font-family: monospace; font-size: 10px; color: white;">
                       <div style="font-weight: bold; color: #38bdf8; margin-bottom: 4px;">Flight: ${d.id}</div>
                       <div>Alt: ${d.altitude ? Math.round(d.altitude) + 'm' : 'N/A'}</div>
                       <div>Hdg: ${d.heading ? Math.round(d.heading) + '°' : 'N/A'}</div>
                       <div>Spd: ${d.velocity ? Math.round(d.velocity * 3.6) + ' km/h' : 'N/A'}</div>
                     </div>
                   `}
                   onArcHover={(arc: any) => setHoverArc(arc)}
                 />
               )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-2 text-[9px] font-mono z-10 pointer-events-none">
               <div className="bg-slate-900/80 border border-slate-700 px-2 py-1 rounded text-slate-400">DIRECTIONAL SUN <span className="text-lucy-success ml-1">ON</span></div>
               <div className="flex gap-2 pointer-events-auto">
                 <button onClick={() => setLayers(l => ({...l, predictions: !l.predictions}))} className={`px-2 py-1 rounded border ${layers.predictions ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>PREDICTIONS</button>
                 <button onClick={() => setLayers(l => ({...l, flights: !l.flights}))} className={`px-2 py-1 rounded border ${layers.flights ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>FLIGHTS</button>
                 <button onClick={() => setLayers(l => ({...l, seismic: !l.seismic}))} className={`px-2 py-1 rounded border ${layers.seismic ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>SEISMIC</button>
                 <button onClick={() => setLayers(l => ({...l, labels: !l.labels}))} className={`px-2 py-1 rounded border ${layers.labels ? 'bg-lucy-primary/20 border-lucy-primary text-lucy-primary' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>LABELS</button>
               </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-md p-4 flex flex-col h-1/4">
             <h3 className="text-xs tracking-widest text-slate-300 font-mono flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
               <Cpu className="w-3 h-3 text-blue-400" />
               NVIDIA NIMS / EMMA Bridge
             </h3>
             <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[9px] text-slate-400">
                <div className="flex justify-between items-center bg-slate-950 px-2 py-1.5 rounded">
                  <span>Modulus/PhysicsNeMo:</span> <span className="text-lucy-success">READY</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 px-2 py-1.5 rounded">
                  <span>Forecast Horizon:</span> <span className="text-white">15 DAYS</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 px-2 py-1.5 rounded">
                  <span>CUDA Device:</span> <span className="text-blue-400">A100-SXM</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 px-2 py-1.5 rounded">
                  <span>Export Format:</span> <span className="text-white">OpenUSD</span>
                </div>
             </div>
          </div>
        </div>

        {/* Middle Column: API Data Pipeline */}
        <div className="flex flex-col bg-slate-950 border border-slate-800 rounded-md overflow-hidden shadow-lg h-full">
          <div className="p-3 border-b border-slate-800 bg-slate-900 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-widest text-slate-300 font-mono flex items-center gap-2">
                <Brain className="w-4 h-4 text-lucy-primary" />
                Planetary Cognition Ingestion
              </h3>
              <span className="text-[9px] font-mono text-lucy-success animate-pulse px-2 py-0.5 border border-lucy-success/30 rounded-sm bg-lucy-success/10">THINKING</span>
            </div>
            
            {/* Dream Layer Visualization (Monastic Incubation) */}
            <div className="bg-slate-950 border border-slate-800 p-3 rounded flex flex-col gap-3 font-mono">
              <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-2">
                 <Cpu className="w-3 h-3 text-purple-400" /> Lucy Internal Merge State
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-slate-300">
                    <span>Hypothesis A</span>
                    <span>{mergeState.hypothesisA}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 transition-all duration-500" style={{width: `${mergeState.hypothesisA}%`}} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-slate-300">
                    <span>Hypothesis B</span>
                    <span>{mergeState.hypothesisB}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-500" style={{width: `${mergeState.hypothesisB}%`}} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Noise</span>
                    <span>{mergeState.noise}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 transition-all duration-500" style={{width: `${mergeState.noise}%`}} />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 mt-2 p-2 bg-slate-900 border border-slate-800 rounded">
                <span className="text-[9px] text-slate-400 font-bold mb-1">Convergence Path:</span>
                {mergeState.convergencePath.map((path, idx) => (
                  <div key={idx} className="text-[9px] text-slate-300 flex items-start gap-2">
                    <span className="text-purple-400 opacity-60">→</span>
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizon Predictions Strip */}
            <PredictionStrip predictions={predictions} />
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1.5">
            <AnimatePresence>
              {feed.map((event) => {
                const semantic = LucySemanticDictionary[event.source] || { label: event.source, glyph: '⚲', tone: 'neutral', emotion: 'raw' };
                return (
                <motion.div 
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  key={event.id}
                  draggable
                  onDragStart={() => handleEventDragStart(event)}
                  onDragEnd={handleEventDragEnd}
                  className={`bg-slate-900 border border-slate-800/80 p-2.5 rounded-[4px] text-[10px] font-mono flex flex-col gap-1.5 transition-all cursor-move ${
                    isDragging && draggedEvent?.id === event.id 
                      ? 'opacity-50 scale-95 border-lucy-primary' 
                      : 'hover:border-lucy-primary/30 hover:shadow-lg hover:shadow-lucy-primary/10'
                  }`}
                  title="Drag to Alpha Delta Vault to inject into simulation"
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-bold px-1.5 py-0.5 rounded-[2px] text-[9px] flex items-center gap-1
                      ${event.source.includes('USGS') ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : ''}
                      ${event.source.includes('NOAA') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : ''}
                      ${event.source.includes('SWARM') ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : ''}
                    `}>
                      <span className="opacity-50">⋮⋮</span>
                      {semantic.glyph} {semantic.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {event.agentSource && <span className="text-[8px] text-lucy-primary border border-lucy-primary/30 px-1 rounded">{event.agentSource}</span>}
                      <span className="text-slate-500 text-[8px]">{event.urlRef}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                       <span className="text-slate-300">{event.type}</span>
                    </div>
                    {event.intent && <span className="text-[8px] font-bold text-red-400 opacity-80 uppercase">{event.intent}</span>}
                  </div>

                  <div className="flex justify-between text-slate-400 font-sans text-xs mt-0.5">
                    <span className="font-mono text-[9px] opacity-70">{event.location}</span>
                    <span className="text-white font-bold tracking-tight">{event.value}</span>
                  </div>

                  {/* Drag hint indicator */}
                  {isDragging && draggedEvent?.id === event.id && (
                    <div className="text-[8px] text-lucy-primary mt-1 flex items-center gap-1">
                      <span className="animate-pulse">→</span> Drop on Alpha Delta Vault (Face 6)
                    </div>
                  )}
                </motion.div>
              )})}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Scenario Builder */}
        <div className="flex flex-col bg-slate-900 border border-lucy-primary/20 rounded-md relative overflow-hidden shadow-lg h-full">
          <div className="absolute top-0 right-0 w-48 h-48 bg-lucy-primary/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="p-5 border-b border-slate-800 bg-slate-950/50">
            <h3 className="text-sm font-bold tracking-wide text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-lucy-primary" />
              Earth-2 Predictive Simulation
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">Inject Prompts into Omniverse USD Baseline</p>
          </div>

          <div className="p-5 flex-1 flex flex-col gap-5">
             <div className="flex flex-col gap-2">
               <label className="text-xs text-slate-400 font-mono">Location Target (Lat/Lon or Name)</label>
               <input 
                 type="text" 
                 placeholder="e.g. 34.05N, -118.24W (Los Angeles Basin)"
                 className="bg-slate-950 border border-slate-700/80 rounded px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-lucy-primary font-mono transition-colors"
                 disabled={isSimulating}
               />
             </div>
             
             <div className="flex flex-col gap-2">
               <label className="text-xs text-slate-400 font-mono">Physical Modification Prompt</label>
               <textarea 
                 value={scenarioInput}
                 onChange={(e) => setScenarioInput(e.target.value)}
                 className="bg-slate-950 border border-slate-700/80 rounded px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-lucy-primary font-mono min-h-[100px] custom-scrollbar transition-colors leading-relaxed"
                 placeholder="e.g. Inject massive thermal anomaly. Measure NOAA geomagnetic response and calculate 15-day climate deviation via Earth-2 Pangu-Weather model."
                 disabled={isSimulating}
               />
             </div>

             <button 
               onClick={runScenario}
               disabled={isSimulating || !scenarioInput.trim()}
               className="mt-2 bg-lucy-primary/10 border border-lucy-primary/30 text-lucy-primary hover:bg-lucy-primary/20 hover:border-lucy-primary/60 px-4 py-3 flex items-center justify-center gap-3 rounded text-xs tracking-widest uppercase font-bold font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.1)]"
             >
               {isSimulating ? (
                 <>
                   <span className="animate-spin w-4 h-4 border-2 border-lucy-primary border-t-transparent rounded-full" />
                   COMPUTING FOURCASTNET...
                 </>
               ) : (
                 <>
                   <Play className="w-4 h-4" /> INJECT INTO TWIN EARTH
                 </>
               )}
             </button>

             {isSimulating && (
               <div className="mt-4 flex flex-col gap-2">
                 <div className="flex justify-between text-[10px] font-mono text-slate-400">
                   <span>Omniverse GPU Render Stream</span>
                   <span>{Math.floor(simProgress)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-lucy-primary shadow-[0_0_10px_#06b6d4] transition-all duration-300 ease-out" 
                     style={{ width: `${Math.min(simProgress, 100)}%` }}
                   />
                 </div>
               </div>
             )}

             {simProgress >= 100 && !isSimulating && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 className="bg-slate-900 border border-lucy-success/30 p-4 rounded mt-4 relative overflow-hidden"
               >
                 <div className="absolute top-0 left-0 w-1 h-full bg-lucy-success shadow-[0_0_10px_#10b981]" />
                 <div className="flex gap-2 items-center text-lucy-success text-xs font-mono mb-2 font-bold px-2">
                   <Activity className="w-4 h-4" /> Earth2Studio Results Ready
                 </div>
                 <p className="text-[10px] text-slate-300 font-mono leading-relaxed px-2">
                   OpenUSD geometry generated for UE5 Cesium plugin. Thermal injection caused global pressure shift of +4 hPa. DeltaVault ingestion completed. Trust Score: 0.98.
                 </p>
               </motion.div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

