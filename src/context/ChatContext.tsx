import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { GreenApiCredentials } from '../types/greenApi'
import { API } from '../api/api'

interface LocalMessage {
    id: string
    text: string
    direction: 'incoming' | 'outgoing'
    timestamp: number
    chatId: string
}

interface ChatItem {
    id: string
    statusName: string
}

interface ChatContextType {
    credentials: GreenApiCredentials | null
    chatId: string
    chatStatus: string
    chatsList: ChatItem[] // Список добавленных чатов
    messages: LocalMessage[]
    loadingChat: boolean
    error: string
    setError: (err: string) => void
    connect: (creds: GreenApiCredentials) => void
    disconnect: () => void
    createChat: (phoneNumber: string) => Promise<void>
    selectChat: (id: string, statusName: string) => void // Метод переключения чата
    deleteChat: (id: string) => void // Метод удаления чата
    sendMessage: (text: string) => Promise<void>
    addIncomingMessage: (incoming: { id: string; chatId: string; text: string; direction: 'incoming' | 'outgoing'; timestamp: number }) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() => {
        const saved = localStorage.getItem('max_creds')
        return saved ? JSON.parse(saved) : null
    })

    const [chatsList, setChatsList] = useState<ChatItem[]>(() => {
        const saved = localStorage.getItem('max_chats_list')
        return saved ? JSON.parse(saved) : []
    })

    const [chatId, setChatId] = useState<string>(() => localStorage.getItem('max_chat_id') || '')
    const [chatStatus, setChatStatus] = useState<string>(() => localStorage.getItem('max_chat_status') || 'Выбери собеседника')
    const [error, setError] = useState('')
    const [loadingChat, setLoadingChat] = useState(false)

    const [messages, setMessages] = useState<LocalMessage[]>(() => {
        if (!credentials) return []
        const saved = localStorage.getItem(`max_msgs_${credentials.idInstance}`)
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        if (credentials) {
            localStorage.setItem(`max_msgs_${credentials.idInstance}`, JSON.stringify(messages))
        }
    }, [messages, credentials])

    useEffect(() => {
        localStorage.setItem('max_chats_list', JSON.stringify(chatsList))
    }, [chatsList])

    const connect = (value: GreenApiCredentials) => {
        localStorage.setItem('max_creds', JSON.stringify(value))
        setCredentials(value)
        const saved = localStorage.getItem(`max_msgs_${value.idInstance}`)
        setMessages(saved ? JSON.parse(saved) : [])
    }

    const disconnect = () => {
        if (credentials) {
            localStorage.removeItem(`max_msgs_${credentials.idInstance}`)
        }
        localStorage.removeItem('max_creds')
        localStorage.removeItem('max_chat_id')
        localStorage.removeItem('max_chat_status')
        localStorage.removeItem('max_chats_list')
        setCredentials(null)
        setChatId('')
        setChatStatus('Выбери собеседника')
        setChatsList([])
        setMessages([])
        setError('')
    }

    const createChat = async (phoneNumber: string) => {
        if (!credentials) return
        setError('')
        setLoadingChat(true)
        try {
            const account = await API.checkAccount(credentials, phoneNumber)
            if (!account.exist) {
                setError('Аккаунт по этому номеру не найден.')
                return
            }

            setChatsList((prev) => {
                if (prev.some(c => c.id === account.chatId)) return prev
                return [...prev, { id: account.chatId, statusName: phoneNumber }]
            })

            setChatId(account.chatId)
            setChatStatus(phoneNumber)
            localStorage.setItem('max_chat_id', account.chatId)
            localStorage.setItem('max_chat_status', phoneNumber)
        } finally {
            setLoadingChat(false)
        }
    }

    const selectChat = (id: string, statusName: string) => {
        setChatId(id)
        setChatStatus(statusName)
        localStorage.setItem('max_chat_id', id)
        localStorage.setItem('max_chat_status', statusName)
    }

    const deleteChat = (id: string) => {
        setChatsList((prev) => prev.filter((chat) => chat.id !== id))
        
        setMessages((current) => current.filter((msg) => msg.chatId !== id))
        
        if (chatId === id) {
            setChatId('')
            setChatStatus('Выбери собеседника')
            localStorage.removeItem('max_chat_id')
            localStorage.removeItem('max_chat_status')
        }
    }

    const sendMessage = async (text: string) => {
        if (!credentials || !chatId) return
        setError('')
        const result = await API.sendMessage(credentials, { chatId, message: text })
        
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
    }

    const addIncomingMessage = useCallback((incoming: { id: string; chatId: string; text: string; direction: 'incoming' | 'outgoing'; timestamp: number }) => {
        setMessages((current) => {
            if (current.some((item) => item.id === incoming.id)) {
                return current
            }
            return [
                ...current,
                {
                    id: incoming.id,
                    text: incoming.text,
                    direction: incoming.direction,
                    chatId: incoming.chatId,
                    timestamp: incoming.timestamp < 1_000_000_000_000 ? incoming.timestamp * 1000 : incoming.timestamp,
                },
            ]
        })
    }, [])

    return (
        <ChatContext.Provider value={{
            credentials, chatId, chatStatus, chatsList, messages, loadingChat, error, setError,
            connect, disconnect, createChat, selectChat, deleteChat, sendMessage, addIncomingMessage
        }}>
            {children}
        </ChatContext.Provider>
    )
}

// The hook is intentionally exported alongside the provider from this context module.
// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
    const context = useContext(ChatContext)
    if (!context) throw new Error('useChat должен использоваться внутри ChatProvider')
    return context
}
