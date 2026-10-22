import { checkAccount } from '../services/greenApi/checkAccount.service'
import { sendMessage } from '../services/greenApi/sendMessage.service'
import { receiveNotification } from '../services/greenApi/receiveNotification.service'
import { deleteNotification } from '../services/greenApi/deleteNotification.service'
import { getInstanceState } from '../services/greenApi/getInstanceState.service'

export const API = {
    checkAccount,
    sendMessage,
    receiveNotification,
    deleteNotification,
    getInstanceState,
}
