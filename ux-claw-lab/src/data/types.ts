import type { Rarity } from '../game/physics';

export type TopicId =
  | 'basics'
  | 'research'
  | 'journey'
  | 'ia'
  | 'interaction'
  | 'testing'
  | 'a11y'
  | 'psych'
  | 'strategy'
  | 'ai';

export interface Topic {
  id: TopicId;
  en: string;
  zh: string;
  emoji: string;
  color: string; // machine body
  glow: string; // light strip
}

export type BodyShape = 'blob' | 'bean' | 'ghost' | 'cat' | 'drop' | 'bun';

export interface SpotOption {
  label: string;
  correct: boolean;
  why: string;
}

/** Hotspot UI element for the phone mock used by `hotspot` challenges. */
export interface MockEl {
  id: string;
  kind: 'title' | 'text' | 'button' | 'ghost-button' | 'link' | 'input' | 'image' | 'chip' | 'error' | 'banner';
  label: string;
  correct: boolean;
  why: string;
}

export type ChallengeDef =
  | {
      type: 'sort';
      title: string;
      prompt: string;
      buckets: { id: string; label: string; emoji: string }[];
      items: { id: string; label: string; bucket: string }[];
      explain: string;
    }
  | {
      type: 'compare';
      title: string;
      prompt: string;
      mockA: string;
      mockB: string;
      correct: 'a' | 'b';
      reasons: { label: string; correct: boolean }[];
      explain: string;
    }
  | {
      type: 'quotes';
      title: string;
      prompt: string;
      people: { name: string; avatar: string; lines: { id: string; text: string; pain: boolean; why: string }[] }[];
      need: number;
      explain: string;
    }
  | {
      type: 'hotspot';
      title: string;
      prompt: string;
      screen: string;
      els: MockEl[];
      explain: string;
    }
  | { type: 'contrast'; title: string; prompt: string; explain: string }
  | { type: 'fitts'; title: string; prompt: string; explain: string }
  | { type: 'abtest'; title: string; prompt: string; explain: string };

export interface DollDef {
  id: string;
  en: string;
  zh: string;
  dollName: string; // cute plush name
  topic: TopicId;
  rarity: Rarity;
  body: BodyShape;
  color: string;
  accent: string;
  mark: string; // emoji badge on the belly
  oneLiner: string;
  example: string;
  atWork: string; // how to use it at work tomorrow
  spot: { prompt: string; options: SpotOption[] };
  challenge: ChallengeDef;
}
