import { createChatOne } from "../repositories/file.repository.js"
import { __joiner } from "../utils/utils.js"
import fs from "fs/promises"


export const chatController = async (request, response) => {

    const { userId } = request.body.user
    const { prompt } = request.body.user

    const data = await fs.readFile(__joiner("data", "mocksGeminiResponse.json"), 'utf8')

    const geminiApi = await JSON.parse(data)

    await createChatOne(
        userId, prompt, geminiApi[prompt], ['pag12.v5']
    )

    response
        .status(200)
        .json(
            { respuesta: geminiApi[prompt] }
        )

    return
}


