import {
  NoteModel,
  QuizResultModel,
  ReactionModel,
  VisitModel,
  WishModel,
  isMongoConnected,
} from '@workspace/db';

import type {
  Note,
  QuizResult,
  ReactionKind,
  Store,
  Visit,
  Wish,
} from './types';

/**
 * Saves everything to MongoDB.
 *
 * Use this when you want the data to survive the server restarting, which on
 * most free hosting plans happens every time it goes idle.
 *
 * Every method here converts Mongo's own shapes (an ObjectId for the key, a
 * real Date for the timestamp) into plain strings before handing them back,
 * so nothing outside this file ever has to know we are using Mongo. That is
 * what lets the JSON-file version be a drop-in replacement.
 */
export class MongoStore implements Store {
  readonly mode = 'mongodb' as const;

  async setup(): Promise<void> {
    if (!isMongoConnected()) {
      throw new Error('Not connected to MongoDB');
    }

    // Build the indexes described in the models. Mongo does this in the
    // background, and it is safe to call every time the server starts.
    await Promise.all([
      WishModel.createIndexes(),
      NoteModel.createIndexes(),
      QuizResultModel.createIndexes(),
      ReactionModel.createIndexes(),
      VisitModel.createIndexes(),
    ]);
  }

  /* ---- Wishes --------------------------------------------------- */

  async addWish(text: string): Promise<Wish> {
    const document = await WishModel.create({ text });

    return {
      id: String(document._id),
      text: document.text,
      createdAt: document.createdAt.toISOString(),
    };
  }

  async listWishes(): Promise<Wish[]> {
    // `.lean()` tells Mongoose to hand back plain objects instead of full
    // documents with methods attached. We are only reading, so the extra
    // machinery is wasted work.
    const rows = await WishModel.find().sort({ createdAt: -1 }).limit(200).lean();

    return rows.map((row) => ({
      id: String(row._id),
      text: row.text,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  /* ---- Notes ---------------------------------------------------- */

  async addNote(text: string, mood: string | null): Promise<Note> {
    const document = await NoteModel.create({ text, mood });

    return {
      id: String(document._id),
      text: document.text,
      mood: document.mood ?? null,
      createdAt: document.createdAt.toISOString(),
    };
  }

  async listNotes(): Promise<Note[]> {
    const rows = await NoteModel.find().sort({ createdAt: -1 }).limit(200).lean();

    return rows.map((row) => ({
      id: String(row._id),
      text: row.text,
      mood: row.mood ?? null,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  /* ---- Quiz ----------------------------------------------------- */

  async addQuizResult(correct: number, total: number, answers: number[]): Promise<QuizResult> {
    const document = await QuizResultModel.create({ correct, total, answers });

    return {
      id: String(document._id),
      correct: document.correct,
      total: document.total,
      answers: document.answers,
      createdAt: document.createdAt.toISOString(),
    };
  }

  async listQuizResults(): Promise<QuizResult[]> {
    const rows = await QuizResultModel.find().sort({ createdAt: -1 }).limit(50).lean();

    return rows.map((row) => ({
      id: String(row._id),
      correct: row.correct,
      total: row.total,
      answers: row.answers ?? [],
      createdAt: row.createdAt.toISOString(),
    }));
  }

  /* ---- Reactions ------------------------------------------------ */

  async addReaction(kind: ReactionKind, target: string | null): Promise<void> {
    await ReactionModel.create({ kind, target });
  }

  async reactionTotals(): Promise<Record<string, number>> {
    // An aggregation pipeline: a list of steps Mongo runs over the
    // collection. This one says "group the documents by their kind, and for
    // each group count how many there are" - the Mongo way of writing
    // GROUP BY in SQL.
    const rows = await ReactionModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$kind', count: { $sum: 1 } } },
    ]);

    return Object.fromEntries(rows.map((row) => [row._id, row.count]));
  }

  /* ---- Visits --------------------------------------------------- */

  async recordVisit(screen: string): Promise<void> {
    // "Find the document for this screen, add one to its count, and if there
    // isn't one yet, create it." All in a single trip, which also means two
    // requests arriving together can never both create a duplicate.
    await VisitModel.updateOne(
      { screen },
      {
        $inc: { count: 1 },
        $set: { lastSeenAt: new Date() },
      },
      { upsert: true },
    );
  }

  async listVisits(): Promise<Visit[]> {
    const rows = await VisitModel.find().sort({ count: -1 }).lean();

    return rows.map((row) => ({
      screen: row.screen,
      count: row.count,
      lastSeenAt: new Date(row.lastSeenAt).toISOString(),
    }));
  }
}
