import { GoogleGenerativeAI } from '@google/generative-ai'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// gemini-embedding-2 with outputDimensionality: 768
// - text-embedding-004 was deprecated (no longer available via v1beta)
// - gemini-embedding-001 produces 3072 dims (above Atlas 2048 limit)
// - gemini-embedding-2 supports outputDimensionality, keeping 768 dims
//   so the Atlas vector index config stays unchanged
const embeddingModel = genai.getGenerativeModel({ model: 'gemini-embedding-2' })

/**
 * Generates a 768-dim embedding for a text string.
 * task_type RETRIEVAL_DOCUMENT for indexing, RETRIEVAL_QUERY for queries.
 */
export const generateEmbedding = async (text, taskType = 'RETRIEVAL_DOCUMENT') => {
  const result = await embeddingModel.embedContent({
    content: { parts: [{ text }], role: 'user' },
    taskType,
    outputDimensionality: 768,
  })
  return result.embedding.values  // float[]  length 768
}
