import { useState } from "react";
import { api } from "./lib/api-client";

function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("unknown");

  const fetchHello = async () => {
    const res = await api.api.hello.$get();
    const data = await res.json();

    setName(data.message);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex items-center justify-center p-6 sm:p-12 font-sans selection:bg-slate-900 selection:text-white">
      <main className="w-full max-w-sm space-y-12">
        <h1 className="text-2xl font-semibold tracking-tight">Stack</h1>

        <div className="space-y-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="group flex w-full items-center justify-between border-b border-slate-100 py-4 transition-colors hover:border-slate-900"
            aria-label="increment"
          >
            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
              Count
            </span>
            <span className="text-sm font-mono tabular-nums">{count}</span>
          </button>

          <button
            onClick={fetchHello}
            className="group flex w-full items-center justify-between border-b border-slate-100 py-4 transition-colors hover:border-slate-900"
            aria-label="get name"
          >
            <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
              Fetch
            </span>
            <span className="text-sm italic text-slate-900 transition-opacity">
              {name}
            </span>
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
