import { IoLogoGithub } from "react-icons/io";
import { Button } from "@/components/ui/button";
import { REPO_URL, WEBSITE_URL } from "@/utils/constants";

export const Header = () => {
	return (
		<header className="pb-4 w-full flex items-center justify-between">
			<a
				href={WEBSITE_URL}
				className="border rounded-md group transition-all duration-300 hover:shadow-xl hover:shadow-neutral-800/50"
			>
				<img
					src="/icon.svg"
					alt="Hviz logo"
					className="size-8 transition-transform duration-300 group-hover:scale-105"
					width={28}
					height={28}
				/>
			</a>

			<div className="flex items-center gap-2">
				<a href={WEBSITE_URL} target="_blank" rel="noopener noreferrer" className="group">
					<Button variant="ghost" size="sm" className="dark:group-hover:text-neutral-300 text-zinc-400">
						Roadmap
					</Button>
				</a>

				<a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="group">
					<Button variant="ghost" size="sm" className="dark:group-hover:text-neutral-300 text-zinc-400">
						<IoLogoGithub />
					</Button>
				</a>
			</div>
		</header>
	);
};
