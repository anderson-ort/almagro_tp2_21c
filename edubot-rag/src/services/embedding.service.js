import { ai } from "./ai.service.js";
import { config } from "../config.js";

const embeddingModel = ai.getEmbeddingModel({
    modelName: config.modelEmbedding,
});

const generateEmbedding = async (chunk, taskType = "RETRIVAL_DOCUMENT") => {
    const result = await embeddingModel.embedContent({
        content: { parts: [{ text: chunk }], role: "user" },
        taskType: taskType,
        outputDimensionality: config.outputDimensionality,
    });
    return result.embedding.values;
};

const embedChunks = (chunks) => {
    return chunks.map((chunk) => generateEmbedding(chunk));
};

export { embedChunks, generateEmbedding };
