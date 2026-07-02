/** 分鏡階段：起 / 承 / 轉 / 合 */
export type Stage = '起' | '承' | '轉' | '合'

/** 黑白線框背景場景的種類（只有空間與物件，沒有人物） */
export type SceneType =
  | 'window-rain' // 窗與雨
  | 'empty-room' // 空房間與椅子
  | 'street-lamp' // 夜街與路燈
  | 'corridor' // 長廊與盡頭的光
  | 'sea-horizon' // 海平線
  | 'door-light' // 微開的門與光
  | 'mountain-path' // 山稜與小徑
  | 'city-skyline' // 城市建築輪廓

/** 單一分鏡格 */
export interface StoryboardBeat {
  stage: Stage
  stageLabel: string // 例如「起 · Opening」
  summary: string // 一句劇情摘要
  sceneDescription: string // 背景畫面描述
  mood: string // 情緒氛圍
  scene: SceneType
}

/** 一份完整的四格分鏡表 */
export interface Storyboard {
  id: string
  title: string
  beats: [StoryboardBeat, StoryboardBeat, StoryboardBeat, StoryboardBeat]
}

/** 輸入模式 */
export type InputMode = 'text' | 'voice'

/** 錄音模擬狀態機 */
export type RecordingState = 'idle' | 'recording' | 'transcribing' | 'done'

/** 整體使用流程狀態 */
export type AppPhase = 'input' | 'generating' | 'result'
