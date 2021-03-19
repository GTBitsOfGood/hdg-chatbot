import qs from 'qs'
import UserState from './models/UserState'
import ChatbotMessage, { IMessage } from './models/ChatbotMessage'

interface templateSpecialMessageHandler {
    (curUserState: InstanceType<typeof UserState>): Promise<IMessage>
}

const restartHandler: templateSpecialMessageHandler = async function (
    curUserState: InstanceType<typeof UserState>,
): Promise<IMessage> {
    curUserState.currMessage = '6022178429efc055c8e74e50'
    await curUserState.updateOne()
    const returnMessage = new ChatbotMessage()
    returnMessage.body =
        '(Welcome Message) What would you like to learn about? 1. (emoji) Exercise - brief description2. (emoji) WASH- brief description3. (emoji) Nutrition-brief description4. (emoji) Maternal Infant Care-brief description5. (emoji) Mental Health- brief description'
    return returnMessage
}

const commandsHandler: templateSpecialMessageHandler = async function (
    curUserState: InstanceType<typeof UserState>,
): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()
    returnMessage.body = 'Here is a list of commands: restart, completed, help'
    return returnMessage
}

const completedHandler: templateSpecialMessageHandler = async function (
    curUserState: InstanceType<typeof UserState>,
): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()
    returnMessage.body = 'You have completed ' + curUserState.moduleCompletionTime.length + ' modules.'
    return returnMessage
}

const specialMessageIds: Map<string | qs.ParsedQs | string[] | qs.ParsedQs[], templateSpecialMessageHandler> = new Map<
    string | qs.ParsedQs | string[] | qs.ParsedQs[],
    templateSpecialMessageHandler
>()

specialMessageIds.set('restart', restartHandler)
specialMessageIds.set('commands', commandsHandler)
specialMessageIds.set('completed', completedHandler)

export default specialMessageIds
