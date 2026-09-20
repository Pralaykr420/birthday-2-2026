import { useEffect, useState } from 'react';

import { getBirthdayDate, isBirthdayToday } from '@/config/love.config';

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the clock has passed midnight on her birthday. */
  hasArrived: boolean;
  /** True for the whole of her birthday, not just midnight. */
  isBirthdayToday: boolean;
};

function measure(): Countdown {
  const now = new Date();
  const target = getBirthdayDate(now);
  const millisecondsLeft = target.getTime() - now.getTime();

  const totalSeconds = Math.max(0, Math.floor(millisecondsLeft / 1000));

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    hasArrived: isBirthdayToday(now),
    isBirthdayToday: isBirthdayToday(now),
  };
}

/**
 * A live countdown to midnight on her birthday.
 * Updates once a second, and cleans itself up when the screen closes.
 */
export function useCountdown(): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(measure);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(measure()), 1000);

    // Phones pause timers when the screen locks, so we also re-check the
    // moment she comes back to the app. Without this, the countdown would be
    // wrong every time she puts her phone in her pocket.
    const recheck = () => setCountdown(measure());
    document.addEventListener('visibilitychange', recheck);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', recheck);
    };
  }, []);

  return countdown;
}
