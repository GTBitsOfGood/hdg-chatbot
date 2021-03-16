import MongoConnect from './db'
import ChatbotMessage from '../models/ChatbotMessage'
import specialMessageIds from '../specialMessageIds'

const formResponse = async function (userState, receivedMessage) {
    const currMessageId = userState.currMessage
    if (currMessageId == null) {
        userState.currMessage = '6022178429efc055c8e74e50'
    }
    await MongoConnect()
    let nextMessageId = null
    // special message handling
    if (specialMessageIds.has(receivedMessage.Body)) {
        // update curUserState depending on the specialMessageId
        if (receivedMessage.Body == 'restart') {
            nextMessageId = '6022178429efc055c8e74e50'
        } else if (receivedMessage.Body == 'completed') {
            userState.lastActivity = Date.now()
            userState.save()
            return 'You have completed ' + userState.moduleCompletionTime.length + ' modules.'
        } else {
            userState.lastActivity = Date.now()
            userState.save()
            return specialMessageIds.get(receivedMessage.Body)
        }
    } else {
        const currMessage = await ChatbotMessage.findById(currMessageId)
        nextMessageId = currMessage.nextMessages.get(currMessage.isQuestion ? receivedMessage.Body : 'default')
        if (nextMessageId == null) {
            nextMessageId = '6022178429efc055c8e74e50' //change this to whatever error message we want to send (for now it is welcome message)
        }
    }
    userState.currMessage = nextMessageId
    userState.lastActivity = Date.now()
    userState.save()
    const nextMessage = await ChatbotMessage.findById(nextMessageId)
    return nextMessage
}

export default formResponse
