import { useState } from 'react';
import { Database, Inbox, RefreshCw, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/common/Button';
import { api, type AdminSnapshot } from '@/lib/api';
import { vibrate } from '@/lib/haptics';

/**
 * Your private inbox. She never sees this.
 *
 * Reach it by adding #admin to the address, like:
 *   https://your-site.com/#admin
 *
 * The password is checked on the SERVER, not here. That matters: anything
 * checked in the browser can be read by anyone who opens the developer tools.
 * This screen simply passes what you type to the backend and shows whatever
 * comes back.
 */
export function AdminScreen() {
  const [password, setPassword] = useState('');
  const [data, setData] = useState<AdminSnapshot | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'wrong'>('idle');

  async function load() {
    setStatus('loading');
    const result = await api.getEverything(password);

    if (!result) {
      setStatus('wrong');
      vibrate('nope');
      return;
    }

    setData(result);
    setStatus('idle');
    vibrate('celebrate');
  }

  /* ---- Not signed in yet ----------------------------------------- */
  if (!data) {
    return (
      <div className="screen pt-20">
        <span className="tappable mb-6 h-12 w-12 rounded-full border border-[var(--hairline)] text-[var(--dusk)]">
          <ShieldCheck size={19} />
        </span>

        <h1 className="t-title text-[var(--petal)]">Your inbox</h1>
        <p className="t-body mt-3">
          Everything she has written, sent and answered.
        </p>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void load();
          }}
          placeholder="Admin password"
          aria-label="Admin password"
          className="mt-7 w-full rounded-full border border-[var(--hairline)] bg-[var(--velvet)] px-6 py-4 outline-none focus:border-[var(--candle)]/60"
        />

        <div className="mt-4">
          <Button full onClick={load} disabled={status === 'loading' || password.length === 0}>
            {status === 'loading' ? 'Checking…' : 'Open'}
          </Button>
        </div>

        {status === 'wrong' && (
          <p className="t-small mt-4 text-center text-[var(--blush)]">
            That did not work. Check the password in love.config.ts and that the
            server is running.
          </p>
        )}
      </div>
    );
  }

  /* ---- Signed in -------------------------------------------------- */
  return (
    <div className="screen pt-10">
      <div className="flex items-center justify-between">
        <h1 className="t-heading text-[var(--petal)]">Her inbox</h1>
        <button
          type="button"
          aria-label="Refresh"
          onClick={() => void load()}
          className="tappable rounded-full text-[var(--dusk)] active:scale-90"
        >
          <RefreshCw size={17} />
        </button>
      </div>

      <p className="t-small mt-2 flex items-center gap-1.5">
        <Database size={11} />
        Storing in {data.storageMode === 'mongodb' ? 'MongoDB' : 'a local file'}
      </p>

      {/* Quick totals */}
      <div className="mt-6 grid grid-cols-3 gap-2">
        <Stat label="wishes" value={data.wishes.length} />
        <Stat label="notes" value={data.notes.length} />
        <Stat
          label="hugs"
          value={(data.reactionTotals.hug ?? 0) + (data.reactionTotals.kiss ?? 0)}
        />
      </div>

      <Section title="Wishes" icon={<Inbox size={15} />} empty="Nothing yet.">
        {data.wishes.map((wish) => (
          <Entry key={wish.id} when={wish.createdAt} text={wish.text} />
        ))}
      </Section>

      <Section title="Notes to you" icon={<Inbox size={15} />} empty="Nothing yet.">
        {data.notes.map((note) => (
          <Entry key={note.id} when={note.createdAt} text={note.text} />
        ))}
      </Section>

      <Section title="Quiz attempts" icon={<Inbox size={15} />} empty="She has not played yet.">
        {data.quizResults.map((result) => (
          <Entry
            key={result.id}
            when={result.createdAt}
            text={`Scored ${result.correct} out of ${result.total}`}
          />
        ))}
      </Section>

      <Section title="Where she went" icon={<Inbox size={15} />} empty="No visits recorded.">
        {data.visits.map((visit) => (
          <Entry
            key={visit.screen}
            when={visit.lastSeenAt}
            text={`${visit.screen} · opened ${visit.count} ${visit.count === 1 ? 'time' : 'times'}`}
          />
        ))}
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface p-4 text-center">
      <p className="font-display text-2xl text-[var(--candle)]">{value}</p>
      <p className="t-small">{label}</p>
    </div>
  );
}

function Section({
  title,
  icon,
  empty,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  empty: string;
  children: React.ReactNode[];
}) {
  return (
    <section className="mt-9">
      <h2 className="flex items-center gap-2 text-[0.95rem] text-[var(--petal)]">
        {icon} {title}
      </h2>
      <div className="mt-3 space-y-2">
        {children.length > 0 ? children : <p className="t-small">{empty}</p>}
      </div>
    </section>
  );
}

function Entry({ when, text }: { when: string; text: string }) {
  return (
    <div className="surface p-4">
      <p className="t-small">{new Date(when).toLocaleString()}</p>
      <p className="mt-1.5 text-[0.93rem] text-[var(--petal)]">{text}</p>
    </div>
  );
}
