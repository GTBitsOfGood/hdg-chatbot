import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import readUserRequest from './Scripts/readRequest';
import MessageResponse from './models/MessageResponse';
import UserState from './models/UserState';

const MessagingResponse = twilio.twiml.MessagingResponse;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const sentMessage = qs.parse(req.body);

    const curUserState = await readUserRequest(req);
    context.log(curUserState);
    context.log(sentMessage);

    const message = new MessagingResponse();
    message.message('you said ' + sentMessage.Body);

    // if there's a conditional (like not recording all messages), put that here
    storeMessage(sentMessage, curUserState);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    };

    context.done();
};

//error in param should go away when UserState becomes strongly typed
const storeMessage = async function (sentMessage:qs.ParsedQs, curUserState: UserState) {
    const userMessage  = new MessageResponse({
        accountSID: sentMessage.AccountSid, 
        chatBotMessageID: curUserState.currMessage,
        response: sentMessage.body});
    userMessage.save(function (err, mes) {
        if (err) return console.error(err);
        console.log("Saved message to database");
    });
}

export default httpTrigger;
