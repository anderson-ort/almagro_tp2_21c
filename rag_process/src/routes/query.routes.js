import express from 'express'
import { queryRAG } from '../services/query.service.js'

const router = express.Router()

// POST /api/v1/query
// Body: { "prompt": "your question here", "topK": 3 }
router.post('/', async (req, res) => {
  const { prompt, topK = 3 } = req.body

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: '"prompt" is required' })
  }

  try {
    const result = await queryRAG(prompt.trim(), Math.min(topK, 10))
    res.json(result)
  } catch (err) {
    console.error('[query] Error:', err.message)
    res.status(500).json({ error: 'Query failed', detail: err.message })
  }
})

export default router