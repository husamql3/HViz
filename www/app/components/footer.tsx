import { X_URL } from "@/lib/constants";

export const Footer = () => {
	return (
		<footer className="bg-zinc-900/40 text-center py-8 border-t border-zinc-900">
			<div className="max-w-3xl mx-auto">
				<a className="flex flex-row items-center gap-2" target="_blank" rel="noopener noreferrer" href={X_URL}>
					<img src="/avocado.png" alt="hviz logo" width={20} height={20} />
					<p className="text-zinc-50/50">By Hüsam</p>
				</a>
			</div>
		</footer>
	);
};
