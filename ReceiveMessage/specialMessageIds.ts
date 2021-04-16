import qs from 'qs'
import ChatbotMessage, { IMessage } from '../models/ChatbotMessage'
import UserState, { IUserState } from '../models/UserState'
import fixedMessages from './fixedMessages'

interface templateSpecialMessageHandler {
    (curUserState: IUserState): Promise<IMessage>
}

const restartHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.currMessage = (await fixedMessages.get('welcome'))._id
    await curUserState.save()

    return fixedMessages.get('welcome')
}

const commandsHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    return fixedMessages.get('commands')
}

const helpHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    return fixedMessages.get('helpme')
}

const completedHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    const returnMessage = new ChatbotMessage()
    let numCompleted = 0
    for (let i = 0; i < curUserState.moduleCompletionTime.length; i++) {
        if (curUserState.moduleCompletionTime[i] != null) {
            numCompleted++
        }
    }
    returnMessage.body = (await fixedMessages.get('num modules')).body + numCompleted
    return returnMessage
}

// mostly for testing purposes
const currentHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    return ChatbotMessage.findById(curUserState.currMessage)
}

const yesDataHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.dataConsent = true
    await curUserState.save()

    return fixedMessages.get('yesDataCollection')
}

const noDataHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.dataConsent = false
    await curUserState.save()

    return fixedMessages.get('noDataCollection')
}

const yesLowDataHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.lowData = true
    await curUserState.save()

    return fixedMessages.get('TurnOnLowData')
}

const noLowDataHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    curUserState.lowData = false
    await curUserState.save()

    return fixedMessages.get('TurnOffLowData')
}

const deleteHandler: templateSpecialMessageHandler = async function (curUserState: IUserState): Promise<IMessage> {
    UserState.deleteOne({ userId: curUserState.userId })
    return fixedMessages.get('complete exit message')
}

const specialMessageIds: Map<string | qs.ParsedQs | string[] | qs.ParsedQs[], templateSpecialMessageHandler> = new Map<
    string | qs.ParsedQs | string[] | qs.ParsedQs[],
    templateSpecialMessageHandler
>()

specialMessageIds.set('reiniciar', restartHandler)
specialMessageIds.set('posibles funciones', commandsHandler)
//TODO: GET PROPER TRANSLATION FOR "helpme" - currently "Me ajude"
specialMessageIds.set('me ajude', helpHandler)
specialMessageIds.set('completado', completedHandler)
specialMessageIds.set('ultimo', currentHandler)
specialMessageIds.set('quiero que se coleccionen datos sobre mi', yesDataHandler)
specialMessageIds.set('no quiero que se coleccionen datos sobre mi', noDataHandler)
specialMessageIds.set('quiero conservar datos', yesLowDataHandler)
specialMessageIds.set('no quiero un modo de datos bajo', noLowDataHandler)
//TODO: GET PROPER TRANSLATION FOR "delete" - currently "Excluir"
specialMessageIds.set('excluir', deleteHandler)

export default specialMessageIds
