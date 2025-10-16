import { Header } from "@/components/header";
import { Wishlist } from "@/components/wishlist";
import {
	WEBSITE_AUTHOR,
	WEBSITE_DESCRIPTION,
	WEBSITE_KEYWORDS,
	WEBSITE_NAME,
	WEBSITE_OG_DESCRIPTION,
	WEBSITE_OG_IMAGE,
	WEBSITE_OG_IMAGE_ALT,
	WEBSITE_OG_TITLE,
	WEBSITE_SITEMAP,
	WEBSITE_TWITTER_USERNAME,
	WEBSITE_URL,
	X_URL,
} from "@/lib/constants";
import { ROADMAP } from "@/lib/roadmap";
import { cn } from "@/lib/utils";
import { joinWaitlist } from "@/utils/join-waitlist";
import type { Route } from "./+types/home";

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email") as string;
	const result = await joinWaitlist(email);
	return result;
}

export function meta() {
	return [
		{ title: WEBSITE_OG_TITLE },
		{ name: "description", content: WEBSITE_DESCRIPTION },
		{ name: "keywords", content: WEBSITE_KEYWORDS },
		{ name: "author", content: WEBSITE_AUTHOR },
		{ name: "robots", content: "index, follow" },

		// Open Graph / Facebook
		{ property: "og:title", content: WEBSITE_OG_TITLE },
		{ property: "og:type", content: "website" },
		{ property: "og:url", content: WEBSITE_URL },
		{ property: "og:description", content: WEBSITE_OG_DESCRIPTION },
		{ property: "og:image", content: WEBSITE_OG_IMAGE },
		{ property: "og:image:alt", content: WEBSITE_OG_IMAGE_ALT },
		{ property: "og:image:width", content: "1200" },
		{ property: "og:image:height", content: "630" },
		{ property: "og:site_name", content: WEBSITE_NAME },
		{ property: "og:locale", content: "en_US" },

		// Twitter Cards
		{ name: "twitter:card", content: "summary_large_image" },
		{ name: "twitter:site", content: WEBSITE_TWITTER_USERNAME },
		{ name: "twitter:creator", content: WEBSITE_TWITTER_USERNAME },
		{ name: "twitter:title", content: WEBSITE_OG_TITLE },
		{ name: "twitter:description", content: WEBSITE_OG_DESCRIPTION },
		{ name: "twitter:image", content: WEBSITE_OG_IMAGE },
		{ name: "twitter:image:alt", content: WEBSITE_OG_IMAGE_ALT },

		// Additional SEO
		{ httpEquiv: "Content-Type", content: "text/html; charset=utf-8" },
		{ name: "language", content: "English" },
		{ name: "revisit-after", content: "7 days" },
		{ name: "distribution", content: "global" },
	];
}

export const links: Route.LinksFunction = () => [
	{ rel: "canonical", href: WEBSITE_URL },
	{ rel: "sitemap", href: WEBSITE_SITEMAP },
];

function Home() {
	return (
		<div className="bg-zinc-950 min-h-dvh py-4 md:py-14 font-roboto-mono text-zinc-50 flex flex-col justify-center items-center max-w-3xl mx-auto">
			<Header />

			<div className="text-center">
				<h1 className="text-6xl pb-2 border-b-4 mb-2 border-green-700">hviz</h1>
				<p className="text-neutral-300 text-xs">CLI tool for visualizing your database schema</p>
			</div>

			<div className="flex md:flex-row flex-col gap-6 pt-14 px-4 pb-14">
				<div className="flex flex-col gap-4">
					<p className="border-l-4 pl-2 text-lg border-green-700">join waitlist</p>
					<p className="text-xs">
						hviz is in active development and not yet production-ready. Sign up to stay updated!
					</p>
					<Wishlist />
				</div>

				<div className="flex flex-col gap-4">
					<p className="border-l-4 pl-2 text-lg border-green-700">roadmap</p>
					<p className="text-xs">Our progress toward a robust ERD generator. Here's what's in the works:</p>
					<div className="flex flex-col gap-4">
						{ROADMAP.map((item) => (
							<div key={item.title} className="flex flex-col gap-1">
								<div className="flex flex-row gap-2 items-center">
									<div
										className={cn(
											"w-2 h-2 rounded-full",
											item.status === "in progress" || item.status === "done" ? "bg-green-700" : "bg-neutral-500",
										)}
									/>
									<p className="text-lg">{item.title}</p>
								</div>

								<p className="text-sm text-neutral-400">{item.subtitle}</p>

								{item.subFeatures && item.subFeatures.length > 0 && (
									<ul className="flex flex-row gap-1 flex-wrap">
										{item.subFeatures.map((subFeature, index) => {
											return (
												<li className="flex items-center flex-row gap-0 text-sm" key={subFeature.title}>
													<span
														className={cn(
															"text-neutral-500",
															subFeature.status === "in progress" || subFeature.status === "done"
																? "text-green-700"
																: "text-neutral-500",
														)}
													>
														{subFeature.title}
													</span>
													{item.subFeatures && index < item.subFeatures.length - 1 && (
														<span className="text-neutral-500">,</span>
													)}
												</li>
											);
										})}
									</ul>
								)}

								<p
									className={cn(
										"text-xs",
										item.status === "in progress" || item.status === "done" ? "text-green-700" : "text-neutral-500",
									)}
								>
									{item.status}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>

			<hr className="w-full border-zinc-800" />

			<p className="text-xs text-zinc-300 pt-6">
				© 2025 hviz —{" "}
				<a
					href={X_URL}
					target="_blank"
					rel="noopener noreferrer"
					className="underline hover:text-green-700 transition-colors"
				>
					@husamql3
				</a>
			</p>
		</div>
	);
}

export default Home;
