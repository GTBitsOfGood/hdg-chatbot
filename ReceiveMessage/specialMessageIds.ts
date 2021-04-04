import qs from 'qs'
import UserState, { IUserState } from './models/UserState'
import ChatbotMessage, { IMessage } from './models/ChatbotMessage'
import Mongoose from 'mongoose'
import fixedMessages from './fixedMessages'

interface templateSpecialMessageHandler {
    (curUserState: IUserState): Promise<IMessage>
}

const restartHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.currMessage = (await fixedMessages.get('Welcome'))._id
    await curUserState.save()

    return fixedMessages.get('Welcome');
}

const commandsHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    return fixedMessages.get('commands');
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
    curUserState.dataConsent = true;
    await curUserState.save()

    return fixedMessages.get('yesDataCollection');
}

const noDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    curUserState.dataConsent = false;
    await curUserState.save()

    return fixedMessages.get('noDataCollection');
}

const yesLowDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    curUserState.lowData = true;
    await curUserState.save()

    return fixedMessages.get('TurnOnLowData');
}

const noLowDataHandler: templateSpecialMessageHandler = async function (curUserState:IUserState): Promise<IMessage> {
    curUserState.lowData = false;
    await curUserState.save()

    return fixedMessages.get('TurnOffLowData');
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
