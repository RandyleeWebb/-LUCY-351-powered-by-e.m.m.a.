import { Folder, FileCode, ImageIcon, Music, Database, Search, Plus, Filter, Box, Zap, Palette, Sliders, Layers, Circle, Square, RotateCcw, Database as DatabaseIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { INITIAL_ASSETS } from '@/lib/constants';
import { Asset } from '@/types';
import { useState, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment } from '@react-three/drei';

function MaterialPreviewScene({ material, shape }: { material: any, shape: string }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={40} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
      
      <Suspense fallback={null}>
        <Stage adjustCamera intensity={0.5} environment="city">
          {shape === 'sphere' && (
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[1, 64, 64]} />
              <meshStandardMaterial 
                color={material.color} 
                roughness={material.roughness} 
                metalness={material.metallic}
                emissive={material.color}
                emissiveIntensity={material.emissive}
              />
            </mesh>
          )}
          {shape === 'cube' && (
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 1.5, 1.5]} />
              <meshStandardMaterial 
                color={material.color} 
                roughness={material.roughness} 
                metalness={material.metallic}
                emissive={material.color}
                emissiveIntensity={material.emissive}
              />
            </mesh>
          )}
          {shape === 'torus' && (
            <mesh castShadow receiveShadow>
              <torusKnotGeometry args={[0.8, 0.3, 128, 32]} />
              <meshStandardMaterial 
                color={material.color} 
                roughness={material.roughness} 
                metalness={material.metallic}
                emissive={material.color}
                emissiveIntensity={material.emissive}
              />
            </mesh>
          )}
        </Stage>
      </Suspense>
      <OrbitControls makeDefault enablePan={false} enableZoom={true} minDistance={2} maxDistance={10} />
    </>
  );
}

