import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import * as qs from 'qs';

const MessagingResponse = twilio.twiml.MessagingResponse;

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    const sentMessage = qs.parse(req.body);
    //hello delete me one day
    const message = new MessagingResponse();
    message.message('you said ' + sentMessage.Body);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: message.toString(),
        headers: { 'Content-Type': 'application/xml' },
        isRaw: true,
    };

    context.done();
};

export default httpTrigger;
