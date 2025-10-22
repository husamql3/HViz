import { IoLogoGithub } from "react-icons/io";
import { Link } from "react-router";
import { REPO_URL } from "@/lib/constants";
import { Button } from "./button";

export const Header = () => {
	return (
		<header className="flex flex-row items-center justify-between gap-2 w-full px-4 pb-6 z-10">
			<Link to="/">
				<img
					src="/icon.svg"
					alt="hviz logo"
					width={32}
					height={32}
					className="border rounded-md group size-9 duration-300 group-hover:scale-105 transition-all hover:shadow-xl hover:shadow-neutral-800/50"
				/>
			</Link>

			<div className="flex flex-row items-center gap-2">
				<Link to="/roadmap" className="group">
					<Button variant="ghost" className="dark:group-hover:text-neutral-300 text-zinc-400" size="lg">
						Roadmap
					</Button>
				</Link>

				<a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="group">
					<Button variant="ghost" className="dark:group-hover:text-neutral-300 text-zinc-400" size="icon-lg">
						<IoLogoGithub className="size-5" />
					</Button>
				</a>
			</div>
		</header>
	);
};
