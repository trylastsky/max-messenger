
import { API_URL } from './const'
import type {
    CheckAccountResponse,
    GreenApiCredentials,
    GreenApiNotification,
    SendMessageInput,
    SendMessageResponse,
} from '../types/chat'

export class GreenApiError extends Error {
    public readonly status?: number

    constructor(message: string, status?: number) {
        super(message)
        this.name = 'GreenApiError'
        this.status = status
    }
}

function createEndpoint(
    credentials: GreenApiCredentials,
    method: string,
    suffix = '',
): string {
    const { idInstance, apiTokenInstance } = credentials

    return (
        `${API_URL}/waInstance${encodeURIComponent(idInstance)}` +
        `/${method}/${encodeURIComponent(apiTokenInstance)}${suffix}`
    )
}

async function request<T>(
    url: string,
    init?: RequestInit,
): Promise<T> {
    let response: Response

    try {
        response = await fetch(url, init)
    } catch {
        throw new GreenApiError(
            'Не удалось подключиться к GREEN-API. Проверь интернет и адрес API.',
        )
    }

    const responseText = await response.text()

    if (!response.ok) {
        throw new GreenApiError(
            `Ошибка GREEN-API (${response.status}): ${responseText || response.statusText
            }`,
            response.status,
        )
    }

    if (!responseText.trim()) {
        return null as T
    }

    try {
        return JSON.parse(responseText) as T
    } catch {
        throw new GreenApiError(
            'GREEN-API вернул ответ в неожиданном формате.',
            response.status,
        )
    }
}

function postJson<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
}

export async function checkAccount(
    credentials: GreenApiCredentials,
    phoneNumber: string,
): Promise<CheckAccountResponse> {
    const digits = phoneNumber.replace(/\D/g, '')

    if (!/^(7\d{10}|375\d{9})$/.test(digits)) {
        throw new GreenApiError(
            'Введи номер в международном формате: +7XXXXXXXXXX или +375XXXXXXXXX.',
        )
    }

    const result = await postJson<CheckAccountResponse>(
        createEndpoint(credentials, 'checkAccount'),
        { phoneNumber: Number(digits) },
    )

    if (
        !result ||
        typeof result.exist !== 'boolean' ||
        typeof result.chatId !== 'string'
    ) {
        throw new GreenApiError(
            'GREEN-API вернул некорректный ответ при проверке номера.',
        )
    }

    return result
}

export async function sendMessage(
    credentials: GreenApiCredentials,
    input: SendMessageInput,
): Promise<SendMessageResponse> {
    const message = input.message.trim()

    if (!input.chatId.trim()) {
        throw new GreenApiError('Не указан идентификатор чата.')
    }

    if (!message) {
        throw new GreenApiError('Сообщение не может быть пустым.')
    }

    if (message.length > 4000) {
        throw new GreenApiError(
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
        throw new GreenApiError(
            'GREEN-API не вернул идентификатор сообщения.',
        )
    }

    return result
}

export async function receiveNotification(
    credentials: GreenApiCredentials,
): Promise<GreenApiNotification | null> {
    const url = createEndpoint(
        credentials,
        'receiveNotification',
        '?receiveTimeout=5',
    )

    return request<GreenApiNotification | null>(url)
}

export function deleteNotification(
    credentials: GreenApiCredentials,
    receiptId: number,
): Promise<unknown> {
    return request(
        createEndpoint(
            credentials,
            'deleteNotification',
            `/${receiptId}`,
        ),
        { method: 'DELETE' },
    )
}
