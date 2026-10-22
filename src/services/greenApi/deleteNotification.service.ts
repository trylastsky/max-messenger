import { createEndpoint, request } from '../../api/client'
import type { GreenApiCredentials } from '../../types/greenApi'

export async function deleteNotification(
    credentials: GreenApiCredentials,
    receiptId: number,
): Promise<void> {
    await request<void>(
        createEndpoint(
            credentials,
            'deleteNotification',
            `/${receiptId}`,
        ),
        { method: 'DELETE' },
    )
}