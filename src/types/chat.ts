
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

export interface CheckAccountResponse {
    existsWhatsapp: boolean
}

