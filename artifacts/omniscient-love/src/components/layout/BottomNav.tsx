import { CakeSlice, Heart, Mail, Sparkles, Stars } from 'lucide-react';

import { vibrate } from '@/lib/haptics';
import type { ScreenName } from '@/lib/navigation';

type BottomNavProps = {
  current: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  /** Screens she has already opened, so we can mark the new ones. */
  visited: ScreenName[];
};

/**
 * The five tabs along the bottom of the screen.
 *
 * Bottom, not top, on purpose: on a phone held in one hand, the bottom third
 * of the screen is the only part a thumb comfortably reaches. Putting
 * navigation at the top is a laptop habit that makes phone apps annoying.
 *
 * Five is also the ceiling. At six the labels start truncating on a small
 * screen and the targets get too narrow to hit reliably.
 */
const TABS: Array<{ screen: ScreenName; label: string; Icon: typeof Heart }> = [
  { screen: 'home', label: 'Home', Icon: Heart },
  { screen: 'us', label: 'Us', Icon: Stars },
  { screen: 'cake', label: 'Wish', Icon: CakeSlice },
  { screen: 'letters', label: 'Letters', Icon: Mail },
  { screen: 'play', label: 'Play', Icon: Sparkles },
];

export function BottomNav({ current, onNavigate, visited }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--hairline)] bg-[var(--ink)]/92 backdrop-blur-xl"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="mx-auto flex max-w-[560px] items-stretch">
        {TABS.map(({ screen, label, Icon }) => {
          const active = current === screen;
          const isNew = !visited.includes(screen);

          return (
            <li key={screen} className="flex-1">
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => {
                  vibrate('tap');
                  onNavigate(screen);
                }}
                className="relative flex h-[var(--nav-height)] w-full flex-col items-center justify-center gap-1"
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.1 : 1.6}
                  className={
                    active
                      ? 'text-[var(--candle)] transition-transform duration-200 -translate-y-0.5'
                      : 'text-[var(--smoke)] transition-transform duration-200'
                  }
                  fill={active && screen === 'home' ? 'currentColor' : 'none'}
                />

                <span
                  className={`text-[0.66rem] tracking-wide ${
                    active ? 'text-[var(--candle)]' : 'text-[var(--smoke)]'
                  }`}
                >
                  {label}
                </span>

                {/* A small dot on rooms she has not opened yet. It disappears
                    the moment she visits, so it never nags. */}
                {isNew && !active && (
                  <span className="absolute right-[26%] top-[18px] h-1.5 w-1.5 rounded-full bg-[var(--blush)]" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
