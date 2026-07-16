// 生活適配測驗題目(一步一題,每題附「為什麼需要詢問」)

export interface QuizOption {
  value: string
  label: string
}

export interface QuizQuestion {
  id: string
  section: string
  question: string
  whyWeAsk: string // 為什麼需要詢問
  options: QuizOption[]
  multi?: boolean
  sensitive?: boolean // 敏感資料,額外說明用途與保存
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'motivation',
    section: '認養動機與期待',
    question: '你目前想認養的主要原因是什麼?',
    whyWeAsk: '了解你的期待,能幫我們推薦真正符合想像的夥伴,減少落差感。沒有標準答案。',
    options: [
      { value: 'companion', label: '想要生活中有個陪伴' },
      { value: 'family', label: '想讓家人(或現有寵物)多個成員' },
      { value: 'help', label: '想幫助需要家的動物' },
      { value: 'specific', label: '已經遇到心動的特定動物' },
    ],
  },
  {
    id: 'expectation',
    section: '認養動機與期待',
    question: '如果牠來到家裡三個月後,仍然不主動靠近你,你會?',
    whyWeAsk: '每隻動物親人的速度不同。這題幫助我們校準期待,推薦互動風格適合你的夥伴。',
    options: [
      { value: 'wait', label: '沒關係,我願意繼續給牠時間' },
      { value: 'learn', label: '會有點失落,但願意學習方法慢慢建立關係' },
      { value: 'hard', label: '可能會覺得辛苦——我比較希望互動快一點的夥伴' },
    ],
  },
  {
    id: 'housing',
    section: '居住狀況',
    question: '你目前的居住型態是?',
    whyWeAsk: '不同居住空間適合不同活動量的動物。租屋也完全可以認養,我們只是需要一起確認一件事:房東是否同意。',
    sensitive: true,
    options: [
      { value: 'own', label: '自有住宅' },
      { value: 'rent-ok', label: '租屋,房東已同意養寵物' },
      { value: 'rent-unknown', label: '租屋,還不確定房東是否同意' },
      { value: 'family', label: '與家人同住' },
    ],
  },
  {
    id: 'cohabitants',
    section: '居住狀況',
    question: '同住的家人或室友,對養寵物的態度是?',
    whyWeAsk: '同住者的支持是動物穩定生活的重要條件。若還在溝通中,我們也有資源可以幫上忙。',
    options: [
      { value: 'agree', label: '都同意,而且有人願意一起照顧' },
      { value: 'ok', label: '同意,但主要由我照顧' },
      { value: 'talking', label: '還在溝通中' },
      { value: 'alone', label: '我自己住' },
    ],
  },
  {
    id: 'work',
    section: '工作與時間',
    question: '平日牠平均會獨處多久?',
    whyWeAsk: '有些動物享受獨處,有些需要陪伴。誠實回答能找到作息合拍的夥伴——長工時不是扣分項。',
    options: [
      { value: 'lt6', label: '6 小時以內' },
      { value: '6to9', label: '6–9 小時' },
      { value: '9to12', label: '9–12 小時' },
      { value: 'gt12', label: '12 小時以上或日夜輪班' },
    ],
  },
  {
    id: 'travel',
    section: '工作與時間',
    question: '你出差或旅行的頻率大約是?',
    whyWeAsk: '出差不影響認養資格。我們想一起確認的是:你不在家時,誰能暫時照顧牠。',
    options: [
      { value: 'rare', label: '很少,一年幾次以內' },
      { value: 'monthly', label: '每月 1–2 次短期' },
      { value: 'often', label: '頻繁,每月多次或長期外派可能' },
    ],
  },
  {
    id: 'experience',
    section: '經驗與學習',
    question: '你過去照顧貓狗的經驗是?',
    whyWeAsk: '沒有經驗不代表不適合,願意學習更重要。這題只是幫我們推薦適合的夥伴與教學資源。',
    options: [
      { value: 'much', label: '長期養過,有完整經驗' },
      { value: 'some', label: '照顧過家人朋友的寵物' },
      { value: 'none-learn', label: '完全沒有,但願意上課與學習' },
      { value: 'none', label: '完全沒有,也還不確定要投入多少' },
    ],
  },
  {
    id: 'budget',
    section: '醫療與支出準備',
    question: '每月可以為牠準備的照護預算大約是?',
    whyWeAsk: '這不是財力審查。不同動物的花費差異很大,我們想推薦支出在你舒適範圍內的夥伴。',
    sensitive: true,
    options: [
      { value: 'lt2000', label: 'NT$2,000 以內' },
      { value: '2to4', label: 'NT$2,000–4,000' },
      { value: 'gt4000', label: 'NT$4,000 以上' },
    ],
  },
  {
    id: 'emergency',
    section: '醫療與支出準備',
    question: '如果牠突然需要一筆 NT$10,000–30,000 的醫療費,你目前的準備是?',
    whyWeAsk: '突發醫療是退養最常見的原因之一。提早想過這題,就能提早準備——還沒準備好也沒關係,我們會提供做法。',
    sensitive: true,
    options: [
      { value: 'ready', label: '有預備金或寵物保險,可以應付' },
      { value: 'partial', label: '可以分期或調度,但會有壓力' },
      { value: 'none', label: '還沒有想過,想了解怎麼準備' },
    ],
  },
  {
    id: 'backup',
    section: '備援計畫',
    question: '如果你生病住院或臨時無法照顧,有沒有可以接手幾天的人?',
    whyWeAsk: '第二照顧者是讓牠安全的保險絲。還沒有也沒關係,這是可以準備的項目,不是門檻。',
    options: [
      { value: 'yes', label: '有,家人或朋友可以接手' },
      { value: 'maybe', label: '可能有,但還沒正式問過' },
      { value: 'no', label: '目前沒有' },
    ],
  },
  {
    id: 'crisis',
    section: '情境規劃',
    question: '未來 3 年內,你覺得可能發生哪些變化?(可複選)',
    whyWeAsk: '認養是 10–20 年的關係,變化很正常。先想過因應方式的人,反而是最可靠的認養人。',
    multi: true,
    options: [
      { value: 'move', label: '搬家' },
      { value: 'job', label: '換工作或工作型態改變' },
      { value: 'marriage', label: '結婚或生育' },
      { value: 'abroad', label: '出國進修或外派' },
      { value: 'none', label: '以上都不太可能' },
    ],
  },
  {
    id: 'careLevel',
    section: '照護接受度',
    question: '你可以接受的照護程度到哪裡?(可複選)',
    whyWeAsk: '誠實選擇最重要。選得少不會被扣分,反而能避免你和牠都受挫。',
    multi: true,
    options: [
      { value: 'easy', label: '一般日常照護' },
      { value: 'patient', label: '需要耐心(慢熟、訓練中、幼齡)' },
      { value: 'special', label: '特殊照護(慢性病、每日餵藥、復健)' },
    ],
  },
]

export const totalMinutes = 8 // 預估完成時間
