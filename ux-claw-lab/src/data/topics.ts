import type { Topic, TopicId } from './types';

export const TOPICS: Topic[] = [
  { id: 'basics', en: 'UX Basics', zh: 'UX 基礎概念', emoji: '🧸', color: '#FFCE55', glow: '#FFF4E0' },
  { id: 'research', en: 'User Research', zh: '使用者研究', emoji: '🔍', color: '#E9A29B', glow: '#FFE3B8' },
  { id: 'journey', en: 'User Journey', zh: '使用者旅程', emoji: '🗺️', color: '#BFDDA0', glow: '#FFF4E0' },
  { id: 'ia', en: 'Information Architecture', zh: '資訊架構', emoji: '🗂️', color: '#F2B66A', glow: '#FFF4E0' },
  { id: 'interaction', en: 'Interaction Design', zh: '互動設計', emoji: '👆', color: '#D7A9C9', glow: '#FFE3B8' },
  { id: 'testing', en: 'Usability Testing', zh: '易用性測試', emoji: '🧪', color: '#F0C4A0', glow: '#FFF4E0' },
  { id: 'a11y', en: 'Accessibility', zh: '無障礙與共融設計', emoji: '♿', color: '#C9D98A', glow: '#FFE3B8' },
  { id: 'psych', en: 'UX Psychology', zh: '使用者心理學', emoji: '🧠', color: '#D99A8F', glow: '#FFE3B8' },
  { id: 'strategy', en: 'UX Strategy', zh: 'UX 策略與商業價值', emoji: '📈', color: '#E3C27A', glow: '#FFF4E0' },
  { id: 'ai', en: 'AI × UX', zh: 'AI 與使用者體驗', emoji: '🤖', color: '#C9B49E', glow: '#FFE3B8' },
];

export const topicById = (id: TopicId) => TOPICS.find((t) => t.id === id)!;
