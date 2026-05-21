import repository from "../repositories/index.js";

export const getUserHistoryService = (userId) =>
    repository.retrieveChatUserHistory(userId);
export const deleteUseChatOneService = (userId, chatId) =>
    repository.deleteChatOne(userId, chatId);
export const deleteAllHistoryService = (userId) =>
    repository.deleteUserChatHistory(userId);
