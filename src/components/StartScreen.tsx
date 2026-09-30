import React from 'react';
import { Play, ShieldAlert, Zap, Keyboard } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 z-20 text-center select-none font-mono">
      {/* HEADER LOGO */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-red-500 tracking-widest text-xs font-bold uppercase animate-pulse border border-red-900/80 bg-red-950/50 px-3 py-1 rounded-full">
          <ShieldAlert className="w-4 h-4" /> RETRO ARCADE ACTION
        </div>

        <h1 className="text-4xl sm:text-5xl font-black font-['Press_Start_2P'] text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-orange-500 to-red-600 drop-shadow-[0_4px_12px_rgba(239,68,68,0.5)] tracking-tight leading-tight mt-2">
          FLOOR ZERO
        </h1>
        <div className="text-2xl sm:text-3xl font-black font-['Chakra_Petch'] text-red-500 tracking-widest uppercase">
          60 SECONDS
        </div>
        <p className="text-xs text-neutral-400 max-w-md tracking-wider mt-1">
          THE BUILDING IS COLLAPSING. REACH THE EMERGENCY CORE AT THE TOP FLOOR BEFORE TIME RUNS OUT!
        </p>
      </div>

      {/* HIGHSCORE DISPLAY */}
      {highScore > 0 && (
        <div className="border border-amber-500/40 bg-amber-950/30 px-5 py-2 rounded-lg text-amber-300 font-['Press_Start_2P'] text-xs flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
          HIGH SCORE: {highScore.toString().padStart(6, '0')}
        </div>
      )}

      {/* START ACTION BUTTON */}
      <button
        onClick={onStart}
        className="group relative px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-xl font-['Press_Start_2P'] text-lg shadow-[0_0_25px_rgba(239,68,68,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.8)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-3 border-2 border-amber-300"
      >
        <Play className="w-6 h-6 fill-white group-hover:translate-x-1 transition-transform" />
        START GAME
      </button>

      {/* CONTROLS GUIDE */}
      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-xl p-4 text-left shadow-lg">
        <div className="text-xs font-bold text-neutral-300 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-neutral-800 pb-2">
          <Keyboard className="w-4 h-4 text-amber-400" /> MISSION CONTROLS
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-neutral-950 p-2 rounded border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">MOVE</span>
            <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">A / D</span>
          </div>

          <div className="bg-neutral-950 p-2 rounded border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">JUMP</span>
            <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">SPACE</span>
          </div>

          <div className="bg-neutral-950 p-2 rounded border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">CLIMB</span>
            <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">W / S</span>
          </div>

          <div className="bg-neutral-950 p-2 rounded border border-neutral-800 flex items-center justify-between">
            <span className="text-neutral-400">CORE SHUTDOWN</span>
            <span className="font-['Press_Start_2P'] text-[10px] text-amber-400">E</span>
          </div>
        </div>

        <div className="text-[10px] text-red-400 mt-3 text-center tracking-wider">
          ⚠️ FLOORS WILL CRACK & COLLAPSE! WATCH OUT FOR ROLLING DEBRIS!
        </div>
      </div>
    </div>
  );
};
