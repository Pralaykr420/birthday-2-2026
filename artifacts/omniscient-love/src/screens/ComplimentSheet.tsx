import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { BilingualText } from '@/components/common/BilingualText';
import { Sheet } from '@/components/common/Sheet';
import { complimentBengali } from '@/data/bengali';
import { complimentLines, drawCompliment } from '@/data/envelopes';
import { api } from '@/lib/api';
import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type ComplimentSheetProps = {
  open: boolean;
  onClose: () => void;
};

/** How many recent lines we remember, so she does not get the same one twice. */
const MEMORY_DEPTH = 8;

/**
 * A panel that hands her one flirty line at a time.
 *
 * She can keep tapping. That is the feature.
 */
export function ComplimentSheet({ open, onClose }: ComplimentSheetProps) {
  const [line, setLine] = useState(() => drawCompliment([]));
  const [recent, setRecent] = useState<string[]>([]);
  const [count, setCount] = useState(0);

  function another() {
    vibrate('heartbeat');
    playEffect('sparkle');

    const next = drawCompliment(recent);
    setLine(next);
    setRecent((current) => [...current, next].slice(-MEMORY_DEPTH));
    setCount((value) => value + 1);
    void api.recordReaction('compliment');
  }

  return (
    <Sheet open={open} onClose={onClose} title="Something nice">
      <div className="pb-6">
        <div className="flex min-h-[150px] items-center justify-center rounded-[var(--radius)] bg-[var(--blush)]/10 px-6 py-8">
          <p key={line} className="t-hand anim-fade text-center text-[1.6rem] text-[var(--blush)]">
            <BilingualText
              english={line}
              bengali={complimentBengali[complimentLines.indexOf(line)] ?? ''}
            />
          </p>
        </div>

        <button
          type="button"
          onClick={another}
          className="tappable mt-5 w-full gap-2 rounded-full border border-[var(--blush)]/45 py-3.5 text-[0.9rem] text-[var(--blush)] active:scale-[0.98]"
        >
          <RefreshCw size={15} /> Tell me another
        </button>

        {count >= 5 && (
          <p className="t-small mt-4 text-center">
            {count >= 12
              ? 'You are just going to sit there pressing it, aren’t you. Good.'
              : 'Keep going, I have plenty.'}
          </p>
        )}
      </div>
    </Sheet>
  );
}
