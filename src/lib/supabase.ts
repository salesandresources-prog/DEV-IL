import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ptpkagihdzcrrxwnfsuo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0cGthZ2loZHpjcnJ4d25mc3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMjg5ODUsImV4cCI6MjEwMTgwNDk4NX0.O-iLvzfZy321mKWePI5TdZXk_jdONy3eIHtyVm2ZgTA";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
