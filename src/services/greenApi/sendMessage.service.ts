
import { ApiError, createEndpoint, postJson } from '../../api/client'
import type {
    GreenApiCredentials,
    SendMessageInput,
    SendMessageResponse,
} from '../../types/greenApi'

export async function sendMessage(
    credentials: GreenApiCredentials,
    input: SendMessageInput,
): Promise<SendMessageResponse> {
    const message = input.message.trim()

    if (!input.chatId.trim()) {
        throw new ApiError('Не указан идентификатор чата.')
    }

    if (!message) {
        throw new ApiError('Сообщение не может быть пустым.')
    }

    if (message.length > 4000) {
        throw new ApiError(
            'Сообщение не должно превышать 4000 символов.',
        )
    }

    const result = await postJson<SendMessageResponse>(
        createEndpoint(credentials, 'sendMessage'),
        {
            chatId: input.chatId,
            message,
        },
    )

    if (!result || typeof result.idMessage !== 'string') {
        throw new ApiError(
            'GREEN-API не вернул идентификатор сообщения.',
        )
    }

    return result
}
