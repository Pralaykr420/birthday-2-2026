/**
 * The shape of "somewhere to save things".
 *
 * Two different things implement this: a JSON file, and a Postgres database.
 * Every route in the app talks to this shape and has no idea which one it is
 * actually using. That is the point - it means you can start with no database
 * at all and add one later without touching a single route.
 */

export type Wish = {
  id: string;
  text: string;
  createdAt: string;
};

export type Note = {
  id: string;
  text: string;
  mood: string | null;
  createdAt: string;
};

export type QuizResult = {
  id: string;
  correct: number;
  total: number;
  answers: number[];
  createdAt: string;
};

export type Visit = {
  screen: string;
  count: number;
  lastSeenAt: string;
};

export type ReactionKind = 'heart' | 'hug' | 'kiss' | 'compliment' | 'reason';

export type Store = {
  /** Which kind of storage this is. Shown on your admin page. */
  readonly mode: 'mongodb' | 'file';

  /** Create any tables or files needed. Called once when the server starts. */
  setup(): Promise<void>;

  addWish(text: string): Promise<Wish>;
  listWishes(): Promise<Wish[]>;

  addNote(text: string, mood: string | null): Promise<Note>;
  listNotes(): Promise<Note[]>;

  addQuizResult(correct: number, total: number, answers: number[]): Promise<QuizResult>;
  listQuizResults(): Promise<QuizResult[]>;

  addReaction(kind: ReactionKind, target: string | null): Promise<void>;
  reactionTotals(): Promise<Record<string, number>>;

  recordVisit(screen: string): Promise<void>;
  listVisits(): Promise<Visit[]>;
};
