import { MongoClient } from 'mongodb'

let client
let db
let connectPromise = null  // singleton promise — prevents parallel connections

export const connectDB = async () => {
  if (db) return db

  // If a connection attempt is already in flight, wait for it instead of
  // starting a second one (fixes race condition on concurrent requests)
  if (!connectPromise) {
    connectPromise = (async () => {
      client = new MongoClient(process.env.MONGODB_URI)
      await client.connect()
      db = client.db(process.env.MONGODB_DB)
      console.log(`MongoDB connected: ${process.env.MONGODB_DB}`)
      return db
    })().catch((err) => {
      // Reset so the next call can retry
      connectPromise = null
      throw err
    })
  }

  return connectPromise
}

export const getCollection = async () => {
  const database = await connectDB()
  return database.collection(process.env.MONGODB_COLLECTION)
}