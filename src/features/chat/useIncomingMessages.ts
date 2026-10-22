import { useEffect, useRef } from 'react'
import { API } from '../../api/api'
import type {
    GreenApiCredentials,
    GreenApiNotification,
} from '../../types/greenApi'
import { parseIncomingMessage } from './parseIncomingMessage'

type ParsedMessage = NonNullable<
    ReturnType<typeof parseIncomingMessage>
>

interface UseIncomingMessagesOptions {
    credentials: GreenApiCredentials | null
    onMessage: (message: ParsedMessage) => void
}

export function useIncomingMessages({
    credentials,
    onMessage,
}: UseIncomingMessagesOptions) {
    const onMessageRef = useRef(onMessage)

    useEffect(() => {
        onMessageRef.current = onMessage
    }, [onMessage])

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
                        await new Promise((resolve) => setTimeout(resolve, 1500))
                        continue
                    }

                    const parsed = parseIncomingMessage(notification)
                    if (parsed) {
                        onMessageRef.current(parsed)
                    }
                    await API.deleteNotification(
                        activeCredentials,
                        notification.receiptId,
                    )
                } catch (error) {
                    if (stopped) return
                    console.error('Ошибка получения сообщений:', error)
                    await new Promise((resolve) => setTimeout(resolve, 3000))
                }
            }
        }

        void poll()

        return () => {
            stopped = true
        }
    }, [credentials])
}