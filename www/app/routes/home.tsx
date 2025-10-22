import { GettingStarted } from "@/components/getting-started";
import { Header } from "@/components/header";
import { HeroVideoDialog } from "@/components/hero-video-dialog";
import { Slogan } from "@/components/slogan";

export default function Home() {
	return (
		<div className="min-h-dvh font-roboto-mono">
			<main className="py-4 md:py-14 text-zinc-50 flex flex-col items-center max-w-3xl mx-auto">
				<Header />
				<Slogan />

				<div className="z-100">
					<HeroVideoDialog
						className="block"
						animationStyle="from-center"
						videoSrc="/tut.mp4"
						thumbnailSrc="/hero.png"
						thumbnailAlt="Hero Video"
					/>
				</div>

				<GettingStarted />
			</main>
		</div>
	);
}
