
import { ApiError, createEndpoint, request } from '../../api/client'
import type {
    GreenApiCredentials,
    InstanceStateResponse,
} from '../../types/greenApi'

export async function getInstanceState(
    credentials: GreenApiCredentials,
): Promise<InstanceStateResponse> {
    const result = await request<InstanceStateResponse>(
        createEndpoint(credentials, 'getStateInstance'),
    )

    if (!result || typeof result.stateInstance !== 'string') {
        throw new ApiError('Не удалось определить состояние инстанса.')
    }

    return result
}
