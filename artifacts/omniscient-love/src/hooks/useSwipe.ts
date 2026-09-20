import { useRef } from 'react';

type SwipeHandlers = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
};

/** A swipe has to travel this far before it counts, in pixels. */
const MIN_DISTANCE = 45;

/**
 * Detect swipe gestures on any element. Built for thumbs.
 *
 * Use it like this:
 *   const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: previous });
 *   return <div {...swipe}>...</div>;
 *
 * We compare horizontal against vertical distance so that scrolling the page
 * up and down never accidentally flips a card sideways.
 */
export function useSwipe(handlers: SwipeHandlers) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart(event: React.TouchEvent) {
      const touch = event.touches[0];
      start.current = { x: touch.clientX, y: touch.clientY };
    },

    onTouchEnd(event: React.TouchEvent) {
      if (!start.current) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.current.x;
      const dy = touch.clientY - start.current.y;
      start.current = null;

      const horizontal = Math.abs(dx) > Math.abs(dy);

      if (horizontal && Math.abs(dx) > MIN_DISTANCE) {
        if (dx < 0) handlers.onSwipeLeft?.();
        else handlers.onSwipeRight?.();
      } else if (!horizontal && Math.abs(dy) > MIN_DISTANCE) {
        if (dy < 0) handlers.onSwipeUp?.();
        else handlers.onSwipeDown?.();
      }
    },
  };
}
