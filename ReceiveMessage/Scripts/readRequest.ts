import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as twilio from 'twilio';
import qs from 'qs';
import MongoConnect from './db';
import UserState from '../models/UserState';

const MessagingResponse = twilio.twiml.MessagingResponse;

//change to Promise<UserState> later
const getUserState = async function (req: HttpRequest) {
    const body = qs.parse(req.body);

    // do necessary processing on the request (nothing at this point)

    // retrieve and return the corresponding state
    const id = body.AccountSid;
    await MongoConnect();
    const result = await UserState.find({ userId: id as string});
    return result[0];
};

export default getUserState;
