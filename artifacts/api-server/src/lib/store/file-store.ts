import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { logger } from '../logger';
import type {
  Note,
  QuizResult,
  ReactionKind,
  Store,
  Visit,
  Wish,
} from './types';

type FileShape = {
  wishes: Wish[];
  notes: Note[];
  quizResults: QuizResult[];
  reactions: Record<string, number>;
  visits: Record<string, { count: number; lastSeenAt: string }>;
};

const EMPTY: FileShape = {
  wishes: [],
  notes: [],
  quizResults: [],
  reactions: {},
  visits: {},
};

/**
 * Saves everything to one JSON file on disk.
 *
 * This exists so the app runs with absolutely no setup. Start the server, and
 * it works. No database to provision, no connection string to find.
 *
 * Two things to know:
 *
 * 1. WRITES ARE QUEUED. If two requests arrive at the same moment, writing
 *    them both at once would corrupt the file. So every write waits its turn
 *    in a chain. With one user this is instant; it just makes it impossible
 *    to lose data to bad timing.
 *
 * 2. WRITES ARE ATOMIC. We write to a temporary file and then rename it.
 *    Renaming is a single operation the operating system cannot interrupt,
 *    so if the server dies mid-save you still have the previous good file
 *    rather than half a broken one.
 *
 * The limitation: on free hosting that wipes the disk on restart, this data
 * disappears. If that matters, set DATABASE_URL and it uses Postgres instead.
 */
export class FileStore implements Store {
  readonly mode = 'file' as const;

  private data: FileShape = structuredClone(EMPTY);

  /** The chain that keeps writes in order. */
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(private readonly path: string) {}

  async setup(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });

    try {
      const raw = await readFile(this.path, 'utf8');
      this.data = { ...structuredClone(EMPTY), ...(JSON.parse(raw) as FileShape) };
      logger.info({ path: this.path }, 'Loaded existing data file');
    } catch {
      // No file yet, or it is unreadable. Start fresh.
      await this.save();
      logger.info({ path: this.path }, 'Created a new data file');
    }
  }

  /** Put a save on the end of the queue and wait for it. */
  private save(): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      const temporary = `${this.path}.tmp`;
      await writeFile(temporary, JSON.stringify(this.data, null, 2), 'utf8');
      await rename(temporary, this.path);
    });

    return this.writeQueue;
  }

  /* ---- Wishes --------------------------------------------------- */

  async addWish(text: string): Promise<Wish> {
    const wish: Wish = { id: randomUUID(), text, createdAt: new Date().toISOString() };
    this.data.wishes.push(wish);
    await this.save();
    return wish;
  }

  async listWishes(): Promise<Wish[]> {
    return [...this.data.wishes].reverse();
  }

  /* ---- Notes ---------------------------------------------------- */

  async addNote(text: string, mood: string | null): Promise<Note> {
    const note: Note = { id: randomUUID(), text, mood, createdAt: new Date().toISOString() };
    this.data.notes.push(note);
    await this.save();
    return note;
  }

  async listNotes(): Promise<Note[]> {
    return [...this.data.notes].reverse();
  }

  /* ---- Quiz ----------------------------------------------------- */

  async addQuizResult(correct: number, total: number, answers: number[]): Promise<QuizResult> {
    const result: QuizResult = {
      id: randomUUID(),
      correct,
      total,
      answers,
      createdAt: new Date().toISOString(),
    };
    this.data.quizResults.push(result);
    await this.save();
    return result;
  }

  async listQuizResults(): Promise<QuizResult[]> {
    return [...this.data.quizResults].reverse();
  }

  /* ---- Reactions ------------------------------------------------ */

  async addReaction(kind: ReactionKind): Promise<void> {
    this.data.reactions[kind] = (this.data.reactions[kind] ?? 0) + 1;
    await this.save();
  }

  async reactionTotals(): Promise<Record<string, number>> {
    return { ...this.data.reactions };
  }

  /* ---- Visits --------------------------------------------------- */

  async recordVisit(screen: string): Promise<void> {
    const existing = this.data.visits[screen];
    this.data.visits[screen] = {
      count: (existing?.count ?? 0) + 1,
      lastSeenAt: new Date().toISOString(),
    };
    await this.save();
  }

  async listVisits(): Promise<Visit[]> {
    return Object.entries(this.data.visits)
      .map(([screen, value]) => ({ screen, ...value }))
      .sort((a, b) => b.count - a.count);
  }
}
