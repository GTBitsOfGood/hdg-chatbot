import qs from 'qs'
import UserState, { IUserState } from './models/UserState'
import ChatbotMessage, { IMessage } from './models/ChatbotMessage'
import Mongoose from 'mongoose'

interface templateSpecialMessageHandler {
    (curUserState: IUserState): Promise<IMessage>
}

const restartHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.currMessage = '6022178429efc055c8e74e50'
    await curUserState.save()
    const returnMessage = new ChatbotMessage()
    returnMessage.body =
        '(Welcome Message) What would you like to learn about? 1. (emoji) Exercise - brief description2. (emoji) WASH- brief description3. (emoji) Nutrition-brief description4. (emoji) Maternal Infant Care-brief description5. (emoji) Mental Health- brief description'
    return returnMessage
}

const commandsHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()
    returnMessage.body = 'Here is a list of commands: restart, completed, help'
    return returnMessage
}

const completedHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()
    let numCompleted = 0
    for (let i = 0; i < curUserState.moduleCompletionTime.length; i++) {
        if (curUserState.moduleCompletionTime[i] != null) {
            numCompleted++
        }
    }
    returnMessage.body = 'You have completed ' + numCompleted + ' modules.'
    return returnMessage
}

// mostly for testing purposes
const currentHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    return ChatbotMessage.findById(curUserState.currMessage)
}

const yesDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()

    curUserState.dataConsent = true;
    await curUserState.save()

    returnMessage.body = 'You have consented to Data Collection.';
    return returnMessage;
}

const noDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()

    curUserState.dataConsent = false;
    await curUserState.save()

    returnMessage.body = 'You have opted out of Data Collection.';
    return returnMessage;
}

const yesLowDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()

    curUserState.lowData = true;
    await curUserState.save()

    returnMessage.body = 'You have turned on Low Data Mode.';
    return returnMessage;
}

const noLowDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()

    curUserState.lowData = false;
    await curUserState.save()

    returnMessage.body = 'You have turned off Low Data Mode.';
    return returnMessage;
}

const specialMessageIds: Map<string | qs.ParsedQs | string[] | qs.ParsedQs[], templateSpecialMessageHandler> = new Map<
    string | qs.ParsedQs | string[] | qs.ParsedQs[],
    templateSpecialMessageHandler
>()

specialMessageIds.set('restart', restartHandler)
specialMessageIds.set('commands', commandsHandler)
specialMessageIds.set('completed', completedHandler)
specialMessageIds.set('current', currentHandler)
specialMessageIds.set('yes data', yesDataHandler)
specialMessageIds.set('no data', noDataHandler)
specialMessageIds.set('turn on low data', yesLowDataHandler)
specialMessageIds.set('turn off low data', noLowDataHandler)

export default specialMessageIds
