"use client";

import { Form, useActionData, useNavigation } from "react-router";
import { Button } from "./button";
import { Input } from "./input";

export const Wishlist = () => {
	const navigation = useNavigation();
	const actionData = useActionData<{ success: boolean; message: string }>();
	const isPending = navigation.state === "submitting";

	return (
		<Form method="post" className="space-y-4 w-full">
			<Input
				placeholder="your@email.com"
				name="email"
				type="email"
				disabled={isPending}
				required
				autoSave="off"
				autoComplete="off"
				autoCorrect="off"
				spellCheck={false}
			/>
			<Button
				size="lg"
				className="hover:bg-green-700 transition-colors font-medium w-full"
				type="submit"
				disabled={isPending}
			>
				{isPending ? "Joining..." : "join waitlist"}
			</Button>

			{actionData && (
				<p className={`text-sm ${actionData.success ? "text-green-500" : "text-red-500"}`}>{actionData.message}</p>
			)}
		</Form>
	);
};
