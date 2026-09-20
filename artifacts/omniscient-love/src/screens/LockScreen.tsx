import { useState } from 'react';
import { KeyRound } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { NightSky } from '@/components/effects/NightSky';
import { loveConfig } from '@/config/love.config';
import { lockScreenBengali } from '@/data/bengali';
import { BilingualText } from '@/components/common/BilingualText';
import { playEffect, unlock as unlockAudio } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type LockScreenProps = {
  onUnlocked: () => void;
};

/** Ignore capitals, spaces at the ends, and full stops when comparing. */
function tidy(text: string): string {
  return text.trim().toLowerCase().replace(/[.!?]+$/, '');
}

/**
 * The front door.
 *
 * One question that only she can answer. This is not security - anyone with
 * the browser's developer tools could read the answer in two seconds. It is
 * there because being asked a question only you know the answer to is a
 * lovely way to open something.
 *
 * It also serves a practical purpose: the first tap on this screen is what
 * gives the browser permission to play sound later.
 */
export function LockScreen({ onUnlocked }: LockScreenProps) {
  const [attempt, setAttempt] = useState('');
  const [wrongCount, setWrongCount] = useState(0);
  const [shaking, setShaking] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const showHint = wrongCount >= 2;

  function check() {
    const isRight = loveConfig.lockScreen.acceptedAnswers.some(
      (answer) => tidy(answer) === tidy(attempt),
    );

    if (!isRight) {
      setWrongCount((count) => count + 1);
      setShaking(true);
      vibrate('nope');
      window.setTimeout(() => setShaking(false), 420);
      return;
    }

    // Right answer. This tap is inside a real user gesture, which is the only
    // moment a browser will let us start audio, so we do it here.
    void unlockAudio().then(() => playEffect('chime'));
    vibrate('celebrate');
    setAccepted(true);

    // Let her read the welcome line before the app appears.
    window.setTimeout(onUnlocked, 1700);
  }

  if (accepted) {
    return (
      <div className="grain relative flex min-h-[100dvh] items-center justify-center px-8">
        <NightSky count={60} />
        <div className="above text-center anim-fade">
          <p className="t-title text-[var(--candle)]">
            <BilingualText
              english={loveConfig.lockScreen.welcome}
              bengali={lockScreenBengali.welcome}
            />
          </p>
          <p className="t-body mt-4">Come in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grain relative flex min-h-[100dvh] flex-col justify-center px-7">
      <NightSky count={50} />
      <div className="glow glow-warm" />

      <div className="above mx-auto w-full max-w-[420px]">
        <span className="tappable mb-7 h-12 w-12 rounded-full border border-[var(--candle)]/40 text-[var(--candle)]">
          <KeyRound size={18} />
        </span>

        <h1 className="t-title anim-rise text-[var(--petal)]">
          <BilingualText
            english={loveConfig.lockScreen.question}
            bengali={lockScreenBengali.question}
          />
        </h1>

        <p className="t-body anim-rise delay-1 mt-4">
          One question before I let you in. Take your time.
        </p>

        <div className={shaking ? 'animate-[flicker_0.4s_ease]' : ''}>
          <input
            type="text"
            value={attempt}
            onChange={(event) => setAttempt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') check();
            }}
            placeholder="Type your answer"
            autoComplete="off"
            aria-label="Your answer"
            className="mt-8 w-full rounded-full border border-[var(--hairline)] bg-[var(--velvet)] px-6 py-4 text-[var(--petal)] outline-none placeholder:text-[var(--smoke)] focus:border-[var(--candle)]/60"
          />
        </div>

        <div className="mt-4">
          <Button full onClick={check} disabled={attempt.trim().length === 0} haptic="open">
            Let me in
          </Button>
        </div>

        {/* We only offer the hint after two wrong guesses, so it never spoils
            the moment for her on the first try. */}
        {showHint && (
          <p className="t-small anim-fade mt-6 text-center italic">
            {loveConfig.lockScreen.hint}
          </p>
        )}

        {wrongCount >= 4 && (
          <button
            type="button"
            onClick={onUnlocked}
            className="t-small mt-4 w-full text-center underline underline-offset-4"
          >
            Skip this, just let me in
          </button>
        )}
      </div>
    </div>
  );
}
