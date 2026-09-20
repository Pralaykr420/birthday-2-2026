/**
 * The MongoDB collections.
 *
 * Mongoose calls these "models". A model is a description of what a document
 * in a collection looks like, plus the functions to read and write them.
 *
 * MongoDB does not force you to describe your data up front the way SQL does.
 * We do it anyway, because a schema is what stops a typo quietly writing
 * `txet` into the database and nobody noticing until you go looking for her
 * birthday wish and it is not there.
 */

import { Schema, model, type InferSchemaType, type Model } from 'mongoose';

/* ---------------------------------------------------------------------------
 * Shared settings applied to every collection
 * ------------------------------------------------------------------------ */

const commonOptions = {
  /** Mongoose adds `createdAt` and `updatedAt` for us and keeps them correct. */
  timestamps: true,

  /** Tidy up what comes out, so routes can send documents straight to the app. */
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(_document: unknown, record: Record<string, unknown>) {
      // Mongo calls the id `_id` and it is an object, not a string. The app
      // just wants `id` as text.
      record.id = String(record._id);
      delete record._id;
      return record;
    },
  },
} as const;

/* ---------------------------------------------------------------------------
 * Wishes - what she wished for on the cake
 * ------------------------------------------------------------------------ */

const wishSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  commonOptions,
);

// An index on createdAt, descending. Without one, "give me the newest wishes"
// makes Mongo read every document and sort them. With one, it walks a sorted
// list. At eleven wishes this is irrelevant; it is here because it is the
// habit worth having.
wishSchema.index({ createdAt: -1 });

export type WishDocument = InferSchemaType<typeof wishSchema>;
export const WishModel: Model<WishDocument> = model<WishDocument>('Wish', wishSchema);

/* ---------------------------------------------------------------------------
 * Notes - messages she writes back to you
 * ------------------------------------------------------------------------ */

const noteSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 5000 },
    /** Optional label, in case you add a mood picker later. */
    mood: { type: String, default: null, maxlength: 40 },
  },
  commonOptions,
);

noteSchema.index({ createdAt: -1 });

export type NoteDocument = InferSchemaType<typeof noteSchema>;
export const NoteModel: Model<NoteDocument> = model<NoteDocument>('Note', noteSchema);

/* ---------------------------------------------------------------------------
 * Quiz results
 * ------------------------------------------------------------------------ */

const quizResultSchema = new Schema(
  {
    correct: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    /** Which option she picked for each question. */
    answers: { type: [Number], default: [] },
  },
  commonOptions,
);

quizResultSchema.index({ createdAt: -1 });

export type QuizResultDocument = InferSchemaType<typeof quizResultSchema>;
export const QuizResultModel: Model<QuizResultDocument> = model<QuizResultDocument>(
  'QuizResult',
  quizResultSchema,
);

/* ---------------------------------------------------------------------------
 * Reactions - hearts, hugs, kisses, compliments
 *
 * One document per tap rather than one running total. Documents are cheap,
 * and this way you can also see WHEN she sent them, which is much nicer than
 * a bare number.
 * ------------------------------------------------------------------------ */

const reactionSchema = new Schema(
  {
    kind: {
      type: String,
      required: true,
      enum: ['heart', 'hug', 'kiss', 'compliment', 'reason'],
    },
    /** What she reacted to, if anything - a photo id, for example. */
    target: { type: String, default: null, maxlength: 120 },
  },
  commonOptions,
);

reactionSchema.index({ kind: 1 });

export type ReactionDocument = InferSchemaType<typeof reactionSchema>;
export const ReactionModel: Model<ReactionDocument> = model<ReactionDocument>(
  'Reaction',
  reactionSchema,
);

/* ---------------------------------------------------------------------------
 * Visits - how often each room has been opened
 *
 * This one is different: a single document per room that we keep updating,
 * rather than one per visit. We only ever want the count, so storing a
 * thousand documents to add them up again would be silly.
 * ------------------------------------------------------------------------ */

const visitSchema = new Schema(
  {
    /** `unique` means Mongo itself refuses to create a second row per screen. */
    screen: { type: String, required: true, unique: true, maxlength: 40 },
    count: { type: Number, default: 0 },
    lastSeenAt: { type: Date, default: () => new Date() },
  },
  commonOptions,
);

export type VisitDocument = InferSchemaType<typeof visitSchema>;
export const VisitModel: Model<VisitDocument> = model<VisitDocument>('Visit', visitSchema);
