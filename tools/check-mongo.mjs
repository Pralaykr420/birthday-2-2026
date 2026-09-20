/**
 * Check your MongoDB connection string actually works.
 *
 *   node tools/check-mongo.mjs
 *
 * Reads MONGODB_URI from your .env, connects, writes a test document, reads
 * it back, deletes it, and tells you what happened. Run this before you trust
 * it with anything that matters.
 */

import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';

// Read .env by hand so this script needs no extra packages.
let uri = process.env.MONGODB_URI;

if (!uri) {
  try {
    const env = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    uri = env
      .split('\n')
      .find((line) => line.trim().startsWith('MONGODB_URI='))
      ?.split('=')
      .slice(1)
      .join('=')
      .trim();
  } catch {
    // No .env file. Handled below.
  }
}

if (!uri) {
  console.log('No MONGODB_URI found in .env or the environment.');
  console.log('That is fine - the app will save to a JSON file instead.');
  process.exit(0);
}

console.log('Connecting…');

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('✓ Connected');

  const Test = mongoose.model('ConnectionCheck', new mongoose.Schema({ at: Date }));

  const written = await Test.create({ at: new Date() });
  console.log('✓ Wrote a test document');

  const found = await Test.findById(written._id);
  console.log(found ? '✓ Read it back' : '✗ Could not read it back');

  await Test.deleteOne({ _id: written._id });
  console.log('✓ Cleaned up');

  console.log(`\nDatabase: ${mongoose.connection.name}`);
  console.log('Everything works. You are good to go.');
} catch (error) {
  console.log(`\n✗ Failed: ${error.message}\n`);
  console.log('The usual causes:');
  console.log('  - wrong password in the connection string');
  console.log('  - you did not add 0.0.0.0/0 under Network Access in Atlas');
  console.log('  - symbols in the password need percent-encoding');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
