import type { PreparationItem } from '../types'

// 共同準備清單(依測驗結果動態指派)
export const preparationItems: PreparationItem[] = [
  {
    id: 'window-safety',
    title: '門窗與陽台防護',
    description: '安裝隱形鐵窗、防逃網或確認紗窗穩固,避免墜樓與走失。這是所有認養的必要安全條件。',
    status: 'todo',
    proofHint: '完成後拍一張防護照片,或預約中途到府協助確認。',
  },
  {
    id: 'landlord',
    title: '房東或同住者同意',
    description: '與房東或同住家人確認同意飼養。可以使用我們準備的「與房東溝通指南」,包含常見疑慮的回應方式。',
    status: 'todo',
    proofHint: '取得口頭或訊息同意即可,不需要正式文件。',
  },
  {
    id: 'backup-caregiver',
    title: '第二照顧者',
    description: '找一位在你出差、住院或臨時有事時,能接手照顧幾天的家人或朋友,並實際和對方確認過。',
    status: 'todo',
    proofHint: '在會員中心填寫第二照顧者的稱呼與聯絡方式(僅在緊急時使用)。',
  },
  {
    id: 'medical-fund',
    title: '醫療預備金',
    description: '建議準備 NT$10,000–30,000 的醫療預備金,或投保寵物險。可以分次存,不需要一次到位。',
    status: 'todo',
    proofHint: '自我確認即可,不需要提供存款證明。',
  },
  {
    id: 'basic-supplies',
    title: '基本用品準備',
    description: '食碗水碗、外出籠/牽繩、貓砂盆或尿墊、初期飼料(中途會提供銜接糧)。',
    status: 'todo',
    proofHint: '照著清單準備即可,接家當天中途會一起確認。',
  },
  {
    id: 'course',
    title: '新手照護課程',
    description: '完成 40 分鐘線上新手課:飲食、如廁、就醫時機與適應期的正常現象。',
    status: 'todo',
    guideUrl: '/process',
    proofHint: '完成課程後系統自動記錄。',
  },
]
