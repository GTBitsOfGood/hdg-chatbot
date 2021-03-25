import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import getUserState from './Scripts/readRequest'
import MessageResponse from './models/MessageResponse'
import { Schema } from 'mongoose'
import formResponse from './Scripts/sendMessage'
import specialMessageIds from './specialMessageIds'

const MessagingResponse = twilio.twiml.MessagingResponse

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.')
    const receivedMessage = qs.parse(req.body)

    const userState = await getUserState(req)
    context.log(userState)
    context.log(receivedMessage)
    const response = await manageKeywordSent(receivedMessage, userState)

    const message = new MessagingResponse()
    if (typeof response === 'string') {
        message.message(response)
    } else {
        // image/multimedia functionality would go here
        message.message(response.body)
    }

    // if there's a conditional (like not recording all messages), put that here
    if (receivedMessage.isQuestion) {
        storeMessage(receivedMessage, userState.currMessage)
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

//checks if a special keyword is in the message received
const manageKeywordSent = async function (receivedMessage: qs.ParsedQs, userState) {
    if (specialMessageIds.has(receivedMessage.Body)) {
        // special message handling
        const responseString = specialMessageIds.get(receivedMessage.Body)

        // update curUserState depending on the specialMessageId
        if (receivedMessage.Body == 'restart') {
            userState.currMessage = '6022178429efc055c8e74e50'
            await userState.save()
        } else if (receivedMessage.Body == 'completed') {
            // do not update userstate
            const responseStringCompleted = 'You have completed ' + userState.moduleCompletionTime.length + ' modules.'
            return responseStringCompleted
        }

        // return message text
        return responseString
    } else {
        // normal handling
        const response = await formResponse(userState, receivedMessage.Body)
        return response
    }
}

export default httpTrigger
