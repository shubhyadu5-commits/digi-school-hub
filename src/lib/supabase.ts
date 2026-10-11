import { createClient } from '@supabase/supabase-js';

// .env file se URL aur Key le raha hai
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL ya Key missing hai. Kripya .env file check karein.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);