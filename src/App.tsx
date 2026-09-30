import { useEffect, useRef, useState } from 'react';
import { GameEngine } from './gameEngine';
import { GameStats, GameStatus } from './types';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { WinScreen } from './components/WinScreen';
import { LossScreen } from './components/LossScreen';
import { TouchControls } from './components/TouchControls';
import { sound } from './audio';

// Packed transparent sprite sheet (4 cols x 7 rows, uniform cells)
import playerSpriteSheet from './assets/images/hero_frames.png';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [status, setStatus] = useState<GameStatus>('START');
  const [muted, setMuted] = useState<boolean>(sound.muted);
  const [stats, setStats] = useState<GameStats>({
    timeRemaining: 60.0,
    structuralFailurePercent: 10,
    score: 0,
    floorsSurvived: 0,
    debrisAvoided: 0,
    highScore: parseInt(localStorage.getItem('floor_zero_highscore') || '0', 10)
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, playerSpriteSheet);
    engineRef.current = engine;

    engine.onStateChange = (newStatus) => {
      setStatus(newStatus);
    };

    engine.onStatsUpdate = (newStats) => {
      setStats({ ...newStats });
    };

    return () => {
      engine.destroy();
    };
  }, []);

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
  };

  const handleVirtualKey = (key: string, pressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.setVirtualKey(key, pressed);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-neutral-950 flex flex-col items-center justify-center overflow-hidden font-mono select-none">
      {/* CRT SCANLINE & GLOW EFFECTS */}
      <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      <div className="absolute inset-0 pointer-events-none z-30 bg-radial from-transparent via-transparent to-black/80" />

      {/* HUD BAR - sits above the playfield, never overlaps the game */}
      {status !== 'START' && (
        <GameHUD
          stats={stats}
          muted={muted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* GAME CANVAS CONTAINER */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center p-2">
        <div className="relative aspect-[8/9] h-full max-w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain rounded-lg shadow-[0_0_50px_rgba(220,38,38,0.25)] border-2 border-neutral-800 bg-neutral-900"
          />

        {status === 'START' && (
          <StartScreen
            onStart={handleStart}
            highScore={stats.highScore}
          />
        )}

        {status === 'WON' && (
          <WinScreen
            stats={stats}
            onRestart={handleRestart}
          />
        )}

        {(status === 'LOST_COLLAPSE' || status === 'LOST_DIED') && (
          <LossScreen
            status={status}
            stats={stats}
            onRestart={handleRestart}
          />
        )}

          {/* TOUCH / MOBILE CONTROLS */}
          {(status === 'PLAYING' || status === 'CHARGING_CORE') && (
            <TouchControls onKeyChange={handleVirtualKey} />
          )}
        </div>
      </div>
    </div>
  );
}
