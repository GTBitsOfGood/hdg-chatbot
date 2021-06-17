import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import getUserState from './Scripts/readRequest'
import MessageResponse from '../models/MessageResponse'
import formResponse from './Scripts/sendMessage'
import UserState, { IUserState } from '../models/UserState'
import specialMessageIds from './specialMessageIds'
import fixedMessages from './fixedMessages'
import ChatbotMessage, { IMessage } from '../models/ChatbotMessage'
import MongoConnect from '../db'
import config from '../config'

const MessagingResponse = twilio.twiml.MessagingResponse

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const receivedMessage = qs.parse(req.body)
    const validated = twilio.validateRequest(
        config.auth_token,
        req.headers['x-twilio-signature'],
        config.webhook_url,
        receivedMessage,
    )
    if (config.node_env != 'development' && !validated) {
        context.res = {
            status: 401 /* Defaults to 200 */,
            body: 'Unauthorized',
            headers: { 'Content-Type': 'application/xml' },
        }
        context.done()
        return
    }
    const curUserState = await getUserState(req)
    const currTime = new Date()
    // only update if userstate exists
    if (curUserState != null) {
        // update lastActivity
        curUserState.lastActivity = currTime
    }

    // if there's a conditional (like not recording all messages), put that here
    // make sure user has consented to data storage
    // make sure curUserState is not null
    // make sure the userstate has not been deleted due to complete exit special message
    const deletedUserState = Boolean(String(receivedMessage.Body).toLowerCase() == 'excluir')
    if (!deletedUserState && curUserState && curUserState.dataConsent) {
        await MongoConnect()
        const currMessage = await ChatbotMessage.findById(curUserState.currMessage)
        if (currMessage.messageType == 'question') {
            storeMessage(receivedMessage, currMessage, currTime, curUserState)
        }
    }

    const response = await manageKeywordSent(receivedMessage, curUserState, req) // returns IMessage

    const message = new MessagingResponse()
    const messageContent = message.message('')
    if (curUserState && curUserState.lowData) {
        messageContent.body(response.lowData)
    } else {
        if (response.messageType == 'message' || response.messageType == 'final-message') {
            // append short message to tell the user how to advance in the chatbot
            messageContent.body(response.body + '\nEnviar cualquier cosa para continuar.')
        } else {
            messageContent.body(response.body)
        }
        if (response.image && response.image != '') {
            messageContent.media(response.image)
        }
    }
    if (response.messageType == 'final-message') {
        const moduleNumber = parseInt(response.module)
        if (!isNaN(moduleNumber) && moduleNumber > 0) {
            if (curUserState.moduleCompletionTime[moduleNumber - 1] == null) {
                curUserState.moduleCompletionTime.set(moduleNumber - 1, currTime)
            }
        }
    }
    if (curUserState) {
        await curUserState.save()
    }

    context.log(response)
    context.log(message.toString())

    context.res = {
        // status: 200, /* Defaults to 200 */ /*
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    }

    context.done()
}

const storeMessage = async function (
    sentMessage: qs.ParsedQs,
    currMessage: IMessage,
    currTime: Date,
    user: IUserState,
) {
    const crypto = require('crypto').createHash('sha256').update(sentMessage.From).digest('hex')
    const userMessage = new MessageResponse({
        accountID: crypto,
        messageID: currMessage.messageId,
        message: user.lowData ? currMessage.lowData : currMessage.body,
        timestamp: currTime,
        response: sentMessage.Body,
    })
    userMessage.save(function (err) {
        if (err) return console.error(err)
        console.log('Saved message to database')
    })
}

//checks if a special keyword is in the message sent
const manageKeywordSent = async function (
    sentMessage: qs.ParsedQs,
    curUserState: IUserState,
    req: HttpRequest,
): Promise<IMessage> {
    //TODO: ASK HDG FOR WHATSAPP CONSENT STRING
    const msg = 'doy mi consentimiento'
    const body = qs.parse(req.body)

    if (!curUserState && msg == String(sentMessage.Body).toLowerCase()) {
        //new user that consents
        //points to data consent question
        const messageId = (await fixedMessages.get('datapermission'))._id
        const newUser = new UserState({
            userId: body.From,
            dataConsent: true,
            currMessage: messageId,
            lowData: false,
            lastActivity: Date.now(),
        })

        await newUser.save()
        return fixedMessages.get('datapermission')
    } else if (!curUserState) {
        //new user that hasn't consented
        return fixedMessages.get('messagepermission')
    } else if (specialMessageIds.has(String(sentMessage.Body).toLowerCase())) {
        // special message handling
        const responseHandler = specialMessageIds.get(String(sentMessage.Body).toLowerCase())
        const responseString = responseHandler(curUserState)
        return responseString
    } else {
        // normal handling
        const responseString = await formResponse(curUserState, String(sentMessage.Body).toLowerCase())
        return responseString
    }
}

export default httpTrigger
