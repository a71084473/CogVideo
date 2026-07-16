import { Link } from 'react-router-dom'
import { useState } from 'react'
import { animals } from '../data/animals'
import { AnimalCard } from '../components/AnimalCard'
import { Section } from '../components/shared'
import { getFavorites, toggleFavorite } from '../lib/storage'

const steps = [
  { title: '了解彼此', desc: '生活適配測驗與動物真實資訊,雙向透明。' },
  { title: '共同準備', desc: '一起完成居家安全與照護準備,不會的我們教。' },
  { title: '安心託付', desc: '責任交接清楚明白,合約與照護資訊完整移交。' },
  { title: '90 天陪伴', desc: '3/7/30/60/90 天適應支持,遇到問題一起解決。' },
]

export default function Home() {
  const [favs, setFavs] = useState<string[]>(getFavorites)
  const featured = animals.filter((a) => ['mochi', 'latte', 'anzu', 'oreo', 'nori', 'yuki'].includes(a.id))

  return (
    <>
      {/* Hero */}
      <div className="border-b border-cream-dark bg-gradient-to-b from-sage-light/40 to-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <h1 className="text-3xl leading-snug font-bold md:text-4xl">
              不是帶回一隻貓,
              <br />
              而是找到適合彼此的家人。
            </h1>
            <p className="mt-4 max-w-lg text-lg text-ink-soft">
              透過生活適配、共同準備與認養後陪伴,讓喜歡成為能長久承擔的關係。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/quiz"
                className="inline-flex min-h-12 items-center rounded-lg bg-brand px-6 py-3 text-lg font-bold text-white shadow-sm hover:bg-brand-dark"
              >
                開始生活適配測驗
              </Link>
              <Link
                to="/animals"
                className="inline-flex min-h-12 items-center rounded-lg border-2 border-sage px-6 py-3 text-lg font-medium text-sage-dark hover:bg-sage-light"
              >
                看看等待中的牠們
              </Link>
            </div>
            <p className="mt-3 text-sm text-ink-soft">測驗約 5–10 分鐘,可隨時儲存、之後續填。</p>
          </div>
          {/* Hero 視覺:動物在居家環境中與人保持舒服距離 */}
          <svg viewBox="0 0 480 360" className="w-full rounded-card" role="img" aria-label="插畫:一隻貓在客廳窗邊安穩休息,人坐在不遠處看書,彼此保持舒服的距離">
            <rect width="480" height="360" rx="16" fill="#EFE7D6" />
            <rect x="40" y="40" width="150" height="180" rx="8" fill="#F7F2E8" stroke="#DCD2BE" strokeWidth="5" />
            <line x1="115" y1="40" x2="115" y2="220" stroke="#DCD2BE" strokeWidth="5" />
            <rect x="0" y="270" width="480" height="90" fill="#E5DCC8" />
            <ellipse cx="240" cy="300" rx="200" ry="34" fill="#DCE5DD" />
            {/* 人:坐著看書 */}
            <circle cx="360" cy="180" r="22" fill="#D9824E" opacity="0.85" />
            <path d="M330 290 q0 -70 30 -70 q30 0 30 70 z" fill="#748C78" />
            <rect x="336" y="228" width="48" height="34" rx="5" fill="#F7F2E8" transform="rotate(-12 360 245)" />
            {/* 貓:窗邊 */}
            <ellipse cx="140" cy="252" rx="46" ry="28" fill="#B08968" />
            <circle cx="180" cy="228" r="20" fill="#B08968" />
            <path d="M168 214 l6 -16 l10 12 z" fill="#B08968" />
            <path d="M184 212 l10 -13 l5 16 z" fill="#B08968" />
            <circle cx="174" cy="227" r="2.5" fill="#2F3A35" />
            <circle cx="187" cy="227" r="2.5" fill="#2F3A35" />
            <path d="M96 262 q-24 -6 -18 -28 q12 4 16 16" fill="#B08968" />
            <rect x="420" y="240" width="24" height="26" rx="4" fill="#C4B598" />
            <path d="M432 240 q-14 -24 2 -36 q16 12 2 36" fill="#748C78" />
          </svg>
        </div>
      </div>

      {/* 信任數字 */}
      <Section>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { n: '8', label: '等待中的動物' },
            { n: '126', label: '已穩定認養家庭' },
            { n: '92%', label: '90 天支持完成率' },
          ].map((s) => (
            <div key={s.label} className="rounded-card border border-cream-dark bg-white p-6 text-center">
              <p className="text-3xl font-bold text-brand-dark">{s.n}</p>
              <p className="text-ink-soft">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-sm text-ink-soft">
          ※ 本原型的數字為示意資料,非真實統計。正式上線後將以實際資料呈現。
        </p>
      </Section>

      {/* 新手安心區塊 */}
      <Section>
        <div className="rounded-card bg-sage-light/70 p-8 md:p-10">
          <h2 className="text-2xl font-bold">你不需要一開始什麼都會</h2>
          <p className="mt-2 max-w-2xl text-ink-soft">
            不會並不代表不適合,願意學習更重要。我們提供分階段準備清單、白話的照護說明、新手友善的動物推薦,
            以及認養後 90 天的陪伴——每一步都有人和你一起。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/quiz" className="inline-flex min-h-11 items-center rounded-lg bg-sage px-5 py-2.5 font-medium text-white hover:bg-sage-dark">
              看看誰適合我的生活
            </Link>
            <Link to="/process" className="inline-flex min-h-11 items-center rounded-lg border border-sage px-5 py-2.5 font-medium text-sage-dark hover:bg-white">
              了解共同準備怎麼進行
            </Link>
          </div>
        </div>
      </Section>

      {/* 推薦動物 */}
      <Section
        title="依生活型態認識牠們"
        subtitle="每一隻都附上真實的照護資訊與適合的生活情境——先了解,再心動。"
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((a) => (
            <AnimalCard
              key={a.id}
              animal={a}
              isFavorite={favs.includes(a.id)}
              onToggleFavorite={(id) => setFavs(toggleFavorite(id))}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/animals" className="inline-flex min-h-11 items-center rounded-lg border-2 border-brand px-6 py-2.5 font-medium text-brand-dark hover:bg-brand-light">
            看所有等待中的夥伴
          </Link>
        </div>
      </Section>

      {/* 四步驟流程 */}
      <Section title="認養四步驟" subtitle="從單向審核,變成雙向透明、共同準備與持續支持。">
        <ol className="grid gap-4 md:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-card border border-cream-dark bg-white p-5">
              <p className="flex h-9 w-9 items-center justify-center rounded-full bg-brand font-bold text-white">{i + 1}</p>
              <p className="mt-3 font-bold">{s.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{s.desc}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 為什麼要問這些問題 */}
      <Section>
        <div className="grid gap-8 rounded-card border border-cream-dark bg-white p-8 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-2xl font-bold">為什麼我們會問這些問題?</h2>
            <p className="mt-3 text-ink-soft">
              測驗和準備清單不是在審判你,而是為了三件事:找到符合你生活節奏的夥伴、
              提早發現可以準備的地方、以及在你需要時知道怎麼幫你。
            </p>
            <ul className="mt-4 space-y-2 text-ink-soft">
              <li>・每一題都會說明「為什麼需要詢問」。</li>
              <li>・我們不用年齡、收入、職業或是否有房來單獨判斷任何人。</li>
              <li>・你的資料只用於媒合與支持,不販售、不公開。</li>
            </ul>
            <Link to="/trust" className="mt-4 inline-flex min-h-11 items-center font-medium text-brand-dark underline underline-offset-4 hover:text-brand">
              查看完整的隱私與透明說明
            </Link>
          </div>
          <div className="rounded-card bg-cream p-6">
            <p className="font-bold">「家訪」其實是——居家安全確認與改善協助</p>
            <p className="mt-2 text-ink-soft">
              不是檢查你夠不夠資格,而是一起確認有哪些地方能讓牠住得更安全。
              我們會帶著防護建議來,而不是帶著評分表。
            </p>
          </div>
        </div>
      </Section>

      {/* 幸福回報故事 */}
      <Section title="牠們後來都好嗎?" subtitle="來自認養家庭的近況分享(示意內容,已隱去個人資訊)。">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: '布丁(認養 8 個月)', text: '前兩週牠都躲在床下,我照著中途給的適應指南慢慢來。現在牠每天早上叫我起床。' },
            { name: '小黑(認養 1 年)', text: '第 30 天時牠突然不吃飯,我用求助按鈕聯絡中途,當天就約到合作醫院。只是換牙不舒服,虛驚一場。' },
            { name: '芝麻(認養 100 天)', text: '我是第一次養貓,90 天檢核點讓我知道每個階段什麼是正常的,不會自己嚇自己。' },
          ].map((s) => (
            <figure key={s.name} className="rounded-card border border-cream-dark bg-white p-5">
              <blockquote className="text-ink-soft">「{s.text}」</blockquote>
              <figcaption className="mt-3 text-sm font-medium">{s.name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* 其他參與方式 */}
      <Section title="還沒準備好認養?這些方式一樣重要">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: '每月助養', d: '固定支持一隻動物的飼料與醫療。', to: '/get-involved' },
            { t: '成為志工', d: '清潔、攝影、運輸、行政都需要你。', to: '/get-involved' },
            { t: '認養前課程', d: '先上課、先照顧,再決定。', to: '/get-involved' },
            { t: '支持醫療基金', d: '幫助特殊需求的動物完成治療。', to: '/get-involved' },
          ].map((c) => (
            <Link key={c.t} to={c.to} className="rounded-card border border-cream-dark bg-white p-5 hover:border-brand">
              <p className="font-bold">{c.t}</p>
              <p className="mt-1 text-sm text-ink-soft">{c.d}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  )
}
