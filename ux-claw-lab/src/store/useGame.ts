import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DOLLS } from '../data/dolls';
import type { TopicId } from '../data/types';

export type Level = 0 | 1 | 2 | 3;
export type Mood = 'tired' | 'fried' | 'learn' | 'chill' | 'challenge';
export type Screen =
  | 'loading'
  | 'home'
  | 'machine'
  | 'learn'
  | 'collection'
  | 'room'
  | 'progress'
  | 'daily'
  | 'settings'
  | 'brand';

export interface DollProgress {
  dollId: string;
  caught: number;
  level: Level;
  firstAt: number;
  spotOk: number;
  spotTries: number;
  chOk: number;
  chTries: number;
  lastChallengeOk: boolean;
  intervalDays: number;
  nextReview: number;
}

export interface Attempt {
  dollId: string;
  kind: 'spot' | 'challenge';
  ok: boolean;
  at: number;
}

export interface DailyState {
  date: string;
  mood: Mood | null;
  played: boolean;
  learned: boolean;
  challenged: boolean;
  claimed: boolean;
}

export interface Coupon {
  id: string;
  brand: string;
  title: string;
  code: string;
  at: number;
  used: boolean;
}

export interface Settings {
  sfx: number; // 0..1
  haptics: boolean;
  reducedMotion: boolean;
}

export interface RoomState {
  shelf: (string | null)[];
  decor: string[]; // owned
  placed: string[]; // visible
  wall: string;
}

export interface BrandStats {
  impressions: number;
  plays: number;
  completions: number;
  couponsClaimed: number;
  couponsRedeemed: number;
}

/** What the learn flow is currently showing. */
export interface LearnSession {
  dollId: string;
  isNew: boolean;
  isReview: boolean;
  fromMachine: string | null;
  brand?: string;
}

const DAY = 86_400_000;
export const today = (t = Date.now()) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const freshDaily = (): DailyState => ({ date: today(), mood: null, played: false, learned: false, challenged: false, claimed: false });

interface GameState {
  screen: Screen;
  machineTopic: TopicId | 'all' | 'brand';
  coins: number;
  dolls: Record<string, DollProgress>;
  attempts: Attempt[];
  daily: DailyState;
  missStreak: number;
  settings: Settings;
  room: RoomState;
  coupons: Coupon[];
  brandStats: BrandStats;
  learn: LearnSession | null;
  seenIntro: boolean;

  go: (s: Screen) => void;
  openMachine: (topic: TopicId | 'all' | 'brand') => void;
  setMood: (m: Mood) => void;
  ensureToday: () => void;
  registerPlay: (brand: boolean) => void;
  registerMiss: () => void;
  catchDoll: (dollId: string, fromMachine: string, brand?: string) => void;
  bonusCatch: (ids: string[]) => void;
  startReview: (dollId: string) => void;
  answerSpot: (ok: boolean) => void;
  finishChallenge: (ok: boolean) => void;
  endLearn: () => void;
  claimDaily: () => void;
  addCoins: (n: number) => void;
  buyDecor: (id: string, price: number) => boolean;
  toggleDecor: (id: string) => void;
  setShelf: (slot: number, dollId: string | null) => void;
  setWall: (c: string) => void;
  setSettings: (s: Partial<Settings>) => void;
  claimCoupon: (c: Omit<Coupon, 'id' | 'at' | 'used'>) => void;
  redeemCoupon: (id: string) => void;
  brandEvent: (k: keyof BrandStats) => void;
  markIntro: () => void;
  resetAll: () => void;
  loadDemo: () => void;
}

const initial = () => ({
  screen: 'loading' as Screen,
  machineTopic: 'all' as GameState['machineTopic'],
  coins: 30,
  dolls: {} as Record<string, DollProgress>,
  attempts: [] as Attempt[],
  daily: freshDaily(),
  missStreak: 0,
  settings: {
    sfx: 0.7,
    haptics: true,
    reducedMotion: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  },
  room: { shelf: [null, null, null, null, null, null], decor: [], placed: [], wall: '#FBE1D6' },
  coupons: [] as Coupon[],
  brandStats: { impressions: 0, plays: 0, completions: 0, couponsClaimed: 0, couponsRedeemed: 0 },
  learn: null as LearnSession | null,
  seenIntro: false,
});

/** Mastery is derived from performance, never from play count. */
export function computeLevel(p: DollProgress): Level {
  if (p.caught === 0 && p.spotTries === 0) return 0;
  if (p.spotOk > 0 && p.chOk > 0 && p.lastChallengeOk) return 3;
  if (p.spotOk > 0 || p.chOk > 0) return 2;
  return 1;
}

function blank(dollId: string): DollProgress {
  return {
    dollId,
    caught: 0,
    level: 0,
    firstAt: Date.now(),
    spotOk: 0,
    spotTries: 0,
    chOk: 0,
    chTries: 0,
    lastChallengeOk: false,
    intervalDays: 0,
    nextReview: 0,
  };
}

