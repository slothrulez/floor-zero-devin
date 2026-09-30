import React from 'react';
import { GameStats } from '../types';
import { Trophy, RefreshCw, CheckCircle2, ShieldCheck, Timer } from 'lucide-react';

interface WinScreenProps {
  stats: GameStats;
  onRestart: () => void;
}

export const WinScreen: React.FC<WinScreenProps> = ({ stats, onRestart }) => {
  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center select-none font-mono">
      <div className="bg-neutral-900 border-2 border-emerald-500 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col items-center gap-5">
        {/* BADGE */}
        <div className="bg-emerald-950 border border-emerald-500/50 p-3 rounded-full text-emerald-400 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* HEADLINE */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Press_Start_2P'] text-emerald-400 tracking-tight leading-snug">
            DISASTER PREVENTED
          </h2>
          <p className="text-xs text-emerald-200/80 mt-1 uppercase tracking-widest font-semibold">
            EMERGENCY CORE SHUTDOWN SUCCESSFUL
          </p>
        </div>

        {/* STATS BREAKDOWN */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-left font-['Chakra_Petch'] text-sm space-y-2.5">
          <div className="flex justify-between items-center text-neutral-300">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400 uppercase">
              <Timer className="w-4 h-4 text-emerald-400" /> TIME REMAINING:
            </span>
            <span className="font-['Press_Start_2P'] text-xs text-emerald-400">
              {stats.timeRemaining.toFixed(1)}s
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-300">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400 uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> FLOORS CLIMBED:
            </span>
            <span className="font-['Press_Start_2P'] text-xs text-amber-300">
              {stats.floorsSurvived} / 7
            </span>
          </div>

          <div className="flex justify-between items-center text-neutral-300">
            <span className="flex items-center gap-1.5 text-xs text-neutral-400 uppercase">
              DEBRIS DODGED:
            </span>
            <span className="font-['Press_Start_2P'] text-xs text-amber-300">
              {stats.debrisAvoided}
            </span>
          </div>

          <div className="border-t border-neutral-800 pt-2.5 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-400 uppercase">
              <Trophy className="w-4 h-4 text-amber-400" /> FINAL SCORE:
            </span>
            <span className="font-['Press_Start_2P'] text-sm text-amber-300">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* PLAY AGAIN */}
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-['Press_Start_2P'] text-sm shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-2 border-emerald-300"
        >
          <RefreshCw className="w-5 h-5" />
          PLAY AGAIN (R)
        </button>
      </div>
    </div>
  );
};
