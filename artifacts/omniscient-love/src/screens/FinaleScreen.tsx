import { useState } from 'react';
import { Check, Heart, RotateCcw } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { BilingualText } from '@/components/common/BilingualText';
import { Photo } from '@/components/common/Photo';
import { Confetti } from '@/components/effects/Confetti';
import { daysTogether, loveConfig } from '@/config/love.config';
import { copyBengali } from '@/data/bengali';
import { memories } from '@/data/memories';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { api } from '@/lib/api';
import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';
import type { ScreenName } from '@/lib/navigation';

type FinaleScreenProps = {
  onNavigate: (screen: ScreenName) => void;
};

/**
 * The last room.
 *
 * Deliberately short and quiet. She has just been through everything else,
 * so this is a landing, not another activity: a few photographs, one line,
 * and one thing to press.
 */
export function FinaleScreen({ onNavigate }: FinaleScreenProps) {
  const [promised, setPromised] = useLocalStorage('promise-kept', false);
  const [celebrating, setCelebrating] = useState(false);

  // A small, hand-picked set rather than all of them, so the grid stays
  // calm and each photo gets room.
  const closing = [memories[10], memories[6], memories[2], memories[8]];

  function keepPromise() {
    if (promised) return;
    setPromised(true);
    setCelebrating(true);
    vibrate('celebrate');
    playEffect('chime');
    void api.recordReaction('heart', 'finale-promise');
    window.setTimeout(() => setCelebrating(false), 5200);
  }

  return (
    <div className="screen">
      <Confetti active={celebrating} pieces={200} />

      <header className="pt-12 pb-8 text-center">
        <h1 className="t-title anim-rise text-[var(--petal)]">
          And this is only
          <br />
          the beginning.
        </h1>
        <p className="t-body anim-rise delay-1 mx-auto mt-4">
          {daysTogether().toLocaleString()} days in, and the best part is still
          that none of it is finished.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        {closing.map((memory, index) => (
          <div key={memory.id} className={index === 0 ? 'col-span-2' : ''}>
            <Photo memory={memory} priority={index === 0} />
          </div>
        ))}
      </div>

      <section className="mt-12 text-center">
        <p className="t-hand mx-auto text-[1.7rem] text-[var(--candle)]">
          <BilingualText
            english={loveConfig.copy.finalPromise}
            bengali={copyBengali.finalPromise}
            bengaliClassName="text-[0.58em]"
          />
        </p>
        <p className="t-small mt-4">— {loveConfig.you.name}</p>
      </section>

      <section className="mt-12 text-center">
        <button
          type="button"
          onClick={keepPromise}
          aria-label={promised ? 'Promise kept' : 'Leave your heart here'}
          className="tappable mx-auto h-20 w-20 rounded-full border border-[var(--blush)]/50 text-[var(--blush)] transition-transform active:scale-90"
        >
          {promised ? (
            <Check size={28} />
          ) : (
            <Heart size={28} className="anim-heartbeat" />
          )}
        </button>

        <p className="t-small mt-4">
          {promised ? 'Kept. Right here, where I can find it.' : 'Press and hold this feeling'}
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-3">
        <Button full variant="outline" onClick={() => onNavigate('us')}>
          <RotateCcw size={15} className="mr-2" /> Walk through it all again
        </Button>
        <Button full variant="quiet" onClick={() => onNavigate('home')}>
          Back to the beginning
        </Button>
      </section>
    </div>
  );
}
