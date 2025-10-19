export async function getSupabaseClient() {
	const Supabase = await import("@supabase/supabase-js");

	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		throw new Error("Missing Supabase environment variables");
	}

	return Supabase.createClient(supabaseUrl, supabaseKey);
}
