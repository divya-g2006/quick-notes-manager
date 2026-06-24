import mongoose from "mongoose"

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: { conn: typeof mongoose | null; promise?: Promise<typeof mongoose> }
}

let cached = globalWithMongoose.mongoose

if (!cached) {
  cached = { conn: null, promise: null }
  globalWithMongoose.mongoose = cached
}

async function connectToDatabase() {
  const mongodbUri = process.env.MONGODB_URI

  if (!mongodbUri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true)
    cached.promise = mongoose.connect(mongodbUri).then((mongooseInstance) => mongooseInstance)
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectToDatabase
