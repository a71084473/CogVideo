/**
 * UX CLAW LAB — claw machine simulation.
 *
 * Pure TypeScript (no DOM) so it can be unit-tested and rendered by any view.
 * World space:  x ∈ [0, W] left→right, z ∈ [0, D] back→front, y = height above floor.
 *
 * Outcome rules are deterministic and visible to the player:
 *   grip   = alignment × clawStrength (+ visible mercy bonus)
 *   hold   ⇔ grip ≥ weight × 0.40 + swingStress
 * There is no hidden payout rate — what you aim is what you get.
 */

export const W = 300;
export const D = 120;
export const RAIL_Y = 250; // height of the gantry rail
export const REST_Y = 205; // claw tip height while idle
export const CHUTE = { x0: 0, x1: 72, z0: D - 62, z1: D, wall: 34 };
export const CHUTE_CENTER = { x: (CHUTE.x0 + CHUTE.x1) / 2, z: (CHUTE.z0 + CHUTE.z1) / 2 };
export const START = { x: CHUTE_CENTER.x, z: CHUTE_CENTER.z };

const GRAVITY = 520;
const MOVE_MAX = 120; // units / s
const MOVE_ACCEL = 360;
const DROP_SPEED = 120;
const LIFT_SPEED = 85;
const CLOSE_TIME = 0.45;
const SPAN = 18; // half-width of the open prongs

export type Rarity = 'common' | 'rare' | 'legendary';
export const WEIGHT: Record<Rarity, number> = { common: 1, rare: 1.18, legendary: 1.32 };

export type DollState = 'rest' | 'held' | 'falling' | 'chute' | 'won';

export interface DollBody {
  uid: number;
  dollId: string;
  rarity: Rarity;
  r: number;
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  state: DollState;
  squash: number; // 0..1 visual squash after landing
  tilt: number; // visual rotation (rad)
  wobble: number; // phase for idle wobble
}

export type Phase = 'ready' | 'drop' | 'close' | 'lift' | 'carry' | 'release' | 'return' | 'done';

export interface ClawState {
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  open: number; // 1 open, 0 closed
  swingX: number; // pendulum angle (rad) along x
  swingZ: number;
  swingVX: number;
  swingVZ: number;
  phase: Phase;
  phaseT: number;
  heldUid: number | null;
  grip: number; // 0..1 computed on close
  need: number; // grip needed right now (live)
  closeTarget: number; // how far prongs can close (stops on a doll)
}

export type MissReason = 'empty' | 'weak' | 'slip';

export type EngineEvent =
  | { type: 'touch'; uid: number }
  | { type: 'grab'; uid: number; grip: number; alignment: number; offset: number }
  | { type: 'miss-close'; uid: number | null; alignment: number; offset: number }
  | { type: 'slip'; uid: number; grip: number; need: number }
  | { type: 'land'; uid: number; impact: number }
  | { type: 'win'; uid: number; dollId: string }
  | { type: 'round-end'; won: string[]; reason: MissReason | null };

export interface EngineOptions {
  strength?: number; // claw strength multiplier (mood / machine)
  mercy?: number; // visible comfort bonus added to grip
}

export interface DollSpawn {
  dollId: string;
  rarity: Rarity;
  r?: number;
}

