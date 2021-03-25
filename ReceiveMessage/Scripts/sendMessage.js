import MongoConnect from './db'
import ChatbotMessage from '../models/ChatbotMessage'

const formResponse = async function (userState, receivedMessage) {
    const currMessageId = userState.currMessage
    if (currMessageId == null) {
        userState.currMessage = '6022178429efc055c8e74e50'
    }
    await MongoConnect()
    const currMessage = await ChatbotMessage.findById(currMessageId)
    const nextMessages = currMessage.nextMessages
    let nextMessageId = nextMessages.get(currMessage.isQuestion ? receivedMessage : 'default')
    if (nextMessageId == null) {
        nextMessageId = '6022178429efc055c8e74e50' //change this to whatever error message we want to send (for now it is welcome message)
    }
    userState.currMessage = nextMessageId
    userState.save()
    const nextMessage = await ChatbotMessage.findById(nextMessageId)
    return nextMessage
}

export default formResponse
