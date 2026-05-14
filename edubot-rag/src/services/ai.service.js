import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config.js";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

const aiService = {
    async generateText(prompt) {
        const response = await ai.models.generateContent({
            model: config.modelLlm,
            contents: prompt,
        });

        return response.text;
    },
};

export { aiService };
