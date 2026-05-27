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

  const parsedTopK = parseInt(topK, 10)
  if (isNaN(parsedTopK) || parsedTopK < 1) {
    return res.status(400).json({ error: '"topK" must be a positive integer' })
  }

  try {
    const result = await queryRAG(prompt.trim(), Math.min(parsedTopK, 10))
    res.json(result)
  } catch (err) {
    console.error('[query] Error:', err.message)
    res.status(500).json({ error: 'Query failed' })
  }
})

export default router