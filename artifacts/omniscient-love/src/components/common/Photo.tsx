import { useState } from 'react';

import type { Memory } from '@/data/memories';

type PhotoProps = {
  memory: Memory;
  /** Extra Tailwind classes for the wrapper. */
  className?: string;
  /** Load this one immediately instead of waiting until it scrolls into view. */
  priority?: boolean;
  rounded?: boolean;
};

/**
 * A photo that fades in from a blur instead of popping in.
 *
 * Each memory carries a `blurPlaceholder`: a 20-pixel-wide blurred copy of
 * itself, small enough to live inside the code. We show that stretched out
 * while the real photo downloads, so she never sees an empty grey rectangle.
 *
 * We also serve .webp first and fall back to .jpg, because webp files are
 * roughly half the size on the same-looking image.
 */
export function Photo({ memory, className = '', priority = false, rounded = true }: PhotoProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[var(--velvet)] ${rounded ? 'rounded-[var(--radius)]' : ''} ${className}`}
      style={{ aspectRatio: `${memory.width} / ${memory.height}` }}
    >
      {memory.blurPlaceholder && (
        <img
          src={memory.blurPlaceholder}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-500 ${
            loaded ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      <picture>
        <source srcSet={memory.photo} type="image/webp" />
        <img
          src={memory.photoFallback ?? memory.photo}
          alt={memory.title}
          width={memory.width}
          height={memory.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`relative h-full w-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  );
}
