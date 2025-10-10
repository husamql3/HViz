"use client"

import { Header } from "@/components/header"
import { api } from "@/lib/api";

// import { Diagram } from "@/components/diagram"

const App = async () => {
  const res = await api.diagram.$get({ query: { name: "test" } })
  const data = await res.json()
  console.log(data)

  return (
    <main className="h-dvh bg-zinc-950 text-zinc-50 flex flex-col">
      <Header />
      <pre>{JSON.stringify(data, null, 2)}</pre>
      {/* <Diagram /> */}
    </main>
  )
};

export default App;
