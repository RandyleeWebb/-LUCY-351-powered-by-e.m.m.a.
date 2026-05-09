import { Play, Pause, Square, Save, Share2, Settings, Monitor, Smartphone, Globe, Layers, Cpu, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export default function Toolbar() {
  return (
    <TooltipProvider>
      <div className="h-12 bg-matrix-card border-b border-matrix-border flex items-center justify-between px-4">
        {/* Left: Engine Brand & Project */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-ame-orange rounded flex items-center justify-center text-white font-black text-xs">A</div>
            <span className="text-xs font-black tracking-tighter text-white">ALPHA MATRIX ENGINE</span>
          </div>
          <div className="h-4 w-[1px] bg-matrix-border" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project:</span>
            <span className="text-[10px] font-bold text-slate-300">NEO_CITY_8K</span>
            <Badge variant="outline" className="h-4 text-[8px] border-ame-orange text-ame-orange px-1">V1.0.4-ALPHA</Badge>
          </div>
        </div>

        {/* Center: Play Controls */}
        <div className="flex items-center gap-1 bg-matrix-bg p-1 rounded-md border border-matrix-border">
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10">
                <Play className="w-4 h-4 fill-current" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-matrix-card border-matrix-border text-[10px]">Play In Editor (Alt+P)</TooltipContent>
          </Tooltip>
          
          <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500">
            <Pause className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10">
            <Square className="w-4 h-4 fill-current" />
          </Button>
        </div>

        {/* Right: Tools & Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 px-2 py-1 bg-matrix-bg rounded border border-matrix-border cursor-help">
                  <Cpu className="w-3 h-3 text-vulkan-blue" />
                  <span className="text-[10px] font-mono text-vulkan-blue">VULKAN 1.3</span>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-matrix-card border-matrix-border text-[10px]">Graphics Backend: Vulkan 1.3 (Native 8K)</TooltipContent>
            </Tooltip>

            <div className="flex items-center gap-1 px-2 py-1 bg-matrix-bg rounded border border-matrix-border">
              <Activity className="w-3 h-3 text-ame-orange" />
              <span className="text-[10px] font-mono text-ame-orange">60.0 FPS</span>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-matrix-border" />

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <Monitor className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <Globe className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-4 w-[1px] bg-matrix-border" />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
              <Settings className="w-4 h-4" />
            </Button>
            <Button className="h-8 bg-ame-orange hover:bg-ame-orange/90 text-white text-[10px] font-bold px-4">
              BUILD ENGINE
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
