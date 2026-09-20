import type { ReactNode } from 'react';

type BilingualTextProps = {
  english: ReactNode;
  bengali: ReactNode;
  className?: string;
  bengaliClassName?: string;
};

/** Keeps the original English copy visible while adding Indian Bengali below it. */
export function BilingualText({
  english,
  bengali,
  className = '',
  bengaliClassName = '',
}: BilingualTextProps) {
  return (
    <span className={`block ${className}`}>
      <span className="block">{english}</span>
      <span
        lang="bn-IN"
        className={`mt-1 block font-body text-[0.9em] leading-relaxed text-[var(--bengali)] ${bengaliClassName}`}
      >
        {bengali}
      </span>
    </span>
  );
}