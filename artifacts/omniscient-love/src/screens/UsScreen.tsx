import { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Shuffle } from 'lucide-react';

import { Photo } from '@/components/common/Photo';
import { BilingualText } from '@/components/common/BilingualText';
import { ScreenIntro } from '@/components/common/ScreenIntro';
import { Sheet } from '@/components/common/Sheet';
import { memories, randomMemory, type Memory } from '@/data/memories';
import { memoryBengali } from '@/data/bengali';
import { useSwipe } from '@/hooks/useSwipe';
import { api } from '@/lib/api';
import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

type UsScreenProps = {
  favourites: string[];
  onToggleFavourite: (id: string) => void;
};

type View = 'sky' | 'deck' | 'timeline';

const VIEWS: Array<{ id: View; label: string }> = [
  { id: 'sky', label: 'The sky' },
  { id: 'deck', label: 'One by one' },
  { id: 'timeline', label: 'In order' },
];

/**
 * Everything to do with photographs, in three ways of looking at them.
 *
 *   The sky   - all of them at once, scattered as stars, tap to open
 *   One by one - a full-screen card she swipes through with her thumb
 *   In order   - a scrolling timeline from the beginning to now
 *
 * Three views rather than one because people browse photos differently
 * depending on mood: sometimes you want the whole constellation, sometimes
 * you want to sit with one at a time.
 */
