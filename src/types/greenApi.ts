export interface GreenApiCredentials {
    idInstance: string
    apiTokenInstance: string
}

export interface CheckAccountResponse {
    exist: boolean
    chatId: string
    fromCache?: boolean
}

export interface SendMessageInput {
    chatId: string
    message: string
}

export interface SendMessageResponse {
    idMessage: string
}

export interface InstanceStateResponse {
    stateInstance: string
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