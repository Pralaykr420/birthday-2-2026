import { useEffect, useRef, useState } from 'react';
import { Check, Mic, RotateCcw, Send, Wind } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { ScreenIntro } from '@/components/common/ScreenIntro';
import { Confetti } from '@/components/effects/Confetti';
import { loveConfig } from '@/config/love.config';
import { api } from '@/lib/api';
import { listenForBlow, playEffect, type BlowListener } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type CakeScreenProps = {
  onCandlesOut: () => void;
};

type Stage = 'lit' | 'listening' | 'out' | 'wishing' | 'done';

/**
 * The cake.
 *
 * The one genuinely clever moment in the app: she can actually blow the
 * candles out using her phone's microphone. If the microphone is unavailable,
 * or she declines the permission, there is always a tap button underneath -
 * the magic trick must never become a wall.
 *
 * Afterwards she can type the wish, which gets saved to your backend so you
 * can read it later without ever having to ask her what she wished for.
 */
export function CakeScreen({ onCandlesOut }: CakeScreenProps) {
  const [stage, setStage] = useState<Stage>('lit');
  const [wish, setWish] = useState('');
  const [micDenied, setMicDenied] = useState(false);

  // Holds the microphone listener so we can switch it off again. A `ref` is
  // used rather than state because changing it must not redraw the screen.
  const listenerRef = useRef<BlowListener | null>(null);

  // How many candles: her age, but capped so the cake still fits on a phone.
  const candleCount = Math.min(loveConfig.her.turningAge, 12);

  /** Always release the microphone when this screen closes. */
  useEffect(() => {
    return () => listenerRef.current?.stop();
  }, []);

  function extinguish() {
    listenerRef.current?.stop();
    listenerRef.current = null;

    setStage('out');
    playEffect('blow');
    vibrate('celebrate');
    onCandlesOut();

    // A short pause in the dark before asking for the wish, so the moment
    // has room to land.
    window.setTimeout(() => setStage('wishing'), 1500);
  }

  async function startListening() {
    setStage('listening');

    const listener = await listenForBlow(extinguish);

    if (!listener) {
      // No microphone, or she said no. Fall back without making a fuss.
      setMicDenied(true);
      setStage('lit');
      return;
    }

    listenerRef.current = listener;
  }

  async function sendWish() {
    vibrate('celebrate');
    playEffect('chime');
    setStage('done');
    await api.saveWish(wish.trim());
  }

  function relight() {
    vibrate('tap');
    setWish('');
    setMicDenied(false);
    setStage('lit');
  }

  return (
    <div className="screen">
      <Confetti active={stage === 'out' || stage === 'wishing' || stage === 'done'} pieces={150} />

      <ScreenIntro
        title={
          <>
            Make a wish
            <br />
            for us.
          </>
        }
        blurb={
          stage === 'lit' || stage === 'listening'
            ? `${candleCount} candles, and one breath. Take your time with it.`
            : 'It is out there now, travelling through all the years ahead of us.'
        }
      />

      {/* ---- The cake ------------------------------------------------- */}
      <div className="surface relative overflow-hidden px-6 pb-8 pt-14">
        <div className="relative mx-auto w-fit">
          {/* Candles, sitting on top of the cake */}
          <div className="mb-1 flex items-end justify-center gap-[7px]">
            {Array.from({ length: candleCount }, (_, index) => (
              <Candle key={index} lit={stage === 'lit' || stage === 'listening'} index={index} />
            ))}
          </div>

          {/* Three layers, widest at the bottom */}
          <div className="mx-auto h-4 w-[188px] rounded-[50%] bg-[#8d5f78]" />
          <div className="h-[46px] w-[188px] bg-[#7a4f68]" />
          <div className="mx-auto h-4 w-[214px] rounded-[50%] bg-[#9b6982]" />
          <div className="h-[52px] w-[214px] rounded-b-[16px] bg-[#6d4459]" />
          <div
            className="mx-auto h-5 w-[236px] rounded-[50%] bg-[#ac7793]"
            style={{ boxShadow: '0 14px 38px -12px rgba(247,200,115,0.3)' }}
          />
        </div>

        <p className="t-hand mt-7 text-center text-[var(--candle)]">
          one more year of you
        </p>

        {/* A warm wash of light over the cake while the candles are burning */}
        {(stage === 'lit' || stage === 'listening') && (
          <div
            className="pointer-events-none absolute inset-0 anim-fade"
            style={{
              background:
                'radial-gradient(circle at 50% 22%, rgba(247,200,115,0.2), transparent 62%)',
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* ---- What to do next ------------------------------------------ */}
      <div className="mt-6">
        {stage === 'lit' && (
          <>
            <Button full onClick={startListening} haptic="open">
              <Wind size={17} className="mr-2" /> Blow them out
            </Button>

            <p className="t-small mt-3 text-center">
              Hold the phone near your mouth and blow, like a real cake.
            </p>

            <button
              type="button"
              onClick={extinguish}
              className="t-small mt-4 w-full text-center underline underline-offset-4"
            >
              {micDenied
                ? 'No microphone? Tap here to blow them out'
                : 'Or just tap here instead'}
            </button>
          </>
        )}

        {stage === 'listening' && (
          <div className="surface flex flex-col items-center gap-3 p-6 text-center">
            <span className="tappable h-12 w-12 rounded-full bg-[var(--candle)]/15 text-[var(--candle)] anim-heartbeat">
              <Mic size={19} />
            </span>
            <p className="text-[var(--petal)]">Listening for your breath…</p>
            <p className="t-small">Go on. I am waiting.</p>
            <button
              type="button"
              onClick={extinguish}
              className="t-small mt-2 underline underline-offset-4"
            >
              Skip and blow them out
            </button>
          </div>
        )}

        {stage === 'out' && (
          <p className="t-title anim-fade text-center text-[var(--candle)]">
            Wish received.
          </p>
        )}

        {stage === 'wishing' && (
          <div className="surface anim-rise p-6">
            <h2 className="t-heading text-[var(--petal)]">What did you wish for?</h2>
            <p className="t-body mt-2">
              Nobody sees this but me, and I promise not to tell anyone it will
              stop it coming true.
            </p>

            <textarea
              value={wish}
              onChange={(event) => setWish(event.target.value)}
              rows={4}
              maxLength={600}
              placeholder="I wished that…"
              aria-label="Your wish"
              className="mt-4 w-full resize-none rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--ink)] p-4 text-[var(--petal)] outline-none placeholder:text-[var(--smoke)] focus:border-[var(--candle)]/60"
            />

            <div className="mt-4 flex gap-3">
              <Button full onClick={sendWish} disabled={wish.trim().length === 0}>
                <Send size={15} className="mr-2" /> Send it
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setStage('done')}
              className="t-small mt-4 w-full text-center underline underline-offset-4"
            >
              Keep it to myself
            </button>
          </div>
        )}

        {stage === 'done' && (
          <div className="surface anim-rise p-7 text-center">
            <span className="tappable mx-auto h-12 w-12 rounded-full bg-[var(--sage)]/15 text-[var(--sage)]">
              <Check size={20} />
            </span>
            <p className="t-heading mt-4 text-[var(--petal)]">Safe with me.</p>
            <p className="t-body mt-2">
              Happy birthday, {loveConfig.her.petName}. I hope you get every bit of it.
            </p>

            <button
              type="button"
              onClick={relight}
              className="tappable mt-6 gap-2 text-[0.85rem] text-[var(--candle)]"
            >
              <RotateCcw size={14} /> Light them again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** One candle. The flame flickers on its own schedule so they look alive. */
function Candle({ lit, index }: { lit: boolean; index: number }) {
  return (
    <span className="flex flex-col items-center">
      {lit ? (
        <span
          className="mb-[3px] block h-[15px] w-[8px] rounded-[50%_50%_46%_46%] bg-[var(--candle-soft)] anim-flicker"
          style={{
            boxShadow: '0 0 14px var(--candle), 0 0 26px rgba(247,200,115,0.55)',
            // A different delay per candle stops them flickering in unison,
            // which would look mechanical.
            animationDelay: `${index * 0.17}s`,
          }}
        />
      ) : (
        // A wisp of smoke where the flame was.
        <span className="mb-[3px] block h-[15px] w-[8px] opacity-45">
          <span className="mx-auto block h-2 w-[2px] rounded-full bg-[var(--smoke)]" />
        </span>
      )}
      <span className="h-[26px] w-[6px] rounded-sm bg-gradient-to-b from-[#fbede4] to-[#e0b7c6]" />
    </span>
  );
}
