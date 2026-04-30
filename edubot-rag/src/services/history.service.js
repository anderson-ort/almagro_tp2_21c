import { deleteChatOne, deleteUserChatHistory, retrieveChatUserHistory } from "../repositories/file.repository.js"

export const getUserHistoryService = (userId) => retrieveChatUserHistory(userId)
export const deleteUseChatOneService = (userId, chatId) => deleteChatOne(userId, chatId)
export const deleteAllHistoryService = (userId) => deleteUserChatHistory(userId)