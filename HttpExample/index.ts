import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import MongoConnect from '../ReceiveMessage/Scripts/db';
import mongoose, { Schema } from 'mongoose';
import ChatbotMessage from '../ReceiveMessage/models/ChatbotMessage';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const test = mongoose.model('test', new Schema({ body: 'string' }));
    await MongoConnect();
    /*
    const welcome = new ChatbotMessage({
        body: '(Welcome Message) \nWhat would you like to learn about? \n1. (emoji) Exercise - brief description\n2. (emoji) WASH- brief description\n3. (emoji) Nutrition-brief description\n4. (emoji) Maternal Infant Care-brief description\n5. (emoji) Mental Health- brief description',
        nextMessages: {},
        module: 0
    })
    const one = new ChatbotMessage({
        body: 'Exercise',
        nextMessages: {},
        previousMessage: welcome['_id'],
        module: 0
    })
    const two = new ChatbotMessage({
        body: 'WASH',
        nextMessages: {},
        previousMessage: welcome['_id'],
        module: 0
    })
    const three = new ChatbotMessage({
        body: 'Nutrition',
        nextMessages: {},
        previousMessage: welcome['_id'],
        module: 0
    })
    const four = new ChatbotMessage({
        body: 'Maternal Infant Care',
        nextMessages: {},
        previousMessage: welcome['_id'],
        module: 0
    })
    const five = new ChatbotMessage({
        body: 'Mental Health',
        nextMessages: {},
        previousMessage: welcome['_id'],
        module: 0
    })
    one.save()
    two.save()
    three.save()
    four.save()
    five.save()
    welcome.set('nextMessages.1', one['_id'])
    welcome.set('nextMessages.2', two['_id'])
    welcome.set('nextMessages.3', three['_id'])
    welcome.set('nextMessages.4', four['_id'])
    welcome.set('nextMessages.5', five['_id'])
    welcome.save()
    */

    const name = req.query.name || (req.body && req.body.name);
    const responseMessage = name
        ? 'Hello, ' + name + '. This HTTP triggered function executed successfully.'
        : 'This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.';

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage,
    };
};

export default httpTrigger;
