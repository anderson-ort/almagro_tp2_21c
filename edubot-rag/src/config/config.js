export const config = {
    jwtTokenSecret: process.env.JWT_TOKEN_SECRET,
    googleApiKey: process.env.GOOGLE_API_KEY,
    modelLlm: process.env.MODEL_LLM,
    mongoUri: process.env.MONGO_URI,
    chatStorage: process.env.CHAT_STORAGE,
    acceptedFileTypes: process.env.ACCEPTED_FILE_TYPES.split(","),
    bucketName: process.env.SUPABASE_BUCKET_NAME,
    modelEmbedding: process.env.MODEL_EMBEDDING,
    outputDimensionality: process.env.MODEL_EMBEDDING_DIM,
};
