import { getSupabaseClient } from "@/lib/supabase";

export const joinWaitlist = async (email: string) => {
	try {
		const supabase = await getSupabaseClient();
		const { error } = await supabase.from("hviz_waitlist").insert([{ email }]).select();

		if (error?.code === "23505") {
			return {
				success: false,
				message: "Email already exists in the waitlist.",
			};
		}

		if (error) {
			console.error("Supabase error:", JSON.stringify(error, null, 2));
			return {
				success: false,
				message: error.message,
			};
		}

		return {
			success: true,
			message: "Successfully joined the waitlist!",
		};
	} catch (error) {
		console.error("Error:", error);
		return {
			success: false,
			message: "Something went wrong. Please try again.",
		};
	}
};
