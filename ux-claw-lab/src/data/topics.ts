import type { Topic, TopicId } from './types';

export const TOPICS: Topic[] = [
  { id: 'basics', en: 'UX Basics', zh: 'UX 基礎概念', emoji: '🧸', color: '#FFA9C5', glow: '#FFE49A' },
  { id: 'research', en: 'User Research', zh: '使用者研究', emoji: '🔍', color: '#A9D9F8', glow: '#FFF9F0' },
  { id: 'journey', en: 'User Journey', zh: '使用者旅程', emoji: '🗺️', color: '#B7E8D0', glow: '#FFA9C5' },
  { id: 'ia', en: 'Information Architecture', zh: '資訊架構', emoji: '🗂️', color: '#FFE49A', glow: '#A9D9F8' },
  { id: 'interaction', en: 'Interaction Design', zh: '互動設計', emoji: '👆', color: '#C9B8F5', glow: '#B7E8D0' },
  { id: 'testing', en: 'Usability Testing', zh: '易用性測試', emoji: '🧪', color: '#FFC9A9', glow: '#FFF9F0' },
  { id: 'a11y', en: 'Accessibility', zh: '無障礙與共融設計', emoji: '♿', color: '#9FDCE0', glow: '#FFE49A' },
  { id: 'psych', en: 'UX Psychology', zh: '使用者心理學', emoji: '🧠', color: '#F5B8E0', glow: '#A9D9F8' },
  { id: 'strategy', en: 'UX Strategy', zh: 'UX 策略與商業價值', emoji: '📈', color: '#D6E3A0', glow: '#FFA9C5' },
  { id: 'ai', en: 'AI × UX', zh: 'AI 與使用者體驗', emoji: '🤖', color: '#B5C3E8', glow: '#B7E8D0' },
];

export const topicById = (id: TopicId) => TOPICS.find((t) => t.id === id)!;
