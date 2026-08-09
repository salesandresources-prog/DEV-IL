import { createClient } from "@supabase/supabase-js";

// Hardcoding the Supabase credentials to guarantee connection without Vercel Env Variable issues
const supabaseUrl = "https://ptpkagihdzcrrxwnfsuo.supabase.co";
const supabaseAnonKey = "sb_publishable_S5kLnbDquy-m3yqWeFLV9Q_hvNMXM8E";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
