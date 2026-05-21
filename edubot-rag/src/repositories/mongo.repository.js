import User from "../models/user.schema.js";
import Chat from "../models/chat.schema.js";

export default class ChatRepositoryMongoService {
    async readChatAllHistory() {
        const chats = await Chat.find().populate("user").lean();

        const formattedChats = chats.map((chat) => ({
            ...chat,
            user: chat.user
                ? {
                      _id: chat.user._id,
                  }
                : null,
        }));
        return formattedChats;
    }
    async retrieveChatUserHistory(userId) {
        const chats = await Chat.find({ user: userId }).populate("user").lean();

        return chats.map((chat) => ({
            ...chat,
            user: chat.user
                ? {
                      _id: chat.user._id,
                  }
                : null,
        }));
    }

    async findUserChatById(chatId) {
        const chat = await Chat.findById(chatId).populate("user").lean();

        if (!chat) {
            return null;
        }

        return {
            ...chat,
            user: chat.user
                ? {
                      _id: chat.user._id,
                  }
                : null,
        };
    }

    async createChatOne(userId, prompt, answer, sources = []) {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found");
        }

        await Chat.create({
            prompt,
            answer,
            sources,
            user: user._id,
        });
    }

    async deleteChatOne(userId, chatId) {
        const result = await Chat.deleteOne({ _id: chatId, user: userId });
        return result.deletedCount > 0;
    }

    async deleteUserChatHistory(userId) {
        const result = await Chat.deleteMany({ user: userId });
        return result.deletedCount > 0;
    }
}
