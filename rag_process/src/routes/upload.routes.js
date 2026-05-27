import express from 'express'
import multer from 'multer'
import { verifyApiKey } from '../middleware/auth.middleware.js'
import { processFile } from '../services/upload.service.js'

const router = express.Router()

const ACCEPTED_TYPES = ['application/pdf', 'text/markdown', 'text/plain', 'text/x-markdown']

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },   // 20 MB cap
  fileFilter: (req, file, cb) => {
    if (ACCEPTED_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, Markdown, and plain-text files are accepted'), false)
    }
  },
})

// POST /api/v1/upload
// Protected: X-API-Key header required
// Body: multipart/form-data, field "file"
router.post('/', verifyApiKey, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file received' })
  }

  try {
    const result = await processFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    res.status(201).json({ message: 'File processed successfully', ...result })
  } catch (err) {
    console.error('[upload] Error:', err.message)
    res.status(422).json({ error: err.message })
  }
})

// Multer error handler (file type / size rejections)
router.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message })
  }
  next()
})

export default router