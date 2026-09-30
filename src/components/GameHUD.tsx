import React from 'react';
import { GameStats } from '../types';
import { Volume2, VolumeX, ShieldAlert, Timer, Trophy } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  muted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ stats, muted, onToggleMute }) => {
  const time = Math.max(0, stats.timeRemaining).toFixed(1);
  const failurePercent = stats.structuralFailurePercent;

  let timeTheme = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60';
  let urgencyText = 'STABLE';

  if (stats.timeRemaining <= 45 && stats.timeRemaining > 30) {
    timeTheme = 'text-amber-400 border-amber-500/50 bg-amber-950/60';
    urgencyText = 'WARNING';
  } else if (stats.timeRemaining <= 30 && stats.timeRemaining > 15) {
    timeTheme = 'text-orange-500 border-orange-500/50 bg-orange-950/60 animate-pulse';
    urgencyText = 'CRITICAL';
  } else if (stats.timeRemaining <= 15) {
    timeTheme = 'text-red-500 border-red-500/80 bg-red-950/80 animate-bounce';
    urgencyText = 'IMMINENT';
  }

  return (
    <div className="w-full px-3 py-2 flex items-center gap-3 z-10 font-mono select-none bg-neutral-950/90 border-b-2 border-red-900/50">
      {/* TIME DISPLAY */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 shadow-lg shrink-0 ${timeTheme}`}>
        <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
        <div className="flex items-baseline gap-2">
          <span className="text-[9px] tracking-widest text-neutral-400 uppercase hidden sm:inline">TIME</span>
          <span className="text-xl font-black font-['Press_Start_2P'] tracking-wider">
            {time}<span className="text-xs">s</span>
          </span>
        </div>
      </div>

      {/* STRUCTURAL FAILURE METER */}
      <div className="flex-1 min-w-0 flex items-center gap-2 bg-neutral-900/80 border-2 border-red-900/60 rounded-md px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-red-400 tracking-wider text-[10px] font-bold shrink-0">
          <ShieldAlert className="w-4 h-4 animate-pulse text-red-500" />
          <span className="hidden md:inline">STRUCTURAL FAILURE</span>
          <span className="md:hidden">FAILURE</span>
        </span>
        <div className="flex-1 h-3 bg-neutral-950 rounded-sm overflow-hidden border border-neutral-800 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            style={{ width: `${failurePercent}%` }}
          />
        </div>
        <span className="text-red-400 font-['Press_Start_2P'] text-[10px] shrink-0">{failurePercent}%</span>
        <span className="text-[9px] text-red-400/80 tracking-widest uppercase font-semibold shrink-0 hidden lg:inline">
          {urgencyText}
        </span>
      </div>

      {/* SCORE */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-neutral-700/80 bg-neutral-900/80 text-amber-300 shadow-lg shrink-0">
        <Trophy className="w-4 h-4 text-amber-400" />
        <span className="text-lg font-bold font-['Press_Start_2P'] tracking-wider">
          {stats.score.toString().padStart(6, '0')}
        </span>
      </div>

      {/* SOUND MUTE BUTTON */}
      <button
        onClick={onToggleMute}
        className="p-2 rounded-lg border-2 border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer shrink-0"
        title="Toggle Sound"
      >
        {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
      </button>
    </div>
  );
};
