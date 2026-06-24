import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const mongodbUri = process.env.MONGODB_URI

if (!mongodbUri) {
  throw new Error("MONGODB_URI is not defined in backend/.env")
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise?: Promise<typeof mongoose> | null
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache
}

const cached: MongooseCache = globalWithMongoose.mongoose ?? { conn: null, promise: null }
globalWithMongoose.mongoose = cached

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    mongoose.set("strictQuery", true)
    cached.promise = mongoose.connect(mongodbUri as string).then((mongooseInstance) => mongooseInstance)
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectToDatabase
