import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import getUserState from './Scripts/readRequest';
import MessageResponse from './models/MessageResponse';
import UserState from './models/UserState';
import { Schema } from 'mongoose';
import formResponse from './Scripts/sendMessage';
import { ConferenceContext } from 'twilio/lib/rest/api/v2010/account/conference';

const MessagingResponse = twilio.twiml.MessagingResponse;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const sentMessage = qs.parse(req.body);

    const curUserState = await getUserState(req);
    context.log(curUserState);
    context.log(sentMessage);
    const response = await formResponse(curUserState, sentMessage.Body);

    if (response.images != null) {
        response.images.forEach(function (image) {
            const imageResponse = new MessagingResponse();
            const imageMessage = imageResponse.message('');
            imageMessage.media(image);
        });
    }

    const message = new MessagingResponse();
    message.message(response.body);

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

export default httpTrigger;
