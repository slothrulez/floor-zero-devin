import { sound } from './audio';
import { CanvasRenderer } from './canvasRenderer';
import { EmergencyCore, FloorBlock, GameStats, GameStatus, Hazard, Ladder, Particle, Platform, Player } from './types';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public renderer: CanvasRenderer;

  public status: GameStatus = 'START';
  public stats: GameStats;

  public player: Player;
  public platforms: Platform[] = [];
  public ladders: Ladder[] = [];
  public hazards: Hazard[] = [];
  public particles: Particle[] = [];
  public core: EmergencyCore;

  // Timers & State
  public timeRemaining = 60.0;
  public collapseTimer = 0;
  public hazardSpawnTimer = 0;
  public bannerText = '';
  public bannerTimer = 0;
  public countdownNumber = 0;

  // Inputs
  public keys: { [key: string]: boolean } = {};

  // Camera Shake
  public shakeX = 0;
  public shakeY = 0;
  public shakeIntensity = 0;

  private lastTime = 0;
  private animationFrameId: number | null = null;
  private globalTime = 0;

  // Callbacks
  public onStateChange?: (status: GameStatus) => void;
  public onStatsUpdate?: (stats: GameStats) => void;

  constructor(canvas: HTMLCanvasElement, spriteSheetPath?: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = 1200;
    this.canvas.height = 900;

    this.renderer = new CanvasRenderer(this.ctx, 1200, 900, spriteSheetPath);

    this.stats = {
      timeRemaining: 60.0,
      structuralFailurePercent: 10,
      score: 0,
      floorsSurvived: 0,
      debrisAvoided: 0,
      highScore: parseInt(localStorage.getItem('floor_zero_highscore') || '0', 10)
    };

    this.player = this.createDefaultPlayer();
    this.core = this.createDefaultCore();
    this.initLevel();
    this.setupKeyListeners();
  }

  private createDefaultPlayer(): Player {
    return {
      x: 600,
      y: 792,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      isGrounded: true,
      isClimbing: false,
      currentLadder: null,
      facing: 'right',
      animState: 'IDLE',
      animFrame: 0,
      animTimer: 0,
      highestTierReached: 0
    };
  }

  private createDefaultCore(): EmergencyCore {
    return {
      x: 550,
      y: 20,
      width: 100,
      height: 60,
      tier: 7,
      chargeProgress: 0,
      isCharging: false
    };
  }

  public initLevel() {
    this.platforms = [];
    this.ladders = [];

    // Tiers and Y coordinates
    // Tier 0: 840 (Ground)
    // Tier 1: 740
    // Tier 2: 630
    // Tier 3: 520
    // Tier 4: 410
    // Tier 5: 300
    // Tier 6: 190
    // Tier 7: 80 (Emergency Core)
    const tierYs = [840, 740, 630, 520, 410, 300, 190, 80];

    tierYs.forEach((y, tier) => {
      const blocks: FloorBlock[] = [];
      const blockWidth = 50;
      const blockHeight = 16;

      if (tier === 0) {
        // Full ground floor across canvas (x=40 to 1190)
        for (let x = 40; x <= 1140; x += blockWidth) {
          blocks.push({
            id: `t0_${x}`,
            tier: 0,
            x,
            y,
            width: blockWidth,
            height: blockHeight,
            state: 'SAFE',
            stateTimer: 0,
            shakeOffset: 0
          });
        }
      } else if (tier === 7) {
        // Core top platform centered
        for (let x = 450; x <= 700; x += blockWidth) {
          blocks.push({
            id: `t7_${x}`,
            tier: 7,
            x,
            y,
            width: blockWidth,
            height: blockHeight,
            state: 'SAFE',
            stateTimer: 0,
            shakeOffset: 0
          });
        }
      } else {
        // Intermediate tiers with gap layouts for climbing strategy
        let skipRangeStart = -1;
        let skipRangeEnd = -1;

        if (tier === 1) { skipRangeStart = 800; skipRangeEnd = 900; }
        else if (tier === 2) { skipRangeStart = 300; skipRangeEnd = 400; }
        else if (tier === 3) { skipRangeStart = 700; skipRangeEnd = 800; }
        else if (tier === 4) { skipRangeStart = 400; skipRangeEnd = 500; }
        else if (tier === 5) { skipRangeStart = 850; skipRangeEnd = 950; }
        else if (tier === 6) { skipRangeStart = 250; skipRangeEnd = 350; }

        for (let x = 60; x <= 1140; x += blockWidth) {
          if (x >= skipRangeStart && x < skipRangeEnd) continue; // Gap
          blocks.push({
            id: `t${tier}_${x}`,
            tier,
            x,
            y,
            width: blockWidth,
            height: blockHeight,
            state: 'SAFE',
            stateTimer: 0,
            shakeOffset: 0
          });
        }
      }

      this.platforms.push({ tier, y, blocks });
    });

    // Ladders connecting adjacent tiers (Zig-zag vertical path)
    const ladderConfigs = [
      { tierFrom: 0, tierTo: 1, x: 280 },
      { tierFrom: 0, tierTo: 1, x: 900 },
      { tierFrom: 1, tierTo: 2, x: 600 },
      { tierFrom: 2, tierTo: 3, x: 220 },
      { tierFrom: 2, tierTo: 3, x: 980 },
      { tierFrom: 3, tierTo: 4, x: 520 },
      { tierFrom: 4, tierTo: 5, x: 300 },
      { tierFrom: 4, tierTo: 5, x: 880 },
      { tierFrom: 5, tierTo: 6, x: 640 },
      { tierFrom: 6, tierTo: 7, x: 560 },
    ];

    ladderConfigs.forEach((c, idx) => {
      const yTop = tierYs[c.tierTo] + 16;
      const yBottom = tierYs[c.tierFrom];
      this.ladders.push({
        id: `lad_${idx}`,
        tierFrom: c.tierFrom,
        tierTo: c.tierTo,
        x: c.x,
        yTop,
        yBottom,
        width: 30
      });
    });
  }

  private setupKeyListeners() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toUpperCase()] = true;
      this.keys[e.code] = true;

      // Handle Instant Restart key R
      if ((e.key === 'r' || e.key === 'R') && (this.status === 'WON' || this.status === 'LOST_COLLAPSE' || this.status === 'LOST_DIED')) {
        this.restartGame();
      }

      // Handle Core Shutdown key E
      if ((e.key === 'e' || e.key === 'E') && this.status === 'PLAYING') {
        this.tryInitiateCoreShutdown();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toUpperCase()] = false;
      this.keys[e.code] = false;
    });
  }

  public startGame() {
    this.status = 'PLAYING';
    this.timeRemaining = 60.0;
    this.collapseTimer = 0;
    this.hazardSpawnTimer = 0;
    this.hazards = [];
    this.particles = [];
    this.player = this.createDefaultPlayer();
    this.core = this.createDefaultCore();
    this.initLevel();

    this.stats.timeRemaining = 60.0;
    this.stats.structuralFailurePercent = 10;
    this.stats.score = 0;
    this.stats.floorsSurvived = 0;
    this.stats.debrisAvoided = 0;

    if (this.onStateChange) this.onStateChange('PLAYING');
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public restartGame() {
    this.startGame();
  }

  public setVirtualKey(key: string, pressed: boolean) {
    this.keys[key.toUpperCase()] = pressed;
    if (pressed && (key === 'e' || key === 'E') && this.status === 'PLAYING') {
      this.tryInitiateCoreShutdown();
    }
    if (pressed && (key === 'r' || key === 'R') && (this.status === 'WON' || this.status === 'LOST_COLLAPSE' || this.status === 'LOST_DIED')) {
      this.restartGame();
    }
  }

  private loop = (now: number) => {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // Clamp delta time
    this.lastTime = now;
    this.globalTime += dt;

    if (this.status === 'PLAYING' || this.status === 'CHARGING_CORE') {
      this.update(dt);
    }

    this.render();

    if (this.status === 'PLAYING' || this.status === 'CHARGING_CORE') {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private update(dt: number) {
    // 1. Timer Countdown & Structural Failure Escalation
    this.timeRemaining = Math.max(0, this.timeRemaining - dt);
    this.stats.timeRemaining = this.timeRemaining;

    // Structural failure % increases from 10% to 100%
    const progress = (60.0 - this.timeRemaining) / 60.0;
    this.stats.structuralFailurePercent = Math.min(100, Math.floor(10 + progress * 90));

    // Handle Time Escalation Banners
    if (this.timeRemaining <= 45.0 && this.timeRemaining > 44.5 && !this.bannerText) {
      this.showBanner('STRUCTURAL INSTABILITY DETECTED');
    } else if (this.timeRemaining <= 30.0 && this.timeRemaining > 29.5 && this.bannerText !== 'CRITICAL FAILURE') {
      this.showBanner('CRITICAL FAILURE');
    } else if (this.timeRemaining <= 15.0 && this.timeRemaining > 14.5 && this.bannerText !== 'BUILDING COLLAPSE IMMINENT') {
      this.showBanner('BUILDING COLLAPSE IMMINENT');
    }

    if (this.timeRemaining <= 5.0 && this.timeRemaining > 0) {
      const num = Math.ceil(this.timeRemaining);
      if (num !== this.countdownNumber) {
        this.countdownNumber = num;
        sound.playAlarmBeep();
        this.shakeScreen(6);
      }
    }

    // Check Timer Zero Loss
    if (this.timeRemaining <= 0) {
      this.triggerLoss('LOST_COLLAPSE');
      return;
    }

    // 2. Collapsing Floors Mechanism
    this.updateCollapsingFloors(dt);

    // 3. Hazards Logic
    this.updateHazards(dt);

    // 4. Player Physics & Controls
    this.updatePlayer(dt);

    // 5. Emergency Core Shutdown Logic
    this.updateCore(dt);

    // 6. Particles & Screen Shake Decay
    this.updateParticles(dt);
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 25);
      this.shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // 7. Update Banner Timer
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) this.bannerText = '';
    }

    // Stats callback for HUD
    if (this.onStatsUpdate) this.onStatsUpdate(this.stats);
  }

  private showBanner(text: string) {
    this.bannerText = text;
    this.bannerTimer = 2.5;
    sound.playAlarmBeep();
    this.shakeScreen(8);
  }

  private shakeScreen(intensity: number) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  private updateCollapsingFloors(dt: number) {
    // Collapse frequency speeds up as time decreases
    let interval = 3.2;
    if (this.timeRemaining < 45) interval = 2.2;
    if (this.timeRemaining < 30) interval = 1.4;
    if (this.timeRemaining < 15) interval = 0.8;
    if (this.timeRemaining < 5) interval = 0.4;

    this.collapseTimer += dt;
    if (this.collapseTimer >= interval) {
      this.collapseTimer = 0;
      this.triggerRandomFloorCollapse();
    }

    // Update existing collapsing floor blocks
    this.platforms.forEach((platform) => {
      platform.blocks.forEach((block) => {
        if (block.state === 'CRACKING') {
          block.stateTimer -= dt;
          block.shakeOffset = (Math.random() * 2 - 1) * 2;
          if (block.stateTimer <= 0) {
            block.state = 'COLLAPSING';
            block.stateTimer = 1.0;
            sound.playCrack();
          }
        } else if (block.state === 'COLLAPSING') {
          block.stateTimer -= dt;
          block.shakeOffset = (Math.random() * 2 - 1) * 5;

          // Spawn falling debris particles
          if (Math.random() < 0.4) {
            this.particles.push({
              x: block.x + Math.random() * block.width,
              y: block.y + block.height,
              vx: (Math.random() * 2 - 1) * 30,
              vy: 100 + Math.random() * 150,
              color: '#ef4444',
              size: 4,
              life: 0.8,
              maxLife: 0.8,
              gravity: 400
            });
          }

          if (block.stateTimer <= 0) {
            block.state = 'DESTROYED';
            block.shakeOffset = 0;
            sound.playCollapse();
            this.shakeScreen(5);

            // Explosion particles of rubble
            for (let i = 0; i < 12; i++) {
              this.particles.push({
                x: block.x + Math.random() * block.width,
                y: block.y + Math.random() * block.height,
                vx: (Math.random() * 2 - 1) * 120,
                vy: -50 - Math.random() * 150,
                color: Math.random() > 0.5 ? '#f97316' : '#64748b',
                size: 5 + Math.random() * 4,
                life: 1.2,
                maxLife: 1.2,
                gravity: 600
              });
            }
          }
        }
      });
    });
  }

  private triggerRandomFloorCollapse() {
    // Find candidate blocks that are SAFE and not directly under player's current stand position
    const candidates: FloorBlock[] = [];
    this.platforms.forEach((p) => {
      p.blocks.forEach((b) => {
        if (b.state === 'SAFE') {
          // Avoid collapsing block directly under player without adjacent alternative
          const isUnderPlayer =
            Math.abs(b.y - (this.player.y + this.player.height)) < 20 &&
            this.player.x + this.player.width > b.x &&
            this.player.x < b.x + b.width;

          if (!isUnderPlayer) {
            candidates.push(b);
          }
        }
      });
    });

    if (candidates.length > 0) {
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      chosen.state = 'CRACKING';
      chosen.stateTimer = 1.8; // Player has 1.8s to react to cracking floor!
      sound.playCrack();
    }
  }

  private updateHazards(dt: number) {
    // Spawn hazards periodically
    let spawnInterval = 3.5;
    if (this.timeRemaining < 45) spawnInterval = 2.5;
    if (this.timeRemaining < 25) spawnInterval = 1.8;

    this.hazardSpawnTimer += dt;
    if (this.hazardSpawnTimer >= spawnInterval) {
      this.hazardSpawnTimer = 0;
      this.spawnHazard();
    }

    // Update existing hazards
    this.hazards.forEach((h) => {
      // Horizontal movement
      h.x += h.vx * dt;
      h.rotation += (h.vx / h.radius) * dt;

      // Check edge of screen bouncing
      if (h.x - h.radius < 40) {
        h.x = 40 + h.radius;
        h.vx = Math.abs(h.vx);
      } else if (h.x + h.radius > 1160) {
        h.x = 1160 - h.radius;
        h.vx = -Math.abs(h.vx);
      }

      // Check if hazard is on a platform or falling
      let onPlatform = false;
      const hFeetY = h.y + h.radius;

      this.platforms.forEach((p) => {
        p.blocks.forEach((b) => {
          if (b.state !== 'DESTROYED') {
            if (
              hFeetY >= b.y &&
              hFeetY <= b.y + 12 &&
              h.x >= b.x &&
              h.x <= b.x + b.width &&
              h.vy >= 0
            ) {
              onPlatform = true;
              h.y = b.y - h.radius;
              h.vy = 0;
              h.currentTier = p.tier;
            }
          }
        });
      });

      if (!onPlatform) {
        // Fall down through gap!
        h.vy += 980 * dt;
        h.y += h.vy * dt;
      }

      // Check player collision
      const dx = this.player.x + this.player.width / 2 - h.x;
      const dy = this.player.y + this.player.height / 2 - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < h.radius + 14) {
        this.triggerLoss('LOST_DIED');
      }

      // Check dodge (Player jumps over hazard)
      if (
        !h.dodged &&
        Math.abs(dx) < 30 &&
        this.player.y + this.player.height < h.y - 10 &&
        !this.player.isGrounded
      ) {
        h.dodged = true;
        this.stats.debrisAvoided++;
        this.stats.score += 50;
      }
    });

    // Remove hazards that fall below bottom screen
    this.hazards = this.hazards.filter((h) => h.y < 950);
  }

  private spawnHazard() {
    const spawnTiers = [5, 6];
    const tier = spawnTiers[Math.floor(Math.random() * spawnTiers.length)];
    const platform = this.platforms.find((p) => p.tier === tier);
    if (!platform) return;

    const spawnRight = Math.random() > 0.5;
    const x = spawnRight ? 1140 : 60;
    const vx = (spawnRight ? -1 : 1) * (150 + Math.random() * 80);

    const types: ('BARREL' | 'CONCRETE' | 'CANISTER')[] = ['BARREL', 'CONCRETE', 'CANISTER'];
    const type = types[Math.floor(Math.random() * types.length)];

    this.hazards.push({
      id: `h_${Date.now()}_${Math.random()}`,
      type,
      x,
      y: platform.y - 18,
      vx,
      vy: 0,
      radius: 14,
      rotation: 0,
      currentTier: tier,
      dodged: false
    });
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Movement speeds
    const speed = 280;
    const gravity = 1400;
    const jumpForce = -520;
    const climbSpeed = 200;

    // Animation frames update
    p.animTimer += dt;
    if (p.animTimer > 0.1) {
      p.animTimer = 0;
      p.animFrame = (p.animFrame + 1) % 6;
    }

    // 1. Ladder Interaction Check
    const playerCenterX = p.x + p.width / 2;
    const playerFeetY = p.y + p.height;

    let nearestLadder: Ladder | null = null;
    this.ladders.forEach((lad) => {
      if (
        Math.abs(playerCenterX - (lad.x + lad.width / 2)) < 24 &&
        playerFeetY >= lad.yTop - 10 &&
        p.y <= lad.yBottom + 10
      ) {
        nearestLadder = lad;
      }
    });

    const upPressed = this.keys['W'] || this.keys['ARROWUP'];
    const downPressed = this.keys['S'] || this.keys['ARROWDOWN'];
    const leftPressed = this.keys['A'] || this.keys['ARROWLEFT'];
    const rightPressed = this.keys['D'] || this.keys['ARROWRIGHT'];
    const jumpPressed = this.keys['SPACE'] || this.keys[' '];

    if (nearestLadder && (upPressed || downPressed) && !p.isClimbing) {
      const lad: Ladder = nearestLadder;
      p.isClimbing = true;
      p.currentLadder = lad;
      p.x = lad.x + lad.width / 2 - p.width / 2;
      p.vx = 0;
      p.vy = 0;
      sound.playClimb();
    }

    if (p.isClimbing && p.currentLadder) {
      p.animState = 'CLIMB';
      p.isGrounded = false;

      if (upPressed) {
        p.y -= climbSpeed * dt;
        if (Math.floor(this.globalTime * 10) % 2 === 0) sound.playClimb();
      } else if (downPressed) {
        p.y += climbSpeed * dt;
        if (Math.floor(this.globalTime * 10) % 2 === 0) sound.playClimb();
      }

      // Exit ladder top or bottom
      if (p.y + p.height < p.currentLadder.yTop - 10) {
        p.isClimbing = false;
        p.currentLadder = null;
      } else if (p.y > p.currentLadder.yBottom + 5) {
        p.isClimbing = false;
        p.currentLadder = null;
      }

      // Leap off ladder
      if (jumpPressed) {
        p.isClimbing = false;
        p.currentLadder = null;
        p.vy = jumpForce * 0.85;
        sound.playJump();
      }
      return;
    }

    // 2. Horizontal Movement
    p.vx = 0;
    if (leftPressed) {
      p.vx = -speed;
      p.facing = 'left';
    }
    if (rightPressed) {
      p.vx = speed;
      p.facing = 'right';
    }

    p.x += p.vx * dt;

    // Boundaries
    p.x = Math.max(20, Math.min(1180 - p.width, p.x));

    // 3. Vertical Physics & Jump
    if (jumpPressed && p.isGrounded) {
      p.vy = jumpForce;
      p.isGrounded = false;
      sound.playJump();
    }

    p.vy += gravity * dt;
    p.y += p.vy * dt;

    // Platform Landing Detection
    let groundedThisFrame = false;
    const feetY = p.y + p.height;
    const prevFeetY = feetY - p.vy * dt;

    this.platforms.forEach((plat) => {
      plat.blocks.forEach((block) => {
        if (block.state !== 'DESTROYED') {
          if (
            p.x + p.width > block.x + 4 &&
            p.x < block.x + block.width - 4 &&
            prevFeetY <= block.y + 6 &&
            feetY >= block.y &&
            p.vy >= 0
          ) {
            groundedThisFrame = true;
            p.y = block.y - p.height;
            p.vy = 0;

            // Tier progression score
            if (plat.tier > p.highestTierReached) {
              const diff = plat.tier - p.highestTierReached;
              p.highestTierReached = plat.tier;
              this.stats.score += diff * 200;
              this.stats.floorsSurvived = p.highestTierReached;
            }
          }
        }
      });
    });

    p.isGrounded = groundedThisFrame;

    // Set animation state
    if (!p.isGrounded) {
      p.animState = p.vy < 0 ? 'JUMP' : 'FALL';
    } else if (p.vx !== 0) {
      p.animState = 'RUN';
    } else {
      p.animState = 'IDLE';
    }

    // Fall death below screen
    if (p.y > 920) {
      this.triggerLoss('LOST_DIED');
    }
  }

  private tryInitiateCoreShutdown() {
    const dist = Math.abs(this.player.x + this.player.width / 2 - (this.core.x + this.core.width / 2));
    const onTopTier = this.player.y < 120;

    if (onTopTier && dist < 60 && !this.core.isCharging) {
      this.core.isCharging = true;
      this.core.chargeProgress = 0;
      this.status = 'CHARGING_CORE';
      sound.playCoreCharge();
      if (this.onStateChange) this.onStateChange('CHARGING_CORE');
    }
  }

  private updateCore(dt: number) {
    if (this.core.isCharging) {
      this.core.chargeProgress += dt / 3.5; // 3.5s shutdown sequence
      sound.playCoreCharge();

      if (this.core.chargeProgress >= 1.0) {
        this.triggerWin();
      }
    }
  }

  private triggerWin() {
    this.status = 'WON';
    sound.playVictory();

    // Calculate time bonus
    const timeBonus = Math.floor(this.timeRemaining * 100);
    this.stats.score += 1000 + timeBonus;

    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('floor_zero_highscore', this.stats.highScore.toString());
    }

    if (this.onStateChange) this.onStateChange('WON');
  }

  private triggerLoss(reason: 'LOST_COLLAPSE' | 'LOST_DIED') {
    this.status = reason;
    this.player.animState = 'DEATH';
    sound.playGameOver();

    if (this.stats.score > this.stats.highScore) {
      this.stats.highScore = this.stats.score;
      localStorage.setItem('floor_zero_highscore', this.stats.highScore.toString());
    }

    if (this.onStateChange) this.onStateChange(reason);
  }

  private updateParticles(dt: number) {
    this.particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) p.vy += p.gravity * dt;
      p.life -= dt;
    });

    this.particles = this.particles.filter((p) => p.life > 0);
  }

  private render() {
    // Clear screen with camera shake
    this.renderer.clear(this.shakeX, this.shakeY);

    // Draw level components
    this.renderer.drawLadders(this.ladders);
    this.renderer.drawPlatforms(this.platforms, this.globalTime);

    // Check if player near Emergency Core
    const playerNearCore =
      this.player.y < 120 &&
      Math.abs(this.player.x + this.player.width / 2 - (this.core.x + this.core.width / 2)) < 60;

    this.renderer.drawEmergencyCore(this.core, this.globalTime, playerNearCore);
    this.renderer.drawHazards(this.hazards, this.globalTime);
    this.renderer.drawParticles(this.particles);

    // Draw Player
    this.renderer.drawPlayer(this.player, this.globalTime);

    // Banner Text Overlay
    if (this.bannerText) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      this.ctx.fillRect(0, 380, 1200, 70);
      this.ctx.strokeStyle = '#fde047';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(0, 380, 1200, 70);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '700 22px "Press Start 2P", cursive, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.bannerText, 600, 424);
      this.ctx.restore();
    }

    // Countdown 5..1 Overlay
    if (this.countdownNumber > 0 && this.timeRemaining <= 5.0 && this.timeRemaining > 0) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
      this.ctx.fillRect(0, 0, 1200, 900);

      this.ctx.fillStyle = '#fef08a';
      this.ctx.font = '900 120px "Press Start 2P", cursive, monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.countdownNumber.toString(), 600, 480);
      this.ctx.restore();
    }

    this.renderer.endFrame();
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
