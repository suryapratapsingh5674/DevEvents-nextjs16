import mongoose from "mongoose";

const { MONGODB_URI, NODE_ENV } = process.env;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

interface MongooseConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Preserve the connection across hot reloads in development.
const globalCache = globalThis as unknown as {
  mongoose: MongooseConnectionCache | undefined;
};

globalCache.mongoose ??= { conn: null, promise: null };
const cached = globalCache.mongoose;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Create a single connection promise to avoid duplicate connections.
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      // Use a single pool in serverless environments; adjust in production if needed.
      maxPoolSize: NODE_ENV === "production" ? 10 : 5,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
