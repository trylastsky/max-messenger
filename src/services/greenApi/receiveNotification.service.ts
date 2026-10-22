import { createEndpoint, request } from '../../api/client'
import type {
    GreenApiCredentials,
    GreenApiNotification,
} from '../../types/greenApi'

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