import { useEffect, useState } from 'react';
import { Check, Lock, PenLine, Send } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { BilingualText } from '@/components/common/BilingualText';
import { ScratchCard } from '@/components/common/ScratchCard';
import { ScreenIntro } from '@/components/common/ScreenIntro';
import { Sheet } from '@/components/common/Sheet';
import { loveConfig } from '@/config/love.config';
import { copyBengali, envelopeBengali } from '@/data/bengali';
import { envelopes, type Envelope } from '@/data/envelopes';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { api } from '@/lib/api';
import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

/**
 * Everything written down: the main letter, a drawer of "open when" notes,
 * one scratch card, and somewhere for her to write back.
 */
export function LettersScreen() {
  const [openedIds, setOpenedIds] = useLocalStorage<string[]>('opened-envelopes', []);
  const [reading, setReading] = useState<Envelope | null>(null);

  function openEnvelope(envelope: Envelope) {
    vibrate('open');
    playEffect('sparkle');
    setReading(envelope);
    setOpenedIds((current) =>
      current.includes(envelope.id) ? current : [...current, envelope.id],
    );
  }

  return (
    <div className="screen">
      <ScreenIntro
        title={
          <>
            A few things
            <br />
            I mean.
          </>
        }
        blurb="Written down on purpose, so you can come back to them on a day when you need to."
      />

      <TheLetter />

      {/* ---- Scratch card --------------------------------------------- */}
      <section className="mt-12">
        <h2 className="t-heading text-[var(--petal)]">One more thing</h2>
        <p className="t-body mt-2 mb-4">
          Use your finger. It will not show itself until you work for it a little.
        </p>
        <ScratchCard
          secret={{ english: loveConfig.copy.scratchSecret, bengali: copyBengali.scratchSecret }}
        />
      </section>

      {/* ---- Open when ------------------------------------------------ */}
      <section className="mt-12">
        <h2 className="t-heading text-[var(--petal)]">Open when…</h2>
        <p className="t-body mt-2 mb-4">
          Sealed letters for specific days. Only open the one you actually need.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {envelopes.map((envelope) => {
            const opened = openedIds.includes(envelope.id);

            return (
              <button
                key={envelope.id}
                type="button"
                onClick={() => openEnvelope(envelope)}
                className={`surface flex min-h-[126px] flex-col justify-between p-4 text-left transition-transform active:scale-[0.97] ${
                  opened ? 'opacity-65' : ''
                }`}
              >
                <span className="text-2xl">{envelope.seal}</span>
                <span>
                  <span className="block text-[0.9rem] leading-snug text-[var(--petal)]">
                    <BilingualText
                      english={envelope.openWhen}
                      bengali={envelopeBengali[envelope.id]?.openWhen ?? ''}
                    />
                  </span>
                  <span className="t-small mt-1 block">
                    {opened ? 'Opened' : 'Sealed'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <WriteBack />

      <Sheet
        open={reading !== null}
        onClose={() => setReading(null)}
        title={reading ? `Open when ${reading.openWhen}` : undefined}
      >
        {reading && (
          <div className="pb-6">
            {reading.letter.map((paragraph, index) => (
              <p key={index} className="t-hand mt-4 text-[var(--petal)]">
                <BilingualText
                  english={paragraph}
                  bengali={envelopeBengali[reading.id]?.letter[index] ?? ''}
                />
              </p>
            ))}
            <p className="t-hand mt-7 text-right text-[var(--candle)]">
              {loveConfig.you.signOff}
            </p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

/* ===========================================================================
 * The main letter, revealed one line at a time
 * ======================================================================== */

function TheLetter() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [reading, setReading] = useState(false);

  const paragraphs = loveConfig.loveLetter;
  const finished = visibleCount >= paragraphs.length;

  // While "reading" is on, add one paragraph every few seconds. The pacing is
  // the point: a letter that appears all at once gets skimmed, a letter that
  // arrives a line at a time gets read.
  useEffect(() => {
    if (!reading || finished) return;

    const timer = window.setTimeout(() => {
      setVisibleCount((count) => count + 1);
      vibrate('tap');
    }, 3400);

    return () => window.clearTimeout(timer);
  }, [reading, visibleCount, finished]);

  return (
    <article
      className="relative overflow-hidden rounded-[var(--radius)] px-6 py-9"
      style={{
        background: 'linear-gradient(168deg, #f2e6d0, #e4d2b6)',
        color: 'var(--paper-ink)',
        boxShadow: '0 22px 60px -22px rgba(0,0,0,0.6)',
      }}
    >
      {/* A coloured band down the spine, like a real folded letter. */}
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[#b5736f]/30" aria-hidden="true" />

      <p className="t-small text-[#8a6a52]">
        For {loveConfig.her.name}
        {loveConfig.her.nameInBengali ? ` · ${loveConfig.her.nameInBengali}` : ''}
      </p>

      <div className="mt-5 space-y-4">
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            className={`font-hand text-[1.4rem] leading-[1.45] transition-opacity duration-1000 ${
              index < visibleCount || !reading ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            <BilingualText
              english={paragraph}
              bengali={copyBengali.loveLetter[index] ?? ''}
              bengaliClassName="text-[0.68em]"
            />
          </p>
        ))}
      </div>

      <p
        className="mt-8 text-right text-[1.35rem] text-[#8a6a52]"
        style={{ fontFamily: 'var(--font-hand)' }}
      >
        {loveConfig.you.signOff}, {loveConfig.you.name}
      </p>

      {!reading && (
        <button
          type="button"
          onClick={() => {
            vibrate('open');
            setReading(true);
            setVisibleCount(1);
          }}
          className="tappable mt-7 w-full rounded-full bg-[#6d4459] px-6 text-[0.88rem] font-semibold text-[#f7e6d5] active:scale-[0.98]"
        >
          Read it slowly, with me
        </button>
      )}

      {reading && !finished && (
        <p className="t-small mt-6 text-center text-[#8a6a52]">
          Line {visibleCount} of {paragraphs.length}…
        </p>
      )}
    </article>
  );
}

/* ===========================================================================
 * Her reply
 * ======================================================================== */

function WriteBack() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  async function send() {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    vibrate('celebrate');
    playEffect('chime');
    setSent(true);
    await api.saveNote(trimmed);
  }

  if (sent) {
    return (
      <section className="surface mt-12 p-7 text-center anim-rise">
        <span className="tappable mx-auto h-12 w-12 rounded-full bg-[var(--sage)]/15 text-[var(--sage)]">
          <Check size={20} />
        </span>
        <p className="t-heading mt-4 text-[var(--petal)]">I have it.</p>
        <p className="t-body mt-2">
          I will read it more times than is reasonable.
        </p>
        <button
          type="button"
          onClick={() => {
            setText('');
            setSent(false);
          }}
          className="t-small mt-5 underline underline-offset-4"
        >
          Write another one
        </button>
      </section>
    );
  }

  return (
    <section className="surface mt-12 p-6">
      <div className="flex items-center gap-3">
        <span className="tappable h-10 w-10 shrink-0 rounded-full bg-[var(--blush)]/15 text-[var(--blush)]">
          <PenLine size={16} />
        </span>
        <h2 className="t-heading text-[var(--petal)]">Write back</h2>
      </div>

      <p className="t-body mt-3">
        Anything at all. It comes straight to me, and nobody else ever sees it.
      </p>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={5}
        maxLength={2000}
        placeholder="Say something to me…"
        aria-label="Your message"
        className="mt-4 w-full resize-none rounded-[var(--radius-sm)] border border-[var(--hairline)] bg-[var(--ink)] p-4 text-[var(--petal)] outline-none placeholder:text-[var(--smoke)] focus:border-[var(--candle)]/60"
      />

      <div className="mt-4">
        <Button full onClick={send} disabled={text.trim().length === 0}>
          <Send size={15} className="mr-2" /> Send it to him
        </Button>
      </div>

      <p className="t-small mt-3 flex items-center justify-center gap-1.5">
        <Lock size={11} /> Private. Saved even if you have no signal right now.
      </p>
    </section>
  );
}