/** Expanding-interval spaced repetition: 1d → 2.5d → 6d … ; a miss brings it back tomorrow. */
function schedule(p: DollProgress, ok: boolean): DollProgress {
  const intervalDays = ok ? (p.intervalDays ? Math.min(60, p.intervalDays * 2.5) : 1) : 0.5;
  return { ...p, intervalDays, nextReview: Date.now() + intervalDays * DAY };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial(),

      go: (screen) => set({ screen }),
      openMachine: (machineTopic) => set({ machineTopic, screen: 'machine' }),
      ensureToday: () => {
        if (get().daily.date !== today()) set({ daily: freshDaily() });
      },
      setMood: (mood) => {
        get().ensureToday();
        set((s) => ({ daily: { ...s.daily, mood } }));
      },
      registerPlay: (brand) => {
        get().ensureToday();
        set((s) => ({
          daily: { ...s.daily, played: true },
          brandStats: brand ? { ...s.brandStats, plays: s.brandStats.plays + 1 } : s.brandStats,
        }));
      },
      registerMiss: () => set((s) => ({ missStreak: s.missStreak + 1 })),
      catchDoll: (dollId, fromMachine, brand) => {
        const prev = get().dolls[dollId];
        const isNew = !prev || prev.caught === 0;
        const p = { ...(prev ?? blank(dollId)) };
        p.caught += 1;
        if (isNew) p.firstAt = Date.now();
        // a new doll officially joins the collection once its card task is attempted (answerSpot)
        set((s) => ({
          dolls: { ...s.dolls, [dollId]: p },
          coins: s.coins + (isNew ? 5 : 2),
          missStreak: 0,
          learn: { dollId, isNew, isReview: !isNew, fromMachine, brand },
          screen: 'learn',
          brandStats: brand ? { ...s.brandStats, completions: s.brandStats.completions + 1 } : s.brandStats,
        }));
      },
      bonusCatch: (ids) =>
        set((s) => {
          const dolls = { ...s.dolls };
          for (const id of ids) {
            const p = { ...(dolls[id] ?? blank(id)) };
            p.caught += 1;
            p.level = Math.max(1, computeLevel(p)) as Level;
            dolls[id] = p;
          }
          return { dolls, coins: s.coins + ids.length * 3 };
        }),
      startReview: (dollId) => set({ learn: { dollId, isNew: false, isReview: true, fromMachine: null }, screen: 'learn' }),
      answerSpot: (ok) => {
        const l = get().learn;
        if (!l) return;
        get().ensureToday();
        set((s) => {
          let p = { ...(s.dolls[l.dollId] ?? blank(l.dollId)) };
          p.spotTries += 1;
          if (ok) p.spotOk += 1;
          p = schedule(p, ok);
          p.level = computeLevel(p);
          return {
            dolls: { ...s.dolls, [l.dollId]: p },
            attempts: [...s.attempts, { dollId: l.dollId, kind: 'spot' as const, ok, at: Date.now() }].slice(-400),
            coins: s.coins + (ok ? 3 : 1),
            daily: { ...s.daily, learned: true },
          };
        });
      },
      finishChallenge: (ok) => {
        const l = get().learn;
        if (!l) return;
        get().ensureToday();
        set((s) => {
          let p = { ...(s.dolls[l.dollId] ?? blank(l.dollId)) };
          p.chTries += 1;
          if (ok) p.chOk += 1;
          p.lastChallengeOk = ok;
          p = schedule(p, ok);
          p.level = computeLevel(p);
          return {
            dolls: { ...s.dolls, [l.dollId]: p },
            attempts: [...s.attempts, { dollId: l.dollId, kind: 'challenge' as const, ok, at: Date.now() }].slice(-400),
            coins: s.coins + (ok ? 6 : 2),
            daily: { ...s.daily, challenged: true },
          };
        });
      },
      endLearn: () => {
        const l = get().learn;
        set({ learn: null, screen: l?.fromMachine ? 'machine' : 'collection' });
      },
      claimDaily: () => {
        const d = get().daily;
        if (d.claimed || !(d.played && d.learned && d.challenged)) return;
        set((s) => ({ daily: { ...s.daily, claimed: true }, coins: s.coins + 20 }));
      },
      addCoins: (n) => set((s) => ({ coins: s.coins + n })),
      buyDecor: (id, price) => {
        const s = get();
        if (s.room.decor.includes(id) || s.coins < price) return false;
        set({ coins: s.coins - price, room: { ...s.room, decor: [...s.room.decor, id], placed: [...s.room.placed, id] } });
        return true;
      },
      toggleDecor: (id) =>
        set((s) => ({
          room: {
            ...s.room,
            placed: s.room.placed.includes(id) ? s.room.placed.filter((x) => x !== id) : [...s.room.placed, id],
          },
        })),
      setShelf: (slot, dollId) =>
        set((s) => {
          const shelf = s.room.shelf.map((x) => (x === dollId ? null : x));
          shelf[slot] = dollId;
          return { room: { ...s.room, shelf } };
        }),
      setWall: (wall) => set((s) => ({ room: { ...s.room, wall } })),
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),
      claimCoupon: (c) =>
        set((s) => ({
          coupons: [...s.coupons, { ...c, id: Math.random().toString(36).slice(2, 9), at: Date.now(), used: false }],
          brandStats: { ...s.brandStats, couponsClaimed: s.brandStats.couponsClaimed + 1 },
        })),
      redeemCoupon: (id) =>
        set((s) => ({
          coupons: s.coupons.map((c) => (c.id === id ? { ...c, used: true } : c)),
          brandStats: { ...s.brandStats, couponsRedeemed: s.brandStats.couponsRedeemed + 1 },
        })),
      brandEvent: (k) => set((s) => ({ brandStats: { ...s.brandStats, [k]: s.brandStats[k] + 1 } })),
      markIntro: () => set({ seenIntro: true }),
      resetAll: () => set({ ...initial(), screen: 'home' }),
      loadDemo: () => {
        const now = Date.now();
        const dolls: Record<string, DollProgress> = {};
        const attempts: Attempt[] = [];
        DOLLS.slice(0, 8).forEach((d, i) => {
          const spotOk = i < 6 ? 1 : 0;
          const chOk = i < 4 ? 1 : 0;
          const p: DollProgress = {
            ...blank(d.id),
            caught: 1 + (i % 3),
            firstAt: now - (7 - (i % 7)) * DAY,
            spotOk,
            spotTries: 1 + (i % 2),
            chOk,
            chTries: chOk ? 1 : i < 6 ? 1 : 0,
            lastChallengeOk: chOk > 0,
            intervalDays: 1,
            nextReview: i % 3 === 0 ? now - DAY : now + 2 * DAY,
          };
          p.level = computeLevel(p);
          dolls[d.id] = p;
          for (let k = 0; k < p.spotTries; k++)
            attempts.push({ dollId: d.id, kind: 'spot', ok: k < spotOk, at: now - ((i + k) % 7) * DAY });
          for (let k = 0; k < p.chTries; k++)
            attempts.push({ dollId: d.id, kind: 'challenge', ok: k < chOk, at: now - ((i + k + 1) % 7) * DAY });
        });
        set({
          ...initial(),
          screen: 'home',
          seenIntro: true,
          coins: 120,
          dolls,
          attempts,
          room: { shelf: ['a11y', 'empathy', 'persona', null, null, null], decor: ['lamp', 'plant'], placed: ['lamp', 'plant'], wall: '#FFF0C8' },
          brandStats: { impressions: 1280, plays: 342, completions: 211, couponsClaimed: 96, couponsRedeemed: 41 },
        });
      },
    }),
    {
      name: 'ux-claw-lab-v1',
      partialize: (s) => {
        // never persist transient navigation state
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { screen, learn, machineTopic, ...rest } = s;
        void screen;
        void learn;
        void machineTopic;
        return rest;
      },
    },
  ),
);

