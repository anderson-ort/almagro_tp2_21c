import { GoogleGenerativeAI } from '@google/generative-ai'
import { generateEmbedding } from './embedding.service.js'
import { findSimilarChunks } from '../repositories/chunk.repository.js'

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const chatModel = genai.getGenerativeModel({ model: 'gemini-2.0-flash' })

/**
 * RAG pipeline:
 *   1. Embed the user query (RETRIEVAL_QUERY task type)
 *   2. Vector search → top-k relevant chunks from MongoDB
 *   3. Build a grounded prompt and call Gemini
 *   4. Return the answer + sources
 */
export const queryRAG = async (prompt, topK = 3) => {
  // 1. Embed the question
  const queryVector = await generateEmbedding(prompt, 'RETRIEVAL_QUERY')

  // 2. Retrieve relevant chunks
  const chunks = await findSimilarChunks(queryVector, topK)

  if (chunks.length === 0) {
    return {
      answer: 'No relevant information was found in the uploaded documents for that question.',
      sources: [],
    }
  }

  // 3. Build grounded prompt
  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.sourceFile})\n${c.content}`)
    .join('\n\n')

  const fullPrompt = `You are a helpful assistant that answers questions based strictly on the provided context.
If the context does not contain enough information, say so clearly — do not make things up.
Always mention which source(s) you used at the end of your answer.

CONTEXT:
${context}

QUESTION:
${prompt}

ANSWER:`

  // 4. Generate answer
  const result = await chatModel.generateContent(fullPrompt)
  const answer = result.response.text()

  // 5. Deduplicate sources
  const sources = [...new Set(chunks.map((c) => c.sourceFile))]

  return { answer, sources }
}