import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config.js";
import { generateEmbedding } from "./embedding.service.js";
import { findSimilarChunks } from "../repositories/chunk.repository.js";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

// const aiService = {
//     async generateText(prompt) {
//         const response = await ai.models.generateContent({
//             model: config.modelLlm,
//             contents: prompt,
//         });

//         return response.text;
//     },
// };

const aiService = {
    async generateText(prompt) {
        // generador del embedding query
        const queryVector = await generateEmbedding(prompt, "RETRIVAL_QUERY");

        // traerme todos los chunks que tengan un embedding similar al query
        const similarChunks = await findSimilarChunks(queryVector);

        if (similarChunks.length === 0)
            return {
                message: "No se encontraron chunks similares.",
                sources: [],
            };

        const context = similarChunks.map((chunk) => chunk.content).join("\n");

        const updatedPrompt = `
          ROLE: You are a helpful assistant that answers questions based on the provided context. If the context does not contain the answer, respond with "I don't know"
          DO NOT MAKE UP ANSWERS

          CONTEXT: ${context}
          QUERY: ${prompt}

          RESPONSE:`;

        // generador del embedding query
        const response = await ai.models.generateContent({
            model: config.modelLlm,
            contents: prompt,
        });

        const source = similarChunks.map((chunk) => chunk.source);
        return {
            message: response.text,
            sources: source,
        };
    },
};

export { aiService, ai };
