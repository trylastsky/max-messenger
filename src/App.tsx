
import { MessageSquareText } from 'lucide-react'

function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] p-6 text-slate-100">
      <section className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <MessageSquareText size={30} className="text-indigo-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            MAX Messenger
          </h1>
          <p className="text-sm leading-6 text-slate-400">
            Рабочее пространство для обмена сообщениями через GREEN-API.
          </p>
        </div>

        <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-300">
          API не подключён
        </span>
      </section>
    </main>
  )
}

export default App
