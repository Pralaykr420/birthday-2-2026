import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { vibrate } from '@/lib/haptics';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/**
 * A panel that slides up from the bottom of the screen.
 *
 * On a phone this is the right shape for anything temporary: it appears near
 * her thumb, it dims what is behind it, and swiping down or tapping outside
 * gets rid of it. A centred desktop-style dialog would be the wrong choice.
 */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  // While the sheet is open, stop the page behind it from scrolling.
  // Without this, scrolling inside the sheet drags the whole page around.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={() => {
          vibrate('tap');
          onClose();
        }}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm anim-fade"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-[560px] rounded-t-[28px] border-t border-[var(--hairline)] bg-[var(--velvet)] anim-rise"
        style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}
      >
        {/* The little grey bar that tells her this can be dragged away. */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--smoke)]/50" />

        <div className="flex items-start justify-between gap-4 px-6 pt-4">
          {title && <h2 className="t-heading text-[var(--petal)]">{title}</h2>}
          <button
            type="button"
            aria-label="Close"
            onClick={() => {
              vibrate('tap');
              onClose();
            }}
            className="tappable -mr-2 -mt-2 shrink-0 rounded-full text-[var(--dusk)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-6 pb-2 pt-3 hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
