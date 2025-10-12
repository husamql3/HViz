import { Board } from "./components/board";
import { Header } from "./components/header";

function App() {
	return (
		<div className="h-dvh bg-black text-zinc-50 p-3 flex flex-col">
			<Header />
			<Board />
		</div>
	);
}

export default App;
