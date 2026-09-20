import { useMemo } from 'react';

type NightSkyProps = {
  /** How many stars to scatter. Keep it modest on a phone. */
  count?: number;
};

/**
 * A field of slowly twinkling stars behind the content.
 *
 * The positions are worked out once and then never change, which is what
 * `useMemo` is doing here. Without it, React would re-roll every star's
 * position on each render and the sky would visibly jump around.
 */
export function NightSky({ count = 44 }: NightSkyProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() < 0.82 ? 1.5 : 2.6,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3.5,
        rosy: Math.random() < 0.16,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {stars.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full anim-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            background: star.rosy ? 'var(--blush)' : 'var(--candle-soft)',
            boxShadow: `0 0 ${star.size * 4}px ${star.rosy ? 'var(--blush)' : 'var(--candle)'}`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
