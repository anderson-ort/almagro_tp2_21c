import { Router } from "express";
import { uploader } from "../utils/uploader.js";
import { processFile } from "../services/upload.service.js";

const router = Router();

// middleware
router.post("/upload", uploader.single("file"), async (request, response) => {
    if (!request.file) {
        return response.status(400).json({ message: "No file uploaded" });
    }

    try {
        const result = await processFile(request.file);

        response.status(201).json({
            message: "File uploaded successfully",
            ...result,
        });
    } catch (error) {
        res.status(500).json({ message: "Error uploading file" });
    }
});

router.use((error, request, response, next) => {
    if (error) {
        response.status(400).json({ message: error.message });
    }
    next();
});

export { router as uploadRouter };
