import mongoose from 'mongoose';

/**
 * Connects Mongoose. Transactions need a replica set, so when MONGODB_URI is unset
 * (development) an in-memory single-node replica set is started instead.
 * @param {{ uri?: string, logger?: { info: Function } }} opts
 * @returns {Promise<{ uri: string, stop: () => Promise<void> }>}
 */
export async function connectDb({ uri, logger } = {}) {
  mongoose.set('strictQuery', true);
  mongoose.set('sanitizeFilter', true);

  let resolvedUri = uri;
  let memory = null;
  if (!resolvedUri) {
    const { MongoMemoryReplSet } = await import('mongodb-memory-server');
    memory = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger' } });
    resolvedUri = memory.getUri();
    logger?.info('using in-memory MongoDB replica set (dev)');
  }

  await mongoose.connect(resolvedUri, { autoIndex: true });
  return {
    uri: resolvedUri,
    stop: async () => {
      await mongoose.disconnect();
      if (memory) await memory.stop();
    },
  };
}

/** @returns {boolean} true when Mongoose is connected */
export function dbReady() {
  return mongoose.connection.readyState === 1;
}
