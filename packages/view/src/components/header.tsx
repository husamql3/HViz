import { IoLogoGithub } from "react-icons/io";
import { cn } from "@/utils/cn";
import { WEBSITE_URL } from "@/utils/constants";

export const Header = () => {
	return (
		<header className={cn("pb-3 w-full flex items-center justify-between")}>
			<a
				href={WEBSITE_URL}
				className="border rounded-md group transition-all duration-300 hover:shadow-xl hover:shadow-neutral-800/50"
			>
				<img
					src="/icon.svg"
					alt="Viz"
					className="size-8 transition-transform duration-300 group-hover:scale-105"
					width={28}
					height={28}
				/>
			</a>

			<a href="https://github.com/husamql3/viz" target="_blank" rel="noopener noreferrer" className="group">
				<IoLogoGithub className="size-5 text-neutral-400 duration-150 group-hover:text-neutral-500 dark:group-hover:text-neutral-300 dark:text-neutral-600" />
			</a>
		</header>
	);
};
