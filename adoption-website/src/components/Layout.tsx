import { Link, NavLink, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { track } from '../lib/funnel'

const navItems = [
  { to: '/animals', label: '尋找適合的夥伴' },
  { to: '/quiz', label: '生活適配測驗' },
  { to: '/process', label: '認養流程' },
  { to: '/support-90', label: '90 天支持' },
  { to: '/happiness', label: '幸福回報' },
  { to: '/get-involved', label: '助養與志工' },
  { to: '/trust', label: '關於我們' },
]

// 行動版底部導覽:首頁、找夥伴、適配測驗、進度、求助
const bottomNav = [
  { to: '/', label: '首頁', icon: '⌂' },
  { to: '/animals', label: '找夥伴', icon: '☘' },
  { to: '/quiz', label: '適配測驗', icon: '✎' },
  { to: '/dashboard', label: '進度', icon: '▤' },
  { to: '/crisis', label: '求助', icon: '☂' },
]

export function Layout() {
  // 每個瀏覽器工作階段只記一次進站
  useEffect(() => {
    if (sessionStorage.getItem('adopt.visited')) return
    sessionStorage.setItem('adopt.visited', '1')
    track('visit')
  }, [])

  return (
    <div className="flex min-h-screen flex-col pb-20 md:pb-0">
      <a href="#main" className="skip-link">
        跳至主要內容
      </a>
      <header className="sticky top-0 z-40 border-b border-cream-dark bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-ink">
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white">
              ❋
            </span>
            安心託付・共同陪伴
          </Link>
          <nav aria-label="主要導覽" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm ${
                    isActive ? 'bg-brand-light font-medium text-brand-dark' : 'text-ink-soft hover:bg-cream-dark'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/dashboard"
              className="ml-2 rounded-lg border border-sage px-3 py-2 text-sm font-medium text-sage-dark hover:bg-sage-light"
            >
              我的進度
            </NavLink>
          </nav>
          <NavLink
            to="/dashboard"
            className="rounded-lg border border-sage px-3 py-2 text-sm font-medium text-sage-dark hover:bg-sage-light lg:hidden"
          >
            我的進度
          </NavLink>
        </div>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-cream-dark bg-cream-dark/50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
          <div>
            <p className="font-bold">安心託付・共同陪伴</p>
            <p className="mt-2 text-sm text-ink-soft">
              不是帶回一隻動物,而是找到適合彼此的家人。我們用生活適配、共同準備與認養後陪伴,讓每一次託付都安心。
            </p>
          </div>
          <nav aria-label="頁尾導覽" className="text-sm">
            <p className="font-medium">快速前往</p>
            <ul className="mt-2 space-y-1">
              <li><Link className="text-ink-soft hover:text-brand-dark" to="/quiz">開始生活適配測驗</Link></li>
              <li><Link className="text-ink-soft hover:text-brand-dark" to="/animals">看看等待中的牠們</Link></li>
              <li><Link className="text-ink-soft hover:text-brand-dark" to="/crisis">遇到困難了?一起找方法</Link></li>
              <li><Link className="text-ink-soft hover:text-brand-dark" to="/trust">信任與透明資訊</Link></li>
            </ul>
          </nav>
          <div className="text-sm text-ink-soft">
            <p className="font-medium text-ink">聯絡我們</p>
            <p className="mt-2">週一至週日 10:00–20:00</p>
            <p>hello@example.org(示意)</p>
            <p className="mt-3 text-xs">本網站為設計原型,所有動物資料與數字皆為示意資料。</p>
          </div>
        </div>
      </footer>

      {/* 行動版底部導覽 */}
      <nav
        aria-label="行動版導覽"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-dark bg-white md:hidden"
      >
        <ul className="flex">
          {bottomNav.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-xs ${
                    isActive ? 'font-bold text-brand-dark' : 'text-ink-soft'
                  }`
                }
              >
                <span aria-hidden="true" className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
