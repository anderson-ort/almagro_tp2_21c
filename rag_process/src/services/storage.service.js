import supabase from '../config/supabase.js'

const BUCKET = process.env.SUPABASE_BUCKET

/**
 * Uploads the raw file buffer to Supabase Storage.
 * Path inside the bucket: <filename> (flat, no folders).
 * Returns the public URL (or null if the bucket is private).
 */
export const uploadRawFile = async (fileBuffer, filename, mimeType) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, fileBuffer, {
      contentType: mimeType,
      upsert: true,          // overwrite if same filename is re-uploaded
    })

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`)

  // Return the storage path so callers can reference the original file
  return data.path
}