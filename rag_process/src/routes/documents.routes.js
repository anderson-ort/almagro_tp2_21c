import express from 'express'
import { listDocuments } from '../repositories/chunk.repository.js'

const router = express.Router()

// GET /api/v1/documents
// Returns all ingested files with their chunk count
router.get('/', async (req, res) => {
  try {
    const docs = await listDocuments()
    res.json({ total: docs.length, documents: docs })
  } catch (err) {
    console.error('[documents] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router