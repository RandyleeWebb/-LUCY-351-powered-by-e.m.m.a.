import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  Globe, 
  Hammer, 
  Radio, 
  Database, 
  Network 
} from 'lucide-react';
import { HexFace } from '../types';

interface HexSovereignNavigatorProps {
  activeFace: HexFace;
  onFaceChange: (face: HexFace) => void;
}

const HEX_FACES: { face: HexFace; icon: any; color: string; label: string }[] = [
  { face: 'CHAT', icon: MessageSquare, color: 'text-agi-accent', label: 'CORTEX_CHAT' },
  { face: 'EARTH', icon: Globe, color: 'text-blue-400', label: 'GLOBAL_EARTH' },
  { face: 'BUILDER', icon: Hammer, color: 'text-amber-400', label: 'SYSTEM_BUILDER' },
  { face: 'SIGNAL', icon: Radio, color: 'text-emerald-400', label: 'SIGNAL_STREAM' },
  { face: 'VAULT', icon: Database, color: 'text-purple-400', label: 'ALPHA_DELTA_VAULT' },
  { face: 'ECOSYSTEM', icon: Network, color: 'text-rose-400', label: 'ECO_CORE' },
];

export const HexSovereignNavigator: React.FC<HexSovereignNavigatorProps> = ({ activeFace, onFaceChange }) => {
  const activeIndex = HEX_FACES.findIndex(f => f.face === activeFace);
  // Rotation for a hexagonal prism (360 / 6 = 60 degrees per face)
  const rotation = -activeIndex * 60;

  return (
    <div className="relative w-full h-full perspective-[2000px] flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative w-72 h-72 preserve-3d"
        animate={{ rotateY: rotation }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        {HEX_FACES.map((f, i) => {
          const isActive = f.face === activeFace;
          const rotateY = i * 60;
          const translateZ = 200; // Calculated to make faces touch or have distance
          
          // Calculate shortest distance in the circular array
          const distance = Math.min(Math.abs(i - activeIndex), 6 - Math.abs(i - activeIndex));
          const baseOpacity = isActive ? 1 : Math.max(0.05, 0.4 / (distance * 1.5));

          return (
            <div
              key={f.face}
              className={`absolute inset-0 backface-hidden preserve-3d flex items-center justify-center pointer-events-auto cursor-pointer transition-all duration-700 ${
                isActive ? 'scale-110' : 'scale-90'
              }`}
              style={{
                transform: `rotateY(${rotateY}deg) translateZ(${translateZ}px)`,
                opacity: baseOpacity,
              }}
              onClick={() => onFaceChange(f.face)}
            >
              <div className={`relative group w-48 h-56 transition-all duration-500`}>
                {/* Hexagon Shape via SVG Mask or Clip Path */}
                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]" viewBox="0 0 100 115">
                  <path
                    d="M50 0 L100 28.8 L100 86.2 L50 115 L0 86.2 L0 28.8 Z"
                    className={`transition-colors duration-500 ${
                      isActive ? 'fill-agi-accent/20 stroke-agi-accent stroke-2' : 'fill-agi-panel /40 stroke-agi-border stroke-[1]'
                    }`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
                  <motion.div
                    animate={isActive ? {
                      scale: [1, 1.15, 1],
                      filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <f.icon 
                      size={40} 
                      className={`transition-all duration-500 ${isActive ? f.color : 'text-agi-muted'}`} 
                    />
                  </motion.div>
                  <div className="flex flex-col items-center gap-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-all duration-500 ${
                      isActive ? 'text-agi-text' : 'text-agi-muted'
                    }`}>
                      {f.label}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="h-0.5 w-8 bg-agi-accent rounded-full"
                      />
                    )}
                  </div>

                  {/* Aesthetic Corner Lines */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-agi-accent/20" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-agi-accent/20" />
                </div>

                {/* Glass Reflect effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-30 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Navigation Ring/Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />
    </div>
  );
};
