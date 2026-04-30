
import fs from "fs/promises"
import { __joiner } from "../utils/utils.js"
import { timeStamp } from "console"


const HISTORY_FILE = __joiner("data", "chatHistory.json")

// lectura total
const readChatAllHistory = async () => {
    const data = await fs.readFile(HISTORY_FILE, 'utf-8')
    return JSON.parse(data)
}
//lectura de un user
const retrieveChatUserHistory = async (userId) => {
    const data = await readChatAllHistory()
    return data[userId] || []
}

const findUserChatById = async (userId, chatId) => {
    const chatHistory = await retrieveChatUserHistory(userId)

    if (!chatHistory) return {}

    const chatsFounded = chatHistory.filter(chat => chat.id === chatId)

    if (!chatsFounded) return {}

    return chatsFounded[0]

}

const writeBackToFile = async (data) => await fs.writeFile(HISTORY_FILE, JSON.stringify(data, null, 2))

// almacenamiento de una respuesta

const createChatOne = async (userId, prompt, answer, sources = []) => {

    const data = await readChatAllHistory()

    const chat = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 4),
        timeStamp: new Date().toISOString(),
        prompt,
        answer,
        sources
    }


    data[userId].push(chat)

    await writeBackToFile(data)

}

const deleteChatOne = async (userId, chatId) => {
    const data = await readChatAllHistory()
    data[userId] = data[userId].filter(chat => chat.id !== chatId)
    await writeBackToFile(data)
    return
}

const deleteUserChatHistory = async (userId) => {
    const inMemoryData = await readChatAllHistory()
    inMemoryData[userId] = []
    await writeBackToFile(inMemoryData)
}


export {
    readChatAllHistory,
    retrieveChatUserHistory,
    findUserChatById,
    writeBackToFile,
    createChatOne,
    deleteChatOne,
    deleteUserChatHistory

}