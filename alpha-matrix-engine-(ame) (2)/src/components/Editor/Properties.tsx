import { Settings, ChevronDown, ChevronRight, Box } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useEditor } from '@/contexts/EditorContext';

export default function Properties() {
  const { entities, selectedIds, setEntities } = useEditor();

  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col h-full bg-matrix-card border-l border-matrix-border p-4 items-center justify-center text-slate-500 text-xs">
        No entity selected.
      </div>
    );
  }

  // Find first selected entity
  const activeEntity = entities.find(e => e.id === selectedIds[0]) || entities[0];

  const handleTransformChange = (type: 'position' | 'rotation' | 'scale', axis: 0 | 1 | 2, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    
    setEntities(prev => prev.map(ent => {
      if (ent.id === activeEntity.id) {
        const newTransform = [...ent[type]] as [number, number, number];
        newTransform[axis] = num;
        return { ...ent, [type]: newTransform };
      }
      return ent;
    }));
  };

  return (
    <div className="flex flex-col h-full bg-matrix-card border-l border-matrix-border">
      <div className="p-3 border-bottom border-matrix-border">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-3 h-3 text-ame-orange" />
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Details</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-ame-orange/20 flex items-center justify-center text-ame-orange">
            <Settings className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-white max-w-[200px] truncate">{activeEntity.name}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Transform Section */}
          <section>
            <div className="flex items-center gap-1 mb-2">
              <ChevronDown className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Transform</span>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-[10px] text-slate-500">Location</span>
                <div className="col-span-3 grid grid-cols-3 gap-1">
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-red-500 font-bold mr-1">X</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.position[0].toFixed(2)}
                      onChange={(e) => handleTransformChange('position', 0, e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-green-500 font-bold mr-1">Y</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.position[1].toFixed(2)}
                      onChange={(e) => handleTransformChange('position', 1, e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-blue-500 font-bold mr-1">Z</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.position[2].toFixed(2)}
                      onChange={(e) => handleTransformChange('position', 2, e.target.value)} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-[10px] text-slate-500">Rotation</span>
                <div className="col-span-3 grid grid-cols-3 gap-1">
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-red-500 font-bold mr-1">R</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.rotation[0].toFixed(2)}
                      onChange={(e) => handleTransformChange('rotation', 0, e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-green-500 font-bold mr-1">P</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.rotation[1].toFixed(2)}
                      onChange={(e) => handleTransformChange('rotation', 1, e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-blue-500 font-bold mr-1">Y</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.rotation[2].toFixed(2)}
                      onChange={(e) => handleTransformChange('rotation', 2, e.target.value)} 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-2">
                <span className="text-[10px] text-slate-500">Scale</span>
                <div className="col-span-3 grid grid-cols-3 gap-1">
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-red-500 font-bold mr-1">X</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.scale[0].toFixed(2)}
                      onChange={(e) => handleTransformChange('scale', 0, e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-green-500 font-bold mr-1">Y</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.scale[1].toFixed(2)}
                      onChange={(e) => handleTransformChange('scale', 1, e.target.value)} 
                    />
                  </div>
                  <div className="flex items-center bg-matrix-bg rounded border border-matrix-border px-1">
                    <span className="text-[9px] text-blue-500 font-bold mr-1">Z</span>
                    <input 
                      className="w-full bg-transparent border-none text-[10px] text-white focus:outline-none py-1" 
                      value={activeEntity.scale[2].toFixed(2)}
                      onChange={(e) => handleTransformChange('scale', 2, e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-matrix-border" />

          {/* Mesh Section */}
          <section>
            <div className="flex items-center gap-1 mb-2">
              <ChevronDown className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Entity Info</span>
            </div>
            <div className="p-2 bg-matrix-bg border border-matrix-border rounded flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-800 rounded border border-slate-700 flex items-center justify-center">
                <Box className="w-5 h-5 text-slate-600" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-[10px] font-bold text-white truncate w-full">{activeEntity.name}</div>
                <div className="text-[9px] text-slate-500">Type: {activeEntity.type}</div>
              </div>
            </div>
          </section>

          <Separator className="bg-matrix-border" />

          {/* Rendering Section */}
          <section>
            <div className="flex items-center gap-1 mb-2">
              <ChevronDown className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rendering</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Cast Shadows</span>
                <input type="checkbox" defaultChecked className="accent-ame-orange" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[10px] text-slate-400">LOD Bias</span>
                  <span className="text-[10px] text-ame-orange">1.0</span>
                </div>
                <Slider defaultValue={[1]} max={5} step={0.1} className="[&_[role=slider]]:bg-ame-orange" />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
