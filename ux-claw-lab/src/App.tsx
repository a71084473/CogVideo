import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useEffect } from 'react';
import { BottomNav, SharePreview, ToastHost } from './components/ui';
import { Brand } from './screens/Brand';
import { Collection } from './screens/Collection';
import { Daily } from './screens/Daily';
import { Home } from './screens/Home';
import { Learn } from './screens/Learn';
import { Loading } from './screens/Loading';
import { Machine } from './screens/Machine';
import { Progress } from './screens/Progress';
import { Room } from './screens/Room';
import { Settings } from './screens/Settings';
import { useGame } from './store/useGame';

const WITH_NAV = new Set(['home', 'collection', 'room', 'progress', 'daily']);

export default function App() {
  const screen = useGame((s) => s.screen);
  const learn = useGame((s) => s.learn);
  const reduced = useGame((s) => s.settings.reducedMotion);
  const ensureToday = useGame((s) => s.ensureToday);
  useEffect(() => ensureToday(), [ensureToday]);
  useEffect(() => {
    // `?debug` exposes the store for automated play-testing
    if (new URLSearchParams(location.search).has('debug')) (window as unknown as { __game: typeof useGame }).__game = useGame;
  }, []);

  let view: JSX.Element;
  switch (screen) {
    case 'loading':
      view = <Loading />;
      break;
    case 'machine':
      view = <Machine />;
      break;
    case 'learn':
      view = learn ? <Learn key={learn.dollId + learn.isReview} /> : <Home />;
      break;
    case 'collection':
      view = <Collection />;
      break;
    case 'room':
      view = <Room />;
      break;
    case 'progress':
      view = <Progress />;
      break;
    case 'daily':
      view = <Daily />;
      break;
    case 'settings':
      view = <Settings />;
      break;
    case 'brand':
      view = <Brand />;
      break;
    default:
      view = <Home />;
  }

  return (
    <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>
      <div className={`flex h-full w-full items-center justify-center ${reduced ? 'reduce-motion' : ''}`}>
        {/* 390×844 phone stage on desktop, full-bleed on mobile */}
        <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-cream sm:h-[min(844px,100%)] sm:rounded-[40px] sm:border-[6px] sm:border-ink sm:shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.main
              key={screen}
              className="relative min-h-0 flex-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {view}
            </motion.main>
          </AnimatePresence>
          {WITH_NAV.has(screen) && (
            <div className="absolute inset-x-0 bottom-0 z-20">
              <BottomNav />
            </div>
          )}
          <ToastHost />
          <SharePreview />
        </div>
      </div>
    </MotionConfig>
  );
}
