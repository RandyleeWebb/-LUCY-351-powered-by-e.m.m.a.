/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Toolbar from './components/Editor/Toolbar';
import Viewport from './components/Editor/Viewport';
import Outliner from './components/Editor/Outliner';
import Properties from './components/Editor/Properties';
import ContentBrowser from './components/Editor/ContentBrowser';
import MatrixAssistant from './components/Editor/MatrixAssistant';
import { TooltipProvider } from '@/components/ui/tooltip';
import { EditorProvider } from '@/contexts/EditorContext';

export default function App() {
  return (
    <EditorProvider>
      <TooltipProvider>
        <div className="flex flex-col h-screen w-screen bg-matrix-bg overflow-hidden">
        {/* Top Toolbar */}
        <Toolbar />

        {/* Main Workspace */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Outliner */}
          <div className="w-64 flex-shrink-0">
            <Outliner />
          </div>

          {/* Center: Viewport & Bottom Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative">
              <Viewport />
            </div>
            
            {/* Bottom Panel: Content Browser */}
            <div className="h-1/3 min-h-[200px]">
              <ContentBrowser />
            </div>
          </div>

          {/* Right Sidebar: Properties */}
          <div className="w-80 flex-shrink-0">
            <Properties />
          </div>
        </div>

        {/* AI Assistant */}
        <MatrixAssistant />

        {/* Status Bar */}
        <div className="h-6 bg-matrix-card border-t border-matrix-border flex items-center justify-between px-3 text-[9px] font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span>GPU: NVIDIA RTX 5090 Ti (AME_DRV_8.2)</span>
            </div>
            <span>MEM: 32.4 GB / 128 GB</span>
            <span>DISK: 1.2 TB FREE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>COORDINATES: [X: 124.2, Y: 2.0, Z: -45.1]</span>
            <span className="text-vulkan-blue">VULKAN_VALIDATION_LAYER: OK</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
    </EditorProvider>
  );
}

