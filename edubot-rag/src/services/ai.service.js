import { GoogleGenAI } from "@google/genai";
import config from "../config/config.js";
import { generateEmbedding } from "./embedding.service.js";
import { findSimilarChunks } from "../repositories/chunk.repository.js";

const ai = new GoogleGenAI({ apiKey: config.googleApiKey });

const aiService = {
    async generateText(prompt) {
        // generador del embedding query
        const queryVector = await generateEmbedding(prompt, "RETRIEVAL_QUERY");

        // traerme todos los chunks que tengan un embedding similar al query
        const similarChunks = await findSimilarChunks(queryVector, 10);

        if (similarChunks.length === 0)
            return {
                message: "No se encontraron chunks similares.",
                sources: [],
            };

        const context = similarChunks.map((chunk) => chunk.content).join("\n");

        const updatedPrompt = `
          ROLE: You are a helpful assistant that answers questions based on the provided context.

          DO NOT MAKE UP ANSWERS

          CONTEXT:
          ${context}

          QUERY: ${prompt}

          RESPONSE:`;

        console.log(updatedPrompt);

        // generador del embedding query
        const response = await ai.models.generateContent({
            model: config.modelLlm,
            contents: updatedPrompt,
        });

        const source = similarChunks.map((chunk) => chunk.sourceFile);
        return {
            message: response.text,
            sources: source,
        };
    },
};

export { aiService, ai };
