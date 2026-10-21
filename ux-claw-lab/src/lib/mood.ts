import type { Mood } from '../store/useGame';
import type { UXIFace } from '../components/UXI';

export interface MoodConfig {
  id: Mood;
  emoji: string;
  label: string;
  plan: string;
  face: UXIFace;
  strength: number; // claw strength multiplier (shown to the player)
  aim: boolean; // show aiming guide
  brief: boolean; // shorter knowledge card
  challengeOptional: boolean;
  preferNew: boolean;
  preferReview: boolean;
}

export const MOODS: MoodConfig[] = [
  { id: 'tired', emoji: '😮‍💨', label: '今天有點累', plan: '夾爪力道 +15%、顯示瞄準線、知識卡精簡版。輕輕鬆鬆就好。', face: 'sleepy', strength: 1.15, aim: true, brief: true, challengeOptional: false, preferNew: false, preferReview: false },
  { id: 'fried', emoji: '🫠', label: '腦袋快當機', plan: '只看一句話重點，挑戰可以跳過。先讓大腦休息。', face: 'sad', strength: 1.1, aim: true, brief: true, challengeOptional: true, preferNew: false, preferReview: false },
  { id: 'learn', emoji: '🌱', label: '想學點新東西', plan: '還沒收集過的娃娃會排在前排，等你來認識。', face: 'happy', strength: 1, aim: true, brief: false, challengeOptional: false, preferNew: true, preferReview: false },
  { id: 'chill', emoji: '☁️', label: '今天只想放空', plan: '純夾娃娃，知識卡一句話帶過，挑戰隨你。', face: 'meh', strength: 1.1, aim: true, brief: true, challengeOptional: true, preferNew: false, preferReview: false },
  { id: 'challenge', emoji: '🔥', label: '想挑戰 UX 能力', plan: '夾爪力道 −10%、不顯示瞄準線，優先出現該複習的娃娃。', face: 'wow', strength: 0.9, aim: false, brief: false, challengeOptional: false, preferNew: false, preferReview: true },
];

export const DEFAULT_MOOD: MoodConfig = { ...MOODS[2], id: 'learn' };
export const moodById = (m: Mood | null | undefined) => MOODS.find((x) => x.id === m) ?? DEFAULT_MOOD;
