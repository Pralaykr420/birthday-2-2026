import { useEffect, useState } from 'react';
import { PartyPopper } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { BilingualText } from '@/components/common/BilingualText';
import { Confetti } from '@/components/effects/Confetti';
import { NightSky } from '@/components/effects/NightSky';
import { loveConfig } from '@/config/love.config';
import { copyBengali } from '@/data/bengali';
import { playEffect, unlock } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type MidnightOverlayProps = {
  onBegin: () => void;
  onDismiss: () => void;
};

/**
 * The midnight takeover.
 *
 * At 00:00 on her birthday this covers the whole screen, whatever she was
 * doing. It arrives in three beats: darkness, then the greeting, then the
 * invitation. The pauses are the whole effect - if all three appeared at once
 * it would just be a page.
 */
export function MidnightOverlay({ onBegin, onDismiss }: MidnightOverlayProps) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    vibrate('heartbeat');
    void unlock().then(() => playEffect('chime'));

    const timers = [
      window.setTimeout(() => setBeat(1), 900),
      window.setTimeout(() => {
        setBeat(2);
        vibrate('celebrate');
      }, 2600),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, []);

  return (
    <div className="grain fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[var(--ink)] px-7">
      <NightSky count={80} />
      <Confetti active={beat >= 2} pieces={180} />
      <div className="glow glow-warm" />
      <div className="glow glow-rose" />

      <div className="above w-full max-w-[420px] text-center">
        <span className="tappable mx-auto h-14 w-14 rounded-full border border-[var(--candle)]/45 text-[var(--candle)]">
          <PartyPopper size={22} />
        </span>

        {beat >= 1 && (
          <>
            <p className="t-small anim-fade mt-8 tracking-widest">
              00:00 · {loveConfig.birthday.day}.{loveConfig.birthday.month}
            </p>
            <h1 className="t-hero anim-rise mt-3 shimmer-text">
              <BilingualText
                english={loveConfig.copy.midnightGreeting}
                bengali={copyBengali.midnightGreeting}
                bengaliClassName="text-[0.5em]"
              />
            </h1>
          </>
        )}

        {beat >= 2 && (
          <div className="anim-rise">
            <p className="t-body mx-auto mt-6">
              <BilingualText
                english={loveConfig.copy.midnightSubtitle}
                bengali={copyBengali.midnightSubtitle}
              />
            </p>

            <div className="mt-9">
              <Button full onClick={onBegin} haptic="celebrate">
                Show me
              </Button>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="t-small mt-5 w-full underline underline-offset-4"
            >
              Not yet, let me look around on my own
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
