import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { API } from '../../api/api'
import type { GreenApiCredentials } from '../../types/greenApi'

interface ConnectionFormProps {
    onConnect: (credentials: GreenApiCredentials) => void
}

const credentialsSchema = z.object({
    idInstance: z.string().trim().min(1, 'Введите ID инстанса'),
    apiTokenInstance: z.string().trim().min(1, 'Введите API-токен'),
})

export function ConnectionForm({ onConnect }: ConnectionFormProps) {
    const [idInstance, setIdInstance] = useState('')
    const [apiTokenInstance, setApiTokenInstance] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')

        const parsed = credentialsSchema.safeParse({
            idInstance,
            apiTokenInstance,
        })

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Проверьте введённые данные')
            return
        }

        setLoading(true)

        try {
            const result = await API.getInstanceState(parsed.data)

            if (result.stateInstance !== 'authorized') {
                setError(
                    `Инстанс не авторизован. Текущий статус: ${result.stateInstance}`,
                )
                return
            }

            onConnect(parsed.data)
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось подключиться к GREEN-API',
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#0b0d12] p-6 text-slate-100">
            <section className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                        <span className="text-2xl font-bold text-indigo-400">
                            M
                        </span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        MAX Messenger
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        Подключите GREEN-API, чтобы отправлять и получать сообщения.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-white/10 bg-white/3 p-6"
                >
                    <label className="block space-y-2">
                        <span className="block text-sm font-medium text-slate-300">
                            ID инстанса
                        </span>
                        <input
                            type="text"
                            value={idInstance}
                            onChange={(event) => setIdInstance(event.target.value)}
                            placeholder="Например, 7100000000"
                            autoComplete="username"
                            required
                            disabled={loading}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 disabled:opacity-50"
                        />
                    </label>

                    <label className="block space-y-2">
                        <span className="block text-sm font-medium text-slate-300">
                            API-токен
                        </span>
                        <input
                            type="password"
                            value={apiTokenInstance}
                            onChange={(event) =>
                                setApiTokenInstance(event.target.value)
                            }
                            placeholder="Введите токен инстанса"
                            autoComplete="current-password"
                            required
                            disabled={loading}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 disabled:opacity-50"
                        />
                    </label>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-300"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading ? 'Подключение...' : 'Подключить API'}
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-500">
                        Учётные данные используются для прямого подключения к GREEN-API.
                    </p>
                </form>
            </section>
        </main>
    )
}