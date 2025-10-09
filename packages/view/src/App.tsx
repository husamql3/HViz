import { Header } from "@/components/header"
import { Diagram } from "@/components/diagram"

const App = () => {
  return (
    <main className="h-dvh bg-zinc-950 text-zinc-50 flex flex-col">
      <Header />
      <Diagram />
    </main>
  )
};

export default App;
