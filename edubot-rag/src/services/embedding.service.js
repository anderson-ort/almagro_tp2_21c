import { ai } from "./ai.service.js";
import config from "../config/config.js";

const generateEmbedding = async (chunk, taskType = "RETRIEVAL_DOCUMENT") => {
    // 1. Guard against empty inputs from the HTTP request
    if (!chunk || typeof chunk !== "string") {
        throw new Error(
            "generateEmbedding requires a valid string for the 'chunk' parameter.",
        );
    }

    // 2. Guard against missing config variables
    const modelName = "gemini-embedding-001"; // If using config.modelName, ensure it exists!
    if (!modelName) {
        throw new Error(
            "Server configuration error: Embedding model name is undefined.",
        );
    }

    const result = await ai.models.embedContent({
        model: modelName,
        contents: chunk,
        config: {
            taskType: taskType,
            outputDimensionality: config.outputDimensionality,
        },
    });

    return result.embeddings[0].values;
};

const embedChunks = (chunks) => {
    return chunks.map((chunk) => generateEmbedding(chunk));
};

export { embedChunks, generateEmbedding };
