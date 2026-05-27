import pdfParse from 'pdf-parse'
import { generateEmbedding } from './embedding.service.js'
import { uploadRawFile } from './storage.service.js'
import { saveChunk } from '../repositories/chunk.repository.js'

const CHUNK_SIZE = 600    // characters — good balance for Gemini embeddings
const CHUNK_OVERLAP = 80  // overlap to avoid cutting context at boundaries

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

const extractText = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    const parsed = await pdfParse(buffer)
    return parsed.text
  }
  // Markdown / plain text
  return buffer.toString('utf-8')
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

const splitIntoChunks = (text) => {
  const chunks = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length)
    const chunk = text.slice(start, end).trim()
    if (chunk.length > 50) chunks.push(chunk)   // discard tiny trailing pieces
    start += CHUNK_SIZE - CHUNK_OVERLAP
  }

  return chunks
}

// ---------------------------------------------------------------------------
// Main pipeline
// ---------------------------------------------------------------------------

/**
 * Full pipeline for a single uploaded file:
 *   1. Upload raw file to Supabase Storage
 *   2. Extract text (PDF or Markdown)
 *   3. Split into chunks
 *   4. Embed each chunk with Gemini text-embedding-004
 *   5. Save chunks + vectors to MongoDB
 *
 * Embeddings are generated sequentially to stay within Gemini free-tier rate
 * limits (~60 RPM). If you have a paid plan, you can parallelise with
 * Promise.allSettled and a small concurrency limiter.
 */
export const processFile = async (fileBuffer, originalName, mimeType) => {
  // 1. Persist the original file to Supabase Storage
  const storagePath = await uploadRawFile(fileBuffer, originalName, mimeType)

  // 2. Extract text
  const rawText = await extractText(fileBuffer, mimeType)

  if (!rawText || rawText.trim().length < 100) {
    throw new Error('File contains no extractable text (scanned image or empty document)')
  }

  // 3. Chunk
  const chunks = splitIntoChunks(rawText)
  console.log(`[upload] ${originalName}: ${chunks.length} chunks from ${rawText.length} chars`)

  // 4 + 5. Embed and save sequentially
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i], 'RETRIEVAL_DOCUMENT')
    await saveChunk(chunks[i], embedding, originalName, i)

    if ((i + 1) % 10 === 0) {
      console.log(`[upload] ${originalName}: ${i + 1}/${chunks.length} chunks saved`)
    }
  }

  return {
    filename: originalName,
    storagePath,
    chunksProcessed: chunks.length,
    totalCharacters: rawText.length,
  }
}