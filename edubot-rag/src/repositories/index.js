import ChatRepositoryMongoService from "./mongo.repository.js";
import ChatRepositoryFileService from "./file.repository.js";
import config from "../config/config.js";

class ChatRepositoryFactory {
    static create() {
        if (config.chatStorage === "mongo") {
            return new ChatRepositoryMongoService();
        }

        if (config.chatStorage === "file") {
            return new ChatRepositoryFileService();
        }
    }
}

export default ChatRepositoryFactory.create();
