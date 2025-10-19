import type { ErdResult } from "@viz/cli/src/types/erd.type";
import { Board } from "@/components/board";
import { Header } from "@/components/header";
// import { INITIAL_EDGES, INITIAL_NODES } from "@/utils/data";

export function meta() {
	return [{ title: "hviz" }, { name: "description", content: "CLI Tool for Visualizing Your Database Schema!" }];
}

export const clientLoader = async () => {
	// const erdData = { nodes: INITIAL_NODES, edges: INITIAL_EDGES };
	const erd = await fetch("/api/diagram", {
		headers: {
			"Content-Type": "application/json",
		},
	});
	const { data: erdData } = await erd.json();
	console.log("erdData", erdData);
	return { erdData };
};

function Home({ loaderData }: { loaderData: { erdData: ErdResult } }) {
	console.log("loaderData", loaderData);
	return (
		<div className="h-dvh bg-black text-zinc-50 p-4 flex flex-col">
			<Header />

			{loaderData?.erdData ? (
				<Board erdData={loaderData.erdData} />
			) : (
				// TODO: update this shit later
				<div className="flex-1 flex items-center justify-center">
					<div className="text-zinc-50 text-2xl font-bold">No data</div>
				</div>
			)}
		</div>
	);
}

export default Home;
