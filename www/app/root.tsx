import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Footer } from "./components/footer";
import { PixelBlast } from "./components/pixel-blast";
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
} from "./lib/constants";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
	{ rel: "canonical", href: WEBSITE_URL },
	{ rel: "sitemap", href: WEBSITE_SITEMAP, type: "application/xml" },
	{ rel: "icon", href: "/favicon.ico", sizes: "any" },
	{ rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
	{ rel: "apple-touch-icon", href: "/icon.svg" },
];

export const meta: Route.MetaFunction = () => [
	{ title: WEBSITE_OG_TITLE },
	{ name: "description", content: WEBSITE_DESCRIPTION },
	{ name: "keywords", content: WEBSITE_KEYWORDS },
	{ name: "author", content: WEBSITE_AUTHOR },
	{ name: "robots", content: "index, follow" },
	{ name: "googlebot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },
	{ name: "bingbot", content: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" },

	// Theme and viewport
	{ name: "theme-color", content: "#008236" },
	{ name: "color-scheme", content: "dark" },

	// Application info
	{ name: "application-name", content: WEBSITE_NAME },
	{ name: "apple-mobile-web-app-title", content: WEBSITE_NAME },
	{ name: "apple-mobile-web-app-capable", content: "yes" },
	{ name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
	{ name: "mobile-web-app-capable", content: "yes" },

	// Open Graph / Facebook
	{ property: "og:title", content: WEBSITE_OG_TITLE },
	{ property: "og:type", content: "website" },
	{ property: "og:url", content: WEBSITE_URL },
	{ property: "og:description", content: WEBSITE_OG_DESCRIPTION },
	{ property: "og:image", content: WEBSITE_OG_IMAGE },
	{ property: "og:image:alt", content: WEBSITE_OG_IMAGE_ALT },
	{ property: "og:image:width", content: "1200" },
	{ property: "og:image:height", content: "630" },
	{ property: "og:image:type", content: "image/png" },
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
	{ name: "rating", content: "general" },
	{ name: "referrer", content: "origin-when-cross-origin" },
	{ name: "format-detection", content: "telephone=no" },
];

export function Layout({ children }: { children: React.ReactNode }) {
	// JSON-LD Structured Data
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name: WEBSITE_NAME,
		description: WEBSITE_DESCRIPTION,
		url: WEBSITE_URL,
		applicationCategory: "DeveloperApplication",
		operatingSystem: "Cross-platform",
		author: {
			"@type": "Person",
			name: WEBSITE_AUTHOR,
			url: "https://github.com/husamql3",
		},
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "USD",
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "5",
			ratingCount: "1",
		},
	};

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			</head>
			<body className="dark bg-zinc-95">
				{children}
				<Footer />
				<div className="absolute top-0 left-0 w-full h-full">
					<PixelBlast
						variant="square"
						pixelSize={6}
						color="#008236"
						patternScale={1.3}
						patternDensity={0.5}
						pixelSizeJitter={0}
						enableRipples={false}
						rippleSpeed={0.5}
						rippleThickness={0.12}
						rippleIntensityScale={1.5}
						speed={0.5}
						edgeFade={0.25}
						transparent
						antialias={false}
					/>
				</div>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
