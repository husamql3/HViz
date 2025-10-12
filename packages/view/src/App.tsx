import { Header } from "./components/header";
import { Board } from "./components/board";

function App() {
	return (
		<div className="h-dvh bg-black text-zinc-50 p-3 flex flex-col">
			<Header />
			<Board />
		</div>
	);
}

export default App;
