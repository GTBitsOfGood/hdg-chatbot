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
    const response = await formResponse(userState, receivedMessage)

    const message = new MessagingResponse()
    if (typeof response === 'string') {
        message.message(response)
    } else {
        const responseMessage = response.nextMessage
        if (responseMessage.images != null) {
            responseMessage.images.forEach(function (image) {
                const imageResponse = new MessagingResponse()
                const imageMessage = imageResponse.message('')
                imageMessage.media(image)
            })
        }
    }
    // broke based on manageKeywordSent functionality
    // if (response.images != null) {
    //     response.images.forEach(function (image) {
    //         const imageResponse = new MessagingResponse()
    //         const imageMessage = imageResponse.message('')
    //         imageMessage.media(image)
    //     })
    // }

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

export default httpTrigger
