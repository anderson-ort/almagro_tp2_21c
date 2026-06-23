import config from "../config/config.js";
import supabase from "../config/supabase.js";
import { normalizeMimeType } from "../utils/normalizer.js";

export const uploaderRawFile = async (buffer, originalname, mimetype) => {
    const storagePath = `${originalname}`;
    const { data, error } = await supabase.storage
        .from(config.storageBucket)
        .upload(storagePath, buffer, {
            contentType: normalizeMimeType(mimetype),
            upsert: true,
        });
};
