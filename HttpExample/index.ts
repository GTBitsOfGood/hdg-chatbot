import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import MongoConnect from '../ReceiveMessage/Scripts/db';
import mongoose, { Schema } from 'mongoose';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const test = mongoose.model('test', new Schema({ body: 'string' }));
    await MongoConnect();
    const record = await test.find({});
    console.log(record);

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
