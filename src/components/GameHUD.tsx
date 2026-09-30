import React from 'react';
import { GameStats } from '../types';
import { sound } from '../audio';
import { Volume2, VolumeX, ShieldAlert, Timer, Trophy } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  muted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ stats, muted, onToggleMute }) => {
  const time = Math.max(0, stats.timeRemaining).toFixed(1);
  const failurePercent = stats.structuralFailurePercent;

  // Determine urgency state & theme
  let timeTheme = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60';
  let urgencyText = 'STRUCTURAL INTEGRITY STABLE';

  if (stats.timeRemaining <= 45 && stats.timeRemaining > 30) {
    timeTheme = 'text-amber-400 border-amber-500/50 bg-amber-950/60';
    urgencyText = 'WARNING: SECTOR VIBRATIONS';
  } else if (stats.timeRemaining <= 30 && stats.timeRemaining > 15) {
    timeTheme = 'text-orange-500 border-orange-500/50 bg-orange-950/60 animate-pulse';
    urgencyText = 'CRITICAL: STRUCTURAL DEGRADATION';
  } else if (stats.timeRemaining <= 15) {
    timeTheme = 'text-red-500 border-red-500/80 bg-red-950/80 animate-bounce';
    urgencyText = 'STRUCTURAL FAILURE IMMINENT!';
  }

  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex flex-col gap-2 z-10 font-mono select-none">
      <div className="flex items-center justify-between gap-3">
        {/* TIME DISPLAY */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 shadow-lg backdrop-blur-md transition-colors ${timeTheme}`}>
          <Timer className="w-6 h-6 animate-spin" style={{ animationDuration: '3s' }} />
          <div>
            <div className="text-[10px] tracking-widest text-neutral-400 uppercase">TIME REMAINING</div>
            <div className="text-2xl font-black font-['Press_Start_2P'] tracking-wider">
              {time}<span className="text-sm">s</span>
            </div>
          </div>
        </div>

        {/* SCORE */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg border-2 border-neutral-700/80 bg-neutral-900/80 backdrop-blur-md text-amber-300 shadow-lg">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div className="text-right">
            <div className="text-[10px] tracking-widest text-neutral-400 uppercase">SCORE</div>
            <div className="text-xl font-bold font-['Press_Start_2P'] tracking-wider">
              {stats.score.toString().padStart(6, '0')}
            </div>
          </div>
        </div>

        {/* SOUND MUTE BUTTON */}
        <button
          onClick={onToggleMute}
          className="pointer-events-auto p-2.5 rounded-lg border-2 border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
          title="Toggle Sound"
        >
          {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* STRUCTURAL FAILURE METER */}
      <div className="w-full bg-neutral-950/80 border-2 border-red-900/60 rounded-md p-2 backdrop-blur-sm shadow-md">
        <div className="flex items-center justify-between text-xs font-bold mb-1">
          <span className="flex items-center gap-1.5 text-red-400 tracking-wider">
            <ShieldAlert className="w-4 h-4 animate-pulse text-red-500" />
            STRUCTURAL FAILURE
          </span>
          <span className="text-red-400 font-['Press_Start_2P'] text-[11px]">
            {failurePercent}%
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full h-3.5 bg-neutral-900 rounded-sm overflow-hidden border border-neutral-800 p-0.5 relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-sm transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
            style={{ width: `${failurePercent}%` }}
          />
        </div>

        <div className="text-[10px] text-center text-red-400/80 tracking-widest mt-1 uppercase font-semibold">
          {urgencyText}
        </div>
      </div>
    </div>
  );
};
