import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import readUserRequest from './Scripts/readRequest';
import MessageResponse from './models/MessageResponse';
import UserState from './models/UserState';
import { Schema } from 'mongoose';
import formResponse from './Scripts/sendMessage';
import { ConferenceContext } from 'twilio/lib/rest/api/v2010/account/conference';
import specialMessageIds from './specialMessageIds';
import ChatbotMessage from './models/ChatbotMessage';

const MessagingResponse = twilio.twiml.MessagingResponse;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const sentMessage = qs.parse(req.body);

    const curUserState = await readUserRequest(req);
    context.log(curUserState);
    context.log(sentMessage);
    // const response = await formResponse(curUserState, sentMessage.Body);
    const response = await manageKeywordSent(sentMessage, curUserState);

    const message = new MessagingResponse();
    message.message(response);

    // if there's a conditional (like not recording all messages), put that here
    storeMessage(sentMessage, curUserState.currMessage);

    context.res = {
        // status: 200, /* Defaults to 200 */ /*
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    };

    context.done();
};

const storeMessage = async function (sentMessage: qs.ParsedQs, curMessageID: Schema.Types.ObjectId) {
    const userMessage = new MessageResponse({
        accountID: sentMessage.From,
        chatBotMessageID: curMessageID,
        response: sentMessage.Body,
    });
    userMessage.save(function (err, mes) {
        if (err) return console.error(err);
        console.log('Saved message to database');
    });
};

//checks if a special keyword is in the message sent
const manageKeywordSent = async function (sentMessage: qs.ParsedQs, curUserState) {
    if (specialMessageIds.has(sentMessage.Body)) {
        // special handling
        const responseID = specialMessageIds.get(sentMessage.Body);
        const responseMessage = await ChatbotMessage.findById([responseID]);
        const responseString = responseMessage.body;
        return responseString;
    } else {
        // normal handling
        const responseString = await formResponse(curUserState, sentMessage.Body);
        return responseString;
    }
};

export default httpTrigger;
