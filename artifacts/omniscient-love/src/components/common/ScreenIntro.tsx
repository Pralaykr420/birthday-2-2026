import type { ReactNode } from 'react';

type ScreenIntroProps = {
  title: ReactNode;
  /** One sentence explaining what she can do here. */
  blurb?: string;
};

/**
 * The heading block at the top of every room.
 *
 * Every screen uses this so the rhythm stays identical as she moves around -
 * same size, same spacing, same place on the screen every time.
 */
export function ScreenIntro({ title, blurb }: ScreenIntroProps) {
  return (
    <header className="pt-8 pb-7">
      <h1 className="t-title anim-rise text-[var(--petal)]">{title}</h1>
      {blurb && <p className="t-body anim-rise delay-1 mt-3">{blurb}</p>}
    </header>
  );
}
