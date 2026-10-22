
import type { GreenApiNotification } from '../../types/greenApi'

export interface IncomingMessage {
    id: string
    chatId: string
    text: string
    senderName: string
    timestamp: number
}

export function parseIncomingMessage(
    notification: GreenApiNotification,
): IncomingMessage | null {
    const { body } = notification

    if (body.typeWebhook !== 'incomingMessageReceived') {
        return null
    }

    if (body.messageData?.typeMessage !== 'textMessage') {
        return null
    }

    const chatId = body.senderData?.chatId
    const text = body.messageData.textMessageData?.textMessage

    if (!chatId || !text?.trim()) {
        return null
    }

    return {
        id: body.idMessage ?? `notification-${notification.receiptId}`,
        chatId,
        text: text.trim(),
        senderName: body.senderData?.senderName ?? body.senderData?.chatName ?? chatId,
        timestamp: body.timestamp ?? Math.floor(Date.now() / 1000),
    }
}
