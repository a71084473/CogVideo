import { describe, expect, it } from 'vitest';
import { ClawEngine, EngineEvent, START } from './physics';

function run(engine: ClawEngine, target: { x: number; z: number }) {
  const events: EngineEvent[] = [];
  engine.on((e) => events.push(e));
  // steer toward target with the analog stick, like a player would
  for (let i = 0; i < 600; i++) {
    const t = engine.tip();
    const dx = target.x - t.x;
    const dz = target.z - t.z;
    const settled = Math.abs(dx) < 0.5 && Math.abs(dz) < 0.5 && Math.hypot(engine.claw.vx, engine.claw.vz) < 1 && Math.abs(engine.claw.swingVX) < 0.01;
    if (settled) break;
    engine.step(1 / 60, { x: Math.max(-1, Math.min(1, dx / 20)), z: Math.max(-1, Math.min(1, dz / 12)) });
  }
  engine.drop();
  for (let i = 0; i < 60 * 20 && engine.claw.phase !== 'done'; i++) engine.step(1 / 60);
  return events;
}

describe('ClawEngine', () => {
  it('wins when the claw is centred on a doll', () => {
    const e = new ClawEngine([{ dollId: 'empathy', rarity: 'common' }], 7);
    const d = e.dolls[0];
    const events = run(e, { x: d.x, z: d.z });
    expect(events.some((ev) => ev.type === 'grab')).toBe(true);
    const end = events.find((ev) => ev.type === 'round-end');
    expect(end && end.type === 'round-end' && end.won).toEqual(['empathy']);
  });

  it('misses when dropped on empty floor', () => {
    const e = new ClawEngine([{ dollId: 'empathy', rarity: 'common' }], 7);
    const d = e.dolls[0];
    const far = { x: d.x > 150 ? 100 : 250, z: d.z > 60 ? 20 : 100 };
    const events = run(e, far);
    const end = events.find((ev) => ev.type === 'round-end');
    expect(end && end.type === 'round-end' && end.won).toEqual([]);
  });

  it('a poorly aligned grab does not hold the doll', () => {
    const e = new ClawEngine([{ dollId: 'a11y', rarity: 'legendary' }], 3);
    const d = e.dolls[0];
    const events = run(e, { x: d.x + d.r * 0.9, z: d.z });
    const end = events.find((ev) => ev.type === 'round-end');
    expect(end && end.type === 'round-end' && end.won).toEqual([]);
    expect(events.some((ev) => ev.type === 'miss-close' || ev.type === 'slip')).toBe(true);
  });

  it('is deterministic for the same seed', () => {
    const a = new ClawEngine([{ dollId: 'x', rarity: 'common' }, { dollId: 'y', rarity: 'rare' }], 42);
    const b = new ClawEngine([{ dollId: 'x', rarity: 'common' }, { dollId: 'y', rarity: 'rare' }], 42);
    expect(a.dolls.map((d) => [d.x, d.z])).toEqual(b.dolls.map((d) => [d.x, d.z]));
    expect(a.claw.x).toBe(START.x);
  });
});
