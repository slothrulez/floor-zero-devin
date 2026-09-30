import { EmergencyCore, FloorBlock, Hazard, Ladder, Particle, Platform, Player } from './types';

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private spriteSheet: HTMLImageElement | null = null;
  private spriteSheetLoaded = false;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number, spriteSheetPath?: string) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    if (spriteSheetPath) {
      this.spriteSheet = new Image();
      this.spriteSheet.src = spriteSheetPath;
      this.spriteSheet.onload = () => {
        this.spriteSheetLoaded = true;
      };
    }
  }

  public setSpriteSheet(path: string) {
    this.spriteSheet = new Image();
    this.spriteSheet.src = path;
    this.spriteSheet.onload = () => {
      this.spriteSheetLoaded = true;
    };
  }

  public clear(shakeX = 0, shakeY = 0) {
    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    // Dark industrial background gradient
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    bgGradient.addColorStop(0, '#0a0d14');
    bgGradient.addColorStop(0.5, '#121620');
    bgGradient.addColorStop(1, '#1b0d0d'); // Red tint towards bottom zero floor
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Industrial background grid & support beams
    this.drawBackgroundStructure();
  }

  private drawBackgroundStructure() {
    this.ctx.save();
    this.ctx.strokeStyle = '#1e2638';
    this.ctx.lineWidth = 1;

    // Vertical structural pillars
    const pillars = [120, 350, 600, 850, 1080];
    pillars.forEach((px) => {
      this.ctx.fillStyle = '#141a26';
      this.ctx.fillRect(px - 10, 0, 20, this.height);
      this.ctx.strokeRect(px - 10, 0, 20, this.height);

      // Steel truss diagonals
      this.ctx.strokeStyle = '#222d42';
      this.ctx.beginPath();
      for (let y = 0; y < this.height; y += 80) {
        this.ctx.moveTo(px - 10, y);
        this.ctx.lineTo(px + 10, y + 40);
        this.ctx.moveTo(px + 10, y + 40);
        this.ctx.lineTo(px - 10, y + 80);
      }
      this.ctx.stroke();
    });

    // Floor indicators on wall
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.font = '700 24px "Chakra Petch", monospace';
    this.ctx.textAlign = 'right';

    const floorNames = [
      'CORE - FLOOR ZERO',
      'LEVEL 6 - SECTOR A',
      'LEVEL 5 - SECTOR B',
      'LEVEL 4 - SECTOR C',
      'LEVEL 3 - SECTOR D',
      'LEVEL 2 - SECTOR E',
      'LEVEL 1 - SUB-BASE',
      'GROUND ZERO'
    ];

    const ys = [80, 190, 300, 410, 520, 630, 740, 840];
    ys.forEach((y, i) => {
      if (floorNames[i]) {
        this.ctx.fillText(floorNames[i], this.width - 25, y - 10);
      }
    });

    this.ctx.restore();
  }

  public drawLadders(ladders: Ladder[]) {
    ladders.forEach((ladder) => {
      this.ctx.save();
      const x = ladder.x;
      const w = ladder.width;
      const yTop = ladder.yTop;
      const yBot = ladder.yBottom;

      // Vertical rails (Yellow / Industrial Metal)
      this.ctx.fillStyle = '#d97706';
      this.ctx.fillRect(x, yTop, 5, yBot - yTop);
      this.ctx.fillRect(x + w - 5, yTop, 5, yBot - yTop);

      // Rail highlights
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillRect(x + 1, yTop, 2, yBot - yTop);
      this.ctx.fillRect(x + w - 4, yTop, 2, yBot - yTop);

      // Rungs
      this.ctx.fillStyle = '#92400e';
      this.ctx.strokeStyle = '#f59e0b';
      this.ctx.lineWidth = 2;

      const rungSpacing = 16;
      for (let y = yTop + 8; y < yBot; y += rungSpacing) {
        this.ctx.fillRect(x + 3, y - 2, w - 6, 4);
        this.ctx.beginPath();
        this.ctx.moveTo(x + 2, y);
        this.ctx.lineTo(x + w - 2, y);
        this.ctx.stroke();
      }

      this.ctx.restore();
    });
  }

  public drawPlatforms(platforms: Platform[], globalTime: number) {
    platforms.forEach((p) => {
      p.blocks.forEach((block) => {
        if (block.state === 'DESTROYED') return;

        this.ctx.save();
        const shakeX = block.shakeOffset;
        const x = block.x + shakeX;
        const y = block.y;
        const w = block.width;
        const h = block.height;

        if (block.state === 'SAFE') {
          // Metallic steel platform block
          const grad = this.ctx.createLinearGradient(x, y, x, y + h);
          grad.addColorStop(0, '#475569');
          grad.addColorStop(0.3, '#334155');
          grad.addColorStop(1, '#1e293b');

          this.ctx.fillStyle = grad;
          this.ctx.fillRect(x, y, w, h);

          // Top highlight line
          this.ctx.fillStyle = '#94a3b8';
          this.ctx.fillRect(x, y, w, 2);

          // Caution stripe border on bottom
          this.drawHazardStripes(x, y + h - 4, w, 4);

          // Rivets
          this.ctx.fillStyle = '#64748b';
          this.ctx.fillRect(x + 4, y + 4, 3, 3);
          this.ctx.fillRect(x + w - 7, y + 4, 3, 3);
        } else if (block.state === 'CRACKING') {
          // Warning yellow pulsing glow
          const pulse = (Math.sin(globalTime * 20) + 1) / 2;
          const grad = this.ctx.createLinearGradient(x, y, x, y + h);
          grad.addColorStop(0, `rgb(${200 + pulse * 55}, 140, 20)`);
          grad.addColorStop(1, '#78350f');

          this.ctx.fillStyle = grad;
          this.ctx.fillRect(x, y, w, h);

          // Top flashing border
          this.ctx.fillStyle = pulse > 0.5 ? '#fde047' : '#ca8a04';
          this.ctx.fillRect(x, y, w, 3);

          // Crack fissures
          this.ctx.strokeStyle = '#f97316';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(x + w * 0.2, y);
          this.ctx.lineTo(x + w * 0.35, y + h * 0.6);
          this.ctx.lineTo(x + w * 0.25, y + h);

          this.ctx.moveTo(x + w * 0.7, y);
          this.ctx.lineTo(x + w * 0.6, y + h * 0.5);
          this.ctx.lineTo(x + w * 0.8, y + h);
          this.ctx.stroke();
        } else if (block.state === 'COLLAPSING') {
          // Intense Red crumbling floor
          const pulse = (Math.sin(globalTime * 35) + 1) / 2;
          this.ctx.fillStyle = pulse > 0.4 ? '#dc2626' : '#991b1b';
          this.ctx.fillRect(x, y, w, h);

          // Glowing glowing red crack lines
          this.ctx.strokeStyle = '#fef08a';
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 5, y);
          this.ctx.lineTo(x + w * 0.4, y + h * 0.8);
          this.ctx.lineTo(x + w - 5, y);
          this.ctx.moveTo(x + w * 0.5, y + h);
          this.ctx.lineTo(x + w * 0.4, y + 2);
          this.ctx.stroke();

          // Crumbling particles falling down
          this.ctx.fillStyle = '#ef4444';
          for (let i = 0; i < 3; i++) {
            const px = x + Math.random() * w;
            const py = y + h + Math.random() * 12;
            this.ctx.fillRect(px, py, 4, 4);
          }
        }

        this.ctx.restore();
      });
    });
  }

  private drawHazardStripes(x: number, y: number, w: number, h: number) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(x, y, w, h);
    this.ctx.clip();

    this.ctx.fillStyle = '#eab308';
    this.ctx.fillRect(x, y, w, h);

    this.ctx.fillStyle = '#0f172a';
    for (let px = x - h; px < x + w + h; px += 12) {
      this.ctx.beginPath();
      this.ctx.moveTo(px, y + h);
      this.ctx.lineTo(px + 6, y + h);
      this.ctx.lineTo(px + 12, y);
      this.ctx.lineTo(px + 6, y);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  public drawEmergencyCore(core: EmergencyCore, globalTime: number, playerNear: boolean) {
    this.ctx.save();
    const x = core.x;
    const y = core.y;
    const w = core.width;
    const h = core.height;

    // Base Station frame
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(x, y, w, h);

    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, w, h);

    // Hazard border lines
    this.drawHazardStripes(x, y + h - 8, w, 8);

    // Core Plasma Chamber
    const pulse = (Math.sin(globalTime * (core.isCharging ? 25 : 6)) + 1) / 2;
    const coreColor = core.isCharging
      ? `rgb(${50 + pulse * 200}, 240, ${200 + pulse * 55})`
      : `rgb(239, ${68 + pulse * 100}, 68)`;

    const coreGrad = this.ctx.createRadialGradient(
      x + w / 2, y + h / 2 - 10, 5,
      x + w / 2, y + h / 2 - 10, 30
    );
    coreGrad.addColorStop(0, coreColor);
    coreGrad.addColorStop(1, '#0f172a');

    this.ctx.fillStyle = coreGrad;
    this.ctx.beginPath();
    this.ctx.arc(x + w / 2, y + h / 2 - 10, 26, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = core.isCharging ? '#22d3ee' : '#f87171';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();

    // Core Label
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = '700 12px "Chakra Petch", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('EMERGENCY CORE', x + w / 2, y + 16);

    // Charge Progress Bar when charging
    if (core.isCharging) {
      const barW = w - 16;
      const barH = 10;
      const barX = x + 8;
      const barY = y + h - 22;

      this.ctx.fillStyle = '#0284c7';
      this.ctx.fillRect(barX, barY, barW, barH);

      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillRect(barX, barY, barW * core.chargeProgress, barH);

      this.ctx.strokeStyle = '#f8fafc';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(barX, barY, barW, barH);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '700 10px monospace';
      this.ctx.fillText(`SHUTDOWN ${Math.floor(core.chargeProgress * 100)}%`, x + w / 2, barY - 4);
    } else if (playerNear) {
      // Flashing Interaction Prompt
      const flash = Math.floor(globalTime * 4) % 2 === 0;
      this.ctx.fillStyle = flash ? '#fde047' : '#eab308';
      this.ctx.fillRect(x - 25, y - 35, w + 50, 26);
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x - 25, y - 35, w + 50, 26);

      this.ctx.fillStyle = '#000000';
      this.ctx.font = '700 12px "Press Start 2P", cursive, monospace';
      this.ctx.fillText('PRESS [E] TO SHUTDOWN', x + w / 2, y - 18);
    }

    this.ctx.restore();
  }

  public drawHazards(hazards: Hazard[], globalTime: number) {
    hazards.forEach((h) => {
      this.ctx.save();
      this.ctx.translate(h.x, h.y);
      this.ctx.rotate(h.rotation);

      if (h.type === 'BARREL') {
        // Red Industrial Explosive Barrel
        this.ctx.fillStyle = '#dc2626';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, h.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#7f1d1d';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Metallic bands & hazard logo
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-h.radius + 2, -4);
        this.ctx.lineTo(h.radius - 2, -4);
        this.ctx.moveTo(-h.radius + 2, 4);
        this.ctx.lineTo(h.radius - 2, 4);
        this.ctx.stroke();

        this.ctx.fillStyle = '#fef08a';
        this.ctx.font = 'bold 10px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚡', 0, 0);
      } else if (h.type === 'CONCRETE') {
        // Concrete Chunk
        this.ctx.fillStyle = '#64748b';
        this.ctx.beginPath();
        this.ctx.moveTo(-h.radius, -h.radius + 4);
        this.ctx.lineTo(h.radius - 2, -h.radius);
        this.ctx.lineTo(h.radius, h.radius - 2);
        this.ctx.lineTo(-h.radius + 4, h.radius);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      } else {
        // Gas Canister
        this.ctx.fillStyle = '#2563eb';
        this.ctx.fillRect(-h.radius, -h.radius + 4, h.radius * 2, h.radius * 2 - 8);
        this.ctx.strokeStyle = '#1d4ed8';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-h.radius, -h.radius + 4, h.radius * 2, h.radius * 2 - 8);

        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.arc(0, -h.radius + 2, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });
  }

  public drawPlayer(player: Player, globalTime: number) {
    this.ctx.save();
    this.ctx.imageSmoothingEnabled = false;

    // If sprite sheet is loaded, draw from sprite sheet or use high-fidelity procedural sprite
    if (this.spriteSheetLoaded && this.spriteSheet) {
      this.drawPlayerFromSpriteSheet(player);
    } else {
      this.drawPlayerProcedural(player, globalTime);
    }

    this.ctx.restore();
  }

  private drawPlayerFromSpriteSheet(player: Player) {
    if (!this.spriteSheet) return;

    // hero_frames.png: uniform grid, 4 columns x 7 rows
    // rows: 0 IDLE, 1 RUN right, 2 RUN left, 3 JUMP, 4 FALL, 5 CLIMB, 6 DEATH
    const frameW = this.spriteSheet.width / 4;
    const frameH = this.spriteSheet.height / 7;

    let row = 0;
    if (player.animState === 'RUN') {
      row = player.facing === 'right' ? 1 : 2;
    } else if (player.animState === 'JUMP') {
      row = 3;
    } else if (player.animState === 'FALL') {
      row = 4;
    } else if (player.animState === 'CLIMB') {
      row = 5;
    } else if (player.animState === 'DEATH') {
      row = 6;
    }

    const col = Math.floor(player.animFrame) % 4;
    const sx = col * frameW;
    const sy = row * frameH;

    this.ctx.imageSmoothingEnabled = true;

    // Draw sprite ~1.5x larger than the hitbox, feet anchored to hitbox bottom
    const scale = 1.75;
    const dw = (player.width + 8) * scale;
    const dh = (player.height + 4) * scale;
    const dx = player.x + player.width / 2 - dw / 2;
    const dy = player.y + player.height - dh;
    this.ctx.drawImage(
      this.spriteSheet,
      sx, sy, frameW, frameH,
      dx, dy, dw, dh
    );

    this.ctx.imageSmoothingEnabled = false;
  }

  private drawPlayerProcedural(player: Player, globalTime: number) {
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;

    const isLeft = player.facing === 'left';

    this.ctx.save();
    this.ctx.translate(x + w / 2, y + h / 2);
    if (isLeft) {
      this.ctx.scale(-1, 1);
    }

    // Colors requested: Brown guy, black tee, black pants, red Puma Speedcat shoes with white stripe
    const skinTone = '#92400e'; // Warm rich brown skin
    const skinHighlight = '#b45309';
    const blackTee = '#18181b'; // Black t-shirt
    const blackPants = '#09090b'; // Black trousers
    const pumaRed = '#dc2626'; // Red Speedcat shoe
    const pumaWhite = '#ffffff'; // Speedcat signature white curved formstrip & sole
    const darkHair = '#090d16'; // Dark hair

    const frame = Math.floor(player.animFrame);

    if (player.animState === 'DEATH') {
      // Fallen character on floor
      this.ctx.rotate(Math.PI / 2);
      // Torso (Black Tee)
      this.ctx.fillStyle = blackTee;
      this.ctx.fillRect(-10, -8, 20, 16);
      // Pants (Black)
      this.ctx.fillStyle = blackPants;
      this.ctx.fillRect(-10, 8, 20, 12);
      // Red Puma Speedcat Sneakers
      this.ctx.fillStyle = pumaRed;
      this.ctx.fillRect(-12, 20, 12, 6);
      this.ctx.fillRect(2, 20, 12, 6);
      this.ctx.fillStyle = pumaWhite;
      this.ctx.fillRect(-10, 24, 10, 2);
      this.ctx.fillRect(4, 24, 10, 2);
      // Head & Skin & Hair
      this.ctx.fillStyle = skinTone;
      this.ctx.beginPath();
      this.ctx.arc(0, -14, 8, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = darkHair;
      this.ctx.fillRect(-8, -22, 16, 8);
      this.ctx.restore();
      return;
    }

    // Animation bobbing offsets
    let legOffset = 0;
    let armOffset = 0;

    if (player.animState === 'RUN') {
      legOffset = Math.sin(frame * 1.5) * 8;
      armOffset = Math.cos(frame * 1.5) * 6;
    } else if (player.animState === 'CLIMB') {
      legOffset = Math.sin(globalTime * 15) * 6;
      armOffset = -legOffset;
    }

    // 1. RED PUMA SPEEDCAT SNEAKERS (Sleek red low-profile shoes + white formstrip)
    this.ctx.fillStyle = pumaRed;
    if (player.animState === 'CLIMB') {
      this.ctx.fillRect(-10, 16 + legOffset, 8, 7);
      this.ctx.fillRect(3, 16 - legOffset, 8, 7);
      // White Puma Formstrip logo & sole
      this.ctx.fillStyle = pumaWhite;
      this.ctx.fillRect(-9, 18 + legOffset, 6, 2);
      this.ctx.fillRect(4, 18 - legOffset, 6, 2);
      this.ctx.fillRect(-10, 22 + legOffset, 8, 2);
      this.ctx.fillRect(3, 22 - legOffset, 8, 2);
    } else if (player.animState === 'JUMP') {
      this.ctx.fillRect(-10, 14, 10, 7);
      this.ctx.fillRect(2, 12, 10, 7);
      // White Puma Formstrip logo & sole
      this.ctx.fillStyle = pumaWhite;
      this.ctx.fillRect(-8, 16, 7, 2);
      this.ctx.fillRect(4, 14, 7, 2);
      this.ctx.fillRect(-10, 20, 10, 2);
      this.ctx.fillRect(2, 18, 10, 2);
    } else {
      // Normal walk/run sneakers
      const lx = -11 - legOffset * 0.4;
      const rx = 2 + legOffset * 0.4;
      this.ctx.fillRect(lx, 16, 10, 7);
      this.ctx.fillRect(rx, 16, 10, 7);

      // White Puma Speedcat iconic Formstrip curved stripe
      this.ctx.fillStyle = pumaWhite;
      this.ctx.beginPath();
      this.ctx.moveTo(lx + 2, 19);
      this.ctx.lineTo(lx + 8, 17);
      this.ctx.lineTo(lx + 8, 19);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(rx + 2, 19);
      this.ctx.lineTo(rx + 8, 17);
      this.ctx.lineTo(rx + 8, 19);
      this.ctx.fill();

      // White sneaker sole
      this.ctx.fillRect(lx, 22, 10, 2);
      this.ctx.fillRect(rx, 22, 10, 2);
    }

    // 2. BLACK PANTS (Legs)
    this.ctx.fillStyle = blackPants;
    this.ctx.fillRect(-9 - legOffset * 0.3, 4, 7, 13);
    this.ctx.fillRect(2 + legOffset * 0.3, 4, 7, 13);
    // Subtle knee highlight lines
    this.ctx.fillStyle = '#27272a';
    this.ctx.fillRect(-8 - legOffset * 0.3, 10, 5, 2);
    this.ctx.fillRect(3 + legOffset * 0.3, 10, 5, 2);

    // 3. BLACK TEE SHIRT (Torso)
    this.ctx.fillStyle = blackTee;
    this.ctx.fillRect(-10, -10, 20, 15);
    // White/Red small graphic logo on chest
    this.ctx.fillStyle = pumaRed;
    this.ctx.fillRect(-2, -8, 4, 3);
    this.ctx.fillStyle = pumaWhite;
    this.ctx.fillRect(-1, -7, 2, 1);

    // 4. ARMS & HANDS (Brown skin)
    this.ctx.fillStyle = blackTee; // Sleeves
    if (player.animState === 'CLIMB') {
      this.ctx.fillRect(-13, -16 + armOffset, 5, 8);
      this.ctx.fillRect(8, -16 - armOffset, 5, 8);
      // Forearms & Hands (Brown skin)
      this.ctx.fillStyle = skinTone;
      this.ctx.fillRect(-13, -18 + armOffset, 5, 6);
      this.ctx.fillRect(8, -18 - armOffset, 5, 6);
    } else {
      this.ctx.fillRect(-13 + armOffset * 0.5, -9, 5, 7);
      this.ctx.fillRect(8 - armOffset * 0.5, -9, 5, 7);
      // Forearms & Hands (Brown skin)
      this.ctx.fillStyle = skinTone;
      this.ctx.fillRect(-13 + armOffset * 0.5, -2, 5, 8);
      this.ctx.fillRect(8 - armOffset * 0.5, -2, 5, 8);
    }

    // 5. HEAD & BROWN SKIN
    this.ctx.fillStyle = skinTone;
    this.ctx.fillRect(-7, -21, 14, 12);
    this.ctx.fillStyle = skinHighlight;
    this.ctx.fillRect(-5, -20, 10, 3);

    // 6. DARK HAIR & SIDEBURNS
    this.ctx.fillStyle = darkHair;
    this.ctx.fillRect(-9, -25, 18, 7);
    this.ctx.fillRect(-10, -22, 4, 8); // Sideburn
    this.ctx.fillRect(-4, -26, 10, 3); // Hair tuft top

    // 7. FACE & EYES
    if (player.animState !== 'CLIMB') {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(1, -17, 4, 3);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(3, -17, 2, 3); // Eye pupil
    }

    this.ctx.restore();
  }

  public drawParticles(particles: Particle[]) {
    particles.forEach((p) => {
      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      this.ctx.restore();
    });
  }

  public endFrame() {
    this.ctx.restore();
  }
}
