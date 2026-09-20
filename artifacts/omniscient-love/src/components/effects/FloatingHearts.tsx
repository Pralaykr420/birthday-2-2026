import { useCallback, useEffect, useState } from 'react';

import { loveConfig } from '@/config/love.config';
import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type Heart = {
  id: number;
  x: number;
  y: number;
  drift: number;
  spin: number;
  size: number;
  emoji: string;
};

const EMOJIS = ['❤️', '💗', '💖', '✨', '🤍', '💫'];

let nextId = 0;

/**
 * Hearts that float up wherever she double-taps.
 *
 * This sits invisibly over the whole app. It listens for two taps in quick
 * succession anywhere on screen and throws a small burst of hearts up from
 * that exact spot - the same gesture people already know from liking a photo.
 *
 * Every heart deletes itself after its animation finishes, so they can never
 * pile up and slow the phone down.
 */
export function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  const burst = useCallback((x: number, y: number, count = 6) => {
    const fresh: Heart[] = Array.from({ length: count }, () => ({
      id: nextId++,
      x,
      y,
      drift: (Math.random() - 0.5) * 120,
      spin: (Math.random() - 0.5) * 70,
      size: 18 + Math.random() * 18,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    }));

    setHearts((current) => [...current, ...fresh]);

    const ids = fresh.map((heart) => heart.id);
    window.setTimeout(() => {
      setHearts((current) => current.filter((heart) => !ids.includes(heart.id)));
    }, 1900);
  }, []);

  useEffect(() => {
    if (!loveConfig.feel.heartsOnDoubleTap) return;

    let lastTapAt = 0;

    const onTap = (event: PointerEvent) => {
      const now = Date.now();

      // Two taps within 320ms of each other counts as a double tap.
      if (now - lastTapAt < 320) {
        burst(event.clientX, event.clientY);
        vibrate('heartbeat');
        playEffect('sparkle');
        lastTapAt = 0;
      } else {
        lastTapAt = now;
      }
    };

    window.addEventListener('pointerdown', onTap);
    return () => window.removeEventListener('pointerdown', onTap);
  }, [burst]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute"
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: heart.size,
            ['--drift' as string]: `${heart.drift}px`,
            ['--spin' as string]: `${heart.spin}deg`,
            animation: 'floatUp 1.8s cubic-bezier(0.2, 0.6, 0.35, 1) forwards',
          }}
        >
          {heart.emoji}
        </span>
      ))}
    </div>
  );
}
