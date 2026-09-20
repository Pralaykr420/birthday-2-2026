/**
 * Tiny vibrations, so the app feels physical in her hand.
 *
 * Android phones support this. iPhones mostly ignore it, which is fine -
 * the app just carries on silently. Nothing here can ever throw an error.
 */

import { loveConfig } from '@/config/love.config';

/** The different "feels" available. Named by what they mean, not how long they are. */
const patterns = {
  /** A single soft tick. For taps on buttons and cards. */
  tap: [10],
  /** Slightly firmer. For opening something. */
  open: [18],
  /** Two quick beats, like a heartbeat. For anything romantic. */
  heartbeat: [22, 90, 22],
  /** A happy little roll. For finishing something. */
  celebrate: [14, 40, 14, 40, 40],
  /** A low double thud. For a mistake or a wrong answer. */
  nope: [40, 60, 40],
} as const;

export type HapticPattern = keyof typeof patterns;

export function vibrate(pattern: HapticPattern = 'tap'): void {
  if (!loveConfig.feel.hapticsEnabled) return;
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;

  try {
    navigator.vibrate(patterns[pattern] as unknown as number[]);
  } catch {
    // Some browsers block this. It is decoration, so we let it go.
  }
}
