import type { ReactNode } from 'react';

import { vibrate, type HapticPattern } from '@/lib/haptics';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  /**
   * 'primary'  - solid gold. One per screen, for the main thing to do.
   * 'outline'  - a thin border. For secondary actions.
   * 'quiet'    - text only. For "skip", "not now", "back".
   */
  variant?: 'primary' | 'outline' | 'quiet';
  /** Stretch to the full width of its container. Good for thumbs. */
  full?: boolean;
  haptic?: HapticPattern;
  disabled?: boolean;
  ariaLabel?: string;
};

const styles = {
  primary:
    'bg-[var(--candle)] text-[var(--ink)] font-bold shadow-[0_8px_26px_-8px_rgba(247,200,115,0.55)] active:brightness-95',
  outline:
    'border border-[var(--candle)]/55 text-[var(--candle)] active:bg-[var(--candle)]/10',
  quiet: 'text-[var(--dusk)] underline underline-offset-4 decoration-[var(--smoke)]',
};

/**
 * The one button used everywhere in the app.
 *
 * It handles the tap vibration and the little press-down animation for you,
 * so individual screens never have to think about either.
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  full = false,
  haptic = 'tap',
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        vibrate(haptic);
        onClick?.();
      }}
      className={[
        'tappable rounded-full px-6 py-3.5 text-[0.92rem] transition-transform duration-150',
        'active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100',
        full ? 'w-full' : '',
        styles[variant],
      ].join(' ')}
    >
      {children}
    </button>
  );
}
