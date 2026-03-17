import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yhkhhmzsdsjmwnpqenwy.supabase.co"; // TU Project URL (empieza con https:// y termina en .co)
const supabaseKey = "sb_publishable_SdaqGl0iDpoZYN8lYK8Shg_7iUYGz5T"; // Tu Publishable key (empieza con sb_publishable_...)

export const supabase = createClient(supabaseUrl, supabaseKey);