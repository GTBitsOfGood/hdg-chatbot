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
    const sentMessage = qs.parse(req.body)

    const curUserState = await getUserState(req)
    context.log(curUserState)
    context.log(sentMessage)
    // const response = await formResponse(curUserState, sentMessage.Body);
    const response = await manageKeywordSent(sentMessage, curUserState)

    // broke based on manageKeywordSent functionality
    // if (response.images != null) {
    //     response.images.forEach(function (image) {
    //         const imageResponse = new MessagingResponse()
    //         const imageMessage = imageResponse.message('')
    //         imageMessage.media(image)
    //     })
    // }

    const message = new MessagingResponse()
    message.message(response)

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
const manageKeywordSent = async function (sentMessage: qs.ParsedQs, curUserState) {
    if (specialMessageIds.has(sentMessage.Body)) {
        // special message handling
        const responseString = specialMessageIds.get(sentMessage.Body)

        // update curUserState depending on the specialMessageId
        if (sentMessage.Body == 'restart') {
            curUserState.currMessage = '6022178429efc055c8e74e50'
            await curUserState.save()
        } else if (sentMessage.Body == 'completed') {
            // do not update userstate
            const responseStringCompleted =
                'You have completed ' + curUserState.moduleCompletionTime.length + ' modules.'
            return responseStringCompleted
        }

        // return message text
        return responseString
    } else {
        // normal handling
        const responseString = await formResponse(curUserState, sentMessage.Body)
        return responseString.body
    }
}

export default httpTrigger
