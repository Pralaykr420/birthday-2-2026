import { useEffect, useState } from 'react';
import { Check, HeartHandshake, RotateCcw, Sparkles, X } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { BilingualText } from '@/components/common/BilingualText';
import { ScreenIntro } from '@/components/common/ScreenIntro';
import { reasonBengali, quizBengali } from '@/data/bengali';
import { drawReason, type Reason, type ReasonMood } from '@/data/reasons';
import { quizQuestions, scoreMessage } from '@/data/quiz';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { api } from '@/lib/api';
import { playEffect } from '@/lib/audio';
import { vibrate } from '@/lib/haptics';

/** Each mood gets its own colour, so the deck does not look monotonous. */
const MOOD_COLOURS: Record<ReasonMood, { background: string; text: string }> = {
  tender: { background: 'rgba(242,137,159,0.13)', text: 'var(--blush)' },
  funny: { background: 'rgba(247,200,115,0.13)', text: 'var(--candle)' },
  flirty: { background: 'rgba(168,154,180,0.16)', text: '#d9c7e8' },
  proud: { background: 'rgba(127,181,155,0.13)', text: 'var(--sage)' },
};

export function PlayScreen() {
  return (
    <div className="screen">
      <ScreenIntro
        title={
          <>
            Things to do
            <br />
            with me.
          </>
        }
        blurb="Nothing here is serious. That is rather the point."
      />

      <ReasonDeck />
      <Quiz />
      <AffectionCounters />
    </div>
  );
}

/* ===========================================================================
 * The deck of reasons
 * ======================================================================== */

function ReasonDeck() {
  const [seen, setSeen] = useLocalStorage<number[]>('reasons-seen', []);
  const [current, setCurrent] = useState<Reason | null>(null);
  const [flipping, setFlipping] = useState(false);

  function draw() {
    setFlipping(true);
    vibrate('heartbeat');
    playEffect('pop');

    // A short delay so the card visibly turns over rather than snapping.
    window.setTimeout(() => {
      const reason = drawReason(seen);
      setCurrent(reason);
      setSeen((current) =>
        current.includes(reason.id) ? current : [...current, reason.id],
      );
      setFlipping(false);
      void api.recordReaction('reason', String(reason.id));
    }, 260);
  }

  const colours = current ? MOOD_COLOURS[current.mood] : MOOD_COLOURS.tender;

  return (
    <section>
      <h2 className="t-heading text-[var(--petal)]">Reasons</h2>
      <p className="t-body mt-2">
        There are fifty of these. You have found {seen.length}.
      </p>

      <div
        className="surface mt-4 flex min-h-[200px] items-center justify-center p-7 text-center transition-transform duration-200"
        style={{
          background: colours.background,
          transform: flipping ? 'rotateY(12deg) scale(0.96)' : 'none',
        }}
      >
        {current ? (
          <p
            key={current.id}
            className="t-hand anim-fade text-[1.55rem]"
            style={{ color: colours.text }}
          >
            <BilingualText english={current.text} bengali={reasonBengali[current.id]} />
          </p>
        ) : (
          <p className="t-body">Tap below and I will tell you one.</p>
        )}
      </div>

      <div className="mt-4">
        <Button full variant={current ? 'outline' : 'primary'} onClick={draw}>
          <Sparkles size={15} className="mr-2" />
          {current ? 'Another one' : 'Draw a reason'}
        </Button>
      </div>

      {seen.length >= 50 && (
        <p className="t-small mt-3 text-center text-[var(--candle)]">
          You have read all fifty. There are more, I just ran out of room.
        </p>
      )}
    </section>
  );
}

/* ===========================================================================
 * The quiz
 * ======================================================================== */

