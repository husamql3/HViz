import { IoLogoGithub } from "react-icons/io";
import { REPO_URL } from "@/lib/constants";
import { Button } from "./button";

export const Header = () => {
	return (
		<header className="flex flex-row items-center justify-between gap-2 w-full px-4 pb-6">
			<img
				src="/icon.svg"
				alt="hviz logo"
				width={32}
				height={32}
				className="border rounded-md group size-8 duration-300 group-hover:scale-105 transition-all hover:shadow-xl hover:shadow-neutral-800/50"
			/>

			<a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="group">
				<Button variant="ghost" className="dark:group-hover:text-neutral-300 size-8 text-zinc-400">
					<IoLogoGithub />
				</Button>
			</a>
		</header>
	);
};
