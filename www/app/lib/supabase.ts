import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing Supabase environment variables");
	}

	return createClient(supabaseUrl, supabaseKey);
}
