const cleanStory = (storyText) => storyText.trim().replace(/\s+/g, ' ');

const getStoryHint = (storyText) => {
  const normalized = cleanStory(storyText);

  if (!normalized) {
    return '一段尚未命名的私人故事';
  }

  return normalized.length > 42 ? `${normalized.slice(0, 42)}…` : normalized;
};

/**
 * Mock storyboard generator.
 * This shape is intentionally API-like so it can be replaced with an OpenAI call later.
 */
export function generateStoryboard(storyText) {
  const storyHint = getStoryHint(storyText);

  return [
    {
      stage: '起',
      title: '起｜回到熟悉的房間',
      description: `故事從一個安靜空間展開，記憶像光線一樣落在桌面上：${storyHint}`,
      visualPrompt: 'black and white storyboard wireframe, empty room, window, desk, chair, no character, no face',
    },
    {
      stage: '承',
      title: '承｜走廊裡的停頓',
      description: '情緒被拉長，門與相框暗示過去的關係，空間保留尚未說出口的重量。',
      visualPrompt: 'black and white storyboard wireframe, hallway, doors, wall frames, quiet atmosphere, no people',
    },
    {
      stage: '轉',
      title: '轉｜雨中的轉角',
      description: '外部世界突然介入，雨線、路燈與遠方建築形成衝突出現前的壓迫感。',
      visualPrompt: 'black and white storyboard wireframe, rainy street, street lamp, distant buildings, cinematic tension, no protagonist',
    },
    {
      stage: '合',
      title: '合｜窗邊留下的餘光',
      description: '故事收束在安靜窗邊，空椅子與斜落光線留下開放式餘韻。',
      visualPrompt: 'black and white storyboard wireframe, quiet window, light beams, empty chair, soft ending, background only',
    },
  ];
}

// Future extension point:
// Replace generateStoryboard with an async service that calls OpenAI Responses API
// and preserves the returned [{ stage, title, description, visualPrompt }] contract.
