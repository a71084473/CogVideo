import Anthropic from '@anthropic-ai/sdk'
import type { SceneType, Stage, Storyboard, StoryboardBeat } from '../types'

/**
 * 呼叫 Claude API，把使用者的故事真實拆解成起承轉合四格分鏡。
 * - 瀏覽器直連（dangerouslyAllowBrowser）：API key 只存在使用者的 localStorage，
 *   不經過任何我們的伺服器。正式產品應改為後端代理以保護金鑰。
 * - 以 structured outputs（output_config.format）強制回傳符合 Storyboard 的 JSON。
 */

const SCENE_TYPES: SceneType[] = [
  'window-rain',
  'empty-room',
  'street-lamp',
  'corridor',
  'sea-horizon',
  'door-light',
  'mountain-path',
  'city-skyline',
]

const STAGES: Stage[] = ['起', '承', '轉', '合']

const STAGE_LABELS: Record<Stage, string> = {
  起: '起 · Opening',
  承: '承 · Development',
  轉: '轉 · Turn',
  合: '合 · Resolution',
}

/** 場景種類與其畫面內容的對照，讓模型能挑出最貼切的線框場景 */
const SCENE_GUIDE = `
- window-rain：窗框、玻璃上的雨滴、窗台（室內望外的安靜、等待、憂鬱）
- empty-room：空房間、一把椅子、地板影子（失去、留白、回憶）
- street-lamp：夜街、路燈、光暈、遠景建築（孤獨、徘徊、都市夜晚）
- corridor：一點透視長廊、柱影、盡頭亮窗（對峙、抉擇、通往未知）
- sea-horizon：海平線、波紋、退潮痕（平靜、遼闊、釋放）
- door-light：微開的門、門縫灑進的光（轉機、告別、新的開始）
- mountain-path：山稜線、蜿蜒小徑、電線杆（旅程、遠行、開闊的孤獨）
- city-skyline：城市天際線、亮起的窗格（出發、疏離、新生活）`

const SYSTEM_PROMPT = `你是一位溫柔的電影分鏡師，服務的對象是長輩（可能患有失智症），他們會口述一段人生回憶。你要把這段回憶拆解成「起、承、轉、合」四幕分鏡，做成一件幫助喚起記憶的藝術品。

嚴格規則：
1. 恰好四格，依序對應 stage：「起」「承」「轉」「合」。
2. summary：一句劇情摘要，20 字以內。語氣溫暖、肯定、懷舊，務必保留長輩口述中的具體細節——年份、地名、老物件、稱謂（阿母、老伴）都是喚起記憶的鑰匙，不要改寫成籠統的句子。
3. sceneDescription：背景畫面描述，著重「感官記憶」——光線、天氣、聲音的來源、老物件的質地。只能出現空間、物件、光影與天氣——絕對不能出現人物、主角、臉、身體、手、剪影或任何角色。用「蓋上布的裁縫車」「疊高的空碗」「門縫的光」這類物件與空間暗示人的存在。
4. mood：情緒氛圍，格式如「安靜 · 微微不安」。避免過於負面沉重的詞，轉折處可以有失落，但整體朝溫暖收尾。
5. scene：從下列八種線框場景中挑選最貼切的一種（可重複使用）：${SCENE_GUIDE}
6. title：給這件作品一個 2–6 字的詩意片名，最好取自回憶中的關鍵物件或地點。
7. 口述可能片段、跳躍或重複，這很正常——溫柔地把它整理成有頭有尾的四幕，不要指出任何矛盾。
8. 全部使用繁體中文。`

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    beats: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage: { type: 'string', enum: STAGES },
          summary: { type: 'string' },
          sceneDescription: { type: 'string' },
          mood: { type: 'string' },
          scene: { type: 'string', enum: SCENE_TYPES },
        },
        required: ['stage', 'summary', 'sceneDescription', 'mood', 'scene'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'beats'],
  additionalProperties: false,
} as const

interface RawBeat {
  stage: Stage
  summary: string
  sceneDescription: string
  mood: string
  scene: SceneType
}

interface RawStoryboard {
  title: string
  beats: RawBeat[]
}

export async function generateStoryboardFromStory(
  story: string,
  apiKey: string,
  attempt = 0,
): Promise<Storyboard> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const userPrompt =
    attempt === 0
      ? `請把以下長輩口述的回憶拆成起承轉合四幕分鏡：\n\n${story}`
      : `請把以下長輩口述的回憶拆成起承轉合四幕分鏡。這是第 ${attempt + 1} 次生成，` +
        `請採用與先前不同的詮釋角度（不同的場景選擇、不同的情緒切入點）：\n\n${story}`

  let response: Anthropic.Message
  try {
    response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      messages: [{ role: 'user', content: userPrompt }],
    })
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new Error('API key 無效，請確認後重新輸入。')
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new Error('請求太頻繁，請稍候幾秒再試。')
    }
    if (err instanceof Anthropic.APIConnectionError) {
      throw new Error('無法連線到 Claude API，請檢查網路。')
    }
    if (err instanceof Anthropic.APIError) {
      throw new Error(`Claude API 錯誤（${err.status ?? '未知'}）：${err.message}`)
    }
    throw err
  }

  if (response.stop_reason === 'refusal') {
    throw new Error('這段內容無法生成分鏡，請調整故事內容後再試一次。')
  }

  const text = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text',
  )?.text
  if (!text) {
    throw new Error('Claude 沒有回傳分鏡內容，請再試一次。')
  }

  const raw = JSON.parse(text) as RawStoryboard
  return toStoryboard(raw)
}

/** 驗證並整形為畫面用的 Storyboard（schema 無法限制陣列長度，這裡補驗證） */
function toStoryboard(raw: RawStoryboard): Storyboard {
  const beats = STAGES.map((stage, i) => {
    const beat = raw.beats.find((b) => b.stage === stage) ?? raw.beats[i]
    if (!beat) {
      throw new Error('生成結果缺少分鏡格，請重新生成一次。')
    }
    const scene = SCENE_TYPES.includes(beat.scene) ? beat.scene : SCENE_TYPES[i]
    return {
      stage,
      stageLabel: STAGE_LABELS[stage],
      summary: beat.summary,
      sceneDescription: beat.sceneDescription,
      mood: beat.mood,
      scene,
    } satisfies StoryboardBeat
  }) as Storyboard['beats']

  return {
    id: `generated-${Date.now()}`,
    title: raw.title,
    beats,
  }
}
