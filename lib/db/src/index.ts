import mongoose from 'mongoose';

export * from './models';

/**
 * Connect to MongoDB.
 *
 * Note what this does NOT do: throw when there is no connection string. The
 * app is designed to run perfectly well with no database at all, so refusing
 * to even load would be wrong. The caller decides what to do when this
 * returns false.
 *
 * Returns true if we are connected, false if we are not.
 */
export async function connectToMongo(uri: string | null): Promise<boolean> {
  if (!uri) return false;

  try {
    await mongoose.connect(uri, {
      // Fail fast rather than hanging for thirty seconds. If the database is
      // unreachable we want to know immediately so we can fall back to a file.
      serverSelectionTimeoutMS: 6000,

      // This app has exactly one user. A free Atlas cluster caps connections
      // low, so there is no reason to hold open more than a handful.
      maxPoolSize: 5,
    });

    return true;
  } catch {
    return false;
  }
}

/** Close the connection cleanly when the server shuts down. */
export async function disconnectFromMongo(): Promise<void> {
  await mongoose.disconnect();
}

/** True while the connection is live. Used by the health check. */
export function isMongoConnected(): boolean {
  // 1 means "connected". The other states are disconnected, connecting
  // and disconnecting.
  return mongoose.connection.readyState === 1;
}
