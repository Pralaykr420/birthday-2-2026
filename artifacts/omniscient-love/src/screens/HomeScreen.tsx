import { ArrowRight, CakeSlice, Mail, Quote, Sparkles, Stars } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { BilingualText } from '@/components/common/BilingualText';
import { Photo } from '@/components/common/Photo';
import { daysTogether, loveConfig } from '@/config/love.config';
import { copyBengali } from '@/data/bengali';
import { centrepiece } from '@/data/memories';
import { useCountdown } from '@/hooks/useCountdown';
import type { ScreenName } from '@/lib/navigation';

type HomeScreenProps = {
  onNavigate: (screen: ScreenName) => void;
  /** How many of the five rooms she has opened. */
  roomsOpened: number;
  onOpenCompliment: () => void;
};

const ROOMS: Array<{
  screen: ScreenName;
  title: string;
  blurb: string;
  Icon: typeof Stars;
}> = [
  {
    screen: 'us',
    title: 'Us',
    blurb: 'A sky of every moment worth keeping.',
    Icon: Stars,
  },
  {
    screen: 'cake',
    title: 'Make a wish',
    blurb: 'Candles, one breath, and somewhere for the wish to go.',
    Icon: CakeSlice,
  },
  {
    screen: 'letters',
    title: 'Letters',
    blurb: 'Things I wrote down so you can come back to them.',
    Icon: Mail,
  },
  {
    screen: 'play',
    title: 'Play',
    blurb: 'A quiz, a deck of reasons, and one very needy button.',
    Icon: Sparkles,
  },
];

/**
 * The first thing she sees after unlocking.
 *
 * The job of this screen is to give her one obvious thing to tap and let
 * everything else wait. So: the countdown, then a single big invitation, then
 * the rooms underneath for whenever she wants them.
 */
export function HomeScreen({ onNavigate, roomsOpened, onOpenCompliment }: HomeScreenProps) {
  const countdown = useCountdown();
  const together = daysTogether();

  return (
    <div className="screen">
      {/* ---- The hero ------------------------------------------------- */}
      <section className="pt-10 pb-8">
        <h1 className="t-hero anim-rise text-[var(--petal)]">
          <BilingualText
            english={loveConfig.copy.heroTitle}
            bengali="তোমার জন্য বানানো একটুকরো ছোট্ট মহাবিশ্ব।"
          />
        </h1>

        <p className="t-body anim-rise delay-1 mt-5">
          <BilingualText
            english={loveConfig.copy.heroSubtitle}
            bengali="যে মানুষটা সাধারণ দিনগুলোকেও অসীম মনে করায়, তার জন্য। আমাদের যে মুহূর্তগুলো কোনওদিন ভুলতে চাই না, সেগুলোর ভেতর দিয়ে একটু ঘুরে এসো।"
          />
        </p>

        <div className="anim-rise delay-2 mt-7">
          <Button full onClick={() => onNavigate('us')} haptic="open">
            Start with us <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* ---- Countdown -------------------------------------------------
          On the day itself this turns into a greeting rather than a clock,
          because counting down to something that already happened is sad. */}
      <section className="surface anim-rise delay-3 overflow-hidden p-6">
        {countdown.isBirthdayToday ? (
          <>
            <p className="t-heading text-[var(--candle)]">
              It is your birthday, {loveConfig.her.name}.
            </p>
            <p className="t-body mt-2">
              You are {loveConfig.her.turningAge} today and somehow you get better at it
              every year.
            </p>
          </>
        ) : (
          <>
            <p className="t-small">Counting down to midnight on your birthday</p>
            <div className="mt-3 flex items-baseline gap-2 font-display text-[var(--candle)]">
              <CountUnit value={countdown.days} label="days" />
              <Divider />
              <CountUnit value={countdown.hours} label="hrs" />
              <Divider />
              <CountUnit value={countdown.minutes} label="min" />
              <Divider />
              <CountUnit value={countdown.seconds} label="sec" />
            </div>
          </>
        )}
      </section>

      {/* ---- Two numbers she might like ------------------------------- */}
      <section className="mt-3 grid grid-cols-2 gap-3">
        <div className="surface p-5">
          <p className="font-display text-3xl text-[var(--blush)]">
            {together.toLocaleString()}
          </p>
          <p className="t-small mt-1">days of us, so far</p>
        </div>
        <div className="surface p-5">
          <p className="font-display text-3xl text-[var(--candle)]">{roomsOpened}/5</p>
          <p className="t-small mt-1">rooms you have opened</p>
        </div>
      </section>

      {/* ---- The needy button ----------------------------------------- */}
      <section className="mt-3">
        <button
          type="button"
          onClick={onOpenCompliment}
          className="surface flex w-full items-center gap-4 p-5 text-left transition-transform active:scale-[0.98]"
        >
          <span className="tappable h-11 w-11 shrink-0 rounded-full bg-[var(--blush)]/15 text-[var(--blush)]">
            <Quote size={17} />
          </span>
          <span>
            <span className="block text-[0.95rem] text-[var(--petal)]">
              Tell me something nice
            </span>
            <span className="t-small block">Tap as many times as you want. I mean all of them.</span>
          </span>
        </button>
      </section>

      {/* ---- The rooms ------------------------------------------------ */}
      <section className="mt-10">
        <h2 className="t-heading text-[var(--petal)]">Where to go</h2>

        <div className="mt-4 space-y-3">
          {ROOMS.map(({ screen, title, blurb, Icon }) => (
            <button
              key={screen}
              type="button"
              onClick={() => onNavigate(screen)}
              className="surface flex w-full items-center gap-4 p-5 text-left transition-transform active:scale-[0.98]"
            >
              <span className="tappable h-11 w-11 shrink-0 rounded-full bg-[var(--candle)]/12 text-[var(--candle)]">
                <Icon size={18} strokeWidth={1.6} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.02rem] text-[var(--petal)]">{title}</span>
                <span className="t-small block">{blurb}</span>
              </span>
              <ArrowRight size={16} className="shrink-0 text-[var(--smoke)]" />
            </button>
          ))}
        </div>
      </section>

      {/* ---- One photo, as a full stop -------------------------------- */}
      <section className="mt-10">
        <Photo memory={centrepiece} priority />
        <p className="t-hand mt-4 text-center text-[var(--candle)]">
          <BilingualText
            english={loveConfig.copy.finalPromise}
            bengali={copyBengali.finalPromise}
            bengaliClassName="text-[0.68em]"
          />
        </p>
      </section>

      <footer className="mt-10 border-t border-[var(--hairline)] pt-6">
        <p className="t-small text-center">
          Made by {loveConfig.you.name}, slowly, over a lot of evenings.
        </p>
      </footer>
    </div>
  );
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex flex-col items-center">
      {/* tabular-nums stops the numbers jittering sideways as they tick over */}
      <span className="text-3xl tabular-nums">{String(value).padStart(2, '0')}</span>
      <span className="t-small">{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="pb-4 text-xl text-[var(--smoke)]">:</span>;
}
