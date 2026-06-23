import { createClient } from "@supabase/supabase-js";
import config from "./config.js";

const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);

export default supabase;
