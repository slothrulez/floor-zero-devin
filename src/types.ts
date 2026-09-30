export type GameStatus = 'START' | 'PLAYING' | 'CHARGING_CORE' | 'WON' | 'LOST_COLLAPSE' | 'LOST_DIED';

export type FloorState = 'SAFE' | 'CRACKING' | 'COLLAPSING' | 'DESTROYED';

export interface FloorBlock {
  id: string;
  tier: number;
  x: number;
  y: number;
  width: number;
  height: number;
  state: FloorState;
  stateTimer: number; // Seconds remaining in current state
  shakeOffset: number;
}

export interface Platform {
  tier: number;
  y: number;
  blocks: FloorBlock[];
}

export interface Ladder {
  id: string;
  tierFrom: number;
  tierTo: number;
  x: number;
  yTop: number;
  yBottom: number;
  width: number;
}

export type HazardType = 'BARREL' | 'CONCRETE' | 'CANISTER';

export interface Hazard {
  id: string;
  type: HazardType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  currentTier: number;
  dodged: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isClimbing: boolean;
  currentLadder: Ladder | null;
  facing: 'left' | 'right';
  animState: 'IDLE' | 'WALK' | 'RUN' | 'JUMP' | 'FALL' | 'CLIMB' | 'DEATH';
  animFrame: number;
  animTimer: number;
  highestTierReached: number;
}

export interface EmergencyCore {
  x: number;
  y: number;
  width: number;
  height: number;
  tier: number;
  chargeProgress: number; // 0 to 1
  isCharging: boolean;
}

export interface GameStats {
  timeRemaining: number;
  structuralFailurePercent: number;
  score: number;
  floorsSurvived: number;
  debrisAvoided: number;
  highScore: number;
}
