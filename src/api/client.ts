import { API_URL } from './const'
import type { GreenApiCredentials } from '../types/greenApi'

export class ApiError extends Error {
    public readonly status?: number

    constructor(message: string, status?: number) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

export function createEndpoint(
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

export async function request<T>(
    url: string,
    init?: RequestInit,
): Promise<T> {
    let response: Response

    try {
        response = await fetch(url, init)
    } catch {
        throw new ApiError(
            'Не удалось подключиться к GREEN-API. Проверь интернет и доступность API.',
        )
    }

    const responseText = await response.text()

    if (!response.ok) {
        throw new ApiError(
            `Ошибка API (${response.status}): ${responseText || response.statusText}`,
            response.status,
        )
    }

    if (!responseText.trim()) {
        return null as T
    }

    try {
        return JSON.parse(responseText) as T
    } catch {
        throw new ApiError(
            'API вернул ответ в неожиданном формате.',
            response.status,
        )
    }
}

export function postJson<T>(
    url: string,
    body: unknown,
): Promise<T> {
    return request<T>(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })
}