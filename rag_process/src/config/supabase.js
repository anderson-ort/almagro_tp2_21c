import { createClient } from '@supabase/supabase-js'

// Use service_role key: bypasses RLS for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default supabase