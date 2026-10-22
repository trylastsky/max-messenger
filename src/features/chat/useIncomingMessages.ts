import { useEffect, useRef } from 'react'
import { API } from '../../api/api'
import { useChat } from '../../context/ChatContext'
import type { GreenApiNotification } from '../../types/greenApi'
import { parseIncomingMessage } from './parseIncomingMessage'

export function useIncomingMessages(): void {
    const { credentials, addIncomingMessage } = useChat()
    const addMessageRef = useRef(addIncomingMessage)
    
    useEffect(() => {
        addMessageRef.current = addIncomingMessage
    }, [addIncomingMessage])

    useEffect(() => {
        if (!credentials) return

        const activeCredentials = credentials
        let stopped = false

        async function poll() {
            while (!stopped) {
                try {
                    const notification: GreenApiNotification | null =
                        await API.receiveNotification(activeCredentials)

                    if (stopped) return
                    if (!notification) {
                        continue
                    }

                    const parsed = parseIncomingMessage(notification)
                    if (parsed) {
                        addMessageRef.current(parsed)
                    }

                    await API.deleteNotification(
                        activeCredentials,
                        notification.receiptId,
                    )
                } catch (error) {
                    if (stopped) return
                    console.error('Ошибка получения сообщений:', error)
                    await new Promise((resolve) => setTimeout(resolve, 5000))
                }
            }
        }

        void poll()

        return () => {
            stopped = true
        }
    }, [credentials])
}