
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { API } from '../../api/api'
import type { GreenApiCredentials } from '../../types/greenApi'

interface ConnectionFormProps {
    onConnect: (credentials: GreenApiCredentials) => void
}

const credentialsSchema = z.object({
    idInstance: z.string().trim().min(1, 'Введи ID инстанса'),
    apiTokenInstance: z.string().trim().min(1, 'Введи API-токен'),
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
            setError(parsed.error.issues[0]?.message ?? 'Проверь введённые данные')
            return
        }

        const credentials = parsed.data
        setLoading(true)

        try {
            const result = await API.getInstanceState(credentials)

            if (result.stateInstance !== 'authorized') {
                setError(
                    `Инстанс не авторизован. Текущий статус: ${result.stateInstance}`,
                )
                return
            }

            onConnect(credentials)
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
                        <span className="text-2xl font-bold text-indigo-400">M</span>
                    </div>

                    <h1 className="text-3xl font-semibold tracking-tight">
                        MAX Messenger
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-slate-400">
                        Подключи GREEN-API, чтобы отправлять и получать сообщения.
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
                            // Оставь здесь текущие value, onChange и остальные props
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    <label className="block space-y-2">
                        <span className="block text-sm font-medium text-slate-300">
                            API-токен
                        </span>
                        <input
                            // Оставь здесь текущие value, onChange и остальные props
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    {/* Оставь здесь вывод ошибки и кнопку подключения */}
                </form>
            </section>
        </main>
    )
}
