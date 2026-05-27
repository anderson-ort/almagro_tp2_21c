import { getCollection } from '../config/mongo.js'

/**
 * Saves a chunk with its embedding to MongoDB.
 * @param {string} content  - text of the chunk
 * @param {number[]} embedding  - 768-dim vector
 * @param {string} sourceFile  - original filename
 * @param {number} chunkIndex  - position within the document
 */
export const saveChunk = async (content, embedding, sourceFile, chunkIndex) => {
  const col = await getCollection()
  const doc = {
    content,
    embedding,
    sourceFile,
    chunkIndex,
    createdAt: new Date(),
  }
  const result = await col.insertOne(doc)
  return result.insertedId
}

/**
 * Vector search using MongoDB Atlas $vectorSearch.
 * Requires an Atlas Vector Search index named "embedding_index"
 * with numDimensions: 768 and similarity: "cosine".
 *
 * @param {number[]} queryEmbedding  - 768-dim query vector
 * @param {number} limit  - how many results to return
 * @returns {Array<{content, sourceFile, score}>}
 */
export const findSimilarChunks = async (queryEmbedding, limit = 3) => {
  const col = await getCollection()

  const results = await col.aggregate([
    {
      $vectorSearch: {
        index: 'embedding_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: limit * 10,  // oversample then re-rank
        limit,
      },
    },
    {
      $project: {
        _id: 0,
        content: 1,
        sourceFile: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]).toArray()

  return results
}

/**
 * Lists unique source files with their chunk count.
 */
export const listDocuments = async () => {
  const col = await getCollection()
  return col.aggregate([
    {
      $group: {
        _id: '$sourceFile',
        chunks: { $sum: 1 },
        uploadedAt: { $min: '$createdAt' },
      },
    },
    { $sort: { uploadedAt: -1 } },
    { $project: { _id: 0, filename: '$_id', chunks: 1, uploadedAt: 1 } },
  ]).toArray()
}