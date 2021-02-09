import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import readUserRequest from './Scripts/readRequest';
import formResponse from './Scripts/sendMessage';

const MessagingResponse = twilio.twiml.MessagingResponse;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const sentMessage = qs.parse(req.body);

    const userState = await readUserRequest(req);
    const response = await formResponse(userState, sentMessage.Body);

    const message = new MessagingResponse();
    message.message(response);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    };

    context.done();
};

export default httpTrigger;
