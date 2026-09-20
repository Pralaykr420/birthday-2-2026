/**
 * Reads the server's settings from environment variables, in one place.
 *
 * Environment variables are how you give a server secrets without writing
 * them into the code. On your computer they come from a .env file; on a
 * hosting service you type them into a dashboard.
 *
 * Anything required is checked here, when the server starts, so a missing
 * setting fails loudly and immediately rather than halfway through a request
 * at midnight.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

const rawPort = optional('PORT', '3001');
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`PORT must be a positive number, got "${rawPort}"`);
}

export const env = {
  port,

  isProduction: process.env['NODE_ENV'] === 'production',

  /**
   * The password for your private inbox. Must match `adminPassword` in the
   * frontend's love.config.ts.
   */
  adminPassword: required('ADMIN_PASSWORD'),

  /**
   * Where to save things.
   *
   * With a MONGODB_URI we use MongoDB. Without one we fall back to a JSON
   * file on disk, which means the whole thing runs with zero setup. The file
   * is fine for one person's birthday; use Mongo if you want it to survive
   * the server restarting on a free hosting plan.
   *
   * A free Atlas connection string looks like:
   *   mongodb+srv://user:password@cluster0.abcde.mongodb.net/omniscient
   */
  mongoUri: process.env['MONGODB_URI'] ?? null,

  /** Where the JSON file lives when there is no database. */
  dataFile: optional('DATA_FILE', './data/omniscient.json'),

  /**
   * Which websites are allowed to talk to this server.
   * Comma-separated, e.g. "https://our-app.vercel.app,http://localhost:5173"
   * Leave unset during development to allow everything.
   */
  allowedOrigins: (process.env['ALLOWED_ORIGINS'] ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
};
