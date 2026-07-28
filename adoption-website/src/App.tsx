import { HashRouter, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Animals from './pages/Animals'
import AnimalDetail from './pages/AnimalDetail'
import Quiz from './pages/Quiz'
import QuizResult from './pages/QuizResult'
import Process from './pages/Process'
import Dashboard from './pages/Dashboard'
import Support90 from './pages/Support90'
import Crisis from './pages/Crisis'
import Happiness from './pages/Happiness'
import GetInvolved from './pages/GetInvolved'
import Trust from './pages/Trust'
import Canary from './pages/Canary'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/animals/:id" element={<AnimalDetail />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/result" element={<QuizResult />} />
          <Route path="/process" element={<Process />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/support-90" element={<Support90 />} />
          <Route path="/crisis" element={<Crisis />} />
          <Route path="/happiness" element={<Happiness />} />
          <Route path="/get-involved" element={<GetInvolved />} />
          <Route path="/trust" element={<Trust />} />
          <Route path="/canary" element={<Canary />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