export default function ContentBrowser() {
  const [activeTab, setActiveTab] = useState('browser');
  const [previewShape, setPreviewShape] = useState('sphere');
  const [material, setMaterial] = useState({
    name: 'M_Architectural_Concrete',
    color: '#888888',
    roughness: 0.5,
    metallic: 0.2,
    emissive: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const allAssetTypes = Array.from(new Set(INITIAL_ASSETS.map(a => a.type)));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(allAssetTypes));

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      // Re-enable all if user unchecks the last one to prevent empty state lock-in
      if (next.size === 0) {
         return new Set(allAssetTypes);
      }
      return next;
    });
  };

  const filteredAssets = INITIAL_ASSETS.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypes.has(asset.type);
    return matchesSearch && matchesType;
  });

  const getIcon = (type: Asset['type']) => {
    switch (type) {
      case 'Model': return <BoxIcon />;
      case 'Texture': return <ImageIcon className="w-8 h-8 text-blue-400" />;
      case 'Material': return <Zap className="w-8 h-8 text-yellow-400" />;
      case 'Script': return <FileCode className="w-8 h-8 text-green-400" />;
      case 'Audio': return <Music className="w-8 h-8 text-purple-400" />;
      default: return <Database className="w-8 h-8 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-matrix-card border-t border-matrix-border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-2 border-b border-matrix-border bg-matrix-bg/50">
          <div className="flex items-center gap-6">
            <TabsList className="h-8 bg-matrix-bg border border-matrix-border p-1">
              <TabsTrigger 
                value="browser" 
                className="text-[10px] uppercase font-bold tracking-tight data-[state=active]:bg-matrix-card data-[state=active]:text-ame-orange"
              >
                <Folder className="w-3 h-3 mr-1.5" />
                Browser
              </TabsTrigger>
              <TabsTrigger 
                value="material" 
                className="text-[10px] uppercase font-bold tracking-tight data-[state=active]:bg-matrix-card data-[state=active]:text-ame-orange"
              >
                <Palette className="w-3 h-3 mr-1.5" />
                Material Editor
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              {activeTab === 'browser' ? (
                <>
                  <span>All</span>
                  <span className="text-slate-700">/</span>
                  <span>Game</span>
                  <span className="text-slate-700">/</span>
                  <span className="text-slate-300">Assets</span>
                </>
              ) : (
                <>
                  <span>Materials</span>
                  <span className="text-slate-700">/</span>
                  <span className="text-slate-300 font-bold">{material.name}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeTab === 'browser' ? (
              <>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500" />
                  <Input 
                    placeholder="Search assets..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-6 w-48 pl-7 bg-matrix-bg border-matrix-border text-[10px]"
                  />
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="p-1 hover:bg-matrix-border rounded transition-colors relative"
                  >
                    <Filter className="w-3 h-3 text-slate-400" />
                    {selectedTypes.size < allAssetTypes.length && (
                      <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-ame-orange rounded-full"></span>
                    )}
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute top-full right-0 mt-1 z-50 w-48 bg-matrix-card border border-matrix-border rounded-lg shadow-xl text-slate-300 py-1">
                        <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-slate-500 border-b border-matrix-border/50 mb-1">
                          Filter by Type
                        </div>
                        {allAssetTypes.map(type => (
                          <label
                            key={type}
                            className="flex items-center gap-2 px-2 py-1.5 text-[11px] hover:bg-ame-orange/20 hover:text-white cursor-pointer select-none"
                          >
                            <input 
                              type="checkbox" 
                              checked={selectedTypes.has(type)}
                              onChange={() => toggleType(type)}
                              className="accent-ame-orange"
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <button className="flex items-center gap-1 px-2 py-1 bg-ame-orange text-white rounded text-[10px] font-bold hover:bg-ame-orange/90 transition-colors">
                  <Plus className="w-3 h-3" />
                  ADD
                </button>
              </>
            ) : (
              <button className="flex items-center gap-1 px-3 py-1 bg-vulkan-blue text-white rounded text-[10px] font-bold hover:bg-vulkan-blue/90 transition-colors">
                SAVE MATERIAL
              </button>
            )}
          </div>
        </div>

        <TabsContent value="browser" className="flex-1 mt-0 overflow-hidden">
          <div className="flex h-full">
            {/* Folder Tree */}
            <div className="w-48 border-r border-matrix-border p-2 hidden md:block">
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-2 py-1 bg-ame-orange/10 text-ame-orange rounded cursor-pointer">
                  <Folder className="w-3 h-3" />
                  <span className="text-[10px] font-bold">Content</span>
                </div>
                <div className="pl-4 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">
                    <Folder className="w-3 h-3" />
                    <span className="text-[10px]">Models</span>
                  </div>
                  <div className="pl-4 flex items-center gap-2 px-2 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">
                    <Folder className="w-3 h-3" />
                    <span className="text-[10px]">Hero</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">
                    <Folder className="w-3 h-3" />
                    <span className="text-[10px]">Textures</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-slate-500 hover:text-slate-300 cursor-pointer">
                    <Folder className="w-3 h-3" />
                    <span className="text-[10px]">Scripts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Grid */}
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {filteredAssets.map((asset) => (
                  <div 
                    key={asset.id}
                    className="group flex flex-col items-center gap-2 p-2 rounded border border-transparent hover:border-matrix-border hover:bg-matrix-bg/50 cursor-pointer transition-all"
                  >
                    <div className="w-full aspect-square bg-matrix-bg rounded border border-matrix-border flex items-center justify-center group-hover:bg-matrix-card">
                      {getIcon(asset.type)}
                    </div>
                    <div className="w-full text-center">
                      <div className="text-[10px] font-medium text-slate-300 truncate group-hover:text-white">{asset.name}</div>
                      <div className="text-[8px] text-slate-600 uppercase tracking-tighter">{asset.type} | {asset.size}</div>
                    </div>
                  </div>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
                    <Search className="w-8 h-8 mb-2 opacity-20" />
                    <span className="text-[11px] uppercase tracking-wider font-bold">No assets found</span>
                    <span className="text-[10px] mt-1">Try adjusting your filters or search query</span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="material" className="flex-1 mt-0 overflow-hidden">
          <div className="flex h-full">
            {/* Material Parameters Sidebar */}
            <div className="w-72 border-r border-matrix-border p-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Sliders className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Base Attributes</span>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Base Color</label>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded border border-matrix-border" 
                      style={{ backgroundColor: material.color }}
                    />
                    <Input 
                      value={material.color}
                      onChange={(e) => setMaterial(prev => ({ ...prev, color: e.target.value }))}
                      className="h-10 bg-matrix-bg border-matrix-border font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Metallic */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Metallic</label>
                    <span className="text-[10px] font-mono text-ame-orange">{material.metallic.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[material.metallic]} 
                    max={1} 
                    step={0.01}
                    onValueChange={(val) => setMaterial(prev => ({ ...prev, metallic: Array.isArray(val) ? val[0] : val }))}
                    className="[&_[role=slider]]:bg-vulkan-blue"
                  />
                </div>

                {/* Roughness */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] text-slate-500 uppercase font-black tracking-tighter">Roughness</label>
                    <span className="text-[10px] font-mono text-ame-orange">{material.roughness.toFixed(2)}</span>
                  </div>
                  <Slider 
                    value={[material.roughness]} 
                    max={1} 
                    step={0.01}
                    onValueChange={(val) => setMaterial(prev => ({ ...prev, roughness: Array.isArray(val) ? val[0] : val }))}
                    className="[&_[role=slider]]:bg-vulkan-blue"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-matrix-border">
                <div className="flex items-center gap-2 text-slate-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Global Options</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Double Sided</span>
                  <input type="checkbox" className="accent-ame-orange" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Cast Shadow</span>
                  <input type="checkbox" defaultChecked className="accent-ame-orange" />
                </div>
              </div>
            </div>

            {/* Material Preview Surface */}
            <div className="flex-1 bg-matrix-bg flex items-center justify-center relative shadow-inner overflow-hidden">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
                <span className="text-[10px] font-mono text-slate-600">PREVIEW_NODE: PBR_MAT_01</span>
                <span className="text-[9px] font-mono text-vulkan-blue uppercase">Hardware Shading: Active</span>
              </div>

              {/* Shape Selection Overlay */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 p-1 bg-matrix-card/80 backdrop-blur border border-matrix-border rounded-lg shadow-xl">
                <button 
                  onClick={() => setPreviewShape('sphere')}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewShape === 'sphere' ? "bg-ame-orange text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPreviewShape('cube')}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewShape === 'cube' ? "bg-ame-orange text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <Square className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setPreviewShape('torus')}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewShape === 'torus' ? "bg-ame-orange text-white" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas shadows gl={{ antialias: true, alpha: true }}>
                  <MaterialPreviewScene material={material} shape={previewShape} />
                </Canvas>
              </div>

              {/* Grid Background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BoxIcon() {
  return (
    <svg className="w-8 h-8 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}


