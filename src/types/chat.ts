
export interface GreenApiCredentials {
    idInstance: string
    apiTokenInstance: string
    apiUrl: string
}

export interface ChatMessage {
    id: string
    chatId: string
    text: string
    direction: 'incoming' | 'outgoing'
    timestamp: number
}

export interface Chat {
    id: string
    name: string
    phoneNumber: string
    lastMessage?: string
    updatedAt: number
}

export interface SendMessageInput {
    chatId: string
    message: string
}

export interface CheckAccountResponse {
    exist: boolean
    chatId: string
    fromCache?: boolean
}

export interface SendMessageResponse {
    idMessage: string
}

export interface CheckAccountResponse {
    existsWhatsapp: boolean
}

export interface GreenApiNotification {
    receiptId: number
    body: {
        typeWebhook: string
        timestamp?: number
        idMessage?: string
        senderData?: {
            chatId?: string
            chatName?: string
            senderName?: string
        }
        messageData?: {
            typeMessage?: string
            textMessageData?: {
                textMessage?: string
            }
        }
    }
}
