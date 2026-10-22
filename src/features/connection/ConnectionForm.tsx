
import { useState, type SubmitEvent } from 'react'
import { z } from 'zod'
import type { GreenApiCredentials } from '../../types/chat'

const connectionSchema = z.object({
    idInstance: z.string().trim().min(1, 'Введи ID инстанса'),
    apiTokenInstance: z
        .string()
        .trim()
        .min(1, 'Введи API-токен'),
})

interface ConnectionFormProps {
    onConnect: (credentials: GreenApiCredentials) => void
}

export function ConnectionForm({ onConnect }: ConnectionFormProps) {
    const [idInstance, setIdInstance] = useState('')
    const [apiTokenInstance, setApiTokenInstance] = useState('')
    const [error, setError] = useState('')

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')

        const result = connectionSchema.safeParse({
            idInstance,
            apiTokenInstance,
        })

        if (!result.success) {
            setError(
                result.error.issues[0]?.message ??
                'Проверь введённые данные',
            )
            return
        }

        onConnect(result.data)
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] p-6 text-slate-100">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-sm space-y-5 rounded-2xl border border-white/10 bg-white/3 p-6"
            >
                <header className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        MAX Messenger
                    </h1>

                    <p className="text-sm leading-6 text-slate-400">
                        Подключение через GREEN-API
                    </p>
                </header>

                <label className="block space-y-2">
                    <span className="text-sm text-slate-300">
                        ID инстанса
                    </span>

                    <input
                        name="idInstance"
                        value={idInstance}
                        onChange={(event) => setIdInstance(event.target.value)}
                        autoComplete="off"
                        required
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400"
                        placeholder="Введите idInstance"
                    />
                </label>

                <label className="block space-y-2">
                    <span className="text-sm text-slate-300">
                        API-токен
                    </span>

                    <input
                        name="apiTokenInstance"
                        type="password"
                        value={apiTokenInstance}
                        onChange={(event) =>
                            setApiTokenInstance(event.target.value)
                        }
                        autoComplete="new-password"
                        required
                        className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400"
                        placeholder="Введите apiTokenInstance"
                    />
                </label>

                {error && (
                    <p role="alert" className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium transition hover:bg-indigo-400"
                >
                    Продолжить
                </button>

                <p className="text-xs leading-5 text-slate-500">
                    Используй данные своего инстанса GREEN-API. Не публикуй
                    API-токен в репозитории.
                </p>
            </form>
        </main>
    )
}
