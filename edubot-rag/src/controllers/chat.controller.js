import { createChatOne } from "../repositories/file.repository.js";
import { __joiner } from "../utils/utils.js";
import { aiService } from "../services/ai.service.js";

export const chatController = async (request, response) => {
    const { userId } = request.user;
    const { prompt } = request.body;

    const geminiApiResponse = await aiService.generateText(prompt);

    await createChatOne(userId, prompt, geminiApiResponse, ["chatResponse"]);

    response.status(200).json({ respuesta: geminiApiResponse });

    return;
};
