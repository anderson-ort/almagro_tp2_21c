import supabase from '../config/supabase.js'

const BUCKET = process.env.SUPABASE_BUCKET

/**
 * Uploads the raw file buffer to Supabase Storage.
 * Path uses a timestamp prefix to avoid silent overwrites on same filename.
 * Returns the storage path for reference.
 */
export const uploadRawFile = async (fileBuffer, filename, mimeType) => {
  const storagePath = `${Date.now()}_${filename}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    })

  if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`)

  return data.path
}