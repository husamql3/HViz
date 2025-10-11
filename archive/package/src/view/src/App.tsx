"use client"

import { useState, useEffect } from "react"

function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/diagram?name=test`)
        const data = await res.json()
        setData(data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="h-dvh bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center">
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default App
