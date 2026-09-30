import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap } from 'lucide-react';

interface TouchControlsProps {
  onKeyChange: (key: string, pressed: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onKeyChange }) => {
  const bindTouch = (key: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onKeyChange(key, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onKeyChange(key, false);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyChange(key, true);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyChange(key, false);
    },
    onMouseLeave: () => {
      onKeyChange(key, false);
    }
  });

  return (
    <div className="md:hidden absolute bottom-2 left-0 right-0 p-3 pointer-events-none flex justify-between items-end z-10 select-none">
      {/* D-PAD DIRECTIONALS */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 w-36 h-36 bg-neutral-900/80 p-2 rounded-2xl border-2 border-neutral-700/80 backdrop-blur-md shadow-2xl">
        <div />
        <button
          {...bindTouch('w')}
          className="bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-600 rounded-lg flex items-center justify-center text-neutral-200"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          {...bindTouch('a')}
          className="bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-600 rounded-lg flex items-center justify-center text-neutral-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          {...bindTouch('s')}
          className="bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-600 rounded-lg flex items-center justify-center text-neutral-200"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          {...bindTouch('d')}
          className="bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-600 rounded-lg flex items-center justify-center text-neutral-200"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* ACTION BUTTONS (JUMP & SHUTDOWN) */}
      <div className="pointer-events-auto flex gap-2">
        <button
          {...bindTouch('e')}
          className="w-16 h-16 bg-gradient-to-br from-amber-600 to-red-600 active:from-amber-400 active:to-red-400 text-white rounded-full border-2 border-amber-300 flex flex-col items-center justify-center shadow-lg active:scale-95"
        >
          <Zap className="w-5 h-5 fill-white" />
          <span className="text-[9px] font-['Press_Start_2P'] mt-0.5">E</span>
        </button>

        <button
          {...bindTouch(' ')}
          className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-500 active:from-red-400 active:to-orange-300 text-white rounded-full border-2 border-amber-300 flex flex-col items-center justify-center shadow-xl active:scale-95"
        >
          <span className="text-xs font-['Press_Start_2P']">JUMP</span>
          <span className="text-[9px] text-amber-200">SPACE</span>
        </button>
      </div>
    </div>
  );
};
