import multer from "multer";
import config from "../config/config.js";

export const uploader = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB
    },
    fileFilter: (request, file, callback) => {
        if (config.acceptedFileTypes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Invalid file type"), false);
        }
    },
});
