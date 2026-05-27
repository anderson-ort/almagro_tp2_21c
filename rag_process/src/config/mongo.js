import { MongoClient } from 'mongodb'

let client
let db

export const connectDB = async () => {
  if (db) return db

  client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  db = client.db(process.env.MONGODB_DB)

  console.log(`MongoDB connected: ${process.env.MONGODB_DB}`)
  return db
}

export const getCollection = async () => {
  const database = await connectDB()
  return database.collection(process.env.MONGODB_COLLECTION)
}