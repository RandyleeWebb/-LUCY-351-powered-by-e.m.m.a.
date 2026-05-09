// @ts-nocheck
import React, { useState } from 'react';
import { Shield, Cpu } from 'lucide-react';

import CubeNavigator, { DashboardFace } from './CubeNavigator';
import NavButtons from './NavButtons';

// Dashboard imports
import NeuroMeshDashboard from '../dashboards/NeuroMeshDashboard';
import { TwinEarthDashboard } from './TwinEarthDashboard';
import UE5Builder from '../dashboards/UE5Builder';
import UnityBuilder from '../dashboards/UnityBuilder';
import FiveMBuilder from '../dashboards/FiveMBuilder';
import FileManager from '../dashboards/FileManager';

export default function SystemDashboard() {
  const [currentFace, setCurrentFace] = useState<DashboardFace>("mesh");

  const dashboards: Record<DashboardFace, React.ReactNode> = {
    mesh: <NeuroMeshDashboard />,
    earth: <TwinEarthDashboard />,
    ue5: <UE5Builder />,
    unity: <UnityBuilder />,
    fivem: <FiveMBuilder />,
    files: <FileManager />,
  };

  const faceOrder: DashboardFace[] = ["mesh", "earth", "ue5", "unity", "fivem", "files"];

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30">
      
      {/* Top Navigation Bar / Header */}
      <div className="h-14 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-950 backdrop-blur-md z-20 shadow-lg">
         <div className="flex items-center gap-3">
           <Cpu className="w-5 h-5 text-lucy-primary" />
           <h1 className="text-sm font-bold tracking-widest text-slate-200">
             LUCY<span className="text-lucy-primary">PRIME</span> MULTI-DASHBOARD <span className="font-light text-slate-500">IDE</span>
           </h1>
         </div>
         
         <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
           <div className="flex items-center gap-1">
             <Shield className="w-3 h-3 text-lucy-success"/> STANDALONE LOCAL EXECUTION
           </div>
           <div>v0.2.0-standalone</div>
         </div>
      </div>

      {/* Main 3D Container */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
         <CubeNavigator
           currentFace={currentFace}
           dashboards={dashboards}
           faceOrder={faceOrder}
         />
      </div>

      {/* Navigation Footer */}
      <NavButtons currentFace={currentFace} onNavigate={setCurrentFace} />

    </div>
  );
}
