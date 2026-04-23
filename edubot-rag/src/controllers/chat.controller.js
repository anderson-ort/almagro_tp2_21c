import { __joiner } from "../utils/utils.js"
import fs from "fs/promises"


export const chatController = async (request, response) => {

    const { prompt } = request.body

    const data = await fs.readFile(__joiner("data", "mocksGeminiResponse.json"), 'utf8')

    const geminiApi = await JSON.parse(data)

    response
        .status(200)
        .json(
            { respuesta: geminiApi[prompt] }
        )

    return
}


