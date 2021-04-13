import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import getUserState from './Scripts/readRequest'
import MessageResponse from '../models/MessageResponse'
import { Schema } from 'mongoose'
import formResponse from './Scripts/sendMessage'
import UserState, { IUserState } from '../models/UserState'
import specialMessageIds from './specialMessageIds'
import fixedMessages from './fixedMessages'
import { IMessage } from '../models/ChatbotMessage'

const MessagingResponse = twilio.twiml.MessagingResponse

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.')
    const receivedMessage = qs.parse(req.body)

    const curUserState = await getUserState(req)

    // only update if userstate exists
    if (curUserState != null) {
        // update lastActivity
        curUserState.lastActivity = new Date()
        await curUserState.save()
    }

    const response = await manageKeywordSent(receivedMessage, curUserState, req) // returns IMessage

    const message = new MessagingResponse()
    const messageContent = message.message('')
    if (response.messageType == 'message' || response.messageType == 'final-message') {
        // append short message to tell the user how to advance in the chatbot
        messageContent.body(response.body + '\nSend anything to go to the next message.')
    } else {
        messageContent.body(response.body)
    }

    context.log(response)
    if (response.image && response.image != '') {
        messageContent.media(response.image)
    }

    // if there's a conditional (like not recording all messages), put that here
    // make sure user has consented to data storage
    // make sure curUserState is not null
    // make sure the userstate has not been deleted due to complete exit special message
    const deletedUserState = Boolean(String(receivedMessage.Body).toLowerCase() == 'Excluir')
    if (!deletedUserState && curUserState && curUserState.dataConsent && receivedMessage.messageType == 'question') {
        storeMessage(receivedMessage, curUserState.currMessage)
    }
    context.log(message.toString())

    context.res = {
        // status: 200, /* Defaults to 200 */ /*
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    }

    context.done()
}

const storeMessage = async function (sentMessage: qs.ParsedQs, curMessageID: Schema.Types.ObjectId) {
    const crypto = require('crypto').createHash('sha256').update(sentMessage.From).digest('hex')
    const userMessage = new MessageResponse({
        accountID: crypto,
        chatBotMessageID: curMessageID,
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
    const msg = 'i consent'
    const body = qs.parse(req.body)

    if (!curUserState && msg == String(sentMessage.Body).toLowerCase()) {
        //new user that consents
        //points to data consent question
        const messageId = (await fixedMessages.get('datapermission'))._id
        const newUser = new UserState({ userId: body.From, dataConsent: true, currMessage: messageId, lowData: false })

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
