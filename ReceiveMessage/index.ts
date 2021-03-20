import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import getUserState from './Scripts/readRequest'
import MessageResponse from './models/MessageResponse'
import { Schema } from 'mongoose'
import formResponse from './Scripts/sendMessage'
import UserState from './models/UserState'
import specialMessageIds from './specialMessageIds'
import fixedMessages from './fixedMessages'

const MessagingResponse = twilio.twiml.MessagingResponse

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.')
    const sentMessage = qs.parse(req.body)

    const curUserState = await getUserState(req)
    context.log(curUserState)
    context.log(sentMessage)
    const response = await manageKeywordSent(sentMessage, curUserState) // returns IMessage

    const message = new MessagingResponse()
    const messageContent = message.message('')
    messageContent.body(response.body)
    if (response.images != null) {
        messageContent.media(response.images[0])
    }

    // if there's a conditional (like not recording all messages), put that here
    if (sentMessage.isQuestion) {
        storeMessage(sentMessage, curUserState.currMessage)
    }

    context.res = {
        // status: 200, /* Defaults to 200 */ /*
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    }

    context.done()
}

const storeMessage = async function (sentMessage: qs.ParsedQs, curMessageID: Schema.Types.ObjectId) {
    const userMessage = new MessageResponse({
        accountID: sentMessage.From,
        chatBotMessageID: curMessageID,
        response: sentMessage.Body,
    })
    userMessage.save(function (err, mes) {
        if (err) return console.error(err)
        console.log('Saved message to database')
    })
}

//checks if a special keyword is in the message sent
const manageKeywordSent = async function (sentMessage: qs.ParsedQs, curUserState: InstanceType<typeof UserState>) {
    if (specialMessageIds.has(sentMessage.Body)) {
        // special message handling
        const responseHandler = specialMessageIds.get(sentMessage.Body)
        const responseString = responseHandler(curUserState)
        return responseString
    } else if (fixedMessages.has(sentMessage.Body)) {
        // fixed message handling
        return fixedMessages.get(sentMessage.Body)
    } else {
        // normal handling
        const responseString = await formResponse(curUserState, sentMessage.Body)
        return responseString
    }
}

export default httpTrigger
