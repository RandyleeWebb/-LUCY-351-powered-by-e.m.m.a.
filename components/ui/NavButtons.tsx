// @ts-nocheck
import React from "react";
import { DashboardFace } from "./CubeNavigator";
import { Network, Globe, Box, Gamepad2, Database, Folder } from "lucide-react";

interface NavButtonsProps {
  currentFace: DashboardFace;
  onNavigate: (face: DashboardFace) => void;
}

export default function NavButtons({ currentFace, onNavigate }: NavButtonsProps) {
  const buttons: { label: string; face: DashboardFace; icon: React.ReactNode }[] = [
    { label: "137-Mesh", face: "mesh", icon: <Network className="w-4 h-4" /> },
    { label: "Twin Earth", face: "earth", icon: <Globe className="w-4 h-4" /> },
    { label: "UE5 Build", face: "ue5", icon: <Box className="w-4 h-4" /> },
    { label: "Unity Build", face: "unity", icon: <Gamepad2 className="w-4 h-4" /> },
    { label: "FiveM Live", face: "fivem", icon: <Database className="w-4 h-4" /> },
    { label: "Files", face: "files", icon: <Folder className="w-4 h-4" /> },
  ];

  return (
    <div className="h-16 bg-slate-950 border-t border-slate-800 flex items-center justify-center gap-4 px-4 pb-2 z-50 backdrop-blur-md">
      {buttons.map((btn) => (
        <button
          key={btn.face}
          onClick={() => onNavigate(btn.face)}
          className={`px-5 py-2 rounded-md font-mono text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
            currentFace === btn.face
              ? "bg-lucy-primary/30 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-lucy-primary/70 scale-105"
              : "bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-700/50 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]"
          }`}
        >
          {btn.icon} {btn.label}
        </button>
      ))}
    </div>
  );
}
