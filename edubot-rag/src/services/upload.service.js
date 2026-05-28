import { uploaderRawFile } from "./storage.service.js";
import { embedChunks } from "./embedding.service.js";
import { saveChunksToVectorStore } from "./storage.service.js";

const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 80;

if (CHUNK_SIZE >= CHUNK_OVERLAP) {
    throw new Error("CHUNK_SIZE must be less than CHUNK_OVERLAP");
}

// el dia de mañana tenga que usar pdf
//
const extractText = async (buffer, mimeType) => {
    if (mimeType == "application/pdf") {
        //podria implementar subir con pdf
        return;
    }

    return buffer.toString("utf-8");
};

// division - chunks
const splitText = (text) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        chunks.push(text.substring(i, i + CHUNK_SIZE));
    }
    return chunks;
};

/**
 * uploadFile - supabase
 * extractText -> markdown
 * splitText -> chunks
 * embedding -> vector
 * save chunks -> vector store MongoDB
 */

export const processFile = async ({ buffer, originalname, mimetype }) => {
    // subir el archivo con supabase service
    const storagePath = await uploaderRawFile(buffer, originalname, mimetype);
    // extraccion de texto
    const rawText = await extractText(buffer, mimetype);
    // split text
    const chunks = splitText(rawText);

    // embedding -> vector
    const vectors = await embedChunks(chunks);

    // save chunks -> vector store MongoDB
    await saveChunksToVectorStore(chunks, vectors, originalname);

    return {
        originalname,
        storagePath,
        chunks: chunks.length,
        totalChars: rawText.length,
    };
};
