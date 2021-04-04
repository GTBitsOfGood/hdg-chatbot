import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as twilio from 'twilio'
import qs from 'qs'
import getUserState from './Scripts/readRequest'
import MessageResponse from './models/MessageResponse'
import { Schema } from 'mongoose'
import formResponse from './Scripts/sendMessage'
import UserState, { IUserState } from './models/UserState'
import specialMessageIds from './specialMessageIds'
import fixedMessages from './fixedMessages'
import ChatbotMessage, { IMessage } from './models/ChatbotMessage'
import Mongoose from 'mongoose'

const MessagingResponse = twilio.twiml.MessagingResponse

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.')
    const sentMessage = qs.parse(req.body)

    const curUserState = await getUserState(req)

    // update lastActivity
    curUserState.lastActivity = new Date();
    await curUserState.save();

    const response = await manageKeywordSent(sentMessage, curUserState, req) // returns IMessage

    const message = new MessagingResponse()
    const messageContent = message.message('')
    messageContent.body(response.body)

    context.log(response)
    if (response.image && response.image != '') {
        messageContent.media(response.image)
    }

    // if there's a conditional (like not recording all messages), put that here
    // make sure user has consented to data storage
    // make sure curUserState is not null
    if (curUserState && curUserState.dataConsent && sentMessage.messageType == 'question') {
        storeMessage(sentMessage, curUserState.currMessage)
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
    const userMessage = new MessageResponse({
        accountID: sentMessage.From,
        chatBotMessageID: curMessageID,
        response: sentMessage.Body,
    })
    userMessage.save(function (err, mes) {
        if (err) return console.error(err);
        console.log('Saved message to database');
    });
};

//checks if a special keyword is in the message sent
const manageKeywordSent = async function (
    sentMessage: qs.ParsedQs,
    curUserState: IUserState,
    req: HttpRequest,
): Promise<IMessage> {
    const msg = 'i consent'
    const body = qs.parse(req.body)

    if (!curUserState && msg == sentMessage.Body) {
        //new user that consents
        const messageId = Mongoose.Types.ObjectId('60563903ea9f2e441461118c') //points to data consent question
        const newUser = new UserState({ userId: body.From, dataConsent: false, currMessage: messageId })
        await newUser.save()

        const returnMessage = new ChatbotMessage()
        returnMessage.body =
            'Thank you for consenting! if angry at data collect write "no data pls" otherwise we\'ll sneaky sneaky. respond to continue thanks'
        return returnMessage
    } else if (!curUserState) {
        //new user that hasn't consented
        const returnMessage = new ChatbotMessage()
        returnMessage.body =
            'Doth thee consent to receiving messages from this numb\'r.  Replyeth with "i consent" if \'t be true thee doth'
        return returnMessage
    } else if (specialMessageIds.has(sentMessage.Body)) {
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
};

export default httpTrigger
