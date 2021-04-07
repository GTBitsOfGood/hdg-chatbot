import MongoConnect from './db'
import ChatbotMessage from '../models/ChatbotMessage'
import fixedMessages from '../fixedMessages'

const formResponse = async function (userState, message) {
    const currMessageId = userState.currMessage
    if (currMessageId == null) {
        userState.currMessage = fixedMessages.get('welcome')
    }
    await MongoConnect()
    const currMessage = await ChatbotMessage.findById(currMessageId)
    const nextMessages = currMessage.nextMessages
    let nextMessageId = nextMessages.get(nextMessages.size > 1 ? message : 'default')
    if (nextMessageId == null) {
        return fixedMessages.get('error message')
    }
    userState.currMessage = nextMessageId
    userState.save()
    const nextMessage = await ChatbotMessage.findById(nextMessageId)
    return nextMessage
}

export default formResponse