/** Small deterministic PRNG so each round layout is reproducible. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export function inChute(x: number, z: number) {
  return x > CHUTE.x0 && x < CHUTE.x1 && z > CHUTE.z0 && z < CHUTE.z1;
}

export function dollHeight(d: { r: number }) {
  return d.r * 1.9;
}

export class ClawEngine {
  claw: ClawState;
  dolls: DollBody[] = [];
  strength: number;
  mercy: number;
  time = 0;
  private listeners: ((e: EngineEvent) => void)[] = [];
  private wonThisRound: string[] = [];
  private missReason: MissReason | null = null;
  private lastAccelX = 0;
  private lastAccelZ = 0;
  private nextUid = 1;
  private touched = new Set<number>();

  constructor(spawns: DollSpawn[], seed = 1, opts: EngineOptions = {}) {
    this.strength = opts.strength ?? 1;
    this.mercy = opts.mercy ?? 0;
    this.claw = ClawEngine.freshClaw();
    this.layout(spawns, seed);
  }

  static freshClaw(): ClawState {
    return {
      x: START.x,
      z: START.z,
      y: REST_Y,
      vx: 0,
      vz: 0,
      open: 1,
      swingX: 0,
      swingZ: 0,
      swingVX: 0,
      swingVZ: 0,
      phase: 'ready',
      phaseT: 0,
      heldUid: null,
      grip: 0,
      need: 0,
      closeTarget: 0,
    };
  }

  on(fn: (e: EngineEvent) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit(e: EngineEvent) {
    for (const l of this.listeners) l(e);
  }

  /** Scatter dolls on the floor, avoiding the chute and each other. */
  layout(spawns: DollSpawn[], seed: number) {
    this.dolls = [];
    this.nextUid = 1;
    const rnd = mulberry32(seed);
    for (const s of spawns) this.place(s, rnd);
    this.separate(30);
  }

  private place(s: DollSpawn, rnd: () => number) {
    const r = s.r ?? (s.rarity === 'legendary' ? 25 : s.rarity === 'rare' ? 23 : 21);
    let best = { x: W / 2, z: D / 2, score: -Infinity };
    for (let i = 0; i < 60; i++) {
      const x = r + rnd() * (W - 2 * r);
      const z = r * 0.6 + rnd() * (D - r * 1.2);
      if (x < CHUTE.x1 + r && z > CHUTE.z0 - r) continue;
      let minD = Infinity;
      for (const o of this.dolls) {
        if (o.state === 'won') continue;
        minD = Math.min(minD, Math.hypot(o.x - x, (o.z - z) * 1.4) - o.r - r);
      }
      if (minD > best.score) best = { x, z, score: minD };
      if (minD > 6) break;
    }
    this.dolls.push({
      uid: this.nextUid++,
      dollId: s.dollId,
      rarity: s.rarity,
      r,
      x: best.x,
      z: best.z,
      y: 0,
      vx: 0,
      vz: 0,
      vy: 0,
      state: 'rest',
      squash: 0,
      tilt: (rnd() - 0.5) * 0.3,
      wobble: rnd() * Math.PI * 2,
    });
  }

  /** Effective claw tip position including pendulum swing. */
  tip() {
    const c = this.claw;
    const L = RAIL_Y - c.y;
    return { x: c.x + Math.sin(c.swingX) * L * 0.35, z: c.z + Math.sin(c.swingZ) * L * 0.35, y: c.y };
  }

  get canMove() {
    return this.claw.phase === 'ready';
  }

  /** Player presses the DROP button. */
  drop() {
    if (this.claw.phase !== 'ready') return false;
    this.setPhase('drop');
    this.wonThisRound = [];
    this.missReason = null;
    this.touched.clear();
    return true;
  }

  private setPhase(p: Phase) {
    this.claw.phase = p;
    this.claw.phaseT = 0;
  }

  /** Begin a new round after 'done'. */
  reset() {
    const keep = this.claw;
    this.claw = ClawEngine.freshClaw();
    this.claw.x = keep.x;
    this.claw.z = keep.z;
    this.setPhase('ready');
  }

  held(): DollBody | undefined {
    return this.claw.heldUid == null ? undefined : this.dolls.find((d) => d.uid === this.claw.heldUid);
  }

  /**
   * Advance the simulation.
   * @param input analog stick (-1..1). Only honored during 'ready'.
   */
  step(dt: number, input: { x: number; z: number } = { x: 0, z: 0 }) {
    dt = Math.min(dt, 1 / 30);
    this.time += dt;
    const c = this.claw;
    c.phaseT += dt;

    // ---- gantry motion (with inertia) ----
    let tx = 0;
    let tz = 0;
    if (c.phase === 'ready') {
      tx = clamp(input.x, -1, 1) * MOVE_MAX;
      tz = clamp(input.z, -1, 1) * MOVE_MAX * 0.6;
    } else if (c.phase === 'carry' || c.phase === 'return') {
      const goal = c.phase === 'carry' ? CHUTE_CENTER : START;
      const dx = goal.x - c.x;
      const dz = goal.z - c.z;
      const dist = Math.hypot(dx, dz);
      const sp = Math.min(MOVE_MAX * 0.85, dist * 2.2);
      if (dist > 0.5) {
        tx = (dx / dist) * sp;
        tz = (dz / dist) * sp;
      } else if (Math.hypot(c.vx, c.vz) < 4) {
        c.vx = c.vz = 0;
        if (c.phase === 'carry') this.setPhase('release');
        else if (!this.anyFalling()) {
          this.setPhase('done');
          this.finishRound();
        }
      }
    }
    const ax = clamp((tx - c.vx) * 6, -MOVE_ACCEL, MOVE_ACCEL);
    const az = clamp((tz - c.vz) * 6, -MOVE_ACCEL, MOVE_ACCEL);
    c.vx += ax * dt;
    c.vz += az * dt;
    c.x = clamp(c.x + c.vx * dt, 12, W - 12);
    c.z = clamp(c.z + c.vz * dt, 8, D - 8);
    if (c.x <= 12 || c.x >= W - 12) c.vx = 0;
    if (c.z <= 8 || c.z >= D - 8) c.vz = 0;
    this.lastAccelX = ax;
    this.lastAccelZ = az;

    // ---- pendulum swing driven by gantry acceleration ----
    const L = Math.max(30, RAIL_Y - c.y);
    const held = this.held();
    const massF = held ? 1.25 : 1;
    const k = 9.8 * 40 / L;
    c.swingVX += (-k * Math.sin(c.swingX) - (ax / L) * 0.9 * massF - c.swingVX * 1.6) * dt;
    c.swingVZ += (-k * Math.sin(c.swingZ) - (az / L) * 0.9 * massF - c.swingVZ * 1.6) * dt;
    c.swingX = clamp(c.swingX + c.swingVX * dt, -0.6, 0.6);
    c.swingZ = clamp(c.swingZ + c.swingVZ * dt, -0.6, 0.6);

    // ---- claw vertical phases ----
    switch (c.phase) {
      case 'drop': {
        c.open = Math.min(1, c.open + dt * 3);
        const t = this.tip();
        const floorStop = 10;
        let stop = floorStop;
        for (const d of this.dolls) {
          if (d.state !== 'rest') continue;
          const dist = Math.hypot(d.x - t.x, d.z - t.z);
          const top = d.y + dollHeight(d);
          // centered over a doll → prongs rest around its upper body
          if (dist < d.r * 0.75) stop = Math.max(stop, top - d.r * 0.75);
          // prong edges strike a doll that is off-center → nudge it (collision)
          if (!this.touched.has(d.uid) && c.y <= top && dist >= d.r * 0.75 && dist < d.r + SPAN) {
            this.touched.add(d.uid);
            const push = (d.r + SPAN - dist) * 2.2;
            const nx = (d.x - t.x) / (dist || 1);
            const nz = (d.z - t.z) / (dist || 1);
            d.vx += nx * push;
            d.vz += nz * push;
            d.tilt += nx * 0.15;
            this.emit({ type: 'touch', uid: d.uid });
          }
        }
        c.y -= DROP_SPEED * dt;
        if (c.y <= stop) {
          c.y = stop;
          this.setPhase('close');
          this.evaluateClose();
        }
        break;
      }
      case 'close': {
        c.open = Math.max(c.closeTarget, 1 - c.phaseT / CLOSE_TIME);
        if (c.phaseT >= CLOSE_TIME) this.setPhase('lift');
        break;
      }
      case 'lift': {
        c.y = Math.min(REST_Y, c.y + LIFT_SPEED * dt);
        this.checkHold(dt);
        if (c.y >= REST_Y) this.setPhase(c.heldUid != null ? 'carry' : 'return');
        break;
      }
      case 'carry': {
        this.checkHold(dt);
        break;
      }
      case 'release': {
        c.open = Math.min(1, c.open + dt * 2.5);
        if (c.heldUid != null && c.open > 0.45) this.releaseHeld();
        if (c.phaseT > 0.9 && !this.anyFalling()) this.setPhase('return');
        break;
      }
      case 'return':
        c.open = Math.min(1, c.open + dt * 2);
        break;
      default:
        break;
    }

    // keep the held doll in the prongs
    if (held && held.state === 'held') {
      const t = this.tip();
      held.x = t.x;
      held.z = t.z;
      held.y = c.y - dollHeight(held) * 0.62;
      held.tilt = -c.swingX * 1.3;
      held.vx = c.vx + c.swingVX * 30;
      held.vz = c.vz + c.swingVZ * 30;
    }

    this.stepDolls(dt);
  }

  private anyFalling() {
    return this.dolls.some((d) => d.state === 'falling' || d.state === 'chute');
  }

  /** Decide whether the closing prongs actually grip something. */
  private evaluateClose() {
    const c = this.claw;
    const t = this.tip();
    let best: DollBody | null = null;
    let bestDist = Infinity;
    for (const d of this.dolls) {
      if (d.state !== 'rest') continue;
      const dist = Math.hypot(d.x - t.x, d.z - t.z);
      const reach = c.y <= d.y + dollHeight(d) + 4;
      if (reach && dist < d.r + SPAN && dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    if (!best) {
      c.closeTarget = 0;
      this.missReason = 'empty';
      this.emit({ type: 'miss-close', uid: null, alignment: 0, offset: Infinity });
      return;
    }
    const alignment = clamp(1 - bestDist / (best.r + 8), 0, 1);
    const grip = clamp(alignment * this.strength + this.mercy, 0, 1);
    const need = WEIGHT[best.rarity] * 0.4;
    c.grip = grip;
    c.need = need;
    if (grip < need * 0.75) {
      // prongs close on the edge and slide off — the doll gets shoved instead
      c.closeTarget = 0;
      const nx = (best.x - t.x) / (bestDist || 1);
      const nz = (best.z - t.z) / (bestDist || 1);
      best.vx += nx * 60;
      best.vz += nz * 60;
      best.vy = 70;
      best.state = 'falling';
      this.missReason = 'weak';
      this.emit({ type: 'miss-close', uid: best.uid, alignment, offset: bestDist });
      return;
    }
    c.closeTarget = 0.35;
    c.heldUid = best.uid;
    best.state = 'held';
    this.emit({ type: 'grab', uid: best.uid, grip, alignment, offset: bestDist });
  }

  /** Live hold test: swing (from acceleration) adds stress; if stress beats grip, the doll slips. */
  private checkHold(dt: number) {
    const c = this.claw;
    const d = this.held();
    if (!d) return;
    const swing = Math.hypot(c.swingX, c.swingZ);
    const swingStress = Math.min(0.22, swing * 0.55);
    const liftJerk = c.phase === 'lift' && c.phaseT < 0.25 ? 0.05 : 0;
    c.need = WEIGHT[d.rarity] * 0.4 + swingStress + liftJerk;
    void dt;
    if (c.grip < c.need) {
      this.emit({ type: 'slip', uid: d.uid, grip: c.grip, need: c.need });
      this.missReason = 'slip';
      c.heldUid = null;
      c.closeTarget = 0.6;
      d.state = 'falling';
      d.vy = 0;
    }
  }

  private releaseHeld() {
    const d = this.held();
    if (!d) return;
    d.state = 'falling';
    d.vy = 0;
    this.claw.heldUid = null;
  }

  private stepDolls(dt: number) {
    for (const d of this.dolls) {
      d.wobble += dt * 2;
      d.squash = Math.max(0, d.squash - dt * 3);
      if (d.state === 'won' || d.state === 'held') continue;

      if (d.state === 'chute') {
        d.vy -= GRAVITY * dt;
        d.y += d.vy * dt;
        d.x += (CHUTE_CENTER.x - d.x) * Math.min(1, dt * 4);
        d.z += (CHUTE_CENTER.z - d.z) * Math.min(1, dt * 4);
        if (d.y < -dollHeight(d) * 1.6) {
          d.state = 'won';
          this.wonThisRound.push(d.dollId);
          this.emit({ type: 'win', uid: d.uid, dollId: d.dollId });
        }
        continue;
      }

      // horizontal motion + friction
      d.x += d.vx * dt;
      d.z += d.vz * dt;
      const onFloor = d.y <= 0.01 && d.state === 'rest';
      const fr = onFloor ? Math.exp(-dt * 6) : Math.exp(-dt * 0.6);
      d.vx *= fr;
      d.vz *= fr;
      d.tilt *= Math.exp(-dt * 2);

      if (d.state === 'falling') {
        d.vy -= GRAVITY * dt;
        d.y += d.vy * dt;
        // fell into the chute opening?
        if (inChute(d.x, d.z) && d.y < CHUTE.wall) {
          d.state = 'chute';
          continue;
        }
        if (d.y <= 0) {
          const impact = -d.vy;
          d.y = 0;
          if (impact > 90) {
            d.vy = impact * 0.32;
            d.squash = Math.min(1, impact / 300);
            this.emit({ type: 'land', uid: d.uid, impact });
          } else {
            d.vy = 0;
            d.state = 'rest';
            d.squash = Math.min(1, impact / 300);
          }
        }
      }

      // walls
      d.x = clamp(d.x, d.r, W - d.r);
      d.z = clamp(d.z, d.r * 0.5, D - d.r * 0.5);
      // chute acrylic wall keeps floor dolls out
      if (d.y < CHUTE.wall) this.pushOutOfChute(d);
    }
    this.separate(2);
  }

  private pushOutOfChute(d: DollBody) {
    const ex = CHUTE.x1 + d.r * 0.6;
    const ez = CHUTE.z0 - d.r * 0.4;
    if (d.x < ex && d.z > ez) {
      const px = ex - d.x;
      const pz = d.z - ez;
      if (px < pz) {
        d.x = ex;
        d.vx = Math.abs(d.vx) * 0.3;
      } else {
        d.z = ez;
        d.vz = -Math.abs(d.vz) * 0.3;
      }
    }
  }

  /** Soft circle separation between dolls on the floor. */
  private separate(iterations: number) {
    for (let it = 0; it < iterations; it++) {
      for (let i = 0; i < this.dolls.length; i++) {
        const a = this.dolls[i];
        if (a.state === 'held' || a.state === 'won' || a.state === 'chute') continue;
        for (let j = i + 1; j < this.dolls.length; j++) {
          const b = this.dolls[j];
          if (b.state === 'held' || b.state === 'won' || b.state === 'chute') continue;
          if (Math.abs(a.y - b.y) > Math.min(dollHeight(a), dollHeight(b)) * 0.8) continue;
          const dx = b.x - a.x;
          const dz = (b.z - a.z) * 1.4;
          const dist = Math.hypot(dx, dz) || 0.01;
          const min = (a.r + b.r) * 0.85;
          if (dist < min) {
            const p = (min - dist) / 2;
            const nx = dx / dist;
            const nz = dz / dist;
            a.x -= nx * p;
            a.z -= (nz * p) / 1.4;
            b.x += nx * p;
            b.z += (nz * p) / 1.4;
            const rv = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
            if (rv < 0) {
              a.vx += nx * rv * 0.5;
              a.vz += nz * rv * 0.5;
              b.vx -= nx * rv * 0.5;
              b.vz -= nz * rv * 0.5;
            }
          }
        }
      }
    }
  }

  private finishRound() {
    const won = this.wonThisRound.slice();
    this.emit({ type: 'round-end', won, reason: won.length ? null : this.missReason ?? 'empty' });
  }

  /** Remove won dolls and top up the machine with fresh spawns (survivors stay put). */
  restock(spawns: DollSpawn[], seed: number) {
    this.dolls = this.dolls.filter((d) => d.state !== 'won');
    const rnd = mulberry32(seed);
    for (const s of spawns) this.place(s, rnd);
    this.separate(20);
  }

  /** Accelerations from the last step (used for haptics / sfx). */
  get accel() {
    return { x: this.lastAccelX, z: this.lastAccelZ };
  }
}
