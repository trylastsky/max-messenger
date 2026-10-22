
import { ApiError, createEndpoint, postJson } from '../../api/client'
import type {
    CheckAccountResponse,
    GreenApiCredentials,
} from '../../types/greenApi'

export async function checkAccount(
    credentials: GreenApiCredentials,
    phoneNumber: string,
): Promise<CheckAccountResponse> {
    const digits = phoneNumber.replace(/\D/g, '')

    if (!/^(7\d{10}|375\d{9})$/.test(digits)) {
        throw new ApiError(
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
        throw new ApiError(
            'GREEN-API вернул некорректный ответ при проверке номера.',
        )
    }

    return result
}
