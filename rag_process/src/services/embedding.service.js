import { GoogleGenerativeAI } from '@google/generative-ai'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// text-embedding-004 produces 768-dimensional vectors
const embeddingModel = genai.getGenerativeModel({ model: 'text-embedding-004' })

/**
 * Generates a 768-dim embedding for a text string.
 * task_type RETRIEVAL_DOCUMENT for indexing, RETRIEVAL_QUERY for queries.
 */
export const generateEmbedding = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType,
  })
  return result.embedding.values  // float[]  length 768
}