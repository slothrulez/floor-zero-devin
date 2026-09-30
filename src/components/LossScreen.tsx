import React from 'react';
import { GameStats, GameStatus } from '../types';
import { AlertTriangle, RefreshCw, Skull, Trophy } from 'lucide-react';

interface LossScreenProps {
  status: GameStatus;
  stats: GameStats;
  onRestart: () => void;
}

export const LossScreen: React.FC<LossScreenProps> = ({ status, stats, onRestart }) => {
  const isCollapse = status === 'LOST_COLLAPSE';

  const title = isCollapse ? 'STRUCTURAL FAILURE' : 'PLAYER DOWN';
  const subtitle = isCollapse ? 'THE BUILDING HAS COLLAPSED' : 'HAZARD FATALITY DETECTED';

  const survivalTime = (60.0 - stats.timeRemaining).toFixed(1);

  return (
    <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 text-center select-none font-mono animate-fade-in">
      <div className="bg-neutral-900 border-2 border-red-600 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center gap-5">
        {/* ICON */}
        <div className="bg-red-950 border border-red-500/50 p-3 rounded-full text-red-500 animate-pulse">
          {isCollapse ? <AlertTriangle className="w-12 h-12" /> : <Skull className="w-12 h-12" />}
        </div>

        {/* HEADLINE */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black font-['Press_Start_2P'] text-red-500 tracking-tight leading-snug">
            {title}
          </h2>
          <p className="text-xs text-red-300/80 mt-1 uppercase tracking-widest font-semibold">
            {subtitle}
          </p>
        </div>

        {/* STATS */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-left font-['Chakra_Petch'] text-sm space-y-2.5">
          <div className="flex justify-between items-center text-neutral-300">
            <span className="text-xs text-neutral-400 uppercase">SURVIVAL TIME:</span>
            <span className="font-['Press_Start_2P'] text-xs text-red-400">{survivalTime}s</span>
          </div>

          <div className="flex justify-between items-center text-neutral-300">
            <span className="text-xs text-neutral-400 uppercase">HIGHEST TIER CLIMBED:</span>
            <span className="font-['Press_Start_2P'] text-xs text-amber-300">{stats.floorsSurvived} / 7</span>
          </div>

          <div className="border-t border-neutral-800 pt-2.5 flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-sm font-bold text-amber-400 uppercase">
              <Trophy className="w-4 h-4 text-amber-400" /> SCORE:
            </span>
            <span className="font-['Press_Start_2P'] text-sm text-amber-300">
              {stats.score.toString().padStart(6, '0')}
            </span>
          </div>
        </div>

        {/* RESTART */}
        <button
          onClick={onRestart}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white rounded-xl font-['Press_Start_2P'] text-sm shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-2 border-amber-300"
        >
          <RefreshCw className="w-5 h-5" />
          RESTART (R)
        </button>
      </div>
    </div>
  );
};
