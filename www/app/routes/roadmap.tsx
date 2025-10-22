import { Header } from "@/components/header";
import { Slogan } from "@/components/slogan";
import { ROADMAP } from "@/lib/roadmap";
import { cn } from "@/lib/utils";

export default function Roadmap() {
	return (
		<div className="font-roboto-mono w-full">
			<main className="py-4 md:py-14 text-zinc-50 flex flex-col items-center w-full max-w-3xl mx-auto">
				<Header />
				<Slogan />

				<div className="flex flex-col gap-4 pt-14 px-4 pb-14">
					<p className="border-l-4 pl-2 text-lg border-green-700">roadmap</p>
					<p className="text-xs">Our progress toward a robust ERD generator. Here's what's in the works:</p>
					<div className="flex flex-col gap-4 z-100">
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
			</main>
		</div>
	);
}