function Quiz() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[questionIndex];
  const correctCount = answers.filter(
    (answer, index) => answer === quizQuestions[index].correctIndex,
  ).length;

  function choose(optionIndex: number) {
    if (chosen !== null) return; // She already answered this one.

    setChosen(optionIndex);
    const right = optionIndex === question.correctIndex;
    vibrate(right ? 'celebrate' : 'nope');
    playEffect(right ? 'chime' : 'thud');
  }

  function next() {
    const updated = [...answers, chosen ?? -1];
    setAnswers(updated);
    setChosen(null);

    if (questionIndex + 1 >= quizQuestions.length) {
      setFinished(true);
      const right = updated.filter(
        (answer, index) => answer === quizQuestions[index].correctIndex,
      ).length;
      void api.saveQuizResult(right, quizQuestions.length, updated);
    } else {
      setQuestionIndex((index) => index + 1);
    }
  }

  function restart() {
    vibrate('tap');
    setQuestionIndex(0);
    setChosen(null);
    setAnswers([]);
    setFinished(false);
  }

  if (finished) {
    return (
      <section className="surface mt-12 p-7 text-center anim-rise">
        <p className="t-small">How well you know us</p>
        <p className="mt-2 font-display text-5xl text-[var(--candle)]">
          {correctCount}
          <span className="text-[var(--smoke)]">/{quizQuestions.length}</span>
        </p>
        <p className="t-body mt-4">
          <BilingualText
            english={scoreMessage(correctCount, quizQuestions.length)}
            bengali={
              correctCount === quizQuestions.length
                ? 'একেবারে perfect। তুই আমাকে আমার থেকেও ভালো জানিস।'
                : correctCount / quizQuestions.length >= 0.7
                  ? 'প্রায় perfect। যেগুলো ভুল হয়েছে, সেগুলো আমি সামনাসামনি বুঝিয়ে দেব।'
                  : correctCount / quizQuestions.length >= 0.4
                    ? 'মন্দ না। আমাদের আরও অনেক লম্বা কথা বলা দরকার।'
                    : 'সত্যি? ভালোই হয়েছে, এখনও তোকে আবিষ্কার করার মতো কিছু বাকি আছে।'
            }
          />
        </p>

        <button
          type="button"
          onClick={restart}
          className="tappable mt-6 gap-2 text-[0.85rem] text-[var(--candle)]"
        >
          <RotateCcw size={14} /> Try again
        </button>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="t-heading text-[var(--petal)]">How well do you know us?</h2>

      {/* Progress bar. Seven segments, one per question. */}
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {quizQuestions.map((item, index) => (
          <span
            key={item.id}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{
              background: index <= questionIndex ? 'var(--candle)' : 'var(--velvet-high)',
            }}
          />
        ))}
      </div>

      <div className="surface mt-4 p-6">
        <p className="t-small">
          Question {questionIndex + 1} of {quizQuestions.length}
        </p>
        <p className="mt-2 text-[1.08rem] leading-snug text-[var(--petal)]">
          <BilingualText
            english={question.question}
            bengali={quizBengali[question.id]?.question ?? ''}
          />
        </p>

        <div className="mt-5 space-y-2.5">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctIndex;
            const isChosen = chosen === index;
            const answered = chosen !== null;

            // Colour logic: before answering everything is neutral. After,
            // the right answer always turns green, and her wrong pick turns
            // rose. Showing the right answer either way is deliberate - this
            // is not an exam.
            let tone = 'border-[var(--hairline)] text-[var(--dusk)]';
            if (answered && isCorrect) {
              tone = 'border-[var(--sage)]/60 bg-[var(--sage)]/10 text-[var(--petal)]';
            } else if (answered && isChosen) {
              tone = 'border-[var(--blush)]/55 bg-[var(--blush)]/10 text-[var(--petal)]';
            } else if (answered) {
              tone = 'border-[var(--hairline)] text-[var(--smoke)]';
            }

            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => choose(index)}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] border px-4 py-3.5 text-left text-[0.92rem] transition-all active:scale-[0.98] ${tone}`}
              >
                <span className="flex-1">
                  <BilingualText
                    english={option}
                    bengali={quizBengali[question.id]?.options[index] ?? ''}
                  />
                </span>
                {answered && isCorrect && (
                  <Check size={16} className="shrink-0 text-[var(--sage)]" />
                )}
                {answered && isChosen && !isCorrect && (
                  <X size={16} className="shrink-0 text-[var(--blush)]" />
                )}
              </button>
            );
          })}
        </div>

        {chosen !== null && (
          <div className="anim-rise mt-5">
            <p className="t-hand text-[var(--candle)]">
              <BilingualText
                english={question.reveal}
                bengali={quizBengali[question.id]?.reveal ?? ''}
              />
            </p>
            <div className="mt-4">
              <Button full onClick={next}>
                {questionIndex + 1 >= quizQuestions.length ? 'See how you did' : 'Next question'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ===========================================================================
 * Hugs and kisses
 * ======================================================================== */

function AffectionCounters() {
  const [hugs, setHugs] = useLocalStorage('hugs-sent', 0);
  const [kisses, setKisses] = useLocalStorage('kisses-sent', 0);
  const [totals, setTotals] = useState<{ hug: number; kiss: number } | null>(null);

  // Ask the server for the running totals once, when the screen opens. If the
  // server is unreachable this quietly stays null and we show her own counts.
  useEffect(() => {
    void api.getCounters().then((result) => {
      if (result) setTotals({ hug: result.hug, kiss: result.kiss });
    });
  }, []);

  function send(kind: 'hug' | 'kiss') {
    vibrate(kind === 'hug' ? 'heartbeat' : 'celebrate');
    playEffect('pop');

    if (kind === 'hug') setHugs((count) => count + 1);
    else setKisses((count) => count + 1);

    void api.recordReaction(kind);
  }

  return (
    <section className="mt-12">
      <h2 className="t-heading text-[var(--petal)]">Send something</h2>
      <p className="t-body mt-2">
        It really does reach me. I get a little count on my side.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => send('hug')}
          className="surface flex flex-col items-center gap-2 py-7 transition-transform active:scale-95"
        >
          <HeartHandshake size={26} className="text-[var(--blush)]" />
          <span className="text-[0.92rem] text-[var(--petal)]">Send a hug</span>
          <span className="t-small">
            {hugs} from you{totals ? ` · ${totals.hug} in total` : ''}
          </span>
        </button>

        <button
          type="button"
          onClick={() => send('kiss')}
          className="surface flex flex-col items-center gap-2 py-7 transition-transform active:scale-95"
        >
          <span className="text-2xl">💋</span>
          <span className="text-[0.92rem] text-[var(--petal)]">Send a kiss</span>
          <span className="t-small">
            {kisses} from you{totals ? ` · ${totals.kiss} in total` : ''}
          </span>
        </button>
      </div>
    </section>
  );
}
