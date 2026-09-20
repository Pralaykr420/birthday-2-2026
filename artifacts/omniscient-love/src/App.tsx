import { useEffect, useState } from 'react';

import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { FloatingHearts } from '@/components/effects/FloatingHearts';
import { NightSky } from '@/components/effects/NightSky';
import { loveConfig } from '@/config/love.config';
import { useCountdown } from '@/hooks/useCountdown';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { api, flushQueue } from '@/lib/api';
import { setVolume, startAmbient, stopAmbient, unlock } from '@/lib/audio';
import {
  goToScreen,
  screenFromHash,
  type ScreenName,
} from '@/lib/navigation';

import { AdminScreen } from '@/screens/AdminScreen';
import { CakeScreen } from '@/screens/CakeScreen';
import { ComplimentSheet } from '@/screens/ComplimentSheet';
import { FinaleScreen } from '@/screens/FinaleScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { LettersScreen } from '@/screens/LettersScreen';
import { LockScreen } from '@/screens/LockScreen';
import { MidnightOverlay } from '@/screens/MidnightOverlay';
import { PlayScreen } from '@/screens/PlayScreen';
import { UsScreen } from '@/screens/UsScreen';

/**
 * The root of the app.
 *
 * Its whole job is to decide WHICH screen is showing and to hold the handful
 * of things every screen needs to agree on:
 *
 *   - has she got past the lock screen
 *   - which room is open
 *   - is the music on
 *   - which photos has she saved
 *   - is it midnight on her birthday
 *
 * Anything that only matters inside one room lives in that room's own file,
 * not here. Keeping this file small is what stops the project turning back
 * into one enormous unreadable component.
 */
export default function App() {
  /* ---- Which screen is showing ----------------------------------- */
  const [screen, setScreen] = useState<ScreenName>(screenFromHash);

  // Keep the screen in step with the address bar, so the phone's back button
  // works the way she expects instead of leaving the app entirely.
  useEffect(() => {
    const onHashChange = () => setScreen(screenFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function navigate(next: ScreenName) {
    goToScreen(next);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setVisited((current) => (current.includes(next) ? current : [...current, next]));
    void api.recordVisit(next);
  }

  /* ---- Things that are remembered between visits ------------------ */
  const [unlocked, setUnlocked] = useLocalStorage('unlocked', !loveConfig.lockScreen.enabled);
  const [visited, setVisited] = useLocalStorage<ScreenName[]>('visited', []);
  const [favourites, setFavourites] = useLocalStorage<string[]>('favourites', []);
  const [midnightSeen, setMidnightSeen] = useLocalStorage('midnight-seen', false);
  const [soundOn, setSoundOn] = useLocalStorage('sound-on', !loveConfig.feel.startMuted);

  /* ---- The midnight surprise -------------------------------------- */
  const countdown = useCountdown();
  const [showMidnight, setShowMidnight] = useState(false);

  useEffect(() => {
    // Three things have to be true: it is her birthday, she is inside the app,
    // and we have not already shown her this.
    if (countdown.isBirthdayToday && !midnightSeen && unlocked) {
      setShowMidnight(true);
    }
  }, [countdown.isBirthdayToday, midnightSeen, unlocked]);

  /* ---- Sound ------------------------------------------------------ */
  useEffect(() => {
    if (!loveConfig.feel.ambientMusicEnabled) return;

    if (soundOn) {
      void unlock().then(() => {
        startAmbient();
        setVolume(0.55);
      });
    } else {
      setVolume(0, 0.7);
    }
  }, [soundOn]);

  // Stop the music when the app is closed or the phone is locked, so it never
  // keeps playing in the background and drains her battery.
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) setVolume(0, 0.4);
      else if (soundOn) setVolume(0.55);
    };

    document.addEventListener('visibilitychange', onHidden);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      stopAmbient();
    };
  }, [soundOn]);

  /* ---- Anything that failed to send earlier ------------------------ */
  useEffect(() => {
    void flushQueue();
  }, []);

  /* ---- The compliment panel --------------------------------------- */
  const [complimentOpen, setComplimentOpen] = useState(false);

  /* ---- What to draw ------------------------------------------------ */

  // The admin page sits outside everything: no lock screen, no navigation.
  if (screen === 'admin') {
    return (
      <main className="grain relative min-h-[100dvh]">
        <AdminScreen />
      </main>
    );
  }

  if (!unlocked) {
    return <LockScreen onUnlocked={() => setUnlocked(true)} />;
  }

  function toggleFavourite(id: string) {
    setFavourites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  const roomsOpened = ['us', 'cake', 'letters', 'play', 'finale'].filter((room) =>
    visited.includes(room as ScreenName),
  ).length;

  return (
    <main className="grain relative min-h-[100dvh]">
      <NightSky count={38} />
      <div className="glow glow-warm" />
      <div className="glow glow-rose" />
      <FloatingHearts />

      <div className="above">
        <TopBar
          soundOn={soundOn}
          onToggleSound={() => setSoundOn(!soundOn)}
          daysAway={countdown.isBirthdayToday ? null : countdown.days}
        />

        {screen === 'home' && (
          <HomeScreen
            onNavigate={navigate}
            roomsOpened={roomsOpened}
            onOpenCompliment={() => setComplimentOpen(true)}
          />
        )}

        {screen === 'us' && (
          <UsScreen favourites={favourites} onToggleFavourite={toggleFavourite} />
        )}

        {screen === 'cake' && <CakeScreen onCandlesOut={() => navigate('cake')} />}

        {screen === 'letters' && <LettersScreen />}

        {screen === 'play' && <PlayScreen />}

        {screen === 'finale' && <FinaleScreen onNavigate={navigate} />}

        <BottomNav current={screen} onNavigate={navigate} visited={visited} />
      </div>

      <ComplimentSheet open={complimentOpen} onClose={() => setComplimentOpen(false)} />

      {showMidnight && (
        <MidnightOverlay
          onBegin={() => {
            setMidnightSeen(true);
            setShowMidnight(false);
            navigate('us');
          }}
          onDismiss={() => {
            setMidnightSeen(true);
            setShowMidnight(false);
          }}
        />
      )}
    </main>
  );
}