export const collectedCount = (d: Record<string, DollProgress>) => Object.values(d).filter((p) => p.level > 0).length;
export const dueForReview = (d: Record<string, DollProgress>) =>
  Object.values(d).filter((p) => p.level > 0 && (p.nextReview <= Date.now() || !p.lastChallengeOk));

/** UXI outfits unlock with *demonstrated* knowledge. */
export const OUTFITS = [
  { id: 'none', label: '原味 UXI', need: '初始造型', test: () => true },
  { id: 'headphones', label: '研究員耳機', need: '收集 3 隻娃娃', test: (d: Record<string, DollProgress>) => collectedCount(d) >= 3 },
  { id: 'scarf', label: '理解者圍巾', need: '3 隻娃娃達到 Lv2', test: (d: Record<string, DollProgress>) => Object.values(d).filter((p) => p.level >= 2).length >= 3 },
  { id: 'cap', label: '實戰派棒球帽', need: '3 隻娃娃達到 Lv3', test: (d: Record<string, DollProgress>) => Object.values(d).filter((p) => p.level >= 3).length >= 3 },
  { id: 'crown', label: 'UX 大師皇冠', need: '12 隻全部 Lv3', test: (d: Record<string, DollProgress>) => DOLLS.every((x) => d[x.id]?.level === 3) },
] as const;

export const bestOutfit = (d: Record<string, DollProgress>) => {
  let best: string = 'none';
  for (const o of OUTFITS) if (o.test(d)) best = o.id;
  return best;
};
