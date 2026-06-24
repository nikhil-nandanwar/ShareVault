import { variables } from "@/lib/variables";
import mongoose from "mongoose";

const uri = `mongodb+srv://${variables.MONGO_USERNAME}:${variables.MONGO_PASSWORD}@cluster0.pxlkh.mongodb.net/${variables.MONGO_DB_NAME}`;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
   
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    }).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      return mongoose;
    }).catch((error) => {
      console.error("❌ MongoDB connection error:", error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  
  return cached.conn;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await cached.conn.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log("✅ MongoDB disconnected");
  }
}

export function getDatabaseStatus(): { connected: boolean; state: string } {
  if (!cached.conn) {
    return { connected: false, state: "disconnected" };
  }
  
  const state = cached.conn.connection.readyState;
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  
  return {
    connected: state === 1,
    state: states[state] || "unknown",
  };
}
