import { MongoClient } from "mongodb";
import config from "../config/config.js";

const client = new MongoClient(config.mongoUri);
await client.connect();
const db = client.db(config.mongoDbName);

const saveChunksToVectorStore = async (chunks, vectors, originalname) => {
    const collection = db.collection(config.mongoCollectionName);

    const chunksWithVectors = chunks.map((chunk, index) => ({
        ...chunk,
        vector: vectors[index],
        originalname,
        index,
    }));

    await collection.insertMany(chunksWithVectors);
};

const findSimilarChunks = async (queryEmbedding, limit = 3) => {
    const collection = db.collection(config.mongoCollectionName);

    const result = await collection
        .aggregate([
            {
                $vectorSearch: {
                    queryVector: queryEmbedding,
                    path: "embedding",
                    numCandidates: limit * 10,
                    limit,
                    index: "embedding_index",
                },
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    sourceFile: 1,
                    chunkIndex: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ])
        .toArray();

    return result;
};

export { saveChunksToVectorStore, findSimilarChunks };
