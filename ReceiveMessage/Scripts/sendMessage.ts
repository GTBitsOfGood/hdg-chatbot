import MongoConnect from '../../db'
import ChatbotMessage, { IMessage } from '../../models/ChatbotMessage'
import fixedMessages from '../fixedMessages'

import { IUserState } from '../../models/UserState'

const formResponse = async function (userState: IUserState, message: string): Promise<IMessage> {
    const currMessageId = userState.currMessage
    if (currMessageId == null) {
        userState.currMessage = await fixedMessages.get('welcome')
    }
    await MongoConnect()
    const currMessage = await ChatbotMessage.findById(currMessageId)
    const nextMessages = currMessage.nextMessages
    const nextMessageId = nextMessages.get(nextMessages.size > 1 ? message : 'default')
    if (nextMessageId == null) {
        return await fixedMessages.get('error message')
    }
    userState.currMessage = nextMessageId
    userState.save()
    const nextMessage = await ChatbotMessage.findById(nextMessageId)
    return nextMessage
}

export default formResponse
