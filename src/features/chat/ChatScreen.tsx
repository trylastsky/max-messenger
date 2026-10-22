import { useState, useCallback, type FormEvent, useEffect, useRef } from 'react'
import type { GreenApiCredentials } from '../../types/greenApi'
import { useIncomingMessages } from './useIncomingMessages'
import { API } from '../../api/api'

interface ChatScreenProps {
    credentials: GreenApiCredentials
    onDisconnect: () => void
}

interface LocalMessage {
    id: string
    text: string
    direction: 'incoming' | 'outgoing'
    timestamp: number
    chatId: string
}

export function ChatScreen({
    credentials,
    onDisconnect,
}: ChatScreenProps) {
    const [phoneNumber, setPhoneNumber] = useState('')
    const [chatId, setChatId] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState<LocalMessage[]>([])
    const [loadingChat, setLoadingChat] = useState(false)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('Выбери собеседника')
    
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, chatId])

    const handleIncomingMessage = useCallback(
        (incoming: {
            id: string
            chatId: string
            text: string
            timestamp: number
        }) => {
            setMessages((current) => {
                if (current.some((item) => item.id === incoming.id)) {
                    return current
                }
                
                return [
                    ...current,
                    {
                        id: incoming.id,
                        text: incoming.text,
                        direction: 'incoming',
                        chatId: incoming.chatId,
                        timestamp:
                            incoming.timestamp < 1_000_000_000_000
                                ? incoming.timestamp * 1000
                                : incoming.timestamp,
                    },
                ]
            })
        },
        [],
    )

    useIncomingMessages({
        credentials,
        onMessage: handleIncomingMessage,
    })

    async function handleCreateChat(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError('')
        setLoadingChat(true)

        try {
            const account = await API.checkAccount(credentials, phoneNumber)

            if (!account.exist) {
                setError('Аккаунт по этому номеру не найден.')
                return
            }

            setChatId(account.chatId)
            setStatus(phoneNumber)
            setPhoneNumber('')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось создать чат.',
            )
        } finally {
            setLoadingChat(false)
        }
    }

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!chatId || !message.trim()) {
            return
        }

        setError('')
        setSending(true)
        const text = message.trim()

        try {
            const result = await API.sendMessage(credentials, {
                chatId,
                message: text,
            })

            setMessages((current) => [
                ...current,
                {
                    id: result.idMessage,
                    text,
                    direction: 'outgoing',
                    timestamp: Date.now(),
                    chatId: chatId,
                },
            ])

            setMessage('')
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Не удалось отправить сообщение.',
            )
        } finally {
            setSending(false)
        }
    }

    const currentChatMessages = messages.filter((item) => item.chatId === chatId)

    return (
        <main className="flex min-h-screen flex-col bg-[#0b0d12] text-slate-100 md:flex-row">
            <aside className="flex w-full flex-col border-b border-white/10 p-5 md:w-80 md:border-r md:border-b-0">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">MAX Messenger</h1>
                    <button
                        type="button"
                        onClick={onDisconnect}
                        className="text-sm text-slate-400 hover:text-white"
                    >
                        Выйти
                    </button>
                </div>

                <form onSubmit={handleCreateChat} className="space-y-3">
                    <label className="block space-y-2">
                        <span className="text-sm text-slate-300">
                            Номер собеседника
                        </span>
                        <input
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                            placeholder="+7XXXXXXXXXX"
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loadingChat}
                        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-50"
                    >
                        {loadingChat ? 'Проверяем…' : 'Создать чат'}
                    </button>
                </form>

                {chatId && (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
                        <p className="text-sm font-medium">{status}</p>
                        <p className="mt-1 break-all text-xs text-slate-500">
                            {chatId}
                        </p>
                    </div>
                )}
            </aside>

            <section className="flex min-h-[60vh] flex-1 flex-col">
                <header className="border-b border-white/10 px-5 py-4">
                    <p className="font-medium">
                        {chatId ? status : 'Сообщения'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                        {chatId ? 'Чат выбран' : 'Создай чат по номеру телефона'}
                    </p>
                </header>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
                    {!chatId && (
                        <p className="m-auto text-center text-sm text-slate-500">
                            Здесь появится переписка
                        </p>
                    )}

                    {chatId && currentChatMessages.map((item) => (
                        <div
                            key={item.id}
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${item.direction === 'outgoing'
                                    ? 'self-end bg-indigo-500'
                                    : 'self-start border border-white/10 bg-white/5'
                                }`}
                        >
                            <p className="whitespace-pre-wrap break-words">
                                {item.text}
                            </p>
                            <p className="mt-1 text-right text-[10px] opacity-60">
                                {new Date(item.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {error && (
                    <p role="alert" className="mx-5 mb-3 text-sm text-red-400">
                        {error}
                    </p>
                )}

                <form
                    onSubmit={handleSendMessage}
                    className="flex gap-3 border-t border-white/10 p-4"
                >
                    <input
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder={chatId ? 'Напиши сообщение…' : 'Сначала создай чат'}
                        disabled={!chatId || sending}
                        maxLength={4000}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!chatId || !message.trim() || sending}
                        className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {sending ? '…' : 'Отправить'}
                    </button>
                </form>
            </section>
        </main>
    )
}
