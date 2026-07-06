import type { Storyboard } from '../types'

/**
 * Mock 分鏡資料（示範模式）。
 * 未設定 API key 時，以三組預寫的「長輩回憶」分鏡表輪替，
 * 模擬把口述回憶轉換成四幕藝術品的效果。
 * 所有場景描述都只包含背景、空間、物件與光影，不出現任何人物。
 */
export const mockStoryboards: Storyboard[] = [
  {
    id: 'sewing-machine',
    title: '裁縫車的歌',
    beats: [
      {
        stage: '起',
        stageLabel: '起 · Opening',
        summary: '十八歲那年嫁過來，嫁妝是一台黑亮的裁縫車。',
        sceneDescription: '老屋窗邊的裁縫車、疊得整齊的花布、午後斜斜的光。',
        mood: '青澀 · 帶著期待',
        scene: 'window-rain',
      },
      {
        stage: '承',
        stageLabel: '承 · Development',
        summary: '一腳一腳踩出全家的衣裳，踩過幾十個年頭。',
        sceneDescription: '牆上掛滿紙樣與軟尺、桌上的粉餅劃線、窗外換了季節的樹影。',
        mood: '勤懇 · 溫火慢燉',
        scene: 'empty-room',
      },
      {
        stage: '轉',
        stageLabel: '轉 · Turn',
        summary: '孩子一個個離家，裁縫車慢慢安靜了下來。',
        sceneDescription: '蓋上防塵布的裁縫車、空了一半的衣櫃、走廊盡頭亮著的一盞燈。',
        mood: '安靜 · 微微失落',
        scene: 'corridor',
      },
      {
        stage: '合',
        stageLabel: '合 · Resolution',
        summary: '如今孫女學會踩踏板，老歌又在屋裡響起。',
        sceneDescription: '重新掀開布的裁縫車、門縫灑進的晨光、椅上一塊縫到一半的新花布。',
        mood: '欣慰 · 延續',
        scene: 'door-light',
      },
    ],
  },
  {
    id: 'noodle-stall',
    title: '巷口麵香',
    beats: [
      {
        stage: '起',
        stageLabel: '起 · Opening',
        summary: '和老伴推著攤車，在巷口支起第一鍋熱湯。',
        sceneDescription: '清晨的窄巷、攤車上的白鐵鍋、剛升起的炊煙與路燈餘光。',
        mood: '打拚 · 熱氣騰騰',
        scene: 'street-lamp',
      },
      {
        stage: '承',
        stageLabel: '承 · Development',
        summary: '一碗麵五毛錢，養大了三個孩子。',
        sceneDescription: '掛在攤前的價目木牌、疊高的空碗、雨棚下滴著水的簷角。',
        mood: '知足 · 忙碌',
        scene: 'window-rain',
      },
      {
        stage: '轉',
        stageLabel: '轉 · Turn',
        summary: '都市更新那年，巷子拆了，攤車進了倉庫。',
        sceneDescription: '圍起的工地擋板、遠處新起的大樓輪廓、堆在角落蒙塵的攤車。',
        mood: '不捨 · 時代更迭',
        scene: 'city-skyline',
      },
      {
        stage: '合',
        stageLabel: '合 · Resolution',
        summary: '兒子把那口鍋擺進新店裡，湯頭還是那個味。',
        sceneDescription: '亮著暖燈的新店門口、玻璃窗上的老店名、灶上冒著熟悉的蒸氣。',
        mood: '傳承 · 暖',
        scene: 'door-light',
      },
    ],
  },
  {
    id: 'homebound-train',
    title: '回鄉的火車',
    beats: [
      {
        stage: '起',
        stageLabel: '起 · Opening',
        summary: '十六歲離開山裡的家，到城裡當學徒。',
        sceneDescription: '層層山稜間的小路、肩挑行李留下的腳印小徑、清晨的薄霧。',
        mood: '忐忑 · 少年遠行',
        scene: 'mountain-path',
      },
      {
        stage: '承',
        stageLabel: '承 · Development',
        summary: '城裡的日子一晃三十年，鄉音藏進了口袋。',
        sceneDescription: '入夜亮起的城市天際線、宿舍窗格透出的一盞燈、屋頂之間的月台鐘。',
        mood: '打拚 · 想家',
        scene: 'city-skyline',
      },
      {
        stage: '轉',
        stageLabel: '轉 · Turn',
        summary: '接到母親病重的電報，連夜搭上回鄉的火車。',
        sceneDescription: '深夜月台的長廊、一排空蕩的候車椅、號誌燈在雨裡明明滅滅。',
        mood: '焦急 · 夜雨',
        scene: 'corridor',
      },
      {
        stage: '合',
        stageLabel: '合 · Resolution',
        summary: '天亮時山出現在車窗外，到家了。',
        sceneDescription: '車窗外連綿的山稜線、田埂上的晨光、遠處炊煙升起的老屋頂。',
        mood: '平靜 · 歸屬',
        scene: 'sea-horizon',
      },
    ],
  },
]

/** 模擬語音轉文字的結果（長輩口述） */
export const mockTranscript =
  '我十八歲嫁過來的時候，阿母給我一台裁縫車做嫁妝。' +
  '那時候全家的衣服都是我一針一線做的，' +
  '後來孩子大了、搬出去了，裁縫車就蓋起來了。' +
  '前陣子孫女說想學，我把布掀開，機器還會動呢。'
