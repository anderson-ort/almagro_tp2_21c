import 'dotenv/config'
import express from 'express'
import { connectDB } from './src/config/mongo.js'
import uploadRoutes from './src/routes/upload.routes.js'
import queryRoutes from './src/routes/query.routes.js'
import documentsRoutes from './src/routes/documents.routes.js'

const app = express()

app.use(express.json())

app.use('/api/v1/upload',    uploadRoutes)
app.use('/api/v1/query',     queryRoutes)
app.use('/api/v1/documents', documentsRoutes)

const PORT = process.env.PORT || 3000

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`RAG API running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message)
    process.exit(1)
  })