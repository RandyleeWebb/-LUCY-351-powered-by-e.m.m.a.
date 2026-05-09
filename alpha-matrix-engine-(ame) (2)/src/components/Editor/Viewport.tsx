import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Stars, ContactShadows, Float, Text, TransformControls } from '@react-three/drei';
import { Suspense, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Settings2, X, RotateCcw, Cloud, Move, RotateCcw as RotateIcon, Scaling } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useEditor } from '@/contexts/EditorContext';
import * as THREE from 'three';

type EnvPreset = 'city' | 'night' | 'sunset' | 'forest' | 'studio' | 'apartment' | 'dawn' | 'park';

interface LightingSettings {
  ambientIntensity: number;
  mainIntensity: number;
  mainColor: string;
  mainPosition: [number, number, number];
  envPreset: EnvPreset;
  envIntensity: number;
  envBlur: number;
}

function Scene({ lighting, transformMode }: { lighting: LightingSettings, transformMode: 'translate' | 'rotate' | 'scale' }) {
  const { entities, selectedIds, setSelectedIds, setEntities } = useEditor();

  const handlePointerDown = (e: any, id: string) => {
    e.stopPropagation();
    setSelectedIds([id]);
  };
  
  const handlePointerMissed = (e: any) => {
    if (e.pointerType === 'mouse') {
      setSelectedIds([]);
    }
  };

  const updateEntity = (id: string, ref: React.RefObject<any>) => {
    if (!ref.current) return;
    const pos = ref.current.position;
    const rot = ref.current.rotation;
    const scl = ref.current.scale;
    setEntities(prev => prev.map(ent => 
      ent.id === id 
        ? { 
            ...ent, 
            position: [pos.x, pos.y, pos.z],
            rotation: [THREE.MathUtils.radToDeg(rot.x), THREE.MathUtils.radToDeg(rot.y), THREE.MathUtils.radToDeg(rot.z)],
            scale: [scl.x, scl.y, scl.z]
          } 
        : ent
    ));
  };

  // We map specific meshes to the default initial entities for visual continuity
  const heroBuilding = entities.find(e => e.id === '3');
  const heroRef = useRef<THREE.Mesh>(null);

  const groundPlane = entities.find(e => e.id === '4');
  const groundRef = useRef<THREE.Mesh>(null);

  const controlsRef = useRef<any>(null);

  // Disable OrbitControls when TransformControls is active
  useEffect(() => {
    if (controlsRef.current) {
      const callback = (event: any) => {
        // Find the OrbitControls and disable it while dragging
        const controls = event.target.domElement.__r3f?.root?.camera?.controls;
        if (controls) {
            controls.enabled = !event.value;
        }
      };
      controlsRef.current.addEventListener('dragging-changed', callback);
      return () => {
        controlsRef.current?.removeEventListener('dragging-changed', callback);
      };
    }
  }, [selectedIds, transformMode]);


  return (
    <>
      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
      {/* We need to use makeDefault on OrbitControls so TransformControls can disable it */}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
      
      <ambientLight intensity={lighting.ambientIntensity} />
      <pointLight 
        position={lighting.mainPosition} 
        intensity={lighting.mainIntensity} 
        color={lighting.mainColor} 
      />
      <spotLight 
        position={lighting.mainPosition} 
        angle={0.15} 
        penumbra={1} 
        intensity={lighting.mainIntensity} 
        color={lighting.mainColor} 
        castShadow 
      />

      <Suspense fallback={null}>
        <Environment 
          preset={lighting.envPreset} 
          background 
          blur={lighting.envBlur} 
          environmentIntensity={lighting.envIntensity}
        />
        
        {heroBuilding && (
          <TransformControls 
            ref={selectedIds.includes(heroBuilding.id) ? controlsRef : null}
            showX={selectedIds.includes(heroBuilding.id)}
            showY={selectedIds.includes(heroBuilding.id)}
            showZ={selectedIds.includes(heroBuilding.id)}
            mode={transformMode}
            onMouseUp={() => updateEntity(heroBuilding.id, heroRef)}
            position={heroBuilding.position}
            rotation={[
              THREE.MathUtils.degToRad(heroBuilding.rotation[0]), 
              THREE.MathUtils.degToRad(heroBuilding.rotation[1]), 
              THREE.MathUtils.degToRad(heroBuilding.rotation[2])
            ]}
            scale={heroBuilding.scale}
          >
            <mesh 
              ref={heroRef} 
              castShadow 
              onPointerDown={(e) => handlePointerDown(e, heroBuilding.id)}
            >
              <boxGeometry args={[2, 2, 2]} />
              <meshStandardMaterial color={selectedIds.includes(heroBuilding.id) ? "#ff9a55" : "#f27d26"} metalness={0.8} roughness={0.2} />
            </mesh>
          </TransformControls>
        )}

        {groundPlane && (
          <TransformControls 
            ref={selectedIds.includes(groundPlane.id) ? controlsRef : null}
            showX={selectedIds.includes(groundPlane.id)}
            showY={selectedIds.includes(groundPlane.id)}
            showZ={selectedIds.includes(groundPlane.id)}
            mode={transformMode}
            onMouseUp={() => updateEntity(groundPlane.id, groundRef)}
            position={groundPlane.position}
            rotation={[
              THREE.MathUtils.degToRad(groundPlane.rotation[0]), 
              THREE.MathUtils.degToRad(groundPlane.rotation[1]), 
              THREE.MathUtils.degToRad(groundPlane.rotation[2])
            ]}
            scale={groundPlane.scale}
          >
            <mesh 
              ref={groundRef} 
              receiveShadow 
              onPointerDown={(e) => handlePointerDown(e, groundPlane.id)}
            >
              <boxGeometry args={[100, 1, 100]} />
              <meshStandardMaterial color={selectedIds.includes(groundPlane.id) ? "#333333" : "#222222"} metalness={0.1} roughness={0.8} />
            </mesh>
          </TransformControls>
        )}

        {/* Unlinked decorative meshes */}
        <mesh position={[4, 1, -4]} castShadow onPointerDown={(e) => handlePointerMissed(e)}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshStandardMaterial color="#00a3ff" metalness={0.9} roughness={0.1} />
        </mesh>

        <mesh position={[-4, 0.5, 4]} castShadow onPointerDown={(e) => handlePointerMissed(e)}>
          <torusKnotGeometry args={[0.5, 0.2, 128, 32]} />
          <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} />
        </mesh>
        
        {/* Pointer missed area object or grid doesn't have onPointerMissed directly easily with TransformControls sometimes, so we can put a big invisible plane */}
        <mesh visible={false} position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} onPointerDown={(e) => handlePointerMissed(e)}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial />
        </mesh>

        <Grid
          infiniteGrid
          fadeDistance={50}
          fadeStrength={5}
          cellSize={1}
          sectionSize={5}
          sectionColor="#262626"
          cellColor="#1a1a1a"
        />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
        
        <Text
          position={[0, 0.1, 5]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#f27d26"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          ALPHA MATRIX ENGINE - 8K RUNTIME
        </Text>
      </Suspense>
    </>
  );
}

