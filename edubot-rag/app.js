import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { __joiner } from './src/utils/utils.js'

import { proxyRouter } from "./src/routes/proxy.router.js"
import { chatRouter } from './src/routes/chat.router.js'


const app = express()
const morganApacheStyle = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'




app.use(cors())
app.use(morgan(morganApacheStyle))
app.use(express.static(__joiner("static"))) //commonJs __dirname //

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/", (request, response) => {

    response.sendFile(
        __joiner("static", "index.html")
    )
})


app.get("/health", (requests, response) => {
    response
        .status(200)
        .json({
            status: "ok",
            timestamp: new Date().toISOString()
        })
})



app.use("/proxy", proxyRouter)

app.use("/api/v1", chatRouter)

app.use((request, response) => {
    response
        .status(404)
        .json({
            msg: "Not found 😒"
        })
})


export default app