export function UsScreen({ favourites, onToggleFavourite }: UsScreenProps) {
  const [view, setView] = useState<View>('sky');

  return (
    <div className="screen">
      <ScreenIntro
        title={
          <>
            Our corner of
            <br />
            everything.
          </>
        }
        blurb="Every one of these is here because it was ours, not because it was perfect."
      />

      {/* A segmented control. Three options is the most that fits across a
          phone without the labels getting cramped. */}
      <div
        role="tablist"
        aria-label="How to view the photos"
        className="flex gap-1 rounded-full border border-[var(--hairline)] bg-[var(--velvet)] p-1"
      >
        {VIEWS.map((option) => (
          <button
            key={option.id}
            role="tab"
            aria-selected={view === option.id}
            type="button"
            onClick={() => {
              vibrate('tap');
              setView(option.id);
            }}
            className={`flex-1 rounded-full py-2.5 text-[0.82rem] transition-colors ${
              view === option.id
                ? 'bg-[var(--candle)] font-semibold text-[var(--ink)]'
                : 'text-[var(--dusk)]'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {view === 'sky' && (
          <ConstellationView favourites={favourites} onToggleFavourite={onToggleFavourite} />
        )}
        {view === 'deck' && (
          <SwipeDeck favourites={favourites} onToggleFavourite={onToggleFavourite} />
        )}
        {view === 'timeline' && <TimelineView />}
      </div>
    </div>
  );
}

/* ===========================================================================
 * View 1: the constellation
 * ======================================================================== */

function ConstellationView({
  favourites,
  onToggleFavourite,
}: {
  favourites: string[];
  onToggleFavourite: (id: string) => void;
}) {
  const [open, setOpen] = useState<Memory | null>(null);

  return (
    <>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[var(--radius)] border border-[var(--hairline)] bg-gradient-to-b from-[#1d1428] to-[#241a2e]">
        {/* Faint lines joining the stars in order, so it reads as one shape
            rather than random dots. Drawn as SVG underneath the buttons. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points={memories.map((memory) => `${memory.star.x},${memory.star.y}`).join(' ')}
            fill="none"
            stroke="var(--candle)"
            strokeOpacity="0.2"
            strokeWidth="0.25"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {memories.map((memory, index) => {
          const saved = favourites.includes(memory.id);
          return (
            <button
              key={memory.id}
              type="button"
              aria-label={`Open the memory: ${memory.title}`}
              onClick={() => {
                vibrate('open');
                playEffect('sparkle');
                setOpen(memory);
              }}
              /* The button is 44px so a thumb can hit it, but the visible star
                 inside is tiny. Big target, small dot. */
              className="tappable absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ left: `${memory.star.x}%`, top: `${memory.star.y}%` }}
            >
              <span
                className="block rounded-full anim-twinkle"
                style={{
                  width: saved ? 11 : 7,
                  height: saved ? 11 : 7,
                  background: saved ? 'var(--blush)' : 'var(--candle)',
                  boxShadow: `0 0 16px ${saved ? 'var(--blush)' : 'var(--candle)'}`,
                  animationDelay: `${index * 0.28}s`,
                }}
              />
            </button>
          );
        })}

        <p className="t-small absolute inset-x-0 bottom-4 text-center">
          Tap a light. The pink ones are the ones you saved.
        </p>
      </div>

      <Sheet open={open !== null} onClose={() => setOpen(null)} title={open?.title}>
        {open && (
          <MemoryDetail
            memory={open}
            saved={favourites.includes(open.id)}
            onToggleFavourite={() => onToggleFavourite(open.id)}
          />
        )}
      </Sheet>
    </>
  );
}

/* ===========================================================================
 * View 2: the swipe deck
 * ======================================================================== */

function SwipeDeck({
  favourites,
  onToggleFavourite,
}: {
  favourites: string[];
  onToggleFavourite: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const memory = memories[index];

  // The % keeps the number inside the list, so going past the end wraps
  // round to the start instead of crashing.
  const next = () => {
    vibrate('tap');
    setIndex((current) => (current + 1) % memories.length);
  };

  const previous = () => {
    vibrate('tap');
    setIndex((current) => (current - 1 + memories.length) % memories.length);
  };

  const surprise = () => {
    vibrate('celebrate');
    playEffect('sparkle');
    const picked = randomMemory(memory.id);
    setIndex(memories.findIndex((item) => item.id === picked.id));
  };

  const swipe = useSwipe({ onSwipeLeft: next, onSwipeRight: previous });

  return (
    <div>
      {/* The `key` here is the important bit: changing it makes React throw
          the old card away and build a new one, which replays the fade-in
          animation on every swipe. */}
      <div {...swipe} className="touch-pan-y">
        <div key={memory.id} className="anim-fade">
          <Photo memory={memory} priority />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="t-small">
            {memory.dateLabel} · {memory.place}
          </p>
          <h2 className="t-heading mt-1 text-[var(--petal)]">
            <BilingualText english={memory.title} bengali={memoryBengali[memory.id]?.title ?? ''} />
          </h2>
        </div>

        <button
          type="button"
          aria-label={favourites.includes(memory.id) ? 'Remove from saved' : 'Save this memory'}
          onClick={() => {
            vibrate('heartbeat');
            onToggleFavourite(memory.id);
          }}
          className="tappable shrink-0 rounded-full text-[var(--blush)] active:scale-90"
        >
          <Heart
            size={22}
            fill={favourites.includes(memory.id) ? 'currentColor' : 'none'}
            className={favourites.includes(memory.id) ? 'anim-heartbeat' : ''}
          />
        </button>
      </div>

      <p className="t-body mt-3">
        <BilingualText english={memory.caption} bengali={memoryBengali[memory.id]?.caption ?? ''} />
      </p>

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous photo"
          onClick={previous}
          className="tappable h-12 w-12 rounded-full border border-[var(--hairline)] text-[var(--dusk)] active:scale-90"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          aria-label="Next photo"
          onClick={next}
          className="tappable h-12 w-12 rounded-full border border-[var(--candle)]/50 text-[var(--candle)] active:scale-90"
        >
          <ChevronRight size={18} />
        </button>

        <button
          type="button"
          onClick={surprise}
          className="tappable ml-auto gap-2 rounded-full border border-[var(--hairline)] px-4 text-[0.82rem] text-[var(--dusk)] active:scale-95"
        >
          <Shuffle size={14} /> Surprise me
        </button>
      </div>

      <p className="t-small mt-4 text-center">
        {index + 1} of {memories.length} · swipe sideways
      </p>
    </div>
  );
}

/* ===========================================================================
 * View 3: the timeline
 * ======================================================================== */

function TimelineView() {
  return (
    <ol className="relative space-y-8 border-l border-[var(--hairline)] pl-6">
      {memories.map((memory, index) => (
        <li key={memory.id} className="relative">
          <span
            className="absolute -left-[26px] top-2 h-2.5 w-2.5 rounded-full bg-[var(--candle)]"
            style={{ boxShadow: '0 0 12px var(--candle)' }}
            aria-hidden="true"
          />
          <p className="t-small">{memory.dateLabel}</p>
          <h3 className="t-heading mt-1 text-[var(--petal)]">
            <BilingualText english={memory.title} bengali={memoryBengali[memory.id]?.title ?? ''} />
          </h3>
          <div className="mt-3">
            {/* Only the first two load straight away; the rest wait until she
                scrolls near them, which saves a lot of her data. */}
            <Photo memory={memory} priority={index < 2} />
          </div>
          <p className="t-body mt-3">
            <BilingualText english={memory.caption} bengali={memoryBengali[memory.id]?.caption ?? ''} />
          </p>
        </li>
      ))}
    </ol>
  );
}

/* ===========================================================================
 * Shared: the detail panel used by the constellation
 * ======================================================================== */

function MemoryDetail({
  memory,
  saved,
  onToggleFavourite,
}: {
  memory: Memory;
  saved: boolean;
  onToggleFavourite: () => void;
}) {
  return (
    <div className="pb-4">
      <Photo memory={memory} priority />

      <p className="t-small mt-4">
        {memory.dateLabel} · {memory.place}
      </p>
      <p className="t-body mt-2">
        <BilingualText english={memory.caption} bengali={memoryBengali[memory.id]?.caption ?? ''} />
      </p>

      <button
        type="button"
        onClick={() => {
          vibrate('heartbeat');
          onToggleFavourite();
          void api.recordReaction('heart', memory.id);
        }}
        className="tappable mt-5 w-full gap-2 rounded-full border border-[var(--blush)]/45 py-3 text-[0.88rem] text-[var(--blush)] active:scale-[0.98]"
      >
        <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
        {saved ? 'Saved to your keepsakes' : 'Keep this one'}
      </button>
    </div>
  );
}
