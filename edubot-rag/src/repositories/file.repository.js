import fs from "fs/promises";
import { __joiner } from "../utils/utils.js";

export default class ChatRepositoryFileService {
    constructor() {
        this.HISTORY_FILE = __joiner("data", "chatHistory.json");
    }

    // lectura total
    async readChatAllHistory() {
        const data = await fs.readFile(this.HISTORY_FILE, "utf-8");
        return JSON.parse(data);
    }

    //lectura de un user
    async retrieveChatUserHistory(userId) {
        const data = await readChatAllHistory();
        return data[userId] || [];
    }

    async findUserChatById(userId, chatId) {
        const chatHistory = await this.retrieveChatUserHistory(userId);

        if (!chatHistory) return {};

        const chatsFounded = chatHistory.filter((chat) => chat.id === chatId);

        if (!chatsFounded) return {};

        return chatsFounded[0];
    }

    async writeBackToFile(data) {
        return fs.writeFile(this.HISTORY_FILE, JSON.stringify(data, null, 2));
    }

    // almacenamiento de una respuesta

    async createChatOne(userId, prompt, answer, sources = []) {
        const data = await this.readChatAllHistory();

        const chat = {
            id:
                Date.now().toString() +
                Math.random().toString(36).substring(2, 4),
            timeStamp: new Date().toISOString(),
            prompt,
            answer,
            sources,
        };

        data[userId].push(chat);

        await this.writeBackToFile(data);
    }

    async deleteChatOne(userId, chatId) {
        const data = await this.readChatAllHistory();
        data[userId] = data[userId].filter((chat) => chat.id !== chatId);
        await this.writeBackToFile(data);
        return;
    }

    async deleteUserChatHistory(userId) {
        const inMemoryData = await this.readChatAllHistory();
        inMemoryData[userId] = [];
        await this.writeBackToFile(inMemoryData);
    }
}
