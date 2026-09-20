import { Volume2, VolumeX } from 'lucide-react';

import { loveConfig } from '@/config/love.config';
import { vibrate } from '@/lib/haptics';

type TopBarProps = {
  soundOn: boolean;
  onToggleSound: () => void;
  /** Days until her birthday, or null once it has arrived. */
  daysAway: number | null;
};

/**
 * A thin strip along the top. Deliberately almost empty.
 *
 * It holds two things only: a reminder of whose day it is, and the sound
 * switch. Everything else lives in the bottom bar where her thumb is.
 */
export function TopBar({ soundOn, onToggleSound, daysAway }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-[55] bg-[var(--ink)]/85 backdrop-blur-xl"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="mx-auto flex max-w-[560px] items-center justify-between px-5 py-3">
        <p className="text-[0.78rem] text-[var(--dusk)]">
          {daysAway === null ? (
            <span className="text-[var(--candle)]">Today is yours, {loveConfig.her.petName}</span>
          ) : daysAway === 0 ? (
            <span className="text-[var(--candle)]">Tomorrow. Almost.</span>
          ) : (
            <>
              <span className="text-[var(--candle)]">{daysAway}</span>{' '}
              {daysAway === 1 ? 'day' : 'days'} until your birthday
            </>
          )}
        </p>

        <button
          type="button"
          aria-label={soundOn ? 'Turn music off' : 'Turn music on'}
          onClick={() => {
            vibrate('tap');
            onToggleSound();
          }}
          className="tappable -mr-2 rounded-full text-[var(--dusk)] active:scale-90"
        >
          {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </header>
  );
}