export default function Viewport() {
  const [showLighting, setShowLighting] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('lighting');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [lighting, setLighting] = useState<LightingSettings>({
    ambientIntensity: 0.5,
    mainIntensity: 1,
    mainColor: '#ffffff',
    mainPosition: [10, 10, 10],
    envPreset: 'city',
    envIntensity: 1,
    envBlur: 0.05
  });

  const envPresets: EnvPreset[] = ['city', 'night', 'sunset', 'forest', 'studio', 'apartment', 'dawn', 'park'];

  const resetLighting = () => {
    setLighting({
      ambientIntensity: 0.5,
      mainIntensity: 1,
      mainColor: '#ffffff',
      mainPosition: [10, 10, 10],
      envPreset: 'city',
      envIntensity: 1,
      envBlur: 0.05
    });
  };

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden">
      {/* Overlay Info */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">Operating Live</span>
        </div>
        <h2 className="text-xl font-bold tracking-tighter text-white">8K_WORLD_LAYER_01</h2>
        <div className="flex gap-4 text-[10px] font-mono text-slate-500">
          <span>FPS: 120.4</span>
          <span>LATENCY: 2.1ms</span>
          <span>TRIANGLES: 4.2M</span>
          <span>VRAM: 12.4GB / 24GB</span>
        </div>
      </div>

      {/* Viewport Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="flex bg-matrix-card border border-matrix-border rounded overflow-hidden mr-2">
          <button 
            onClick={() => setTransformMode('translate')}
            className={cn("p-1.5 transition-colors", transformMode === 'translate' ? "bg-ame-orange text-white" : "text-slate-400 hover:text-white")}
            title="Move Tool (W)"
          >
            <Move className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setTransformMode('rotate')}
            className={cn("p-1.5 transition-colors", transformMode === 'rotate' ? "bg-ame-orange text-white" : "text-slate-400 hover:text-white")}
            title="Rotate Tool (E)"
          >
            <RotateIcon className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => setTransformMode('scale')}
            className={cn("p-1.5 transition-colors", transformMode === 'scale' ? "bg-ame-orange text-white" : "text-slate-400 hover:text-white")}
            title="Scale Tool (R)"
          >
            <Scaling className="w-3.5 h-3.5" />
          </button>
        </div>

        <button 
          onClick={() => setShowLighting(!showLighting)}
          className={cn(
            "p-1 rounded border transition-colors flex items-center gap-1.5 px-2",
            showLighting 
              ? "bg-ame-orange text-white border-ame-orange" 
              : "bg-matrix-card border-matrix-border text-slate-400 hover:text-white"
          )}
        >
          <Sun className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Lighting</span>
        </button>
        <div className="px-2 py-1 bg-matrix-card border border-matrix-border rounded text-[10px] font-mono text-slate-400">
          PERSPECTIVE
        </div>
        <div className="px-2 py-1 bg-matrix-card border border-matrix-border rounded text-[10px] font-mono text-slate-400">
          LIT
        </div>
      </div>

      <AnimatePresence>
        {showLighting && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-16 right-4 z-20 w-72 bg-matrix-card/90 backdrop-blur-md border border-matrix-border rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="px-3 py-2 bg-matrix-bg border-b border-matrix-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-3.5 h-3.5 text-ame-orange" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Environment Settings</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={resetLighting} className="p-1 hover:text-white text-slate-500 transition-colors">
                  <RotateCcw className="w-3 h-3" />
                </button>
                <button onClick={() => setShowLighting(false)} className="p-1 hover:text-white text-slate-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} className="w-full">
              <TabsList className="w-full h-8 bg-matrix-bg/50 border-b border-matrix-border p-1 rounded-none gap-2">
                <TabsTrigger value="lighting" className="flex-1 text-[9px] uppercase font-bold tracking-tight data-[state=active]:bg-matrix-card data-[state=active]:text-ame-orange">
                  <Sun className="w-3 h-3 mr-1.5" />
                  Direct Light
                </TabsTrigger>
                <TabsTrigger value="environment" className="flex-1 text-[9px] uppercase font-bold tracking-tight data-[state=active]:bg-matrix-card data-[state=active]:text-ame-orange">
                  <Cloud className="w-3 h-3 mr-1.5" />
                  Skybox/Env
                </TabsTrigger>
              </TabsList>

              <TabsContent value="lighting" className="p-3 space-y-4 m-0">
                {/* Ambient Light */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Ambient Intensity</label>
                    <span className="text-[10px] font-mono text-ame-orange">{lighting.ambientIntensity.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[lighting.ambientIntensity]} 
                    max={2} 
                    step={0.01}
                    onValueChange={(val) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setLighting(prev => ({ ...prev, ambientIntensity: v }));
                    }}
                    className="[&_[role=slider]]:bg-ame-orange" 
                  />
                </div>

                {/* Main Light Intensity */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Main Intensity</label>
                    <span className="text-[10px] font-mono text-ame-orange">{lighting.mainIntensity.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[lighting.mainIntensity]} 
                    max={5} 
                    step={0.1}
                    onValueChange={(val) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setLighting(prev => ({ ...prev, mainIntensity: v }));
                    }}
                    className="[&_[role=slider]]:bg-ame-orange" 
                  />
                </div>

                {/* Main Color */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block">Light Color</label>
                  <div className="flex gap-2 items-center">
                    <input 
                      type="color" 
                      value={lighting.mainColor}
                      onChange={(e) => setLighting(prev => ({ ...prev, mainColor: e.target.value }))}
                      className="w-8 h-8 rounded bg-transparent border-none cursor-pointer"
                    />
                    <Input 
                      value={lighting.mainColor}
                      onChange={(e) => setLighting(prev => ({ ...prev, mainColor: e.target.value }))}
                      className="h-8 bg-matrix-bg border-matrix-border text-[10px] uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Position / Direction */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block">Main Position</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['X', 'Y', 'Z'].map((axis, i) => (
                      <div key={axis} className="space-y-1">
                        <div className="flex justify-between px-1">
                          <span className={cn(
                            "text-[9px] font-black",
                            axis === 'X' ? "text-red-500" : axis === 'Y' ? "text-green-500" : "text-blue-500"
                          )}>{axis}</span>
                        </div>
                        <Input 
                          type="number"
                          value={lighting.mainPosition[i]}
                          onChange={(e) => {
                            const newPos = [...lighting.mainPosition] as [number, number, number];
                            newPos[i] = parseFloat(e.target.value) || 0;
                            setLighting(prev => ({ ...prev, mainPosition: newPos }));
                          }}
                          className="h-7 bg-matrix-bg border-matrix-border text-[9px] font-mono p-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="environment" className="p-3 space-y-4 m-0">
                {/* Preset Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold block">Skybox Preset</label>
                  <div className="grid grid-cols-2 gap-1">
                    {envPresets.map((p) => (
                      <button
                        key={p}
                        onClick={() => setLighting(prev => ({ ...prev, envPreset: p }))}
                        className={cn(
                          "px-2 py-1 text-[9px] font-bold uppercase rounded border transition-colors",
                          lighting.envPreset === p 
                            ? "bg-vulkan-blue text-white border-vulkan-blue" 
                            : "bg-matrix-bg border-matrix-border text-slate-400 hover:text-white"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Environment Intensity */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Exposure / Intensity</label>
                    <span className="text-[10px] font-mono text-vulkan-blue">{lighting.envIntensity.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[lighting.envIntensity]} 
                    max={5} 
                    step={0.1}
                    onValueChange={(val) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setLighting(prev => ({ ...prev, envIntensity: v }));
                    }}
                    className="[&_[role=slider]]:bg-vulkan-blue" 
                  />
                </div>

                {/* Environment Blur */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Background Blur</label>
                    <span className="text-[10px] font-mono text-vulkan-blue">{lighting.envBlur.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[lighting.envBlur]} 
                    max={1} 
                    step={0.01}
                    onValueChange={(val) => {
                      const v = Array.isArray(val) ? val[0] : val;
                      setLighting(prev => ({ ...prev, envBlur: v }));
                    }}
                    className="[&_[role=slider]]:bg-vulkan-blue" 
                  />
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      <Canvas shadows dpr={[1, 2]} onPointerMissed={() => { /* Handled by plane */ }}>
        <Scene lighting={lighting} transformMode={transformMode} />
      </Canvas>

      {/* Compass / Gizmo Simulation */}
      <div className="absolute bottom-4 right-4 w-16 h-16 pointer-events-none opacity-50">
        <div className="relative w-full h-full border border-matrix-border rounded-full flex items-center justify-center">
          <div className="absolute top-0 text-[8px] text-red-500 font-bold">X</div>
          <div className="absolute right-0 text-[8px] text-green-500 font-bold">Y</div>
          <div className="absolute left-0 text-[8px] text-blue-500 font-bold">Z</div>
        </div>
      </div>
    </div>
  );
}
