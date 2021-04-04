import MongoConnect from './db'
import ChatbotMessage from '../models/ChatbotMessage'
import fixedMessages from '../fixedMessages'

const formResponse = async function (state, message) {
    const p = state.currMessage
    // if (p == null) {
    //     state.currMessage = '6022178429efc055c8e74e50'
    // }
    if (p == null) {
        state.currMessage = fixedMessages.get('welcome')
    }
    await MongoConnect()
    const prev = await ChatbotMessage.findById(p)
    const map = prev.nextMessages
    let nextChatbotMessageId = map.get(map.size > 1 ? message : 'default')
    if (nextChatbotMessageId == null) {
        // nextChatbotMessageId = '6022178429efc055c8e74e50'
        nextChatbotMessageId = fixedMessages.get('error message')
    }
    state.currMessage = nextChatbotMessageId
    state.save()
    const response = await ChatbotMessage.findById(nextChatbotMessageId)
    return response
}

export default formResponse
