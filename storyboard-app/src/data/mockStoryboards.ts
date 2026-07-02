import type { Storyboard } from '../types'

/**
 * Mock 分鏡資料。
 * 真實產品會呼叫 AI API 把使用者的故事拆成起承轉合；
 * 原型階段以三組預先寫好的分鏡表輪替，模擬「重新生成」時的不同結果。
 * 所有場景描述都只包含背景、空間、物件與光影，不出現任何人物。
 */
export const mockStoryboards: Storyboard[] = [
  {
    id: 'rain-window',
    title: '雨停之前',
    beats: [
      {
        stage: '起',
        stageLabel: '起 · Opening',
        summary: '一切從一個安靜的午後開始，日常還未被打擾。',
        sceneDescription: '木質窗框、玻璃上的第一滴雨、窗台上未收的信。',
        mood: '安靜 · 微微不安',
        scene: 'window-rain',
      },
      {
        stage: '承',
        stageLabel: '承 · Development',
        summary: '生活如常推進，只是雨越下越密，話越來越少。',
        sceneDescription: '深夜街道、路燈下被雨打亮的柏油路、遠處店招熄了一半。',
        mood: '綿長 · 壓抑',
        scene: 'street-lamp',
      },
      {
        stage: '轉',
        stageLabel: '轉 · Turn',
        summary: '一句沒說出口的話，讓房間突然空了下來。',
        sceneDescription: '空房間、一把背對窗的椅子、地板上斜長的影子。',
        mood: '失落 · 靜止',
        scene: 'empty-room',
      },
      {
        stage: '合',
        stageLabel: '合 · Resolution',
        summary: '雨停了，門縫透進光，日子重新有了呼吸。',
        sceneDescription: '微開的門、門縫灑進的長條光、走廊盡頭的窗。',
        mood: '釋然 · 微亮',
        scene: 'door-light',
      },
    ],
  },
  {
    id: 'sea-return',
    title: '往海的方向',
    beats: [
      {
        stage: '起',
        stageLabel: '起 · Opening',
        summary: '離開的那天，城市的輪廓在背後越縮越小。',
        sceneDescription: '清晨的城市天際線、樓與樓之間灰白的霧。',
        mood: '疏離 · 出發前的靜',
        scene: 'city-skyline',
      },
      {
        stage: '承',
        stageLabel: '承 · Development',
        summary: '路一直往前，山替換了街景，訊號越來越弱。',
        sceneDescription: '層疊的山稜線、蜿蜒的小徑、電線杆的細影。',
        mood: '孤獨 · 開闊',
        scene: 'mountain-path',
      },
      {
        stage: '轉',
        stageLabel: '轉 · Turn',
        summary: '在長廊的盡頭，才發現一直逃避的其實是自己。',
        sceneDescription: '無人的長廊、規律的柱影、盡頭一扇過曝的亮窗。',
        mood: '對峙 · 屏息',
        scene: 'corridor',
      },
      {
        stage: '合',
        stageLabel: '合 · Resolution',
        summary: '海平線把所有情緒攤平，回程的票安安靜靜躺在口袋。',
        sceneDescription: '無風的海面、一條筆直的海平線、沙灘上退潮的痕跡。',
        mood: '平靜 · 遼闊',
        scene: 'sea-horizon',
      },
    ],
  },
  {
    id: 'old-room',
    title: '搬家那天',
    beats: [
      {
        stage: '起',
        stageLabel: '起 · Opening',
        summary: '紙箱堆到天花板之前，這裡曾經是全世界。',
        sceneDescription: '清空一半的房間、牆上留下相框的淺色方印。',
        mood: '懷舊 · 溫吞',
        scene: 'empty-room',
      },
      {
        stage: '承',
        stageLabel: '承 · Development',
        summary: '一件一件收，回憶比行李更佔位置。',
        sceneDescription: '午後的窗、灰塵在光柱裡漂浮、窗外安靜的巷子。',
        mood: '緩慢 · 捨不得',
        scene: 'window-rain',
      },
      {
        stage: '轉',
        stageLabel: '轉 · Turn',
        summary: '鑰匙交出去的瞬間，門在身後合上了一整段時光。',
        sceneDescription: '關到只剩一線光的門、門把上反射的最後一道夕陽。',
        mood: '斷裂 · 鼻酸',
        scene: 'door-light',
      },
      {
        stage: '合',
        stageLabel: '合 · Resolution',
        summary: '新城市的燈一盞盞亮起，舊故事變成新故事的第一頁。',
        sceneDescription: '入夜的城市輪廓、亮起的窗格、天邊最後一層暮色。',
        mood: '期待 · 微光',
        scene: 'city-skyline',
      },
    ],
  },
]

/** 模擬語音轉文字的結果 */
export const mockTranscript =
  '那年夏天我一個人搬到海邊的小鎮，本來只是想暫住一個月，' +
  '結果在那裡遇見了改變我一生的一封信。' +
  '我猶豫了很久要不要回去，最後在雨停的那個早晨做了決定。'
