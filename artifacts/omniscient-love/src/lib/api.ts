/**
 * Talking to the backend.
 *
 * Everything she writes gets sent to your server so you can read it later.
 * But this app has to work at midnight, possibly with no signal at all.
 *
 * So the rule here is: THE APP NEVER BREAKS BECAUSE THE SERVER IS DOWN.
 *
 * If a request fails, we quietly put it in a queue in her phone's storage and
 * try again the next time the app opens with a working connection. She never
 * sees an error. She never loses a wish.
 */

/**
 * Where the backend lives.
 *
 * In development this is empty, and Vite forwards /api to the local server.
 * In production, set VITE_API_URL in your hosting dashboard to something like
 * https://your-api.onrender.com
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

const QUEUE_KEY = 'omniscient:pending-requests';

type QueuedRequest = {
  path: string;
  body: unknown;
  queuedAt: string;
};

/* ---------------------------------------------------------------------------
 * The offline queue
 * ------------------------------------------------------------------------ */

function readQueue(): QueuedRequest[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedRequest[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-50)));
  } catch {
    // Storage full or blocked. Nothing we can do, and nothing worth breaking for.
  }
}

function addToQueue(path: string, body: unknown): void {
  const queue = readQueue();
  queue.push({ path, body, queuedAt: new Date().toISOString() });
  writeQueue(queue);
}

/**
 * Try to send everything that failed earlier. Called when the app starts and
 * whenever the phone reconnects to the internet.
 */
export async function flushQueue(): Promise<void> {
  const queue = readQueue();
  if (queue.length === 0) return;

  const stillFailing: QueuedRequest[] = [];

  for (const item of queue) {
    try {
      const response = await fetch(`${API_BASE}${item.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.body),
      });
      if (!response.ok) stillFailing.push(item);
    } catch {
      stillFailing.push(item);
    }
  }

  writeQueue(stillFailing);
}

export function pendingCount(): number {
  return readQueue().length;
}

/* ---------------------------------------------------------------------------
 * The two basic request helpers
 * ------------------------------------------------------------------------ */

/**
 * Send something to the server. Never throws.
 * Returns true if it went through, false if it was queued for later.
 */
async function post(path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      addToQueue(path, body);
      return false;
    }
    return true;
  } catch {
    addToQueue(path, body);
    return false;
  }
}

/** Read something from the server. Returns null instead of throwing. */
async function get<T>(path: string, password?: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: password ? { 'x-admin-password': password } : undefined,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/* ---------------------------------------------------------------------------
 * The actual things the app sends and asks for
 * ------------------------------------------------------------------------ */

export const api = {
  /** She blew out the candles and made a wish. */
  saveWish: (text: string) => post('/api/wishes', { text }),

  /** She wrote you a note back. */
  saveNote: (text: string, mood?: string) => post('/api/notes', { text, mood }),

  /** She finished the quiz. */
  saveQuizResult: (correct: number, total: number, answers: number[]) =>
    post('/api/quiz-results', { correct, total, answers }),

  /** A tap on a heart, a hug, a kiss - small counters you can look at later. */
  recordReaction: (kind: 'heart' | 'hug' | 'kiss' | 'compliment' | 'reason', target?: string) =>
    post('/api/reactions', { kind, target }),

  /** She opened a room. Lets you see what she actually explored. */
  recordVisit: (screen: string) => post('/api/visits', { screen }),

  /** Live totals shown inside the app (hug count and so on). */
  getCounters: () => get<{ hug: number; kiss: number; heart: number }>('/api/reactions/totals'),

  /** Everything, for your private admin page. */
  getEverything: (password: string) =>
    get<AdminSnapshot>('/api/admin/everything', password),
};

export type AdminSnapshot = {
  wishes: Array<{ id: string; text: string; createdAt: string }>;
  notes: Array<{ id: string; text: string; mood: string | null; createdAt: string }>;
  quizResults: Array<{ id: string; correct: number; total: number; createdAt: string }>;
  reactionTotals: Record<string, number>;
  visits: Array<{ screen: string; count: number; lastSeenAt: string }>;
  storageMode: 'mongodb' | 'file';
};

/** Retry queued requests whenever the phone finds a connection again. */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushQueue();
  });
}
