import { IoLogoGithub } from "react-icons/io";
import { cn } from "@/utils/cn";

export const Header = () => {
	return (
		<header className={cn("pt-2 pb-4 px-4 w-full flex items-center justify-between")}>
			<h1 className="font-bold">Viz</h1>

			<a href="https://github.com/husamql3/viz" target="_blank" rel="noopener noreferrer" className="group">
				<IoLogoGithub className="size-5 text-neutral-400 duration-150 group-hover:text-neutral-500 dark:group-hover:text-neutral-300 dark:text-neutral-600" />
			</a>
		</header>
	);
};
