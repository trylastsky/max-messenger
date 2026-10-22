import { useEffect, useRef, useState, type FormEvent} from 'react'
import type { GreenApiCredentials } from '../../types/greenApi'
import { useIncomingMessages } from './useIncomingMessages'
import { useChat } from '../../context/ChatContext'

interface ChatScreenProps {
    credentials: GreenApiCredentials
    onDisconnect: () => void
}

export function ChatScreen({ onDisconnect }: ChatScreenProps) {
    const { 
        chatId, chatStatus, chatsList, messages, loadingChat, error, setError, createChat, selectChat, deleteChat, sendMessage 
    } = useChat()

    const [phoneNumber, setPhoneNumber] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useIncomingMessages()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, chatId])

    async function handleCreateChat(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        try {
            await createChat(phoneNumber)
            setPhoneNumber('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось создать чат.')
        }
    }

    async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!chatId || !message.trim()) return

        setSending(true)
        try {
            await sendMessage(message.trim())
            setMessage('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось отправить сообщение.')
        } finally {
            setSending(false)
        }
    }

    const currentChatMessages = messages.filter((item: { chatId: string }) => item.chatId === chatId)

    return (
        <main className="flex min-h-screen flex-col bg-[#0b0d12] text-slate-100 md:flex-row">
            <aside className="flex w-full flex-col border-b border-white/10 p-5 md:w-80 md:border-r md:border-b-0">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">MAX Messenger</h1>
                    <button type="button" onClick={onDisconnect} className="text-sm text-slate-400 hover:text-white">
                        Выйти
                    </button>
                </div>

                <form onSubmit={handleCreateChat} className="space-y-3">
                    <label className="block space-y-2">
                        <span className="text-sm text-slate-300">Номер собеседника</span>
                        <input
                            value={phoneNumber}
                            onChange={(event) => setPhoneNumber(event.target.value)}
                            placeholder="+7XXXXXXXXXX"
                            required
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                        />
                    </label>
                    <button type="submit" disabled={loadingChat} className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium hover:bg-indigo-400 disabled:opacity-50">
                        {loadingChat ? 'Проверяем…' : 'Создать чат'}
                    </button>
                </form>

                <div className="mt-6 flex-1 overflow-y-auto space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">Ваши чаты</p>
                    {chatsList.length === 0 && (
                        <p className="text-xs text-slate-400 italic px-1">Список пуст</p>
                    )}
                    {chatsList.map((chat: { id: string; statusName: string }) => (
                        <div 
                            key={chat.id}
                            className={`group relative flex items-center justify-between rounded-xl border transition ${
                                chat.id === chatId 
                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300' 
                                    : 'bg-white/3 border-white/5 hover:bg-white/5 text-slate-300'
                            }`}
                        >
                            <button
                                type="button"
                                onClick={() => selectChat(chat.id, chat.statusName)}
                                className="flex-1 text-left p-3 min-w-0"
                            >
                                <p className="text-sm font-medium truncate pr-4">{chat.statusName}</p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">{chat.id}</p>
                            </button>
                            
                            {/* КНОПКА УДАЛЕНИЯ ЧАТА (КРЕСТИК) */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteChat(chat.id);
                                }}
                                title="Удалить чат"
                                className="mr-2 hidden group-hover:flex size-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition"
                            >
                                &#x2715;
                            </button>
                        </div>
                    ))}
                </div>
            </aside>

            <section className="flex min-h-[60vh] flex-1 flex-col">
                <header className="border-b border-white/10 px-5 py-4">
                    <p className="font-medium">{chatId ? chatStatus : 'Сообщения'}</p>
                    <p className="mt-1 text-xs text-slate-500">{chatId ? 'Чат выбран' : 'Создай чат по номеру телефона'}</p>
                </header>

                <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
                    {!chatId && <p className="m-auto text-center text-sm text-slate-500">Здесь появится переписка</p>}
                    {chatId && currentChatMessages.map((item: { id: string; direction: 'incoming' | 'outgoing'; text: string; timestamp: number }) => (
                        <div key={item.id} className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${item.direction === 'outgoing' ? 'self-end bg-indigo-500' : 'self-start border border-white/10 bg-white/5'}`}>
                            <p className="whitespace-pre-wrap wrap-break-word">{item.text}</p>
                            <p className="mt-1 text-right text-[10px] opacity-60">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {error && <p role="alert" className="mx-5 mb-3 text-sm text-red-400">{error}</p>}

                {/* НИЖНИЙ БАР РЕНДЕРИТСЯ ТОЛЬКО ЕСЛИ ВЫБРАН АКТИВНЫЙ ЧАТ */}
                {chatId && (
                    <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-white/10 p-4 bg-[#0b0d12]">
                        <input
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Напиши сообщение…"
                            disabled={sending}
                            maxLength={4000}
                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-indigo-400 disabled:opacity-50"
                        />
                        <button type="submit" disabled={!message.trim() || sending} className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-medium hover:bg-indigo-400 disabled:opacity-50">
                            {sending ? '…' : 'Отправить'}
                        </button>
                    </form>
                )}
            </section>
        </main>
    )
}