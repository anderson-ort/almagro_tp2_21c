import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'

import __dirname from './src/utils/paths.js'
import chatRoutes from './src/routes/chat.routes.js'



const morgnType = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan(morgnType))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/", (request, response) => {
    response.sendFile(
        path.join(__dirname, "statics", "index.html")
    )
})

app.get("/health", (request, response) => {
    response
        .status(200)
        .json({
            status: "ok",
            timestamp: new Date().toISOString()
        })
})



app.use('/api/v1/chat', chatRoutes)


app.use(express.static(path.join(__dirname, "statics")))
app.use((request, response) => {
    response
        .status(404)
        .json({ error: "Not Found" })
})


export default app